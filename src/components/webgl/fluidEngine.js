import * as S from './shaders'

/**
 * Navier–Stokes fluid + dithered-noise stain, in one WebGL context.
 *
 * Why one context: on scrib3.co the stain shader samples the fluid as a
 * flowmap (`uFlowmapTexture`). Running them in separate canvases would mean
 * copying 16k+ pixels across every frame. Here the fluid writes into an FBO
 * and the stain pass binds it directly — zero copies.
 *
 * Pass chain per frame:
 *   splat → curl → vorticity → divergence → pressure ×N → gradientSubtract
 *         → advect(velocity) → advect(dye) → stain(display)
 */

const SIM = 128
const DYE = 128
const PRESSURE_ITERATIONS = 3

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[fluid] shader compile failed:', gl.getShaderInfoLog(shader))
  }
  return shader
}

class Program {
  constructor(gl, vertex, fragment) {
    this.gl = gl
    this.program = gl.createProgram()
    gl.attachShader(this.program, vertex)
    gl.attachShader(this.program, fragment)
    gl.linkProgram(this.program)
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn('[fluid] link failed:', gl.getProgramInfoLog(this.program))
    }
    this.uniforms = {}
    const count = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(this.program, i).name
      this.uniforms[name] = gl.getUniformLocation(this.program, name)
    }
  }
  bind() {
    this.gl.useProgram(this.program)
  }
}

