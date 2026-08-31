import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SLIDE_VIEW_HEIGHT = 141.45
// The Codrops source bends by 5 units in a 60-unit-high, viewport-wide panel.
// Our portrait panel occupies far less screen width, so compensate its on-screen
// bend instead of applying the source's raw path number to a much narrower card.
const PORTRAIT_BEND_COMPENSATION = 1.65
const BEND_DEPTH = SLIDE_VIEW_HEIGHT * (5 / 60) * PORTRAIT_BEND_COMPENSATION

const SLIDES = Array.from({ length: 3 }, (_, index) => ({
  id: String(index + 1).padStart(2, '0'),
  image: `./images/${index + 1}.png`,
}))

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function cubicBezier(value, x1, y1, x2, y2) {
  const sample = (time, first, second) => {
    const inverse = 1 - time
    return 3 * inverse * inverse * time * first
      + 3 * inverse * time * time * second
      + time * time * time
  }

  let low = 0
  let high = 1
  for (let index = 0; index < 18; index += 1) {
    const middle = (low + high) / 2
    if (sample(middle, x1, x2) < value) low = middle
    else high = middle
  }
  return sample((low + high) / 2, y1, y2)
}

// Snap.svg's mina.elastic easing, used by the original WobblySlideshowEffect.
// Returning the remaining displacement gives us a curved -> flat morph with
// the same early overshoot and progressively smaller rebounds.
function elasticRemainder(value) {
  if (value === 0 || value === 1) return 1 - value
  const eased = (2 ** (-10 * value))
    * Math.sin(((value - 0.075) * 2 * Math.PI) / 0.3)
    + 1
  return 1 - eased
}

function getWobblyPath(bend) {
  const normalizedBend = clamp(bend, -1.15, 1.15)
  const left = normalizedBend > 0 ? normalizedBend * BEND_DEPTH : 0
  const right = normalizedBend < 0 ? 100 + normalizedBend * BEND_DEPTH : 100
  const middle = SLIDE_VIEW_HEIGHT / 2
  const shoulder = SLIDE_VIEW_HEIGHT * 0.16
  const lowerShoulder = SLIDE_VIEW_HEIGHT - shoulder
  return [
    'M0,0 H100',
    `C100,0 ${right},${shoulder} ${right},${middle}`,
    `C${right},${lowerShoulder} 100,${SLIDE_VIEW_HEIGHT} 100,${SLIDE_VIEW_HEIGHT}`,
    'H0',
    `C0,${SLIDE_VIEW_HEIGHT} ${left},${lowerShoulder} ${left},${middle}`,
    `C${left},${shoulder} 0,0 0,0 Z`,
  ].join(' ')
}

