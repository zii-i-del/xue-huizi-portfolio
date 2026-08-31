/** Compact relay arrow used by card controls. */
export default function ArrowGlyph({ className = '' }) {
  return (
    <svg viewBox="0 0 16 12" className={className} aria-hidden="true">
      <rect x="0" y="5" width="8" height="2" fill="currentColor" />
      <rect x="8" y="3" width="2" height="6" fill="currentColor" />
      <rect x="10" y="4" width="2" height="4" fill="currentColor" />
      <rect x="12" y="5" width="2" height="2" fill="currentColor" />
    </svg>
  )
}