export default class FluidStain {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.opts = {
      simResolution: SIM,
      dyeResolution: DYE,
      densityDissipation: 0.9,
      velocityDissipation: 1,
      pressure: 0,
      pressureIterations: PRESSURE_ITERATIONS,
      curl: 0,
      splatRadius: 0.004,
      splatForce: 5,
      granularity: 2,
      falloff: 0,
      opacity: 1,
      color: [0.843, 0.671, 0.773], // #D7ABC5
      ...options,
    }

    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
    let gl = canvas.getContext('webgl2', params)
    this.isWebGL2 = !!gl
    if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)
    if (!gl) {
      this.supported = false
      return
    }
    this.gl = gl
    this.supported = true

    this._initFormats()
    this._initPrograms()
    this._initQuad()
    // size the drawing buffer first — the sim grids are derived from its aspect
    this.resize()
    this._initFramebuffers()

    this.time = 0
    this.windows = []
    this.pointers = [{ x: 0, y: 0, dx: 0, dy: 0, down: false, moved: false }]
  }

  // ---------------------------------------------------------------- formats
  _initFormats() {
    const gl = this.gl
    let halfFloat, supportLinearFiltering
    if (this.isWebGL2) {
      gl.getExtension('EXT_color_buffer_float')
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear')
      halfFloat = gl.HALF_FLOAT
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float')?.HALF_FLOAT_OES
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear')
    }

    this.halfFloat = halfFloat
    this.linearFiltering = !!supportLinearFiltering

    const internalFormat = this.isWebGL2
      ? { rgba: gl.RGBA16F, rg: gl.RG16F, r: gl.R16F }
      : { rgba: gl.RGBA, rg: gl.RGBA, r: gl.RGBA }

    this.formats = {
      rgba: { internalFormat: internalFormat.rgba, format: gl.RGBA },
      rg: { internalFormat: internalFormat.rg, format: this.isWebGL2 ? gl.RG : gl.RGBA },
      r: { internalFormat: internalFormat.r, format: this.isWebGL2 ? gl.RED : gl.RGBA },
    }
  }

  _initPrograms() {
    const gl = this.gl
    const vertex = compile(gl, gl.VERTEX_SHADER, S.baseVertex)

    const make = (frag) => new Program(gl, vertex, compile(gl, gl.FRAGMENT_SHADER, frag))

    this.clearProgram = make(S.clearShader)
    this.splatProgram = make(S.splatShader)
    this.advectionProgram = make(S.advectionShader)
    this.curlProgram = make(S.curlShader)
    this.vorticityProgram = make(S.vorticityShader)
    this.divergenceProgram = make(S.divergenceShader)
    this.pressureProgram = make(S.pressureShader)
    this.gradientSubtractProgram = make(S.gradientSubtractShader)
    this.stainProgram = make(S.stainShader)
  }

  /**
   * 注册可见区块。 stain 不再是全屏背景 —— 只有这些矩形里才画颗粒。
   * @param {Array} list 每项 { x0, y0, x1, y1, cx, cy, hw, hh, mode }
   *                     单位 CSS 像素，y 从视口顶部数（与 getBoundingClientRect 一致）
   */
  setWindows(list) {
    this.windows = list
  }

  _initQuad() {
    const gl = this.gl
    this.quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    this.quadIndex = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadIndex)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
  }

  _createFBO(w, h, fmt, type, filter) {
    const gl = this.gl
    gl.activeTexture(gl.TEXTURE0)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, type, null)

    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.viewport(0, 0, w, h)
    gl.clear(gl.COLOR_BUFFER_BIT)

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        return id
      },
    }
  }

  _createDoubleFBO(w, h, fmt, type, filter) {
    return {
      read: this._createFBO(w, h, fmt, type, filter),
      write: this._createFBO(w, h, fmt, type, filter),
      swap() {
        const t = this.read
        this.read = this.write
        this.write = t
      },
    }
  }

  _initFramebuffers() {
    const gl = this.gl
    const filter = this.linearFiltering ? gl.LINEAR : gl.NEAREST
    const type = this.halfFloat

    const sim = this._resolution(this.opts.simResolution)
    const dye = this._resolution(this.opts.dyeResolution)

    this.dye = this._createDoubleFBO(dye.w, dye.h, this.formats.rgba, type, filter)
    this.velocity = this._createDoubleFBO(sim.w, sim.h, this.formats.rg, type, filter)
    this.divergence = this._createFBO(sim.w, sim.h, this.formats.r, type, gl.NEAREST)
    this.curl = this._createFBO(sim.w, sim.h, this.formats.r, type, gl.NEAREST)
    this.pressure = this._createDoubleFBO(sim.w, sim.h, this.formats.r, type, gl.NEAREST)

    // blank texture so the stain has something to bind before the first splat
    gl.activeTexture(gl.TEXTURE0)
    this.blank = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.blank)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
  }

  _resolution(target) {
    const gl = this.gl
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight || 1
    const min = Math.round(target)
    const max = Math.round(target * (aspect < 1 ? 1 / aspect : aspect))
    return aspect > 1 ? { w: max, h: min } : { w: min, h: max }
  }

  resize() {
    if (!this.supported) return
    const gl = this.gl
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const w = Math.round(this.canvas.clientWidth * dpr)
    const h = Math.round(this.canvas.clientHeight * dpr)
    if (w === 0 || h === 0) return
    if (this.canvas.width === w && this.canvas.height === h) return
    this.canvas.width = w
    this.canvas.height = h
    gl.viewport(0, 0, w, h)
  }

  // ---------------------------------------------------------------- passes
  _blit(target) {
    const gl = this.gl
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    } else {
      gl.viewport(0, 0, target.width, target.height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadIndex)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }

  splat(x, y, dx, dy, color) {
    if (!this.supported) return
    const gl = this.gl
    const c = color || this.opts.color

    this.splatProgram.bind()
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0))
    gl.uniform1f(this.splatProgram.uniforms.aspectRatio, this.canvas.width / this.canvas.height)
    gl.uniform2f(this.splatProgram.uniforms.point, x, y)
    gl.uniform3f(this.splatProgram.uniforms.color, dx, dy, 0)
    gl.uniform1f(this.splatProgram.uniforms.radius, this.opts.splatRadius)
    this._blit(this.velocity.write)
    this.velocity.swap()

    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0))
    gl.uniform3f(this.splatProgram.uniforms.color, c[0], c[1], c[2])
    this._blit(this.dye.write)
    this.dye.swap()
  }

  step(dt) {
    if (!this.supported) return
    const gl = this.gl
    const { velocity, dye, curl, divergence, pressure } = this

    gl.disable(gl.BLEND)

    // --- curl ---
    this.curlProgram.bind()
    gl.uniform2f(this.curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(this.curlProgram.uniforms.uVelocity, velocity.read.attach(0))
    this._blit(curl)

    // --- vorticity ---
    this.vorticityProgram.bind()
    gl.uniform2f(this.vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(this.vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(this.vorticityProgram.uniforms.uCurl, curl.attach(1))
    gl.uniform1f(this.vorticityProgram.uniforms.curl, this.opts.curl)
    gl.uniform1f(this.vorticityProgram.uniforms.dt, dt)
    this._blit(velocity.write)
    velocity.swap()

    // --- divergence ---
    this.divergenceProgram.bind()
    gl.uniform2f(this.divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(this.divergenceProgram.uniforms.uVelocity, velocity.read.attach(0))
    this._blit(divergence)

    // --- clear pressure ---
    this.clearProgram.bind()
    gl.uniform1i(this.clearProgram.uniforms.uTexture, pressure.read.attach(0))
    gl.uniform1f(this.clearProgram.uniforms.value, this.opts.pressure)
    this._blit(pressure.write)
    pressure.swap()

    // --- pressure (Jacobi) ---
    this.pressureProgram.bind()
    gl.uniform2f(this.pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(this.pressureProgram.uniforms.uDivergence, divergence.attach(0))
    for (let i = 0; i < this.opts.pressureIterations; i++) {
      gl.uniform1i(this.pressureProgram.uniforms.uPressure, pressure.read.attach(1))
      this._blit(pressure.write)
      pressure.swap()
    }

    // --- gradient subtract ---
    this.gradientSubtractProgram.bind()
    gl.uniform2f(this.gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(this.gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0))
    gl.uniform1i(this.gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
    this._blit(velocity.write)
    velocity.swap()

    // --- advect velocity ---
    this.advectionProgram.bind()
    gl.uniform2f(this.advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY)
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(this.advectionProgram.uniforms.uSource, velocity.read.attach(0))
    gl.uniform1f(this.advectionProgram.uniforms.dt, dt)
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.opts.velocityDissipation)
    this._blit(velocity.write)
    velocity.swap()

    // --- advect dye (velocity lookup still uses the sim grid) ---
    gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY)
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
    gl.uniform1i(this.advectionProgram.uniforms.uSource, dye.read.attach(1))
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.opts.densityDissipation)
    this._blit(dye.write)
    dye.swap()
  }

  draw(dt) {
    if (!this.supported) return
    const gl = this.gl
    this.time += dt * 0.1 // matches scrib3's uTime += 0.1 * delta

    // the stain covers the whole viewport, but blending would still accumulate
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.stainProgram.bind()
    gl.uniform1i(this.stainProgram.uniforms.uFlowmap, this.dye.read.attach(0))
    gl.uniform2f(this.stainProgram.uniforms.uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.uniform3fv(this.stainProgram.uniforms.uColor, this.opts.color)
    gl.uniform1f(this.stainProgram.uniforms.uTime, this.time)
    gl.uniform1f(this.stainProgram.uniforms.uGranularity, this.opts.granularity)
    gl.uniform1f(this.stainProgram.uniforms.uFalloff, this.opts.falloff)
    gl.uniform1f(this.stainProgram.uniforms.uOpacity, this.opts.opacity)

    this._uploadWindows()

    this._blit(null)
  }

  /**
   * CSS 像素（y 向下）→ 设备像素（y 向上，gl_FragCoord 坐标系）。
   * 空槽保持 (0,0,0,0)，shader 里 `r.z > r.x` 为假即跳过。
   */
  _uploadWindows() {
    const gl = this.gl
    const p = this.stainProgram.uniforms
    const list = this.windows || []
    const n = Math.min(4, list.length)

    if (this._winRect == null) {
      this._winRect = new Float32Array(16)
      this._winField = new Float32Array(16)
      this._winMode = new Float32Array(4)
    }
    const rect = this._winRect
    const field = this._winField
    const mode = this._winMode
    rect.fill(0)
    field.fill(0)
    mode.fill(0)

    const cw = this.canvas.clientWidth || 1
    const ch = this.canvas.clientHeight || 1
    const dpr = this.canvas.width / cw

    for (let i = 0; i < n; i++) {
      const w = list[i]
      // y0/y1 输入是「距视口顶部」，翻转成「距视口底部」
      const bottom = (ch - w.y1) * dpr
      const top = (ch - w.y0) * dpr
      const o = i * 4
      rect[o + 0] = w.x0 * dpr
      rect[o + 1] = bottom
      rect[o + 2] = w.x1 * dpr
      rect[o + 3] = top

      field[o + 0] = w.cx * dpr
      field[o + 1] = (ch - w.cy) * dpr
      field[o + 2] = Math.max(1, w.hw * dpr)
      field[o + 3] = Math.max(1, w.hh * dpr)

      mode[i] = w.mode === 'linear' ? 1 : 0
    }

    // 数组 uniform 的 location 存在 "name[0]" 键下
    if (p['uWindowCount']) gl.uniform1i(p['uWindowCount'], n)
    if (p['uWindows[0]']) gl.uniform4fv(p['uWindows[0]'], rect)
    if (p['uWindowField[0]']) gl.uniform4fv(p['uWindowField[0]'], field)
    if (p['uWindowMode[0]']) gl.uniform1fv(p['uWindowMode[0]'], mode)
  }

  setOptions(patch) {
    Object.assign(this.opts, patch)
  }

  destroy() {
    /* contexts are released when the canvas is dropped */
  }
}
