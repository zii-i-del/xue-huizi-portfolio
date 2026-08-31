import { useEffect, useState } from 'react'
import { profile, navItems } from '../../data/content'
import { scrollToId } from './SmoothScroll'
import { useContrast } from '../../hooks/useContrast'

/**
 * Header.
 * - Top bar: wordmark / tagline / mark / nav / contact pill
 * - A fixed pill nav that slides up from below once you scroll past the fold
 *   (`translateY(calc(100% + 6.13vh))` → 0), exactly like scrib3's fixedNav.
 *
 * 强调色已固定为单一粉色，不再提供切换入口，
 * 但 useContrast 仍需调用 —— 它负责把 token 写进 <html>。
 */
export default function Header({ entered = false }) {
  const [showNav, setShowNav] = useState(false)
  const [active, setActive] = useState('hero')
  useContrast()

  useEffect(() => {
    const onScroll = () => {
      setShowNav(window.scrollY > window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // highlight the section currently in view
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    navItems.forEach((n) => {
      const el = document.getElementById(n.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <header
        className="pointer-events-none absolute left-0 top-0 z-[5] w-full"
        style={{
          padding: 'var(--layout-margin) 0',
          color: 'var(--theme-secondary)',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-18px)',
          transition: 'opacity .65s var(--ease-scribe), transform .65s var(--ease-scribe)',
        }}
      >
        <div className="layout-grid layout-block items-start">
          {/* wordmark */}
          <button
            data-header-logo-target
            onClick={() => scrollToId('hero')}
            className="pointer-events-auto col-span-2 text-left"
            style={{ color: 'var(--grey-one)' }}
          >
            <span className="font-pack text-[1.6vw] uppercase leading-none tracking-tight">
              Xue Huizi
            </span>
          </button>

          {/* tagline */}
          <div className="col-span-2 col-start-4">
            <p className="cjk font-owners text-[0.95vw] leading-snug opacity-70">
              AI 产品经理
              <br />
              中国 · 深圳
            </p>
          </div>

          {/* mark */}
          <div className="col-span-2 col-start-6 flex justify-center">
            <svg
              viewBox="0 0 32 32"
              className="w-[2.2vw] min-w-[24px]"
              style={{ color: 'var(--theme-contrast)' }}
            >
              <rect x="4" y="4" width="10" height="10" fill="currentColor" />
              <rect x="18" y="4" width="10" height="10" fill="currentColor" opacity="0.45" />
              <rect x="4" y="18" width="10" height="10" fill="currentColor" opacity="0.45" />
              <rect x="18" y="18" width="10" height="10" fill="currentColor" />
            </svg>
          </div>

          {/* nav */}
          <nav className="col-span-2 col-start-9 hidden lg:block">
            <ul className="space-y-1">
              {navItems.slice(1).map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => scrollToId(n.id)}
                    className="cjk font-owners text-[0.9vw] leading-none tracking-[0.06em] transition-opacity hover:opacity-60"
                    style={{ color: active === n.id ? 'var(--theme-contrast)' : undefined }}
                  >
                    {n.labelCn}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact */}
          <div className="col-span-2 col-start-11 flex items-start justify-end gap-2">
            <a
              href={`mailto:${profile.email}`}
              className="cjk pointer-events-auto whitespace-nowrap font-owners text-[0.9vw] leading-none tracking-[0.06em] transition-opacity hover:opacity-70"
              style={{
                background: 'var(--grey-one)',
                color: 'var(--theme-primary)',
                borderRadius: '2.9166666667vw',
                padding: '0.75vw 1.3vw',
              }}
            >
              联系我
            </a>
          </div>
        </div>
      </header>

      {/* fixed pill nav */}
      <div
        className="pointer-events-none fixed bottom-[4.9vh] left-0 right-0 z-[5] flex justify-center"
        style={{
          transition: 'opacity .2s, transform .4s',
          opacity: showNav ? 1 : 0,
          transform: showNav ? 'translateY(0)' : 'translateY(calc(100% + 6.13vh))',
        }}
      >
        <div
          className="pointer-events-auto flex flex-row items-center"
          style={{
            gap: '1.1111111111vw',
            border: '1px solid var(--grey-two)',
            borderRadius: '2.9166666667vw',
            padding: '0.75vw 1.4vw',
            background: 'var(--theme-primary)',
          }}
        >
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollToId(n.id)}
              className="cjk group relative whitespace-nowrap font-owners text-[0.95vw] leading-none tracking-[0.06em] transition-colors"
              style={{ color: active === n.id ? 'var(--theme-contrast)' : 'var(--grey-two)' }}
            >
              {n.labelCn}
              <span
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: 'var(--theme-contrast)' }}
              />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
