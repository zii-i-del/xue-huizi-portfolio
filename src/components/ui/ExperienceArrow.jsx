/** SCRIB3's 72-grid staircase arrow, used only by the experience rows. */
export default function ExperienceArrow({ className = '' }) {
  return (
    <svg viewBox="0 0 72 72" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M48 24H36v11.9h12zm5.9-14.5L45.4 18l8.5 8.5 8.5-8.5zm18-9.5h-12v12h12zm-36 36H24v12h12V36M24 48H12v11.9h12v-12ZM12 59.8H0v12h12zM48.3 0H3.4v12h44.8zM72 23.7H60v44.8h12z"
        fill="currentColor"
      />
    </svg>
  )
}
