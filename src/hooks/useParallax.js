import { useEffect, useRef } from 'react'

/**
 * Pointer parallax — translates children marked with data-speed toward/away
 * from the cursor. Reads [data-parallax-layer] descendants.
 *
 * Usage:
 *   const ref = useParallax({ strength: 28 })
 *   <div ref={ref}>
 *     <span data-parallax-layer data-speed="0.6" />
 *   </div>
 */
export function useParallax({ strength = 26, damping = 0.09 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const layers = Array.from(root.querySelectorAll('[data-parallax-layer]'))
    if (!layers.length) return

    let raf = null
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const tick = () => {
      current.x += (target.x - current.x) * damping
      current.y += (target.y - current.y) * damping
      layers.forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '1')
        el.style.transform = `translate3d(${(current.x * strength * speed).toFixed(2)}px, ${(
          current.y *
          strength *
          speed
        ).toFixed(2)}px, 0)`
      })
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [strength, damping])

  return ref
}

/**
 * Scroll parallax — moves an element vertically as the page scrolls.
 */
export function useScrollParallax(speed = 0.25) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2
        el.style.transform = `translate3d(0, ${(-centerOffset * speed).toFixed(2)}px, 0)`
        raf = null
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return ref
}
