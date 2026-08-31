/**
 * Frame — scrib3 出现频率最高的母题（首页 38 处）。
 *
 * 原站结构（SSR 直抄，fragment from a41af27b55b6a660.css）：
 *   .frame        position:relative; color:currentColor; width:100%; height:100%
 *   .frame__corners  position:absolute; inset:0; pointer-events:none
 *   .frame__corner   3.4722222222vw 见方，四角各一个，靠 scale 镜像
 *     .frame__first   73%×73%   bottom/left  border-left:1px
 *     .frame__second  73%×73%   top/right    border-top:1px
 *     .frame__third   37% 正方  top/left     rotate(45deg) + 平移，border-left:1px
 *   .frame__plus   左上角 "+"   1.1111111111vw
 *   .frame__stack  右上角三个描边小方块 .5555555556vw
 *   .frame__top / .frame__bottom  —— fill 变体：上下实心条 + border-bottom
 *
 * 颜色全部用 currentColor：浅底区块（跑马灯 / 卡片）自动变黑，
 * 深色区块自动变浅，不用各处分叉判断。
 *
 * 用法：
 *   <Frame inset="1.1111111111vw" />              覆盖层（默认）
 *   <Frame className="cases_caseInfo">…children…</Frame>   作为容器
 */

/**
 * 四个角的修饰类**必须写成字面量**。
 *
 * 之前写成 `frame__corner--${n}`，Tailwind 的 content 扫描器只能看到
 * `frame__corner--`，看不到 `--1/--2/--3/--4`，于是这四条规则被静默 purge ——
 * 四个角全部塌到左上角、镜像 transform 全丢，页面上就表现为"边框只有左上角有"。
 * 构建不报错、控制台也不报错，纯静默失效，肉眼很难发现是 CSS 被删了。
 */
const CORNER_CLASSES = [
  'frame__corner--1',
  'frame__corner--2',
  'frame__corner--3',
  'frame__corner--4',
]

export default function Frame({
  className = '',
  style,
  inset,
  plus = true,
  plusPosition = 'top-left',
  stack = 3,
  fill = false,
  children,
}) {
  // 覆盖层模式：absolute + inset 定位。必须把 .frame 默认的
  // width/height:100% 顶掉，否则会撑出 inset 之外造成溢出。
  const frameStyle =
    inset != null
      ? { position: 'absolute', inset, width: 'auto', height: 'auto', ...style }
      : style

  return (
    <div
      className={`frame ${className}`}
      style={frameStyle}
      aria-hidden={children ? undefined : 'true'}
    >
      <div className="frame__corners">
        {CORNER_CLASSES.map((cls) => (
          <span key={cls} className={`frame__corner ${cls}`}>
            <svg viewBox="0 0 50 50" preserveAspectRatio="none" aria-hidden="true">
              <path d="M50 .5 H21 L.5 21 V50" />
            </svg>
          </span>
        ))}

        {plus && (
          <span className={`frame__plus frame__plus--${plusPosition}`}>+</span>
        )}

        {stack > 0 && (
          <span className="frame__stack">
            {Array.from({ length: stack }, (_, i) => (
              <span key={i} />
            ))}
          </span>
        )}

        {fill && (
          <>
            <span className="frame__top" />
            <span className="frame__bottom" />
          </>
        )}
      </div>

      {children}
    </div>
  )
}
