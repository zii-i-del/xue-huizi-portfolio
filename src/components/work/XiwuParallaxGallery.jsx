import { useCallback, useEffect, useRef, useState } from 'react'

const ITEMS = Array.from({ length: 7 }, (_, index) => ({
  id: String(index + 1).padStart(2, '0'),
  image: `./images/${index + 1}.png`,
}))

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function XiwuParallaxGallery() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const itemRefs = useRef([])
  const progressRef = useRef(null)
  const animationRef = useRef(0)
  const motionRef = useRef({ current: 0, target: 0, min: 0 })
  const dragRef = useRef({ active: false, startX: 0, startTarget: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    motionRef.current.min = Math.min(0, window.innerWidth - track.scrollWidth)
    motionRef.current.target = clamp(motionRef.current.target, motionRef.current.min, 0)
    motionRef.current.current = clamp(motionRef.current.current, motionRef.current.min, 0)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    measure()
    const resizeObserver = new ResizeObserver(measure)
    if (trackRef.current) resizeObserver.observe(trackRef.current)
    window.addEventListener('resize', measure, { passive: true })

    const render = () => {
      const motion = motionRef.current
      const ease = reducedMotion ? 1 : 0.095
      motion.current += (motion.target - motion.current) * ease

      if (Math.abs(motion.target - motion.current) < 0.01) motion.current = motion.target
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${motion.current}px, 0, 0)`
      }

      const progress = motion.min === 0 ? 0 : motion.current / motion.min
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure, reducedMotion])

  const onWheel = useCallback((event) => {
    event.preventDefault()
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    const motion = motionRef.current
    motion.target = clamp(motion.target - delta * 0.9, motion.min, 0)
  }, [])

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
    const motion = motionRef.current
    motion.target = clamp(
      dragRef.current.startTarget + (event.clientX - dragRef.current.startX) * 1.5,
      motion.min,
      0,
    )
  }, [])

  const stopDragging = useCallback((event) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }, [])

  const onBack = useCallback(() => {
    sessionStorage.setItem('portfolio:return-to-cases', '1')
    window.location.replace('../../#cases')
  }, [])

  return (
    <main className="xiwu-gallery-page">
      <header className="xiwu-gallery-header">
        <button
          type="button"
          className="xiwu-gallery-back"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onBack}
          aria-label="返回作品集"
        >
          <span aria-hidden="true">←</span>
          <span>返回作品集</span>
        </button>
        <h1>APP视觉改版</h1>
      </header>

      <div
        ref={viewportRef}
        className="xiwu-gallery-viewport"
        aria-label="APP视觉改版图片画廊"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <div ref={trackRef} className="xiwu-gallery-track">
          {ITEMS.map((item, index) => (
            <figure
              key={item.id}
              ref={(node) => { itemRefs.current[index] = node }}
              className="xiwu-gallery-item"
            >
              <div className="xiwu-gallery-image">
                <img src={item.image} alt={`APP视觉改版 ${item.id}`} onLoad={measure} draggable="false" />
              </div>
              <figcaption>{item.id}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="xiwu-gallery-progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>
      <p className="xiwu-gallery-hint" aria-hidden="true">SCROLL / DRAG</p>
    </main>
  )
}
