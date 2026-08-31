import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { totemCards } from '../../data/content'
import SectionHeader from '../ui/SectionHeader'
import Frame from '../ui/Frame'
import ArrowButton from '../ui/ArrowButton'
import Marquee from '../ui/Marquee'
import { useStainWindow } from '../webgl/StainField'

const Totem = lazy(() => import('../webgl/Totem'))

const LABELS = totemCards.map((card) => card.short)

function MobileTotem({ active }) {
  return (
    <svg viewBox="0 0 340 380" className="h-full w-full" aria-hidden="true">
      {LABELS.map((_, layerIndex) => {
        const y = 78 + (3 - layerIndex) * 62
        const cardIndex = LABELS.length - 1 - layerIndex
        const on = cardIndex === active
        return (
          <g key={layerIndex} opacity={on ? 1 : 0.42}>
            <path d={`M170 ${y} L286 ${y + 54} L170 ${y + 108} L54 ${y + 54}Z`} fill="#000" stroke="var(--theme-contrast)" />
            <path d={`M54 ${y + 54} L170 ${y + 108} L170 ${y + 143} L54 ${y + 89}Z`} fill="#000" stroke="var(--theme-contrast)" />
            <path d={`M286 ${y + 54} L170 ${y + 108} L170 ${y + 143} L286 ${y + 89}Z`} fill="#000" stroke="var(--theme-contrast)" />
          </g>
        )
      })}
    </svg>
  )
}

export default function TotemSection() {
  const [active, setActive] = useState(0)
  const [cardHeight, setCardHeight] = useState(0)
  const anchorsRef = useRef([])
  const cardRef = useRef(null)
  const hasUserSelected = useRef(false)
  const stainRef = useStainWindow({
    // Overview 的颗粒独立于魔方尺寸：原站是舞台全宽的线性 stain，
    // 从魔方区域开始，向底部额外延展后自然淡出。
    mode: 'linear',
    overflowBottom: 10.4167,
  })

  const changeOverviewIndex = useCallback((nextIndex) => {
    const length = totemCards.length
    const index = (nextIndex + length) % length
    hasUserSelected.current = true
    setActive(index)
  }, [])

  useEffect(() => {
    if (!hasUserSelected.current || window.matchMedia('(max-width: 1023px)').matches) return undefined

    const anchor = anchorsRef.current[active]
    if (!anchor) return undefined

    const frame = window.requestAnimationFrame(() => {
      const target = window.scrollY + anchor.getBoundingClientRect().top - window.innerHeight / 2
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (window.__lenis) {
        window.__lenis.scrollTo(target, {
          duration: reduced ? 0 : 1.4,
          immediate: reduced,
        })
      } else {
        window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [active])

  useLayoutEffect(() => {
    const node = cardRef.current
    if (!node) return undefined

    const updateHeight = () => setCardHeight(node.getBoundingClientRect().height)
    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(node)
    return () => resizeObserver.disconnect()
  }, [active])

  const card = totemCards[active]
  const go = (direction) => changeOverviewIndex(active + direction)

  return (
    <section id="services" className="relative" style={{ marginBottom: '5.5555555556vw' }}>
      <div className="layout-block">
        <SectionHeader
          index="01"
          label="Overview"
          title="能力概览"
          body="教育、实习、作品与技能，切换卡片时，后方立方体同步定位到对应层"
        />
      </div>

      <div className="overview-stage layout-block relative mt-[3.2vw]">
        <Marquee direction="left" speed={110} pauseOnHover={false} className="overview-marquee" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="overview-marquee__item">OVERVIEW</span>
          ))}
        </Marquee>
        <div className="overview-stage__scene hidden lg:block" aria-hidden="true">
          <div ref={stainRef} className="overview-stage__stain-window" />
          <Suspense fallback={null}>
            <Totem labels={LABELS} active={active} className="h-full w-full" />
          </Suspense>
        </div>

        <div className="layout-grid relative z-[2]">
          <div className="overview-card-track col-span-5">
            <div
              className="overview-card-column"
              style={{ '--overview-card-half-height': `${cardHeight / 2}px` }}
            >
              <article ref={cardRef} className="overview-card relative" style={{ background: 'var(--grey-one)', color: 'var(--theme-primary)' }}>
                <Frame inset="1.1vw" plus={false} stack={3} />
                <div className="overview-card__head">
                  <span className="font-stardust text-[0.75vw] uppercase tracking-[0.2em]">{card.index}</span>
                  <span className="font-stardust text-[0.75vw] uppercase tracking-[0.2em]">{String(active + 1).padStart(2, '0')} / 04</span>
                </div>
                <h3 className="overview-card__title uppercase">{card.title}</h3>
                <p className="cjk mt-[0.55vw] font-owners text-[clamp(17px,1.35vw,22px)]">{card.titleCn}</p>
                <p className="cjk mt-[1.6vw] max-w-[28vw] font-owners text-[clamp(14px,1vw,17px)] leading-[1.34]">{card.ledeCn}</p>
                <div className="overview-card__rows">
                  {card.rows.map((row) => (
                    <div key={`${row.k}-${row.v}`}>
                      <span className="cjk font-owners text-[0.9vw]">{row.k}</span>
                      <span className="cjk font-owners text-[0.82vw] opacity-60">{row.v}</span>
                    </div>
                  ))}
                </div>
                <div className="overview-card__controls">
                  <ArrowButton direction="left" onClick={() => go(-1)} label="Previous overview" />
                  <div className="flex gap-[0.45vw]">
                    {totemCards.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => changeOverviewIndex(index)}
                        aria-label={`查看${item.titleCn}`}
                        aria-current={index === active}
                        className="h-[0.6vw] w-[0.6vw] min-h-[7px] min-w-[7px] border"
                        style={{ borderColor: 'var(--theme-primary)', background: index === active ? 'var(--theme-primary)' : 'transparent' }}
                      />
                    ))}
                  </div>
                  <ArrowButton direction="right" onClick={() => go(1)} label="Next overview" />
                </div>
              </article>
            </div>
          </div>

          <div className="overview-stage__anchors col-span-7 col-start-6 hidden lg:block" aria-hidden="true">
            {totemCards.map((item, index) => (
              <div
                key={item.id}
                id={`cardAnchor${index}`}
                ref={(node) => { anchorsRef.current[index] = node }}
                data-index={index}
                className="overview-stage__anchor"
                style={{ top: `${(index / totemCards.length) * 100}%`, height: `${100 / totemCards.length}%` }}
              />
            ))}
          </div>

          <div className="col-span-12 mt-[6vw] lg:hidden">
            <div className="mx-auto h-[88vw] max-h-[560px] max-w-[420px]"><MobileTotem active={active} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
