import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const GALLERY_ITEMS = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1).padStart(2, '0'),
  image: `./images/${index + 1}.png`,
  aspect: 3840 / 5434,
}))

const LOOP_ITEMS = [...GALLERY_ITEMS, ...GALLERY_ITEMS]

function createNumberTexture(id) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#615a69'
  context.font = '32px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(id, canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function GalleryCard({ dimensions, index, item, motion, reducedMotion, spacingRef, total }) {
  const groupRef = useRef(null)
  const extraRef = useRef(0)
  const smoothedVelocity = useRef(0)
  const texture = useLoader(THREE.TextureLoader, item.image)
  const numberTexture = useMemo(() => createNumberTexture(item.id), [item.id])
  const material = useMemo(() => {
    const nextMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
    })

    nextMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: Math.random() * 100 }
      shader.uniforms.uVelocity = { value: 0 }
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          uniform float uVelocity;`,
        )
        .replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(position);
          float wave = sin(position.x * 4.0 + uTime) + cos(position.y * 2.8 + uTime * 0.85);
          transformed.z += wave * 0.085 * uVelocity;`,
        )
      nextMaterial.userData.shader = shader
    }

    nextMaterial.customProgramCacheKey = () => 'jidu-gallery-velocity-wave-v1'
    return nextMaterial
  }, [texture])

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }, [texture])

  useEffect(() => () => numberTexture.dispose(), [numberTexture])
  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const spacing = spacingRef.current
    const widthTotal = spacing * total
    const baseX = (index - total / 2) * spacing
    let x = baseX - motion.current - extraRef.current
    const boundary = dimensions.viewportWidth / 2 + dimensions.cardWidth

    if (motion.direction > 0 && x < -boundary) {
      extraRef.current -= widthTotal
      x += widthTotal
    } else if (motion.direction < 0 && x > boundary) {
      extraRef.current += widthTotal
      x -= widthTotal
    }

    const normalized = THREE.MathUtils.clamp(x / Math.max(dimensions.viewportWidth / 2, 0.001), -1.35, 1.35)
    const y = Math.cos(normalized * 0.95) * dimensions.arcHeight - dimensions.arcHeight
    group.position.set(x, y, 0)
    group.rotation.z = -normalized * 0.16

    const targetVelocity = reducedMotion ? 0 : Math.min(Math.abs(motion.speed) * 4.5, 1)
    smoothedVelocity.current = THREE.MathUtils.lerp(
      smoothedVelocity.current,
      targetVelocity,
      Math.min(1, delta * 9),
    )
    const shader = material.userData.shader
    if (shader) {
      shader.uniforms.uTime.value += delta * 2.4
      shader.uniforms.uVelocity.value = smoothedVelocity.current
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[dimensions.cardWidth, dimensions.cardHeight, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
      <sprite position={[0, -dimensions.cardHeight / 2 - dimensions.labelGap, 0.02]} scale={[0.58, 0.145, 1]}>
        <spriteMaterial map={numberTexture} transparent depthTest={false} />
      </sprite>
    </group>
  )
}

function GalleryScene({ motion, reducedMotion, spacingRef }) {
  const { size, viewport } = useThree()
  const mobile = size.width < 768
  const cardWidthPixels = mobile
    ? Math.min(size.width * 0.78, (size.height - 130) * GALLERY_ITEMS[0].aspect)
    : Math.min(size.width * 0.43, (size.height - 150) * GALLERY_ITEMS[0].aspect, 670)
  const cardWidth = cardWidthPixels * (viewport.width / size.width)
  const cardHeight = cardWidth / GALLERY_ITEMS[0].aspect
  const spacing = cardWidth * (mobile ? 1.28 : 1.32)
  const dimensions = useMemo(() => ({
    cardWidth,
    cardHeight,
    viewportWidth: viewport.width,
    arcHeight: mobile ? 0.32 : 0.56,
    labelGap: mobile ? 0.13 : 0.16,
  }), [cardHeight, cardWidth, mobile, viewport.width])

  spacingRef.current = spacing

  useFrame((_, delta) => {
    const previous = motion.current
    const ease = reducedMotion ? 1 : 1 - Math.pow(0.0008, delta)
    motion.current = THREE.MathUtils.lerp(motion.current, motion.target, ease)
    motion.speed = motion.current - previous
    if (Math.abs(motion.speed) > 0.000001) motion.direction = motion.speed > 0 ? 1 : -1
    motion.last = previous
  }, -10)

  return (
    <>
      {LOOP_ITEMS.map((item, index) => (
        <GalleryCard
          key={`${item.id}-${index}`}
          dimensions={dimensions}
          index={index}
          item={item}
          motion={motion}
          reducedMotion={reducedMotion}
          spacingRef={spacingRef}
          total={LOOP_ITEMS.length}
        />
      ))}
    </>
  )
}

