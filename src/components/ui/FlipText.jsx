/**
 * Flip-board heading.
 *
 * Resting state renders the text in grey. On hover the glyphs drop 90% of their
 * own height (clipped by the overflow-hidden wrapper), swap to the contrast
 * colour at the very bottom of the travel, then rise back up — so it reads as a
 * mechanical flip rather than a colour change.
 *
 * Duration 400ms on `--ease-scribe`, exactly as scrib3 ships it.
 */
export default function FlipText({ children, as: Tag = 'h2', className = '' }) {
  return (
    <Tag className={`flip ${className}`}>
      <span>{children}</span>
    </Tag>
  )
}

/** Masked line that slides its content up from below. */
export function SlideLine({ children, delay = 0, className = '' }) {
  return (
    <span className={`mask ${className}`}>
      <span style={{ transitionDelay: `${delay}ms` }}>{children}</span>
    </span>
  )
}
