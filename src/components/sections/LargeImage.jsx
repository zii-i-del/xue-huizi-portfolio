import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { largeImage } from '../../data/content'
import DitheredImage from '../ui/DitheredImage'
import Frame from '../ui/Frame'

gsap.registerPlugin(ScrollTrigger)

/**
 * Full-bleed image band — scrib3's `largeImage` section.
 *
 * On scrib3 this is a single full-width plate: the image is dithered to 1-bit,
 * then multiplied over the accent ground (white → accent, black → black).
 * We reproduce that with DitheredImage + mix-blend-mode: multiply, and keep
 * the slow parallax scrub the original runs on scroll.
 */
export default function LargeImage() {
  const wrapRef = useRef(null)
  const plateRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const plate = plateRef.current
    if (!wrap || !plate) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        plate,
        { yPercent: -6, scale: 1.14 },
        {
          yPercent: 6,
          scale: 1.14,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }, wrap)

    return () => ctx.revert()
  }, [])

  return (
    <section
      className="layout-block relative"
      style={{ marginBottom: '5.5555555556vw', marginTop: '5.5555555556vw' }}
    >
      <div
        ref={wrapRef}
        className="relative overflow-hidden"
        style={{
          background: 'var(--theme-contrast)',
          borderRadius: '1.6666666667vw',
          aspectRatio: largeImage.ratio,
        }}
      >
        {/* the plate
            NB: the accent ground has to live *on the plate*, not on the wrapper.
            `will-change: transform` makes the plate its own stacking context, so
            a child's mix-blend-mode can only see the backdrop inside it — put the
            colour on the outer div and multiply silently does nothing. */}
        <div
          ref={plateRef}
          className="absolute inset-0 will-change-transform"
          style={{ background: 'var(--theme-contrast)', isolation: 'isolate' }}
        >
          <DitheredImage
            src={largeImage.src}
            alt={largeImage.alt}
            cell={3}
            maxWidth={1600}
            contrast={1.35}
            brightness={0.88}
            className="h-full w-full"
            style={{
              aspectRatio: 'auto',
              mixBlendMode: 'multiply',
              // source ratio matches the band, so this is a 1:1 fit — no crop
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* frame + caption, floating above the blend */}
        <Frame inset="1.1111111111vw" />

        <div
          className="pointer-events-none absolute flex items-end justify-between"
          style={{
            inset: '1.1111111111vw',
            padding: '1.1111111111vw',
            color: 'var(--theme-primary)',
          }}
        >
          <p className="cjk font-owners text-[1.05vw] leading-none tracking-[0.04em]">
            {largeImage.captionCn}
          </p>
          <p className="font-stardust text-[0.72vw] uppercase tracking-[0.2em] opacity-70">
            {largeImage.caption}
          </p>
        </div>
      </div>
    </section>
  )
}
