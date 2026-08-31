import { useCallback, useRef, useState } from 'react'
import { aiCapabilities } from '../../data/content'
import SectionHeader from '../ui/SectionHeader'
import ArrowButton from '../ui/ArrowButton'
import Frame from '../ui/Frame'

const SWAP_MS = 300

/**
 * Services block — scrib3's sticky card carousel.
 * Changing index runs a two-phase swap: exit (title drops out, index slides
 * left) then enter (title rises, index slides in from the right).
 */
export default function Services() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('idle')
  const busy = useRef(false)

  const go = useCallback(
    (dir) => {
      if (busy.current) return
      busy.current = true
      const total = aiCapabilities.length
      const next = (index + dir + total) % total

      setPhase('exit')
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setPhase('exit-active')
          setTimeout(() => {
            setIndex(next)
            setPhase('enter')
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                setPhase('enter-active')
                setTimeout(() => {
                  setPhase('idle')
                  busy.current = false
                }, SWAP_MS)
              })
            )
          }, SWAP_MS)
        })
      )
    },
    [index]
  )

  const item = aiCapabilities[index]

  return (
    <section id="capabilities" className="relative" style={{ marginBottom: '5.5555555556vw' }}>
      <div className="layout-block">
        <SectionHeader
          index="02"
          label="Capability"
          title="AI 能力"
          body="六项能把模型表现变成产品质量的能力，悬停或点击右侧列表切换卡片"
        />
      </div>

      <div className="layout-block relative mt-[4vw] flex flex-col">
        {/* vertical rails, like scrib3's cardWrapper */}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-px"
          style={{ background: 'var(--theme-contrast)' }}
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-px"
          style={{ background: 'var(--theme-contrast)' }}
        />

        <div
          className="relative flex flex-col lg:flex-row"
          style={{ padding: '0 var(--layout-margin)', gap: '4vw' }}
        >
          {/* ---- card ---- */}
          <div
            className="relative w-full shrink-0 lg:w-[40.2777777778vw] lg:min-w-[320px] lg:sticky"
            style={{ top: 'calc(50vh - 15vw)' }}
          >
            <div
              className="relative grid"
              style={{
                background: 'var(--grey-one)',
                color: 'var(--theme-primary)',
                borderRadius: '1.6666666667vw',
                padding: '1.1111111111vw',
                height: '29.8611111111vw',
                minHeight: 300,
                gridTemplateRows: 'auto 1fr',
              }}
            >
              <Frame inset="1.1111111111vw" />

              {/* header */}
              <div
                className="grid items-start border-b text-right"
                style={{ gridTemplateColumns: '1fr auto', paddingBottom: '1.1111111111vw' }}
              >
                <div className={`card-swap ${phase}`} style={{ textAlign: 'left' }}>
                  <span className="swap-mask font-stardust text-[0.75vw] uppercase tracking-[0.2em]">
                    <span className="swap-inner block">SERVICE</span>
                  </span>
                </div>
                <span className="font-stardust text-[0.75vw] uppercase tracking-[0.2em] opacity-60">
                  {String(index + 1).padStart(2, '0')} / {String(aiCapabilities.length).padStart(2, '0')}
                </span>
              </div>

              {/* body */}
              <div className="relative" style={{ paddingTop: '1.1111111111vw' }}>
                {/* index stack */}
                <div className="stack" style={{ color: 'var(--theme-primary)' }}>
                  {aiCapabilities.map((_, i) => (
                    <span
                      key={i}
                      className={`card-swap ${phase}`}
                      style={{ display: 'block', width: '100%' }}
                    >
                      <span
                        className="swap-x block"
                        style={{
                          background: i === index ? 'var(--theme-primary)' : 'transparent',
                        }}
                      />
                    </span>
                  ))}
                </div>

                <div className={`card-swap ${phase}`}>
                  <h3 className="font-pack text-[3.4vw] uppercase leading-[0.9]">
                    <span className="swap-mask">
                      <span className="swap-inner block">{item.title}</span>
                    </span>
                  </h3>
                  <p className="mt-2 font-owners text-[1.1vw]" style={{ opacity: 0.65 }}>
                    <span className="swap-mask">
                      <span className="swap-inner block">{item.titleCn}</span>
                    </span>
                  </p>

                  <p
                    className="mt-[2vw] font-owners text-[1.05vw] leading-relaxed"
                    style={{ width: '19.0972222222vw', minWidth: 220 }}
                  >
                    <span className="swap-mask">
                      <span className="swap-inner block">{item.descCn}</span>
                    </span>
                  </p>
                </div>

                {/* metric */}
                <div className="absolute bottom-0 left-0">
                  <div className={`card-swap ${phase}`}>
                    <p className="font-pack text-[2.6vw] leading-none">
                      <span className="swap-mask">
                        <span className="swap-inner block">{item.metric}</span>
                      </span>
                    </p>
                    <p className="mt-1 font-stardust text-[0.7vw] uppercase tracking-[0.18em] opacity-60">
                      <span className="swap-mask">
                        <span className="swap-inner block">{item.metricLabel}</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* controls */}
            <div className="mt-[1.1vw] flex items-center justify-between">
              <ArrowButton direction="left" onClick={() => go(-1)} label="Previous capability" />
              <p className="font-stardust text-[0.75vw] uppercase tracking-[0.2em] opacity-60">
                {String(index + 1).padStart(2, '0')} — {String(aiCapabilities.length).padStart(2, '0')}
              </p>
              <ArrowButton direction="right" onClick={() => go(1)} label="Next capability" />
            </div>
          </div>

          {/* ---- right column: full capability list ---- */}
          <div className="min-w-0 flex-1 lg:ml-0">
            <ul>
              {aiCapabilities.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      if (i === index || busy.current) return
                      go(i > index ? 1 : -1)
                    }}
                    className="group flex w-full items-baseline gap-[1.5vw] border-b py-[1.1vw] text-left"
                    style={{ borderColor: 'var(--grey-two)' }}
                  >
                    <span
                      className="font-stardust text-[0.75vw] uppercase tracking-[0.2em] transition-colors"
                      style={{ color: i === index ? 'var(--theme-contrast)' : 'var(--grey-two)' }}
                    >
                      {c.id}
                    </span>
                    <span
                      className="font-pack text-[2vw] uppercase leading-none transition-opacity"
                      style={{ opacity: i === index ? 1 : 0.45 }}
                    >
                      {c.title}
                    </span>
                    <span className="ml-auto font-owners text-[0.9vw] opacity-50">{c.titleCn}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
