import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function FooterWordmark({ text = 'XUE HUIZI' }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!canHover) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const letters = Array.from(root.querySelectorAll('[data-wordmark-letter]'))
    const cleanups = letters.map((letter) => {
      const glyph = letter.firstElementChild
      const animate = (scale) => {
        gsap.to(glyph, {
          scale,
          duration: reducedMotion ? 0.2 : 2,
          ease: reducedMotion ? 'power2.out' : 'elastic.out(1.5, 0.3)',
          overwrite: true,
        })
      }
      const enter = () => animate(0.9)
      const leave = () => animate(1)

      letter.addEventListener('pointerenter', enter)
      letter.addEventListener('pointerleave', leave)
      return () => {
        letter.removeEventListener('pointerenter', enter)
        letter.removeEventListener('pointerleave', leave)
        gsap.killTweensOf(glyph)
      }
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])

  return (
    <div ref={rootRef} className="footer-wordmark" aria-label={text}>
      {Array.from(text).map((character, index) =>
        character === ' ' ? (
          <span key={`space-${index}`} className="footer-wordmark__space" aria-hidden="true" />
        ) : (
          <span
            key={`${character}-${index}`}
            className="footer-wordmark__letter"
            data-wordmark-letter
            aria-hidden="true"
          >
            <span className="footer-wordmark__glyph">{character}</span>
          </span>
        ),
      )}
    </div>
  )
}
