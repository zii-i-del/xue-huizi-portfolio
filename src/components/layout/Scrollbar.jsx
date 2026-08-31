import { useEffect, useRef, useState } from 'react'

/**
 * Custom scrollbar driven by Lenis progress.
 * Matches scrib3's geometry: a fixed right rail with a 0.5556vw thumb
 * (min-height 5.5556vw) that can be grabbed and dragged.
 */
export default function Scrollbar() {
  const railRef = useRef(null)
  const [state, setState] = useState({ top: 0, height: 20, visible: false })
  const dragging = useRef(false)

  useEffect(() => {
    const update = ({ progress, scroll, limit }) => {
      const rail = railRef.current
      if (!rail) return
      const railH = rail.clientHeight
      const minH = 48
      const h = Math.max(minH, railH * 0.14)
      const top = progress * (railH - h)
      setState({ top, height: h, visible: limit > 0 })
    }

    const lenis = window.__lenis
    if (lenis) {
      lenis.on('scroll', update)
      // initial paint
      setTimeout(() => update(lenis), 60)
    }

    const onNative = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight
      update({ progress: limit > 0 ? window.scrollY / limit : 0, limit })
    }
    window.addEventListener('scroll', onNative, { passive: true })
    window.addEventListener('resize', onNative)

    return () => {
      if (lenis) lenis.off('scroll', update)
      window.removeEventListener('scroll', onNative)
      window.removeEventListener('resize', onNative)
    }
  }, [])

  // drag handling
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !railRef.current) return
      const rail = railRef.current
      const rect = rail.getBoundingClientRect()
      const y = e.clientY - rect.top
      const ratio = Math.min(1, Math.max(0, (y - state.height / 2) / (rect.height - state.height)))
      const lenis = window.__lenis
      const limit = lenis
        ? lenis.limit
        : document.documentElement.scrollHeight - window.innerHeight
      if (lenis) lenis.scrollTo(ratio * limit, { immediate: true })
      else window.scrollTo(0, ratio * limit)
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [state.height])

  return (
    <div
      className="fixed bottom-0 right-0 top-0 z-40 hidden md:block"
      style={{ padding: '1.6666666667vw 0', opacity: state.visible ? 1 : 0, transition: 'opacity .3s' }}
    >
      <div ref={railRef} className="relative h-full" style={{ width: '0.5555555556vw', minWidth: 8 }}>
        <div
          onPointerDown={() => {
            dragging.current = true
            document.body.style.userSelect = 'none'
          }}
          className="absolute right-0 cursor-grab active:cursor-grabbing"
          style={{
            top: state.top,
            height: state.height,
            width: '0.5555555556vw',
            minWidth: 8,
            backgroundColor: 'var(--theme-contrast)',
          }}
        />
      </div>
    </div>
  )
}
