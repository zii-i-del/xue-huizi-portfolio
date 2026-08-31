import { useEffect, useRef } from 'react'
import FluidStain from './fluidEngine'

/**
 * Stain — scrib3 的抖动噪声颗粒（Bayer 8×8 + 双层 Perlin），
 * 叠加一层独立计算的 Navier–Stokes 流体。流体只交给最终 stain pass
 * 局部调整颗粒格点，不改变背景亮度和颜色。
 *
 * 关键事实：原站**没有全屏背景**。stain 是三个 section 内部的绝对定位元素：
 *   .hero_stain     top:0; bottom:-17.36vw; transform:translateX(50%)
 *                   被 .hero_content{overflow:hidden} 裁掉左半，只露右半
 *   .services_stain top:0; bottom:-10.42vw;  linear 渐隐
 *   .cases_stain    radial 渐隐
 *
 * 所以我们保留一个全屏 canvas（只有一个 WebGL 上下文、一次 rAF），
 * 但把这些区块的屏幕矩形传进 shader，窗口外的像素直接丢弃。
 *
 * 用法：
 *   const ref = useStainWindow({ mode:'radial', shift:0.5, overflowBottom:17.36 })
 *   <div ref={ref} …>
 */

const MAX_WINDOWS = 4
const registry = new Set()

/**
 * @param {object}  opts
 * @param {'radial'|'linear'} opts.mode
 * @param {number}  opts.shift          横向偏移倍率（hero 的 translateX(50%)）
 * @param {number}  opts.overflowBottom 底部外扩，单位 vw（原站 -17.36vw / -10.42vw）
 */
export function useStainWindow({ mode = 'radial', shift = 0, overflowBottom = 0, topPercent = 0 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const entry = { el, mode, shift, overflowBottom, topPercent }
    registry.add(entry)
    return () => registry.delete(entry)
  }, [mode, shift, overflowBottom, topPercent])

  return ref
}

/** 把注册区块换算成屏幕矩形；离屏的（含外扩后仍离屏）直接丢掉。 */
function measure() {
  const vw = window.innerWidth / 100
  const vh = window.innerHeight
  const out = []

  registry.forEach(({ el, mode, shift, overflowBottom, topPercent }) => {
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) return

    const y0 = r.top + r.height * topPercent
    const y1 = r.bottom + overflowBottom * vw
    if (y1 < -120 || y0 > vh + 120) return

    const w = r.width
    const shifted = w * shift // hero：整个场右移自身宽度的 50%
    // 可见区间 = 右移后的盒子 ∩ 原盒子（原站靠 overflow:hidden 实现）
    const x0 = r.left + shifted
    const x1 = r.right
    if (x1 <= x0) return

    // 渐隐场：以右移后的盒子中心为原点
    const cx = r.left + shifted + w / 2
    const cy = (y0 + y1) / 2

    out.push({ x0, y0, x1, y1, cx, cy, hw: w / 2, hh: (y1 - y0) / 2, mode })
    if (out.length >= MAX_WINDOWS) return
  })

  return out
}

function hexToRgb(hex) {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return [0.843, 0.671, 0.773]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export default function StainField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const readColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--theme-contrast').trim() ||
      '#D7ABC5'

    const engine = new FluidStain(canvas, {
      color: hexToRgb(readColor()),
      opacity: 0.36,
      granularity: 2,
    })

    if (!engine.supported) {
      window.__stainReady = true
      window.dispatchEvent(new Event('stain-ready'))
      return undefined
    }
    window.__stain = engine
    window.__stainReady = true
    window.dispatchEvent(new Event('stain-ready'))

    engine.resize()

    // ---- pointer → fluid injection ----------------------------------
    // 原站全局采样 pointer，最终由 stain 窗口决定哪里可见。每帧仅消费最新
    // 一次输入，避免高刷鼠标不断堆积 splat。
    let last = null
    let pending = null
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth
      const y = 1 - e.clientY / window.innerHeight
      if (last) {
        pending = {
          x,
          y,
          dx: (e.clientX - last.clientX) * engine.opts.splatForce,
          dy: -(e.clientY - last.clientY) * engine.opts.splatForce,
        }
      }
      last = { x, y, clientX: e.clientX, clientY: e.clientY }
    }
    const onLeave = () => {
      last = null
    }

    // Pointer Events 同时覆盖鼠标和触摸；触摸只有在真实移动时才会注入。
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onLeave, { passive: true })
    window.addEventListener('pointercancel', onLeave, { passive: true })
    window.addEventListener('mouseleave', onLeave)

    // ---- accent token ------------------------------------------------
    const syncColor = () => engine.setOptions({ color: hexToRgb(readColor()) })
    const observer = new MutationObserver(syncColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-contrast'],
    })

    // ---- loop --------------------------------------------------------
    let raf = 0
    let prev = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.033, (now - prev) / 1000)
      prev = now

      engine.resize()
      const windows = measure()
      engine.setWindows(windows)

      if (pending && !reduced) {
        engine.splat(pending.x, pending.y, pending.dx, pending.dy, [0, 0, 1])
        pending = null
      }
      // 所有区块都离屏时只清屏，不跑流体 —— 省掉整条 pass 链。
      if (windows.length && !reduced) engine.step(dt)
      engine.draw(reduced ? 0 : dt)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onLeave)
      window.removeEventListener('pointercancel', onLeave)
      window.removeEventListener('mouseleave', onLeave)
      observer.disconnect()
      engine.destroy()
      delete window.__stain
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  )
}
