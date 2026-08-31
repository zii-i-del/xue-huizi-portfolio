import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const SOURCE_WIDTH = 1920

const APP_ASSETS = [
  ['app-00.png', 1080],
  ['app-1.png', 2079],
  ['app-2.png', 3353],
  ['app-3.png', 2345],
  ['app-4.png', 1173],
  ['app-5.png', 3981],
  ['app-6.png', 2118],
  ['app-7.png', 2721],
  ['app-8.png', 2579],
  ['app-9.png', 2679],
  ['app-10.png', 2532],
  ['app-11.png', 2636],
  ['app-12.png', 3164],
  ['app-13.png', 3003],
  ['app-14.png', 3345],
  ['app-15.png', 2548],
  ['app-16.png', 4417],
  ['app-17.png', 4267],
  ['app-18.png', 4547],
  ['app-19.png', 4547],
  ['app-20.png', 3888],
  ['app-20-1.png', 1905],
  ['app-21.png', 2237],
  ['app-22.png', 1478],
  ['app-23.png', 2679],
]

const ADMIN_ASSETS = [
  ['admin-00.png', 1080],
  ['admin-01.png', 1822],
  ['admin-02.png', 2977],
  ['admin-03.png', 4053],
  ['admin-04.png', 3253],
  ['admin-05.png', 2246],
  ['admin-06.png', 3113],
  ['admin-07.png', 2168],
  ['admin-08.png', 3835],
  ['admin-09.png', 4358],
  ['admin-10.png', 4446],
  ['admin-11.png', 2486],
]

const ITEMS = [...APP_ASSETS, ...ADMIN_ASSETS].map(([file, height], index) => ({
  id: String(index + 1).padStart(2, '0'),
  aspect: SOURCE_WIDTH / height,
  image: `./images/${file}`,
  group: index < APP_ASSETS.length ? '移动端 APP' : '后台管理系统',
}))

function getLayout(viewportWidth) {
  const columns = viewportWidth < 620 ? 2 : viewportWidth < 1040 ? 3 : 4
  const cardWidth = viewportWidth < 620 ? 188 : viewportWidth < 1040 ? 260 : 320
  const gap = viewportWidth < 620 ? 18 : 28
  const padding = viewportWidth < 620 ? 84 : 150
  const columnHeights = Array(columns).fill(0)

  const items = ITEMS.map((item) => {
    const column = columnHeights.indexOf(Math.min(...columnHeights))
    const height = cardWidth / item.aspect
    const left = padding + column * (cardWidth + gap)
    const top = padding + columnHeights[column]
    columnHeights[column] += height + gap
    return { ...item, left, top, width: cardWidth, height }
  })

  return {
    items,
    width: padding * 2 + columns * cardWidth + (columns - 1) * gap,
    height: padding * 2 + Math.max(...columnHeights) - gap,
  }
}

