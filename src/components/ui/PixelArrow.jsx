/**
 * Pixel-arrow — 8-bit flavoured chevron rendered as stepped SVG paths.
 * Used for carousel controls, list affordances and CTA arrows.
 */
export default function PixelArrow({
  direction = 'right',
  size = 16,
  className = '',
  step = 4,
}) {
  // Build a stepped chevron path so it reads as pixel art at any size.
  const s = 16
  const paths = {
    right: `M3 1h3v3h3v3h1v-3h3v-3h3v3h-3v3h-3v3h-1v-3h-3v-3h-3z`,
    left: `M13 1h-3v3h-3v3h-1v-3h-3v-3h-3v3h3v3h3v3h1v-3h3v-3h3z`,
    up: `M1 13v-3h3v-3h3v-1h-3v-3h-3v-3h3v3h3v3h3v-3h-3v-3h3v3h3v3h-3v3h-3v3h-3v-3h-3z`,
    down: `M1 3v3h3v3h3v1h-3v3h-3v3h3v-3h3v-3h3v3h-3v3h3v-3h3v-3h-3v-3h-3v-3h-3v3h-3z`,
  }

  const rotate = { right: 0, down: 90, left: 180, up: 270 }[direction] ?? 0

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${s} ${s}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <path d={paths.right} fill="currentColor" />
    </svg>
  )
}

/** Small pixel cross / plus — used as the expand affordance. */
export function PixelPlus({ size = 14, className = '', open = false }) {
  const s = 16
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${s} ${s}`}
      className={`${className} transition-transform duration-500 ease-expo`}
      shapeRendering="crispEdges"
      style={{ transform: open ? 'rotate(135deg)' : 'rotate(0deg)' }}
      aria-hidden="true"
    >
      <path d="M6 1h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="currentColor" />
    </svg>
  )
}
