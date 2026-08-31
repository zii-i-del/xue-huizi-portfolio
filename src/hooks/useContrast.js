import { useCallback, useEffect, useState } from 'react'

/**
 * scrib3.co 的四档强调色循环。
 *
 * 关键事实（逆向源码得来，别再改回黑白）：
 *   --theme-contrast 在原站 **不写在任何 CSS 文件里**，
 *   而是运行时由 JS 内联注入到根 div：style="--theme-contrast:#D7ABC5"
 *   全站 30 处引用它 —— 图片全部 grayscale(1) + multiply，
 *   所以 accent 是全站唯一的色彩来源。
 *
 * 我们把它提升为 React 状态 + 写入 <html> 内联样式，
 * 让 :root 里的默认值被覆盖，所有组件自动继承。
 */
/** 唯一强调色 —— 原站默认色，用户要求不做颜色切换。 */
export const ACCENT = '#D7ABC5'

/** 保留常量名以兼容旧引用，但只有一档。 */
export const PALETTE = [ACCENT]

const STORAGE_KEY = 'xhz:contrast'

function readInitial() {
  if (typeof window === 'undefined') return ACCENT
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && saved === ACCENT) return saved
  } catch {
    /* localStorage 不可用时静默降级 */
  }
  return ACCENT
}

export function useContrast() {
  const [contrast, setContrast] = useState(readInitial)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-contrast', contrast)
    root.dataset.contrast = contrast
    try {
      window.localStorage.setItem(STORAGE_KEY, contrast)
    } catch {
      /* 忽略写入失败 */
    }
  }, [contrast])

  const cycleContrast = useCallback(() => setContrast(ACCENT), [])

  return { contrast, setContrast, cycleContrast, palette: PALETTE }
}

export default useContrast
