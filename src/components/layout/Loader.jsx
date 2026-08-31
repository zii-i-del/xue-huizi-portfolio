import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const waitForSignal = (flag, eventName) =>
  new Promise((resolve) => {
    if (window[flag]) {
      resolve()
      return
    }
    const done = () => {
      window.removeEventListener(eventName, done)
      resolve()
    }
    window.addEventListener(eventName, done, { once: true })
  })

const waitForFrames = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

export default function Loader({ onStateChange }) {
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const logoRef = useRef(null)
  const progressRef = useRef(null)
  const backgroundRef = useRef(null)
  const callbackRef = useRef(onStateChange)
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)

  callbackRef.current = onStateChange

  useEffect(() => {
    let alive = true
    let raf = 0
    let introTl
    let exitTl
    let shown = 0
    let target = 0
    const started = performance.now()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.matchMedia('(max-width: 767px)').matches
    const minDwell = reduced || compact ? 160 : 900

    callbackRef.current?.('booting')
    document.documentElement.setAttribute('aria-busy', 'true')

    const masked = [
      titleRef.current?.firstElementChild,
      logoRef.current?.firstElementChild,
      progressRef.current?.firstElementChild,
    ].filter(Boolean)

    introTl = gsap.fromTo(masked, { y: '101%' }, {
      y: '0%',
      duration: reduced || compact ? 0.18 : 1,
      delay: reduced || compact ? 0 : 0.25,
      ease: 'expo.out',
    })

    const updateCounter = () => {
      if (!alive) return
      const delta = target - shown
      shown = delta < 0.12 ? target : shown + Math.max(0.12, delta * 0.085)
      setPct(Math.min(Math.floor(shown), Math.floor(target)))
      raf = requestAnimationFrame(updateCounter)
    }
    raf = requestAnimationFrame(updateCounter)

    const mark = (weight) => {
      target = Math.min(99, target + weight)
    }

    const fontsTask = (async () => {
      if (document.fonts) {
        await Promise.allSettled([
          document.fonts.load('1em Pack'),
          document.fonts.load('1em "Owners Wide"'),
          document.fonts.load('1em ZiHunJieBa'),
          document.fonts.ready,
        ])
      }
      mark(30)
    })()

    const webglTask = Promise.all([
      waitForSignal('__stainReady', 'stain-ready'),
      waitForSignal('__heroQuillReady', 'hero-quill-ready'),
    ]).then(() => mark(45))

    const assetsTask = (async () => {
      await waitForFrames()
      const images = Array.from(document.images).filter(
        (img) => img.getBoundingClientRect().top < window.innerHeight * 1.25
      )
      await Promise.allSettled(
        images.map((img) => (img.complete ? Promise.resolve() : img.decode?.() || Promise.resolve()))
      )
      mark(25)
    })()

    const maxWait = new Promise((resolve) => setTimeout(resolve, 5000))

    const finish = async () => {
      await Promise.race([Promise.allSettled([fontsTask, webglTask, assetsTask]), maxWait])
      if (!alive) return
      const elapsed = performance.now() - started
      if (elapsed < minDwell) await new Promise((resolve) => setTimeout(resolve, minDwell - elapsed))
      if (!alive) return

      target = 100
      shown = 100
      setPct(100)
      callbackRef.current?.('ready')
      await new Promise((resolve) => setTimeout(resolve, reduced || compact ? 20 : 180))
      if (!alive) return

      callbackRef.current?.('exiting')
      const logo = logoRef.current?.firstElementChild
      const logoTarget = document.querySelector('[data-header-logo-target]')
      const logoRect = logo?.getBoundingClientRect()
      const targetRect = logoTarget?.getBoundingClientRect()
      const dx = logoRect && targetRect ? targetRect.left + targetRect.width / 2 - (logoRect.left + logoRect.width / 2) : 0
      const dy = logoRect && targetRect ? targetRect.top + targetRect.height / 2 - (logoRect.top + logoRect.height / 2) : 0
      const scale = logoRect && targetRect ? Math.max(0.42, targetRect.width / Math.max(1, logoRect.width)) : 0.55

      exitTl = gsap.timeline({
        onComplete: () => {
          if (!alive) return
          document.documentElement.removeAttribute('aria-busy')
          callbackRef.current?.('entered')
          setGone(true)
        },
      })

      exitTl
        .to([titleRef.current?.firstElementChild, progressRef.current?.firstElementChild], {
          y: '101%',
          duration: reduced || compact ? 0.12 : 1,
          ease: 'expo.out',
        })
        .to(
          logo,
          {
            x: dx,
            y: dy,
            scale,
            duration: reduced || compact ? 0.16 : 1,
            ease: 'expo.out',
            transformOrigin: 'center center',
          },
          0
        )
        .to(
          backgroundRef.current,
          {
            opacity: 0,
            duration: reduced || compact ? 0.18 : 1.5,
            ease: 'expo.out',
          },
          0
        )
    }

    finish()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      introTl?.kill()
      exitTl?.kill()
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={rootRef}
      className="loader_loader fixed inset-0 z-50 flex items-center"
      style={{ color: 'var(--theme-contrast)' }}
      role="status"
      aria-live="polite"
      aria-label={`页面加载 ${pct}%`}
    >
      <div ref={backgroundRef} className="loader_background" aria-hidden="true" />
      <div className="layout-grid layout-block w-full items-center">
        <div ref={titleRef} className="loader_title col-span-5 overflow-hidden">
          <span className="block translate-y-[101%]">
            LOADING
          </span>
        </div>
        <div ref={logoRef} className="loader_logo col-span-2 flex justify-center overflow-visible">
          <span className="loader_monogram block translate-y-[101%]">
            XHZ
          </span>
        </div>
        <div ref={progressRef} className="loader_progress col-span-5 flex justify-end overflow-hidden">
          <span className="block translate-y-[101%] tabular-nums">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  )
}
