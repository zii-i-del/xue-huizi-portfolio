/** SCRIB3 section-header arrow: five pixel steps ending in a split chevron. */
export default function SectionDownArrow({ className = '' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="9" y="1" width="2.4" height="2.4" fill="currentColor" />
      <rect x="9" y="4.3" width="2.4" height="2.4" fill="currentColor" />
      <rect x="9" y="7.6" width="2.4" height="2.4" fill="currentColor" />
      <rect x="9" y="11" width="2.4" height="2.4" fill="currentColor" />
      <rect x="9" y="17.1" width="2.4" height="2.4" fill="currentColor" />
      <rect width="8.9" height="2.4" transform="rotate(135 6.8 9.1)" fill="currentColor" />
      <rect width="8.9" height="2.4" transform="rotate(45 -9.1 9)" fill="currentColor" />
    </svg>
  )
}
