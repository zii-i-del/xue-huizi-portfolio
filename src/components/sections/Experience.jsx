import { useState } from 'react'
import { experiences } from '../../data/content'
import SectionHeader from '../ui/SectionHeader'
import Reveal from '../ui/Reveal'
import Frame from '../ui/Frame'
import ExperienceArrow from '../ui/ExperienceArrow'

export default function Experience() {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => setOpenId((current) => (current === id ? null : id))
  const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  return (
    <section id="press" className="layout-block" style={{ marginBottom: '5.5555555556vw' }}>
      <SectionHeader
        title="EXPERIENCE"
        helperText="四段AI产品经理实习经历，悬浮标题查看实习经历详情"
        mobileHelperText="四段AI产品经理实习经历，悬浮标题查看实习经历详情"
        targetId="experience-list"
        layout="titleOnly"
      />

      <Reveal className="mt-[3.2vw]">
        <ul id="experience-list" className="experience-list scroll-mt-[2vw]">
          {experiences.map((exp) => {
            const isOpen = openId === exp.id
            return (
              <li
                key={exp.id}
                className={`experience-row ${isOpen ? 'is-open' : ''}`}
                onPointerEnter={() => {
                  if (canHover()) setOpenId(exp.id)
                }}
                onPointerLeave={(event) => {
                  if (canHover() && !event.currentTarget.contains(event.relatedTarget)) {
                    setOpenId(null)
                  }
                }}
                onFocusCapture={() => setOpenId(exp.id)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpenId(null)
                }}
              >
                <button
                  type="button"
                  className="experience-row__trigger group"
                  onClick={() => {
                    if (!canHover()) toggle(exp.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggle(exp.id)
                    }
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`experience-detail-${exp.id}`}
                >
                  <span className="experience-row__title cjk">
                    {exp.companyShortCn} · {exp.internshipRoleCn}
                  </span>
                  <span className="experience-row__meta cjk">
                    {exp.productCn}
                    <br />
                    {exp.period} · {exp.city}
                  </span>
                  <span className="experience-row__arrow" aria-hidden="true">
                    <ExperienceArrow className="h-full w-full" />
                  </span>
                </button>

                <div
                  id={`experience-detail-${exp.id}`}
                  className="experience-row__detail"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div>
                    <div className="experience-detail-grid">
                      {exp.details.map((detail) => (
                        <article
                          key={detail.title}
                          className="experience-card relative"
                          style={{ background: 'var(--grey-one)', color: 'var(--theme-primary)' }}
                        >
                          <Frame inset="clamp(8px, .7vw, 12px)" plus={false} stack={3} />
                          <h4 className="font-stardust text-[clamp(12px,.9vw,16px)] uppercase tracking-[0.14em]">
                            {detail.title}
                          </h4>
                          <p className="cjk mt-[0.42vw] font-owners text-[clamp(15px,1vw,18px)] leading-[1.15]">
                            {detail.titleCn}
                          </p>
                          <p className="cjk mt-[1vw] font-owners text-[clamp(13px,.85vw,16px)] leading-[1.48] opacity-75">
                            {detail.bodyCn}
                          </p>
                          <footer className="experience-card__metrics flex items-end justify-between gap-[1.3vw]">
                            <div className="flex flex-wrap items-end gap-x-[2vw] gap-y-[.7vw]">
                              {detail.metrics.map((metric) => (
                                <div key={`${metric.k}-${metric.v}`}>
                                  <p className="font-pack text-[clamp(27px,1.9vw,38px)] leading-none">{metric.k}</p>
                                  <p className="font-stardust text-[clamp(9px,.62vw,12px)] uppercase tracking-[0.14em] opacity-60">
                                    {metric.v}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {detail.link && (
                              <a
                                href={detail.link}
                                target="_blank"
                                rel="noreferrer"
                                className="font-stardust text-[clamp(10px,.7vw,13px)] uppercase tracking-[0.14em] underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                GitHub ↗
                              </a>
                            )}
                          </footer>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Reveal>
    </section>
  )
}
