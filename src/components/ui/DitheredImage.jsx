import { useEffect, useRef, useState } from 'react'

/**
 * Ordered-dither image — scrib3's signature treatment.
 *
 * Real behaviour on scrib3.co (reverse-engineered from chunk 5315.js):
 *   image → luminance → + Bayer 8×8 threshold → 1-bit
 *   then CSS `mix-blend-mode: multiply` over a coloured ground.
 *   White pixels let the accent through, black pixels stay black.
 *   That's where every image on the site gets its duotone grain.
 *
 * We do the same thing on a canvas at load time and swap in the result,
 * so there's zero per-frame cost.
 */

// Classic Bayer 8×8 ordered-dither matrix (values 0–63).
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
]

/**
 * @param {HTMLImageElement} img  decoded source image
 * @param {{cell?:number, maxWidth?:number, contrast?:number, brightness?:number}} opts
 * @returns {string} data URL of the 1-bit dithered bitmap
 */
export function dither(img, { cell = 2, maxWidth = 1440, contrast = 1.15, brightness = 1.02 } = {}) {
  const scale = Math.min(1, maxWidth / img.naturalWidth)
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return img.src

  ctx.drawImage(img, 0, 0, w, h)

  const frame = ctx.getImageData(0, 0, w, h)
  const px = frame.data

  for (let y = 0; y < h; y++) {
    const row = (y % 8) * 8
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Rec.709 luma
      let lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]

      // gentle curve so mid-tones survive the threshold
      lum = (lum / 255 - 0.5) * contrast + 0.5
      lum *= brightness
      lum = Math.min(1, Math.max(0, lum)) * 255

      // Bayer cell lookup — `cell` lets the grain get chunkier on big images
      const t = BAYER[row + ((x / cell | 0) % 8)] / 63
      const v = lum / 255 > t ? 255 : 0

      px[i] = v
      px[i + 1] = v
      px[i + 2] = v
      px[i + 3] = 255
    }
  }

  ctx.putImageData(frame, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * Drop-in replacement for <img> that renders the dithered version.
 *
 * The visible element is a div with the bitmap as background-image so we can
 * control `mix-blend-mode` and `background-size` exactly like scrib3 does.
 */
export default function DitheredImage({
  src,
  alt = '',
  cell = 2,
  maxWidth = 1440,
  contrast = 1.15,
  brightness = 1.02,
  className = '',
  style,
  ...rest
}) {
  const [bitmap, setBitmap] = useState(null)
  const [ratio, setRatio] = useState(null)
  const imgRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    imgRef.current = img

    img.onload = () => {
      if (cancelled) return
      setRatio(img.naturalWidth / img.naturalHeight)
      // let the browser breathe before a potentially heavy pixel pass
      const id = requestIdleCallback
        ? requestIdleCallback(() => !cancelled && setBitmap(dither(img, { cell, maxWidth, contrast, brightness })))
        : setTimeout(() => !cancelled && setBitmap(dither(img, { cell, maxWidth, contrast, brightness })), 0)
      return () => (requestIdleCallback ? cancelIdleCallback(id) : clearTimeout(id))
    }
    img.onerror = () => !cancelled && setBitmap(src)
    img.src = src

    return () => {
      cancelled = true
    }
  }, [src, cell, maxWidth, contrast, brightness])

  return (
    <div
      role="img"
      aria-label={alt}
      className={className}
      style={{
        // fall back to a plain grayscale <img>-like render until the dither lands
        backgroundImage: bitmap ? `url(${bitmap})` : `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: bitmap ? 'none' : 'grayscale(1)',
        aspectRatio: ratio ? `${ratio}` : undefined,
        ...style,
      }}
      {...rest}
    />
  )
}
