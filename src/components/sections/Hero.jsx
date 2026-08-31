import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { profile } from '../../data/content'
import HeroQuill from '../webgl/HeroQuill'
import { useStainWindow } from '../webgl/StainField'

export default function Hero({ entered = false }) {
  const rootRef = useRef(null)
  const animatedRef = useRef(false)
  const stainRef = useStainWindow({ mode: 'radial', shift: 0.5, overflowBottom: 17.3611 })

  useEffect(() => {
    if (!entered || animatedRef.current || !rootRef.current) return undefined
    animatedRef.current = true
    const root = rootRef.current
    const ctx = gsap.context(() => {
      const meta = root.querySelectorAll('[data-hero-meta]')
      const lines = root.querySelectorAll('[data-hero-line]')
      gsap.set([...meta, ...lines], { opacity: 0 })
      const tl = gsap.timeline()
      tl.fromTo(
        meta,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.08, ease: 'expo.out' }
      ).fromTo(
        lines,
        { yPercent: 108, opacity: 1 },
        { yPercent: 0, opacity: 1, duration: 1.18, stagger: 0.09, ease: 'expo.out' },
        0.18
      )
    }, root)
    return () => ctx.revert()
  }, [entered])

  const setRoot = (node) => {
    rootRef.current = node
    stainRef.current = node
  }

  return (
    <section
      id="hero"
      ref={setRoot}
      className="hero-portfolio relative overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      <div className="layout-block relative z-[2] flex min-h-[100svh] flex-col pt-[17.5vh]">
        <div className="hero-intro-grid border-t pt-[1.45vw]" style={{ borderColor: 'var(--theme-contrast)' }}>
          <div data-hero-meta>
            <p className="cjk font-owners text-[clamp(15px,1.55vw,25px)] uppercase leading-[1.12]">
              AI 产品经理
              <br />
              大模型 · Agent
            </p>
          </div>

          <div data-hero-meta>
            <p className="cjk max-w-[31vw] font-owners text-[clamp(13px,1vw,17px)] leading-[1.28] uppercase">
              把模糊的模型表现变成可度量、可迭代、可交付的产品体验
            </p>
          </div>

          <div data-hero-meta className="flex items-start justify-end gap-[0.75vw]">
            <span className="cjk font-owners text-[clamp(12px,0.92vw,15px)] uppercase">向下滚动</span>
            <span className="font-stardust text-[1.25vw] leading-none">↓</span>
          </div>
        </div>

        <div className="relative mt-auto pb-[1.4vw]">
          <h1 className="hero-portfolio-title select-none" aria-label="薛惠姊 AI 作品集 XHZ Portfolio">
            <span className="hero-title-mask">
              <span data-hero-line className="hero-title-line hero-title-line--outline cjk">
                薛惠姊
              </span>
            </span>
            <span className="hero-title-mask">
              <span data-hero-line className="hero-title-line hero-title-line--solid cjk">
                AI 作品集
              </span>
            </span>
            <span className="hero-title-mask">
              <span data-hero-line className="hero-title-line hero-title-line--latin">
                <span className="hero-title-line--outline">XHZ</span>{' '}
                <span className="hero-title-line--solid">PORTFOLIO</span>
              </span>
            </span>
          </h1>

          <div className="hero-quill-3d pointer-events-none absolute z-[3]" data-hero-meta>
            <HeroQuill entered={entered} />
          </div>

          <p
            data-hero-meta
            className="absolute bottom-[1.2vw] right-0 font-stardust text-[0.72vw] uppercase tracking-[0.2em]"
            style={{ color: 'var(--grey-two)' }}
          >
            {profile.location} · 2026
          </p>
        </div>
      </div>
    </section>
  )
}