function FallbackGallery() {
  return (
    <div className="jidu-gallery-fallback" aria-label="集度作品占位图画廊">
      {GALLERY_ITEMS.map((item) => (
        <figure key={item.id}>
          <img src={item.image} alt={`集度视觉设计 ${item.id}`} />
          <figcaption>{item.id}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

export default function JiduGalleryPage() {
  const [webGLAvailable, setWebGLAvailable] = useState(supportsWebGL)
  const [reducedMotion, setReducedMotion] = useState(false)
  const motionRef = useRef({ current: 0, target: 0, last: 0, speed: 0, direction: 1 })
  const spacingRef = useRef(1)
  const dragRef = useRef({ active: false, startX: 0, startTarget: 0 })
  const snapTimerRef = useRef(null)

  const snapToNearest = useCallback(() => {
    const spacing = spacingRef.current || 1
    motionRef.current.target = Math.round(motionRef.current.target / spacing) * spacing
  }, [])

  const scheduleSnap = useCallback(() => {
    window.clearTimeout(snapTimerRef.current)
    snapTimerRef.current = window.setTimeout(snapToNearest, reducedMotion ? 0 : 200)
  }, [reducedMotion, snapToNearest])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => () => window.clearTimeout(snapTimerRef.current), [])

  const onWheel = useCallback((event) => {
    event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    motionRef.current.target += delta * 0.0042
    scheduleSnap()
  }, [scheduleSnap])

  const onPointerDown = useCallback((event) => {
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startTarget: motionRef.current.target,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }, [])

  const onPointerMove = useCallback((event) => {
    if (!dragRef.current.active) return
    motionRef.current.target = dragRef.current.startTarget + (dragRef.current.startX - event.clientX) * 0.012
  }, [])

  const onPointerUp = useCallback((event) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    scheduleSnap()
  }, [scheduleSnap])

  const onBack = useCallback(() => {
    sessionStorage.setItem('portfolio:return-to-cases', '1')
    window.location.replace('../../#cases')
  }, [])

  return (
    <main
      className={`jidu-gallery-page${webGLAvailable ? '' : ' is-fallback'}`}
      onWheel={webGLAvailable ? onWheel : undefined}
      onPointerDown={webGLAvailable ? onPointerDown : undefined}
      onPointerMove={webGLAvailable ? onPointerMove : undefined}
      onPointerUp={webGLAvailable ? onPointerUp : undefined}
      onPointerCancel={webGLAvailable ? onPointerUp : undefined}
    >
      <header className="jidu-gallery-header">
        <button
          type="button"
          className="jidu-gallery-back"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onBack}
          aria-label="返回作品集"
        >
          <span aria-hidden="true">←</span>
          <span>返回作品集</span>
        </button>
        <h1>集度汽车 UI 设计</h1>
      </header>

      {webGLAvailable ? (
        <div className="jidu-gallery-canvas" aria-label="无限循环作品画廊">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ fov: 45, position: [0, 0, 10] }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#eeedf4', 1)
              gl.outputColorSpace = THREE.SRGBColorSpace
              gl.domElement.addEventListener('webglcontextlost', () => setWebGLAvailable(false), { once: true })
            }}
          >
            <Suspense fallback={null}>
              <GalleryScene motion={motionRef.current} reducedMotion={reducedMotion} spacingRef={spacingRef} />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <FallbackGallery />
      )}

      <p className="jidu-gallery-hint" aria-hidden="true">SCROLL / DRAG</p>
    </main>
  )
}
