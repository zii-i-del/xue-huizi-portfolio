import Marquee from '../ui/Marquee'
import Frame from '../ui/Frame'

/**
 * LogoMarquee — 原站结构（SSR 直抄）：
 *
 *   <section class="logo-marquee_logoMarquee">
 *     <p class="logo-marquee_sectionLabel p">We Work With</p>
 *     <div class="marquee_marquee">
 *       <div class="frame_frame logo-marquee_frame">    ← 每个 logo 一个带边框的格子
 *         <div class="frame_corners"> …4 角… </div>
 *         <span class="p frame_plus">+</span>
 *         <div class="frame_stack"><div/><div/><div/></div>
 *         <p class="logo-marquee_title p">( 01 )</p>     ← 顶部居中编号
 *         <div class="logo-marquee_icon"><img/></div>
 *       </div>
 *
 * 关键尺寸（1440 基准）：
 *   .logo-marquee            height:23.8888888889vw; border-radius:1.6666666667vw
 *                            background:var(--grey-one); color:var(--theme-primary)
 *   .logo-marquee_frame      width:23.6111111111vw; height:12.7777777778vw
 *   .logo-marquee_title      position:absolute; top:var(--layout-margin);
 *                            left:50%; transform:translateX(-50%)
 *   .logo-marquee_icon       width:11.1111111111vw; height:8.3333333333vw
 *   .logo-marquee img        width:13.8888888889vw; height:6.25vw
 */
/* 仅展示简历中真实存在的实习公司/业务。 */
const LOGOS = [
  { name: 'TENCENT CRAFT', cn: '腾讯 · AI Agent 实习' },
  { name: 'TENCENT YUANBAO', cn: '腾讯 · 元宝实习' },
  { name: 'XIAOMI XIAOAI', cn: '小米 · 小爱实习' },
  { name: 'BAIDU INTERNATIONAL', cn: '百度国际 · Synclub 实习' },
]

/* Abstract mark standing in for each company logo — keeps the build asset-free. */
function Mark({ i }) {
  const shapes = [
    <g key="a">
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="20" r="4" fill="currentColor" />
    </g>,
    <g key="b">
      <rect x="7" y="7" width="26" height="26" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="15" y="15" width="10" height="10" fill="currentColor" />
    </g>,
    <g key="c">
      <path d="M20 5 L35 32 L5 32 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </g>,
    <g key="d">
      <rect x="5" y="12" width="30" height="16" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 20 H35" stroke="currentColor" strokeWidth="1.5" />
    </g>,
  ]
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      {shapes[i % shapes.length]}
    </svg>
  )
}

export default function LogoMarquee() {
  return (
    <section
      className="logo-marquee relative grid overflow-hidden"
      style={{
        margin: '0 var(--layout-margin) var(--layout-margin)',
        padding: 'var(--layout-margin) 0',
        background: 'var(--grey-one)',
        color: 'var(--theme-primary)',
        borderRadius: '1.6666666667vw',
        gridTemplateRows: '1fr auto 1fr',
        height: '23.8888888889vw',
        minHeight: 300,
      }}
    >
      <div className="self-start text-center">
        <p
          className="cjk mx-auto font-owners text-[0.95vw] leading-snug"
          style={{ maxWidth: '20.8333333333vw', minWidth: 180 }}
        >
          实习与合作
        </p>
      </div>

      <Marquee
        direction="right"
        speed={110}
        pauseOnHover={false}
        className="items-center logo-marquee__track"
        gap="1.1111111111vw"
      >
        {LOGOS.map((l, i) => (
          <div
            key={l.name}
            className="relative flex items-center justify-center"
            style={{
              width: '23.6111111111vw',
              minWidth: 200,
              height: '12.7777777778vw',
              minHeight: 108,
            }}
          >
            <Frame inset={0} plus stack={3} />

            {/* ( 01 ) 编号 —— 原版绝对定位在格子顶部居中 */}
            <p
              className="absolute left-1/2 font-stardust text-[0.72vw] uppercase tracking-[0.2em]"
              style={{
                top: 'var(--layout-margin)',
                transform: 'translateX(-50%)',
                color: 'var(--theme-primary)',
              }}
            >
              ( {String(i + 1).padStart(2, '0')} )
            </p>

            <div
              className="flex flex-col items-center justify-center"
              style={{ gap: '0.6vw', marginTop: '1.4vw' }}
            >
              <div
                style={{
                  width: '11.1111111111vw',
                  maxWidth: 110,
                  aspectRatio: '4 / 3',
                  color: 'var(--theme-primary)',
                }}
              >
                <Mark i={i} />
              </div>
              <span
                className="font-pack text-[1.5vw] uppercase leading-none tracking-tight"
                style={{ color: 'var(--theme-primary)' }}
              >
                {l.name}
              </span>
              <span
                className="cjk font-owners text-[0.8vw]"
                style={{ color: 'var(--theme-primary)', opacity: 0.6 }}
              >
                {l.cn}
              </span>
            </div>
          </div>
        ))}
      </Marquee>

      <div />
    </section>
  )
}
