import { useEffect, useRef, useState } from 'react'

/**
 * Custom cursor — scrib3's exact treatment:
 *   40px accent disc, opacity .4, mix-blend-mode difference,
 *   trailing the pointer with a 0.6s ease-out-expo transition,
 *   and shrinking to 50% over anything interactive.
 *
 * Position is written straight to the ref — no React state per mousemove.
 */
export default function Cursor() {
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!canHover) return
    setEnabled(true)

    const el = ref.current
    if (!el) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let raf = 0

    const apply = () => {
      raf = 0
      if (ref.current) ref.current.style.left = `${x}px`
      if (ref.current) ref.current.style.top = `${y}px`
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      // the CSS transition does the easing — one write per frame is plenty
      if (!raf) raf = requestAnimationFrame(apply)
    }

    const interactive = (target) =>
      target instanceof Element
        ? !!target.closest('a, button, [role="button"], input, textarea, [data-cursor]')
        : false

    const onOver = (e) => {
      if (!ref.current) return
      ref.current.classList.toggle('cursor_pointer', interactive(e.target))
    }

    const onLeave = () => ref.current?.classList.add('is-out')
    const onEnter = () => ref.current?.classList.remove('is-out')

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="cursor_container" aria-hidden="true" style={{ zIndex: 60 }}>
      <span ref={ref} className="cursor_cursor" />
    </div>
  )
}