function WobblySlide({ bend, image, label, style }) {
  const clipId = useMemo(() => `vr-wobble-${label}`, [label])
  const path = getWobblyPath(bend)

  return (
    <div className="vr-wobbly-slide" style={style} aria-label={`KinetoTalk 作品图 ${label}`}>
      <svg viewBox={`0 0 100 ${SLIDE_VIEW_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={path} />
          </clipPath>
        </defs>
        <image
          href={image}
          x="0"
          y="0"
          width="100"
          height={SLIDE_VIEW_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
          clipPath={`url(#${clipId})`}
        />
        <path className="vr-wobbly-slide-outline" d={path} />
      </svg>
    </div>
  )
}

export default function VrEnglishWobblyGallery() {
  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState(null)
  const [direction, setDirection] = useState(1)
  const [motion, setMotion] = useState({ move: 1, outgoingBend: 0, incomingBend: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)
  const activeRef = useRef(0)
  const animatingRef = useRef(false)
  const frameRef = useRef(0)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const navigate = useCallback((step) => {
    if (animatingRef.current) return
    const next = clamp(activeRef.current + step, 0, SLIDES.length - 1)
    if (next === activeRef.current) return

    animatingRef.current = true
    setPrevious(activeRef.current)
    setDirection(step > 0 ? 1 : -1)
    activeRef.current = next
    setActive(next)
    setMotion({ move: 0, outgoingBend: 0, incomingBend: step > 0 ? -1 : 1 })
  }, [])

  useEffect(() => {
    if (previous === null) return undefined
    const startedAt = performance.now()
    const moveDelay = reducedMotion ? 0 : 100
    const moveDuration = reducedMotion ? 260 : 500
    const curveDuration = reducedMotion ? 1 : 250
    const bounceDelay = reducedMotion ? 0 : 250
    const bounceDuration = reducedMotion ? 260 : 1500
    const unlockAt = moveDelay + moveDuration
    const finishAt = Math.max(unlockAt, bounceDelay + bounceDuration)
    let unlocked = false

    const tick = (time) => {
      const elapsed = time - startedAt
      const rawMove = clamp((elapsed - moveDelay) / moveDuration, 0, 1)
      const move = reducedMotion ? rawMove : cubicBezier(rawMove, 0.8, 0, 0.2, 1)
      const outgoingCurve = clamp(elapsed / curveDuration, 0, 1)
      const bounce = clamp((elapsed - bounceDelay) / bounceDuration, 0, 1)
      const incomingElastic = reducedMotion ? 0 : elasticRemainder(bounce)

      setMotion({
        move,
        outgoingBend: -direction * outgoingCurve,
        incomingBend: -direction * incomingElastic,
      })

      if (!unlocked && elapsed >= unlockAt) {
        unlocked = true
        animatingRef.current = false
      }

      if (elapsed < finishAt) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setMotion({ move: 1, outgoingBend: 0, incomingBend: 0 })
        setPrevious(null)
        animatingRef.current = false
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [previous, reducedMotion])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const onWheel = useCallback((event) => {
    event.preventDefault()
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    if (Math.abs(delta) < 6) return
    navigate(delta > 0 ? 1 : -1)
  }, [navigate])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') navigate(1)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') navigate(-1)
  }, [navigate])

  const onBack = useCallback(() => {
    sessionStorage.setItem('portfolio:return-to-cases', '1')
    window.location.replace('../../#cases')
  }, [])

  const outgoingTravel = -direction * motion.move
  const incomingTravel = direction * (1 - motion.move)
  const translateFor = (travel) => `calc(${travel * 52}vw + ${travel * 52}%)`

  return (
    <main
      className="vr-wobbly-page"
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <header className="vr-wobbly-header">
        <button type="button" onClick={onBack} aria-label="返回作品集">
          <span aria-hidden="true">←</span>
          <span>返回作品集</span>
        </button>
        <h1>VR英语学习系统设计</h1>
      </header>

      <section className="vr-wobbly-stage" aria-live="polite" aria-label="VR英语学习系统作品画廊">
        {SLIDES.map((slide, index) => {
          const isActive = index === active
          const isPrevious = index === previous
          const isVisible = isActive || (isPrevious && motion.move < 0.999)
          const translateX = isPrevious
            ? outgoingTravel
            : isActive && previous !== null
              ? incomingTravel
              : 0
          const bend = isPrevious
            ? motion.outgoingBend
            : isActive && previous !== null
              ? motion.incomingBend
              : 0

          return (
            <WobblySlide
              key={slide.id}
              image={slide.image}
              label={slide.id}
              bend={bend}
              style={{
                transform: `translate3d(${translateFor(translateX)}, 0, 0)`,
                opacity: isVisible ? 1 : 0.001,
                zIndex: isActive ? 2 : 1,
              }}
            />
          )
        })}
      </section>

      <div className="vr-wobbly-footer">
        <span>{SLIDES[active].id}</span>
        <div className="vr-wobbly-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${(active + 1) / SLIDES.length})` }} />
        </div>
        <span>{String(SLIDES.length).padStart(2, '0')}</span>
      </div>
      <p className="vr-wobbly-hint" aria-hidden="true">SCROLL UP / DOWN TO TURN</p>
    </main>
  )
}
