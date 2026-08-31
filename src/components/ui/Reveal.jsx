import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll reveal.
 * Finds every `.mask > span` (and anything tagged `[data-reveal]`) inside and
 * slides it up out of its overflow-hidden parent when the block enters view.
 */
export default function Reveal({
  children,
  className = '',
  stagger = 0.06,
  duration = 1,
  delay = 0,
  start = 'top 88%',
  as: Tag = 'div',
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll('.mask > span, [data-reveal]')
    if (!targets.length) return

    // The masked spans carry a CSS transition for hover states. GSAP writes
    // transform every frame, so leaving it on would smear the animation.
    targets.forEach((t) => {
      t.style.transition = 'none'
    })

    const tween = gsap.to(targets, {
      y: '0%',
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start, once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [stagger, duration, delay, start])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}

/** Hairline that grows from the left edge as it scrolls in. */
export function GrowLine({ className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])
  return (
    <span
      ref={ref}
      className={`block h-px w-full origin-left ${className}`}
      style={{ backgroundColor: 'var(--theme-contrast)' }}
    />
  )
}
