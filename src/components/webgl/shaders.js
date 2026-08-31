/**
 * GLSL sources for the background layer.
 *
 * Two things live here, and on scrib3.co they share a single GL context:
 *   1. the Navier–Stokes fluid that trails the cursor
 *   2. the dithered-noise "stain" that is the site's background grain
 *
 * The stain samples the fluid as a flowmap and quantises it with floor(),
 * which is why moving the mouse visibly coarsens the grain around the pointer.
 */

export const baseVertex = /* glsl */ `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

export const clearShader = /* glsl */ `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
`

export const splatShader = /* glsl */ `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`

export const advectionShader = /* glsl */ `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;      // velocity grid
uniform vec2 dyeTexelSize;   // source (dye) grid — they differ in resolution
uniform float dt;
uniform float dissipation;
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
void main () {
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
  gl_FragColor.a = 1.0;
}
`

export const curlShader = /* glsl */ `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`

export const vorticityShader = /* glsl */ `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;

  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}
`

export const divergenceShader = /* glsl */ `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`

export const pressureShader = /* glsl */ `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`

export const gradientSubtractShader = /* glsl */ `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`

/**
 * The stain: two octaves of classic Perlin noise, thresholded through a
 * Bayer 8×8 matrix. The fluid flowmap quantises the cell size, so the grain
 * visibly coarsens where you drag the cursor.
 */
export const stainShader = /* glsl */ `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;

uniform sampler2D uFlowmap;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uTime;
uniform float uGranularity;
uniform float uFalloff;    // 0 = radial (hero / cases), 1 = linear (services)
uniform float uOpacity;

// ---- 区块窗口 ----------------------------------------------------------
// 原站没有全屏背景：stain 是 hero / services / cases 三个 section 内部的
// 绝对定位元素。我们只用一个全屏 canvas，靠这组矩形把颗粒圈回区块内。
//   uWindows[i]     可见裁剪矩形 (x0, y0, x1, y1)，设备像素，y 从底部数
//   uWindowField[i] 渐隐场 (cx, cy, halfW, halfH) —— hero 那份右移了 50%，
//                   所以场的中心和裁剪矩形不重合
//   uWindowMode[i]  0 = radial（hero / cases），1 = linear（services）
uniform int uWindowCount;
uniform vec4 uWindows[4];
uniform vec4 uWindowField[4];
uniform float uWindowMode[4];

// ---- classic Perlin 3D (Stefan Gustavson, webgl-noise, MIT) ----
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// ---- ordered dither, Bayer 8×8 computed rather than tabulated ----
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// 只保留落在某个注册区块内的颗粒，窗口外权重为 0。
float windowMask(vec2 frag) {
  float w = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i < uWindowCount) {
      vec4 r = uWindows[i];
      vec4 f = uWindowField[i];
      if (r.z > r.x && f.z > 0.0) {
        // 软裁剪到可见矩形（左右各 60px 羽化，上下同理）
        float fx = smoothstep(r.x, r.x + 60.0, frag.x)
                 * (1.0 - smoothstep(r.z - 60.0, r.z, frag.x));
        float fy = smoothstep(r.y - 60.0, r.y + 60.0, frag.y)
                 * (1.0 - smoothstep(r.w - 60.0, r.w + 60.0, frag.y));

        // 径向：以场中心为原点，向外淡出（对应原站 hero / cases 的 radial）
        vec2 q = (frag.xy - f.xy) / f.zw;
        float radialW = 1.0 - smoothstep(0.05, 0.82, length(q * vec2(0.85, 1.0)));

        // 线性：顶部保留、底部自然淡出。gl_FragCoord 的 y 从底部开始，
        // 因此 t.y 越大越靠上，不能再用 1-smoothstep 反向遮罩。
        vec2 t = (frag.xy - vec2(r.x, r.y)) / max(vec2(1.0), vec2(r.z - r.x, r.w - r.y));
        float linearW = smoothstep(0.08, 0.88, t.y);

        w = max(w, fx * fy * mix(radialW, linearW, uWindowMode[i]));
      }
    }
  }
  return w;
}

void main () {
  vec2 frag = gl_FragCoord.xy;

  float win = windowMask(frag);
  if (win <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Background and interaction are intentionally separate. The fluid is
  // sampled only on a coarse grid and can change the local dot size by one
  // step; it never injects brightness or colour into the stain itself.
  vec2 flowUv = floor((vUv * uResolution) / 25.0) * 25.0 / uResolution;
  float flowB = clamp(texture2D(uFlowmap, flowUv).b, 0.0, 1.0);
  float gran = uGranularity + floor(flowB);
  vec2 pixels = floor(vUv * uResolution / gran) * gran / uResolution;

  float n1 = clamp(cnoise(vec3(pixels * 5.4 + vec2(17.3, 31.7), uTime + 1000.0)) * 0.5 + 0.5, 0.0, 1.0);
  float n2 = clamp(cnoise(vec3(pixels * 5.4 + vec2(17.3, 31.7), uTime - 1000.0)) * 0.5 + 0.5, 0.0, 1.0);
  float n = clamp(n1 + n2, 0.0, 0.9);

  float d = bayer8(frag / max(1.0, gran));
  float v = step(d, n);

  gl_FragColor = vec4(uColor, v * win * uOpacity);
}
`
