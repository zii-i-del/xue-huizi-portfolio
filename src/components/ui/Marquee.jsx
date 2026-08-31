import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Seamless marquee.
 *
 * Two identical tracks sit side by side. Both animate translateX(-100%) — i.e.
 * by their own width — so at the end of the cycle track B lands exactly where
 * track A started, making the loop invisible. Matches scrib3's keyframes.
 *
 * `--duration` defaults to 50s (the value scrib3 hard-codes).
 * Pauses on hover via the `--animation-status` variable.
 */
export default function Marquee({
  children,
  duration = 50,
  inverted = false,
  direction,
  speed,
  pauseOnHover = true,
  className = '',
  gap = 0,
}) {
  const trackRef = useRef(null)
  const [measuredDuration, setMeasuredDuration] = useState(duration)
  const resolvedDirection = direction ?? (inverted ? 'right' : 'left')

  useLayoutEffect(() => {
    if (!speed || !trackRef.current) {
      setMeasuredDuration(duration)
      return undefined
    }

    const track = trackRef.current
    const measure = () => {
      const width = track.getBoundingClientRect().width
      if (width > 0) setMeasuredDuration(width / speed)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    document.fonts?.ready?.then(measure)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [duration, speed])

  return (
    <div
      className={`marquee marquee--${resolvedDirection} ${className}`}
      style={{ '--duration': `${measuredDuration}s` }}
      onMouseEnter={(e) => {
        if (pauseOnHover) e.currentTarget.style.setProperty('--animation-status', 'paused')
      }}
      onMouseLeave={(e) => {
        if (pauseOnHover) e.currentTarget.style.setProperty('--animation-status', 'running')
      }}
    >
      <div ref={trackRef} className="marquee__inner" style={{ gap }}>
        {children}
      </div>
      <div className="marquee__inner" aria-hidden="true" style={{ gap }}>
        {children}
      </div>
    </div>
  )
}

/**
 * Alternating solid / outlined text marquee — scrib3 runs this through the
 * Team and Cases sections.
 *
 * 交替效果由 `.marquee__item:nth-child(odd/2n)` 提供（原站 a41af27b55b6a660.css 直抄）：
 *   奇数项 → 黑底 + 1px 主题色描边（中空）
 *   偶数项 → 主题色实心
 * 之前这个类既被 Tailwind purge、又没挂到 JSX 上，等于完全没生效。
 */
export function TextMarquee({ items, duration = 50, inverted = false, className = '' }) {
  return (
    <Marquee duration={duration} inverted={inverted} className={className}>
      {items.map((item, i) => (
        <span
          key={i}
          className="marquee__item font-pack text-[7vw] uppercase leading-none"
          style={{ whiteSpace: 'pre', paddingRight: '0.3em' }}
        >
          {item}
        </span>
      ))}
    </Marquee>
  )
}
