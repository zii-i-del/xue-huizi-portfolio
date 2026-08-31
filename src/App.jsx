import { useEffect, useState } from 'react'
import SmoothScroll from './components/layout/SmoothScroll'
import Loader from './components/layout/Loader'
import Header from './components/layout/Header'
import Scrollbar from './components/layout/Scrollbar'

import Hero from './components/sections/Hero'
import LogoMarquee from './components/sections/LogoMarquee'
import TotemSection from './components/sections/TotemSection'
import Experience from './components/sections/Experience'
import LargeImage from './components/sections/LargeImage'
import Cases from './components/sections/Cases'
import TextMarquee from './components/sections/TextMarquee'
import Footer from './components/sections/Footer'
import Cursor from './components/ui/Cursor'
import StainField from './components/webgl/StainField'

/**
 * Section order mirrors scrib3.co's homepage exactly:
 *   hero → logoMarquee → services(totem) → capabilities → press
 *        → largeImage → cases → textMarquee → footer
 *
 * 颗粒只出现在 hero / services / cases 三处（各自在区块内注册 stain 窗口）。
 */
export default function App() {
  const [returningToCases] = useState(
    () => sessionStorage.getItem('portfolio:return-to-cases') === '1'
  )
  const [returnScrollY] = useState(() => {
    const stored = Number(sessionStorage.getItem('portfolio:return-scroll-y'))
    return Number.isFinite(stored) ? stored : null
  })
  const [introState, setIntroState] = useState(returningToCases ? 'entered' : 'booting')
  const entered = introState === 'entered'

  useEffect(() => {
    if (!returningToCases) return undefined

    sessionStorage.removeItem('portfolio:return-to-cases')
    sessionStorage.removeItem('portfolio:return-scroll-y')
    let active = true

    const restoreCases = () => {
      if (!active) return
      const target = document.getElementById('cases')
      if (!target) return
      const destination = returnScrollY ?? target.offsetTop

      window.history.replaceState(null, '', '#cases')
      window.__lenis?.resize()
      window.scrollTo({ top: destination, behavior: 'auto' })
      window.__lenis?.scrollTo(destination, { immediate: true, force: true })
    }

    const frame = requestAnimationFrame(() => requestAnimationFrame(restoreCases))
    const retries = [80, 240, 600].map((delay) => window.setTimeout(restoreCases, delay))
    document.fonts?.ready.then(restoreCases)

    return () => {
      active = false
      cancelAnimationFrame(frame)
      retries.forEach(window.clearTimeout)
    }
  }, [returnScrollY, returningToCases])

  return (
    <SmoothScroll enabled={entered}>
      <StainField />
      {!returningToCases && <Loader onStateChange={setIntroState} />}
      <Scrollbar />
      <Header entered={entered} />
      <Cursor />

      <main className="relative" style={{ zIndex: 1 }}>
        <Hero entered={entered} />
        <LogoMarquee />
        <TotemSection />
        <Experience />
        <LargeImage />
        <Cases />
        <TextMarquee />
      </main>

      <div className="relative" style={{ zIndex: 1 }}>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
