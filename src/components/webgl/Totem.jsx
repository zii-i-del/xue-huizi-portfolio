import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { createTextBand } from './totemText'

/**
 * WebGLTotem — scrib3.co's stacked isometric cube, rebuilt on real Three.js.
 *
 * Reverse-engineered spec (chunk 5333.js):
 *   · orthographic, isometric projection
 *   · group rotation (π/6, -π/4, 0)
 *   · boxGeometry [1.4, 0.45, 1.4], layer spacing 1.06
 *   · outlines via EdgesGeometry(threshold 15) on a copy scaled 1.0075
 *     — NOT a post-processing outline pass
 *   · side faces carry a CanvasTexture band scrolled by offset.x
 *   · entrance: rotateY 0 → 180°, 2s, elastic.out(1, 0.75), stagger 0.1
 *
 * Layers run bottom → top, so index 0 is the lowest slab.
 */

const BOX = [1.4, 0.45, 1.4]
const GAP = 0.62

/**
 * 开发期调试句柄：暴露每一层的 pivot / 贴图，方便验证
 * 「只有 active 层自转 + 滚字」。生产构建里是 null，会被摇掉。
 */
const DEV_LAYERS = import.meta.env.DEV ? [] : null
if (DEV_LAYERS && typeof window !== 'undefined') window.__totemLayers = DEV_LAYERS

function readVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

/**
 * Frames the stack. The projected silhouette is ~2.0 × 3.6 world units, so we
 * fit both axes and take the tighter of the two — that keeps the totem filling
 * ~85% of the height without ever clipping on a narrow column.
 */
function CameraRig({ fitWidth = 2.02, fitHeight = 3.72 }) {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    camera.zoom = Math.max(1, Math.min(size.width / fitWidth, size.height / fitHeight))
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, fitWidth, fitHeight])
  return null
}

function Layer({
  index,
  total,
  active,
  label,
  fontRevision,
  contrast,
  primary,
  secondary,
}) {
  const pivot = useRef(null)
  const slab = useRef(null)
  const edgeMat = useRef(null)
  const switchTween = useRef(null)
  const firstActiveRun = useRef(true)

  const y = (index - (total - 1) / 2) * GAP

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(...BOX), [])
  const edgeGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry, 15), [boxGeometry])
  useEffect(
    () => () => {
      boxGeometry.dispose()
      edgeGeometry.dispose()
    },
    [boxGeometry, edgeGeometry]
  )

  // ---- textures -------------------------------------------------------
  const { band } = useMemo(() => {
    const band = createTextBand(label, {
      repeat: 6,
      fontSize: 80,
      height: 76,
      // 原站立方体侧面的英文字与大标题共用 Pack。这里不再让
      // Canvas 在字体未就绪时静默落到细体系统字体。
      fontFamily: '"Pack"',
      letterSpacing: 0,
      background: primary,
      accent: contrast,
    })
    if (band?.image) {
      const textureAspect = band.image.width / band.image.height
      const faceAspect = BOX[0] / BOX[1]
      band.repeat.x = (faceAspect / textureAspect) * 1.4
      band.needsUpdate = true
    }
    return { band }
  }, [label, primary, contrast, fontRevision])

  useEffect(() => {
    return () => {
      band?.dispose()
    }
  }, [band])

  // ---- entrance ------------------------------------------------------
  useEffect(() => {
    const el = pivot.current
    if (!el) return undefined
    el.rotation.y = 0
    const tween = gsap.to(el.rotation, {
      y: Math.PI,
      duration: 2,
      ease: 'elastic.out(1, 0.75)',
      delay: (total - 1 - index) * 0.1,
    })
    return () => tween.kill()
  }, [index, total])

  // 原站的“到层后弹一下”：仅新选中的单层绕 Y 轴翻转并弹性回摆。
  useEffect(() => {
    if (firstActiveRun.current) {
      firstActiveRun.current = false
      return undefined
    }
    if (!pivot.current) return undefined

    switchTween.current?.kill()
    gsap.killTweensOf(pivot.current.rotation)
    if (!active) {
      pivot.current.rotation.y = Math.PI
      if (slab.current) slab.current.scale.set(1, 1, 1)
      return undefined
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    switchTween.current = gsap.fromTo(
      pivot.current.rotation,
      { y: 0 },
      {
        y: Math.PI,
        duration: reduced ? 0.25 : 1.6,
        ease: reduced ? 'power2.out' : 'elastic.out(1, 0.75)',
        overwrite: true,
        onComplete: () => {
          if (pivot.current) {
            pivot.current.rotation.y = Math.PI
            pivot.current.rotation.x = 0
            pivot.current.rotation.z = 0
          }
        },
      }
    )
    return () => switchTween.current?.kill()
  }, [active])

  // ---- dev 调试句柄 ---------------------------------------------------
  useEffect(() => {
    if (!DEV_LAYERS) return undefined
    const rec = { index, active, pivot, mesh: meshRef, band }
    DEV_LAYERS.push(rec)
    return () => {
      const at = DEV_LAYERS.indexOf(rec)
      if (at >= 0) DEV_LAYERS.splice(at, 1)
    }
  }, [index, active, band])

  // ---- per-frame: only the selected text band moves ------------------
  const meshRef = useRef(null)

  // 原站按 visible 布尔值切换文字，不做旧层淡出。这里保留共享的
  // box material，但在 active 改变时同步切色，视觉结果同样是即时显隐。
  useEffect(() => {
    const mats = meshRef.current?.material
    if (mats) {
      for (let i = 0; i < mats.length; i++) {
        const isSide = i !== 2 && i !== 3
        mats[i].color.set(isSide && active ? '#ffffff' : primary)
      }
    }
    if (edgeMat.current) edgeMat.current.color.set(active ? contrast : secondary)
    if (slab.current && !active) slab.current.scale.set(1, 1, 1)
  }, [active, contrast, primary, secondary])

  useFrame((_, delta) => {
    // 只有目标层文字继续滚动；旧层立即冻结在当前 offset。
    if (band && active) band.offset.x = (band.offset.x - delta * 0.06) % 1
  })

  return (
    <group ref={pivot} position={[0, y, 0]}>
      <group ref={slab}>
        <mesh
          ref={(m) => {
            meshRef.current = m
          }}
          geometry={boxGeometry}
        >
          {/* material order: +x −x +y −y +z −z
              初始 color 为 primary（黑）—— 文字贴图被压掉，
              只有该层被选中时才 lerp 到白色把字显出来。 */}
          <meshBasicMaterial attach="material-0" map={band} color={primary} toneMapped={false} />
          <meshBasicMaterial attach="material-1" map={band} color={primary} toneMapped={false} />
          <meshBasicMaterial attach="material-2" color={primary} toneMapped={false} />
          <meshBasicMaterial attach="material-3" color={primary} toneMapped={false} />
          <meshBasicMaterial attach="material-4" map={band} color={primary} toneMapped={false} />
          <meshBasicMaterial attach="material-5" map={band} color={primary} toneMapped={false} />
        </mesh>

        {/* outline — geometry re-used, scaled just enough to sit on top */}
        <lineSegments geometry={edgeGeometry} scale={1.0075}>
          <lineBasicMaterial ref={edgeMat} color={secondary} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  )
}

