/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  /**
   * safelist —— 这些是从 scrib3.co **1:1 移植**的原站类名，
   * 写在 globals.css 的 `@layer` 里，因此会被 Tailwind 按 content 扫描做 purge。
   *
   * 出过一次事故：`frame__corner--${n}` 是模板字符串拼接，扫描器只看到
   * `frame__corner--`、看不到 `--1/--2/--3/--4`，四条规则被静默删除，
   * 结果四个角全塌到左上角（"边框只有左上角有"）。构建和控制台都不报错。
   *
   * 这里按前缀整体保护，防止以后再有人写动态类名踩同一个坑。
   */
  safelist: [
    { pattern: /^frame__/ },
    { pattern: /^services_/ },
    { pattern: /^section-header_/ },
    { pattern: /^loader_/ },
    { pattern: /^scrollbar_/ },
    { pattern: /^large-image_/ },
    { pattern: /^marquee__/ },
    { pattern: /^hero_/ },
    { pattern: /^footer_/ },
    'no-select',
    'vh-full',
    'svh-full',
  ],

  theme: {
    extend: {
      colors: {
        primary: 'var(--theme-primary)',
        secondary: 'var(--theme-secondary)',
        contrast: 'var(--theme-contrast)',
        'grey-one': 'var(--grey-one)',
        'grey-two': 'var(--grey-two)',
      },
      fontFamily: {
        pack: 'var(--font-pack)',
        stardust: 'var(--font-stardust)',
        owners: 'var(--font-owners)',
      },
      transitionTimingFunction: {
        scribe: 'var(--ease-scribe)',
        'out-expo': 'var(--ease-out-expo)',
      },
    },
  },
  plugins: [],
}
