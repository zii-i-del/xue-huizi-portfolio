import Reveal, { GrowLine } from './Reveal'
import SectionDownArrow from './SectionDownArrow'

/**
 * Section header — mirrors scrib3's grid:
 *   [span 3] label      [span 4 centred] body      [col 12] arrow
 * with a hairline that draws in from the left on enter.
 */
export default function SectionHeader({
  index,
  label,
  title,
  body,
  helperText,
  mobileHelperText,
  targetId,
  layout = 'default',
  className = '',
}) {
  const scrollToTarget = () => {
    if (!targetId) return
    const target = document.getElementById(targetId)
    if (!target) return
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -24, duration: 1.05 })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (layout === 'editorial') {
    return (
      <Reveal className={`section-header-editorial relative ${className}`} stagger={0.08}>
        <GrowLine className="absolute left-0 right-0 top-0" />

        <div className="section-header-editorial__grid">
          <div className="section-header-editorial__title">
            <span className="mask section-header-editorial__eyebrow">
              <span className="font-stardust text-[var(--type-micro)] uppercase tracking-[0.22em]">
                {index} — {label}
              </span>
            </span>
            <span className="mask">
              <span className="cjk section-header-editorial__heading">{title}</span>
            </span>
          </div>

          <div className="section-header-editorial__body">
            {body && (
              <span className="mask">
                <span className="cjk font-owners text-[var(--type-secondary)] leading-[1.4]">{body}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            className="section-header-editorial__arrow"
            onClick={scrollToTarget}
            aria-label={`跳到${title}内容`}
          >
            <SectionDownArrow className="h-full w-full" />
          </button>
        </div>
      </Reveal>
    )
  }

  // The Press / Cases headers on the reference site are deliberately spare:
  // a single editorial title, the opening rule and the navigation arrow.
  // Keep this separate from the overview header so the latter can retain its
  // informational grid without leaking those labels into Experience / Work.
  if (layout === 'titleOnly') {
    return (
      <Reveal className={`section-header-title-only relative ${className}`} stagger={0.08}>
        <GrowLine className="absolute left-0 right-0 top-0" />
        <div className="section-header-title-only__grid">
          {/* 这类页眉不能依赖 ScrollTrigger 的 mask 入场；刷新或直接跳转到
              区块时，标题也必须立即可见。 */}
          <span className="section-header-title-only__title">{title}</span>
          {helperText && (
            <p className="cjk section-header-title-only__helper">
              <span className="section-header-title-only__helper-desktop">{helperText}</span>
              <span className="section-header-title-only__helper-mobile">
                {mobileHelperText || helperText}
              </span>
            </p>
          )}
          <button
            type="button"
            className="section-header-title-only__arrow"
            onClick={scrollToTarget}
            aria-label={`跳到${title}内容`}
          >
            <SectionDownArrow className="h-full w-full" />
          </button>
        </div>
      </Reveal>
    )
  }

  return (
    <Reveal className={`relative ${className}`} stagger={0.08}>
      <GrowLine className="absolute left-0 right-0 top-0" />

      <div className="layout-grid" style={{ paddingTop: 'var(--layout-margin)' }}>
        <div className="col-span-3" style={{ color: 'var(--theme-secondary)' }}>
          <span className="mask">
            <span className="font-stardust text-[var(--type-micro)] uppercase tracking-[0.22em]">
              {index} — {label}
            </span>
          </span>
        </div>

        <div className="col-span-5 col-start-5 text-center">
          {body && (
            <span className="mask">
              <span className="font-owners text-[var(--type-body)] leading-relaxed">{body}</span>
            </span>
          )}
        </div>

        {title && (
          <div className="col-span-3 col-start-10 text-right">
            <span className="mask">
              <span className="font-stardust text-[var(--type-micro)] uppercase tracking-[0.22em]">
                {title}
              </span>
            </span>
          </div>
        )}
      </div>
    </Reveal>
  )
}