/**
 * 整体保持静止 —— 层级关系完全靠"哪一层在自转 + 哪一层亮着字"来表达。
 * （之前是整叠按 -active*0.32 缓慢漂移，看不出到底选中了哪层。）
 */
function Stack({ labels, active, fontRevision, contrast, primary, secondary }) {
  const activeLayer = labels.length - 1 - active
  return (
    <group rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
      <group>
        {labels.map((_, i) => (
          <Layer
            key={`totem-layer-${i}`}
            index={i}
            total={labels.length}
            active={i === activeLayer}
            label={labels[labels.length - 1 - i]}
            fontRevision={fontRevision}
            contrast={contrast}
            primary={primary}
            secondary={secondary}
          />
        ))}
      </group>
    </group>
  )
}

/**
 * @param {string[]} labels  card order, top → bottom
 * @param {number}   active  selected card index (mapped to the reversed layer)
 */
export default function Totem({
  labels,
  active = 0,
  className = '',
  style,
}) {
  const [fontRevision, setFontRevision] = useState(() =>
    typeof document !== 'undefined' && document.fonts?.check('80px "Pack"') ? 1 : 0
  )
  const [colors, setColors] = useState(() => ({
    primary: readVar('--theme-primary', '#000000'),
    secondary: readVar('--theme-secondary', '#ECECEC'),
    contrast: readVar('--theme-contrast', '#D7ABC5'),
  }))

  // CanvasTexture 不会在 Web Font 到达后自动重绘。字体加载完成时递增
  // revision，让四条文字带用真正的 Pack 重新生成一次。
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return undefined
    let live = true
    document.fonts.load('80px "Pack"').then(() => {
      if (live) setFontRevision(1)
    })
    return () => {
      live = false
    }
  }, [])

  // the accent is switched at runtime by the header colour picker —
  // watch the inline style on <html> and re-read the token
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = () =>
      setColors((c) => {
        const next = readVar('--theme-contrast', c.contrast)
        return next === c.contrast ? c : { ...c, contrast: next }
      })
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-contrast'],
    })
    return () => obs.disconnect()
  }, [])

  return (
    <div className={className} style={style}>
      <Canvas
        orthographic
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], near: -100, far: 200, zoom: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraRig />
        <Stack
          labels={labels}
          active={active}
          fontRevision={fontRevision}
          contrast={colors.contrast}
          primary={colors.primary}
          secondary={colors.secondary}
        />
      </Canvas>
    </div>
  )
}