export default function YoujiaMasonryGallery() {
  const viewportRef = useRef(null)
  const canvasRef = useRef(null)
  const itemRefs = useRef([])
  const mediaRef = useRef(null)
  const backdropRef = useRef(null)
  const animationRef = useRef(0)
  const introRef = useRef(null)
  const positionRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 })
  const dragRef = useRef({ active: false, startX: 0, startY: 0, targetX: 0, targetY: 0, moved: false })
  const imageDragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, panX: 0, panY: 0 })

  const [layout, setLayout] = useState(() => getLayout(window.innerWidth))
  const [selected, setSelected] = useState(null)
  const [closing, setClosing] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  const setBounds = useCallback((nextLayout) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const margin = 28
    const maxX = margin
    const maxY = margin
    const minX = Math.min(maxX, viewport.clientWidth - nextLayout.width - margin)
    const minY = Math.min(maxY, viewport.clientHeight - nextLayout.height - margin)
    const position = positionRef.current
    position.minX = minX
    position.maxX = maxX
    position.minY = minY
    position.maxY = maxY
    position.targetX = clamp(position.targetX, minX, maxX)
    position.targetY = clamp(position.targetY, minY, maxY)
    position.currentX = clamp(position.currentX, minX, maxX)
    position.currentY = clamp(position.currentY, minY, maxY)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    setBounds(layout)
    const position = positionRef.current
    position.currentX = position.targetX = (window.innerWidth - layout.width) / 2
    position.currentY = position.targetY = position.maxY
    setBounds(layout)
  }, [layout, setBounds])

  useEffect(() => {
    const onResize = () => setLayout(getLayout(window.innerWidth))
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const render = () => {
      const position = positionRef.current
      const ease = reducedMotion ? 1 : 0.115
      position.currentX += (position.targetX - position.currentX) * ease
      position.currentY += (position.targetY - position.currentY) * ease
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate3d(${position.currentX}px, ${position.currentY}px, 0)`
      }
      animationRef.current = requestAnimationFrame(render)
    }
    animationRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationRef.current)
  }, [reducedMotion])

  useEffect(() => {
    if (!canvasRef.current || reducedMotion) return undefined
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    introRef.current = gsap.fromTo(
      itemRefs.current,
      { left: centerX, top: centerY, scale: 0.72, opacity: 0 },
      {
        left: (index) => layout.items[index].left,
        top: (index) => layout.items[index].top,
        scale: 1,
        opacity: 1,
        duration: 0.65,
        stagger: { amount: 0.9, from: 'center' },
        ease: 'power3.out',
      },
    )
    return () => introRef.current?.kill()
  }, [layout, reducedMotion])

  const onWheel = useCallback((event) => {
    if (selected) return
    event.preventDefault()
    const position = positionRef.current
    position.targetX = clamp(position.targetX - event.deltaX, position.minX, position.maxX)
    position.targetY = clamp(position.targetY - event.deltaY, position.minY, position.maxY)
  }, [selected])

  const onPointerDown = useCallback((event) => {
    if (selected) return
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      targetX: positionRef.current.targetX,
      targetY: positionRef.current.targetY,
      moved: false,
    }
  }, [selected])

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current
    if (!drag.active) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (Math.hypot(dx, dy) > 5 && !drag.moved) {
      drag.moved = true
      event.currentTarget.setPointerCapture?.(drag.pointerId)
    }
    if (!drag.moved) return
    const position = positionRef.current
    position.targetX = clamp(drag.targetX + dx, position.minX, position.maxX)
    position.targetY = clamp(drag.targetY + dy, position.minY, position.maxY)
  }, [])

  const stopDragging = useCallback((event) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const openImage = useCallback((item, event) => {
    if (dragRef.current.moved) return
    const sourceRect = event.currentTarget.getBoundingClientRect()
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setClosing(false)
    setSelected({ ...item, sourceRect })
  }, [])

  useLayoutEffect(() => {
    if (!selected || !mediaRef.current || !backdropRef.current) return undefined
    const media = mediaRef.current
    const targetRect = media.getBoundingClientRect()
    const source = selected.sourceRect
    const x = source.left + source.width / 2 - (targetRect.left + targetRect.width / 2)
    const y = source.top + source.height / 2 - (targetRect.top + targetRect.height / 2)
    const scaleX = source.width / targetRect.width
    const scaleY = source.height / targetRect.height

    const context = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: reducedMotion ? 0 : 0.35 })
      gsap.fromTo(
        media,
        { x, y, scaleX, scaleY, opacity: 0.7 },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: reducedMotion ? 0 : 0.72, ease: 'power4.inOut' },
      )
    })
    return () => context.revert()
  }, [reducedMotion, selected])

  const closeImage = useCallback(() => {
    if (!selected || closing) return
    setClosing(true)
    const media = mediaRef.current
    const source = selected.sourceRect
    const targetRect = media?.getBoundingClientRect()
    if (!media || !targetRect || reducedMotion) {
      setSelected(null)
      setClosing(false)
      return
    }
    const x = source.left + source.width / 2 - (targetRect.left + targetRect.width / 2)
    const y = source.top + source.height / 2 - (targetRect.top + targetRect.height / 2)
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 })
    gsap.to(media, {
      x,
      y,
      scaleX: source.width / targetRect.width,
      scaleY: source.height / targetRect.height,
      opacity: 0,
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: () => {
        setSelected(null)
        setClosing(false)
      },
    })
  }, [closing, reducedMotion, selected])

  useEffect(() => {
    if (!selected) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeImage()
      if (event.key === '+' || event.key === '=') setZoom((value) => clamp(value + 0.25, 0.5, 5))
      if (event.key === '-') setZoom((value) => clamp(value - 0.25, 0.5, 5))
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeImage, selected])

  const onLightboxWheel = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setZoom((value) => clamp(value * Math.exp(-event.deltaY * 0.0014), 0.5, 5))
  }, [])

  const onImagePointerDown = useCallback((event) => {
    if (zoom <= 1) return
    event.stopPropagation()
    imageDragRef.current = { active: true, moved: false, startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }, [pan.x, pan.y, zoom])

  const onImagePointerMove = useCallback((event) => {
    const drag = imageDragRef.current
    if (!drag.active) return
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) drag.moved = true
    setPan({ x: drag.panX + event.clientX - drag.startX, y: drag.panY + event.clientY - drag.startY })
  }, [])

  const stopImageDragging = useCallback((event) => {
    imageDragRef.current.active = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }, [])

  const onImageClick = useCallback((event) => {
    event.stopPropagation()
    if (imageDragRef.current.moved) {
      imageDragRef.current.moved = false
      return
    }
    if (zoom > 1) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    } else {
      setZoom(2)
    }
  }, [zoom])

  const onBack = useCallback(() => {
    sessionStorage.setItem('portfolio:return-to-cases', '1')
    window.location.replace('../../#cases')
  }, [])

  const renderedItems = useMemo(() => layout.items, [layout])

  return (
    <main className="youjia-gallery-page">
      <header className="youjia-gallery-header">
        <button type="button" className="youjia-gallery-back" onClick={onBack}>
          <span aria-hidden="true">←</span><span>返回作品集</span>
        </button>
        <h1>优佳医美APP设计</h1>
        <p>DRAG / SCROLL · CLICK TO VIEW</p>
      </header>

      <div
        ref={viewportRef}
        className="youjia-gallery-viewport"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <div ref={canvasRef} className="youjia-gallery-canvas" style={{ width: layout.width, height: layout.height }}>
          {renderedItems.map((item, index) => (
            <button
              type="button"
              key={item.id}
              ref={(node) => { itemRefs.current[index] = node }}
              className="youjia-gallery-item"
              style={{ left: item.left, top: item.top, width: item.width, height: item.height }}
              onClick={(event) => openImage(item, event)}
              aria-label={`查看${item.group}素材 ${item.id}`}
            >
              <img
                src={item.image}
                alt={`优佳医美APP设计${item.group}素材 ${item.id}`}
                draggable="false"
                loading={index < 8 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span>{item.id}</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          ref={backdropRef}
          className="youjia-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`查看素材 ${selected.id}`}
          onClick={closeImage}
          onWheel={onLightboxWheel}
        >
          <div className="youjia-lightbox-stage">
            <div
              ref={mediaRef}
              className={`youjia-lightbox-media${zoom > 1 ? ' is-zoomed' : ''}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={onImagePointerDown}
              onPointerMove={onImagePointerMove}
              onPointerUp={stopImageDragging}
              onPointerCancel={stopImageDragging}
              style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0)` }}
            >
              <img
                src={selected.image}
                alt={`优佳医美APP设计完整${selected.group}素材 ${selected.id}`}
                draggable="false"
                style={{ transform: `scale(${zoom})` }}
                onClick={onImageClick}
              />
            </div>
          </div>
          <div className="youjia-lightbox-controls" onClick={(event) => event.stopPropagation()}>
            <span>{selected.id}</span>
            <button type="button" onClick={() => setZoom((value) => clamp(value - 0.25, 0.5, 5))} aria-label="缩小">−</button>
            <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => setZoom((value) => clamp(value + 0.25, 0.5, 5))} aria-label="放大">＋</button>
            <button type="button" className="youjia-lightbox-close" onClick={closeImage}>关闭 ×</button>
          </div>
        </div>
      )}
    </main>
  )
}
