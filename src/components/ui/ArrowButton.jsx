import ArrowGlyph from './ArrowGlyph'

/**
 * Arrow button with the relay effect.
 *
 * Two copies of the same arrow: the "in" arrow sits in place, the "out" arrow
 * waits off-canvas at -250%. On hover they swap — the current one exits right,
 * the waiting one slides in from the left. 600ms on --ease-scribe.
 *
 * Built from <rect>s so it inherits `fill: currentColor`, like scrib3's.
 */
function Arrow({ className = '' }) {
  return <ArrowGlyph className={className} />
}

export default function ArrowButton({
  direction = 'right',
  onClick,
  className = '',
  width = '5.5555555556vw',
  height = '6.3888888889vw',
  label,
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`arrow-btn group ${direction === 'left' ? 'left' : ''} ${className}`}
      style={{ width, height, minWidth: 56, minHeight: 46 }}
    >
      <div>
        <Arrow className="arrow-in" />
        <Arrow className="arrow-out" />
      </div>
    </button>
  )
}
