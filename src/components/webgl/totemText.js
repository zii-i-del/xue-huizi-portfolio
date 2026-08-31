import * as THREE from 'three'

/**
 * Seamlessly tiling text band — the scrolling captions on the totem's sides.
 *
 * The canvas width is snapped to a whole number of "unit" copies so the
 * texture tiles without a visible seam when combined with
 * `THREE.RepeatWrapping` and an animated `offset.x`.
 */
export function createTextBand(
  label,
  {
    repeat = 5,
    fontSize = 80,
    height = Math.round(fontSize * 0.95),
    background = '#000000',
    color = '#ECECEC',
    accent = null,
    letterSpacing = 0,
    fontFamily = '"Pack", "ZiHunJieBa", "PingFang SC", sans-serif',
  } = {}
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const unit = `${label} ✳ `
  const font = `400 ${fontSize}px ${fontFamily}`
  ctx.font = font
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`

  const unitWidth = Math.max(1, ctx.measureText(unit).width)

  canvas.width = Math.max(256, Math.round(unitWidth * repeat))
  canvas.height = height

  // context resets when the canvas is resized — re-apply everything
  ctx.font = font
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = accent || color
  for (let x = 0; x < canvas.width + unitWidth; x += unitWidth) {
    ctx.fillText(unit, x, canvas.height / 2 + 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}
