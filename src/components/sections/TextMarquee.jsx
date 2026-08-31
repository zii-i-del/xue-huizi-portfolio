import { closingMarquee } from '../../data/content'
import { TextMarquee } from '../ui/Marquee'

/**
 * Closing type marquee — scrib3's `textMarquee` section.
 * Alternating solid / outlined words, running right-to-left.
 */
export default function TextMarqueeSection() {
  return (
    <section
      className="closing-marquee relative overflow-hidden"
      aria-hidden="true"
    >
      <TextMarquee items={closingMarquee} duration={38} className="items-center" />
    </section>
  )
}
