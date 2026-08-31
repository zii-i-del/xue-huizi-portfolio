import { useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../../data/content'
import SectionHeader from '../ui/SectionHeader'
import PixelArrow from '../ui/PixelArrow'
import Frame from '../ui/Frame'
import { useStainWindow } from '../webgl/StainField'

/**
 * Selected work — rebuilt on scrib3's `.cases_*` grid:
 *   · left 3 columns hold a floating logo frame
 *   · right 9 columns hold the case rows
 *   · hovering a row slides the frame to that row's offsetTop and stretches it,
 *     cross-fading the mask to that project's mark
 *   · the row title runs `cases_bounce-in` (grey → accent, swapping at 51%)
 */

/** Tiny geometric marks, one per project, used as CSS masks. */
const MARKS = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="none" stroke="#000" stroke-width="9"/><circle cx="50" cy="50" r="12" fill="#000"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" fill="none" stroke="#000" stroke-width="9"/><rect x="36" y="36" width="28" height="28" fill="#000"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10 L92 88 L8 88 Z" fill="none" stroke="#000" stroke-width="9"/><circle cx="50" cy="66" r="10" fill="#000"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 50 L50 10 L90 50 L50 90 Z" fill="none" stroke="#000" stroke-width="9"/><path d="M50 28 L72 50 L50 72 L28 50 Z" fill="#000"/></svg>`,
]

const maskUri = (i) => `url("data:image/svg+xml;utf8,${encodeURIComponent(MARKS[i % MARKS.length])}")`

