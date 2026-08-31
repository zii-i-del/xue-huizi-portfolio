import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis smooth scroll, wired into GSAP's ticker so ScrollTrigger stays in sync.
 * This is the exact pairing scrib3.co runs (Lenis 1.0.42 + GSAP ScrollTrigger).
 *
 * Exposes the instance on window so the custom scrollbar and anchor links can
 * drive it directly.
 */
export default function SmoothScroll({ children, enabled = false }) {
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    document.documentElement.classList.add('is-loading')

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      lerp: 0.1,
    })

    window.__lenis = lenis
    if (enabledRef.current) lenis.start()
    else lenis.stop()

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // keep --vh / --svh honest on mobile browsers
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
      document.documentElement.style.setProperty('--svh', `${window.innerHeight * 0.01}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)

    return () => {
      window.removeEventListener('resize', setVh)
      gsap.ticker.remove(raf)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])

  useEffect(() => {
    const lenis = window.__lenis
    if (!lenis) return
    if (enabled) {
      document.documentElement.classList.remove('is-loading')
      lenis.start()
    } else {
      document.documentElement.classList.add('is-loading')
      lenis.stop()
    }
  }, [enabled])

  return children
}

/** Scroll to an element through Lenis (so easing matches). */
export function scrollToId(id, offset = 0) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