export default function Cases() {
  const casesWrapRef = useRef(null)
  const caseRefs = useRef([])
  const activeIndexRef = useRef(null)
  const displayedIconRef = useRef(null)
  const iconTimerRef = useRef(null)
  const iconFrameRef = useRef(null)
  const iconRequestRef = useRef(0)

  const [activeCase, setActiveCase] = useState(null)
  const [lastFrameRect, setLastFrameRect] = useState({ top: 0, height: 0 })
  const [displayedIcon, setDisplayedIcon] = useState(null)
  const [iconPhase, setIconPhase] = useState('entering')

  const measureCase = useCallback((index) => {
    const wrapper = casesWrapRef.current
    const row = caseRefs.current[index]
    if (!wrapper || !row) return null

    const wrapperRect = wrapper.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()
    return {
      index,
      top: rowRect.top - wrapperRect.top,
      height: row.offsetHeight,
    }
  }, [])

  const requestIcon = useCallback((nextIndex) => {
    const requestId = ++iconRequestRef.current
    window.clearTimeout(iconTimerRef.current)
    cancelAnimationFrame(iconFrameRef.current)

    const currentIndex = displayedIconRef.current
    if (currentIndex === nextIndex) {
      if (nextIndex !== null) setIconPhase('visible')
      return
    }

    const showNextIcon = () => {
      if (requestId !== iconRequestRef.current) return
      displayedIconRef.current = nextIndex
      setDisplayedIcon(nextIndex)
      if (nextIndex !== null) setIconPhase('entering')
    }

    if (currentIndex === null) {
      showNextIcon()
      return
    }

    setIconPhase('exiting')
    iconTimerRef.current = window.setTimeout(showNextIcon, 300)
  }, [])

  const activateCase = useCallback((index) => {
    const measured = measureCase(index)
    if (!measured) return

    activeIndexRef.current = index
    setActiveCase(measured)
    setLastFrameRect({ top: measured.top, height: measured.height })
    requestIcon(index)
  }, [measureCase, requestIcon])

  const deactivateCase = useCallback(() => {
    activeIndexRef.current = null
    setActiveCase(null)
    requestIcon(null)
  }, [requestIcon])

  useEffect(() => {
    if (iconPhase !== 'entering' || displayedIcon === null) return undefined

    iconFrameRef.current = requestAnimationFrame(() => {
      setIconPhase('visible')
    })
    return () => cancelAnimationFrame(iconFrameRef.current)
  }, [displayedIcon, iconPhase])

  useEffect(() => {
    const updateActiveGeometry = () => {
      const index = activeIndexRef.current
      if (index === null) return
      const measured = measureCase(index)
      if (!measured) return
      setActiveCase(measured)
      setLastFrameRect({ top: measured.top, height: measured.height })
    }

    window.addEventListener('resize', updateActiveGeometry)
    return () => {
      window.removeEventListener('resize', updateActiveGeometry)
      window.clearTimeout(iconTimerRef.current)
      cancelAnimationFrame(iconFrameRef.current)
      iconRequestRef.current += 1
    }
  }, [measureCase])
  // 原站 .cases_stain —— radial 渐隐的第三处颗粒
  const stainRef = useStainWindow({
    mode: 'radial',
    shift: -0.5,
    topPercent: 0.5,
    overflowBottom: 16.6667,
  })

  return (
    <section
      id="cases"
      ref={stainRef}
      className="layout-block"
      style={{ marginBottom: '5.5555555556vw' }}
    >
      <SectionHeader
        title="SELECTED WORK"
        helperText="四段UI作品集，点击标题查看作品详情"
        mobileHelperText="四段UI作品集，点击标题查看作品详情"
        targetId="cases-list"
        layout="titleOnly"
      />

      <div id="cases-list" className="cases_cases scroll-mt-[2vw]">
        <div ref={casesWrapRef} className="cases_casesWrap">
          {/* ---- floating logo track ---- */}
          <div
            className="home-cases-icon"
            style={{ gridRow: `1 / span ${projects.length}` }}
            aria-hidden="true"
          >
            <div
              className="home-cases-icon_hoverLogo"
              style={{
                '--case-offset': `${lastFrameRect.top}px`,
                height: lastFrameRect.height ? `${lastFrameRect.height}px` : undefined,
                opacity: activeCase === null ? 0 : 1,
              }}
            >
              {/* 原站里浮动 logo 本身就是一个 frame_frame */}
              <Frame inset={0} plus={false} stack={0} />
              <div className={`home-cases-icon_hoverBg is-${iconPhase}`}>
                {displayedIcon !== null && (
                  <span
                    key={displayedIcon}
                    className="home-cases-icon_mask"
                    style={{
                      WebkitMaskImage: maskUri(displayedIcon),
                      maskImage: maskUri(displayedIcon),
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ---- case rows ---- */}
          {projects.map((p, i) => {
            const CaseElement = p.href ? 'a' : 'article'

            return (
              <CaseElement
                key={p.id}
                ref={(node) => { caseRefs.current[i] = node }}
                className={`cases_case${activeCase?.index === i ? ' is-hovered' : ''}`}
                href={p.href}
                tabIndex={p.href ? undefined : 0}
                onMouseEnter={() => activateCase(i)}
                onMouseLeave={deactivateCase}
                onFocus={() => activateCase(i)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) deactivateCase()
                }}
                onClick={() => {
                  if (p.href) {
                    sessionStorage.setItem('portfolio:return-to-cases', '1')
                    sessionStorage.setItem('portfolio:return-scroll-y', String(window.scrollY))
                  }
                }}
              >
              <div className="cases_index">
                <span className="font-stardust text-[0.75vw] uppercase tracking-[0.2em]">
                  {p.id}
                </span>
              </div>

              {/* 原站是 class="frame_frame cases_caseInfo" —— 卡片外面整圈角标框 */}
              <div className="cases_caseInfo">
                <Frame inset={0} plus plusPosition="bottom-left" stack={0} />

                {/* 原站 .cases_companyTitle 就是 h2.h2 大标题，
                    之前我们把它当小标签用了，层级是反的 */}
                <div className="cases_titleRule">
                  <h2 className="cjk cases_companyTitle">
                    <span>{p.titleCn}</span>
                  </h2>
                </div>

                <div className="cases_content">
                  <div className="cases_attribute">
                    <p className="cjk cases_meta">
                      {p.summaryCn}
                    </p>
                  </div>

                  <div className="cases_cta">
                    <span aria-hidden="true" style={{ width: '1.3888888889vw', minWidth: 18 }}>
                      <PixelArrow />
                    </span>
                  </div>
                </div>
              </div>
              </CaseElement>
            )
          })}
        </div>
      </div>
    </section>
  )
}
