// ============================================================
//  薛惠姊 / XUE HUIZI — AI Product Manager
//  All site content lives here. Edit freely.
// ============================================================

export const profile = {
  nameEn: 'XUE HUIZI',
  nameCn: '薛惠姊',
  role: 'AI PRODUCT MANAGER',
  roleCn: 'AI 产品经理',
  location: 'Shenzhen, China',
  available: 'OPEN TO 2027 GRAD ROLES',
  email: '18354345640@163.com',
  phone: '18354345640',
  wechat: 'x18354345640',
  intro:
    'Product manager at the intersection of LLM agents, evaluation systems and generative experiences. I turn fuzzy model behaviour into measurable product quality — then ship it.',
  introCn:
    '聚焦大模型 Agent、评测体系与生成式体验的产品经理，把模糊的模型表现变成可度量、可迭代的产品质量',
  stats: [
    { value: '4', label: 'AI PRODUCT ROLES', labelCn: 'AI 产品实习' },
    { value: '2×', label: 'TENCENT TOURS', labelCn: '腾讯两段' },
    { value: '92%', label: 'INTENT ACCURACY', labelCn: '意图识别准确率' },
    { value: '67%', label: 'VISUAL WIN RATE', labelCn: '视觉净胜率' },
  ],
}

// ------------------------------------------------------------
// SECTION 0 — Hero 主标题（翻牌式入场）
//   stroke: true → 空心描边字；false → 实心填充字
//   原站规则（已从 SSR + CSS 确认）：
//     .hero_title { color: var(--theme-contrast) }
//     .hero_bold  { color: var(--theme-primary);
//                   -webkit-text-stroke: 1px var(--theme-contrast) }
//   第 1 行实心粉（姓名），第 2 行黑字粉描边（站点定位）。
// ------------------------------------------------------------
export const heroLines = [
  { text: '薛惠姊', stroke: true },
  { text: 'AI 作品集', stroke: false },
  { text: 'XHZ PORTFOLIO', stroke: 'split' },
]

export const heroMeta = {
  eyebrow: 'AI PRODUCT MANAGER · SHENZHEN',
  eyebrowCn: 'AI 产品经理 · 深圳',
  scroll: 'SCROLL',
  scrollCn: '向下滚动',
}

// ------------------------------------------------------------
// SECTION 2 — 魔方 / Totem 四层 + 右侧卡片
//   底层 → 顶层：教育 → 实习 → 视觉作品 → 技能
//   short = 魔方表面滚动字幕（短标题）
//   card  = 右侧卡片的详细内容
// ------------------------------------------------------------
export const totemCards = [
  {
    id: '01',
    short: 'EDUCATION',
    index: '01',
    title: 'EDUCATION',
    titleCn: '教育背景',
    kicker: 'MECHANICAL × HUMAN FACTORS',
    kickerCn: '机械 · 人因工程',
    lede: 'Cross-disciplinary, ranked #1 in both exams. Trained in industrial design, now researching human factors.',
    ledeCn: '跨专业考研，初试复试均第一，工业设计出身，现研究人因工程与用户体验',
    rows: [
      { k: '深圳大学', v: '硕士 · 机械设计', t: '2024.09 — 2027.07' },
      { k: '深圳技术大学', v: '本科 · 工业设计', t: '2019.09 — 2023.07' },
    ],
    bullets: [
      '跨专业考研，初试复试均第一',
      '人因工程与用户体验研究',
      '国家级外观设计专利 · 英语六级',
    ],
  },
  {
    id: '02',
    short: 'EXPERIENCE',
    index: '02',
    title: 'EXPERIENCE',
    titleCn: '实习经历',
    kicker: '4 AI PRODUCT ROLES',
    kickerCn: '四段 AI 产品实习',
    lede: 'Two tours at Tencent, plus Xiaomi and Baidu — always on LLM agents, evaluation and generative experiences.',
    ledeCn: '腾讯两段，小米、百度各一段，始终围绕大模型 Agent、评测与生成式体验',
    rows: [
      { k: '腾讯', v: 'AI Agent 产品经理', t: '2026.05 — NOW' },
      { k: '腾讯', v: '大模型产品经理', t: '2025.12 — 2026.04' },
      { k: '小米', v: 'AI 策略产品经理', t: '2025.08 — 2025.12' },
      { k: '百度国际', v: 'AIGC 产品经理', t: '2024.11 — 2025.02' },
    ],
    bullets: [
      '腾讯 Craft · AI Agent 产品',
      '腾讯元宝 · 大模型产品',
      '小米小爱 · AI 策略',
      '百度 Synclub · AIGC 产品',
    ],
  },
  {
    id: '03',
    short: 'PORTFOLIO',
    index: '03',
    title: 'PORTFOLIO',
    titleCn: '视觉作品',
    kicker: 'UI · VR · VISUAL SYSTEMS',
    kickerCn: '界面 · VR · 视觉系统',
    lede: 'Four visual and interaction design projects spanning automotive, medical beauty, immersive learning and community products.',
    ledeCn: '涵盖集度智能汽车视觉、优佳医美 APP、VR 英语学习系统与生活方式社区 APP 改版的设计作品集',
    rows: [
      { k: '集度视觉设计', v: '品牌 · Web · 移动端', t: '' },
      { k: '优佳医美APP设计', v: '移动端 · 后台系统', t: '' },
      { k: 'VR英语学习系统设计', v: 'APP · VR 交互', t: '' },
      { k: 'APP视觉改版', v: '信息架构 · 视觉系统', t: '' },
    ],
    bullets: [
      '集度视觉设计',
      '优佳医美APP设计',
      'VR英语学习系统设计',
      'APP视觉改版',
    ],
  },
  {
    id: '04',
    short: 'SKILLS',
    index: '04',
    title: 'SKILLS',
    titleCn: '技能矩阵',
    kicker: 'PRODUCT × DATA × DESIGN',
    kickerCn: '产品 · 数据 · 设计',
    lede: 'From evaluation frameworks to runnable prototypes — I build the tooling I need to make decisions.',
    ledeCn: '从评测框架到自己可运行的原型，我造自己决策所需的工具',
    rows: [
      { k: 'AI 产品', v: 'Agent 编排 · 模型评测 · Prompt 工程', t: '' },
      { k: '数据分析', v: 'SQL · Python · AB 实验 · GSB 评测', t: '' },
      { k: '设计', v: 'AIGC · Figma · Axure · PS / AI', t: '' },
      { k: '语言', v: '中文母语 · 英语六级 · 日语调研', t: '' },
    ],
    bullets: [
      'AI 产品规划',
      '模型评测体系',
      'Agent 编排设计',
      'Prompt 工程',
      '数据分析',
      '用户研究',
    ],
  },
]

// ------------------------------------------------------------
// SECTION 3 — 第一行：姓名 / 学校 / 课程
// ------------------------------------------------------------
export const education = [
  {
    id: '01',
    school: 'Shenzhen University',
    schoolCn: '深圳大学',
    degree: 'M.Eng · Mechanical Design',
    degreeCn: '硕士 · 机械设计',
    period: '2024.09 — 2027.07',
    city: 'Shenzhen',
    highlights: [
      'Ranked #1 in both initial & final postgraduate entrance exams (cross-discipline)',
      'Research: Human Factors Engineering & User Experience',
      'Thesis: VR-based multimodal serious game design',
    ],
    highlightsCn: [
      '跨专业考研，初试复试均第一',
      '硕士方向：人因工程与用户体验研究',
      '毕设方向：基于 VR 的多模态严肃游戏设计',
    ],
    courses: ['Data Analysis', 'UX Measurement', 'Product Design'],
    coursesCn: ['数据分析', '用户体验度量', '产品设计'],
  },
  {
    id: '02',
    school: 'Shenzhen Technology University',
    schoolCn: '深圳技术大学',
    degree: 'B.Eng · Industrial Design',
    degreeCn: '本科 · 工业设计',
    period: '2019.09 — 2023.07',
    city: 'Shenzhen',
    highlights: [
      'National-level design patent granted',
      'CET-6 certified',
      'Admission score 590 (Physics track, Guangdong)',
    ],
    highlightsCn: [
      '在校获国家级外观设计专利',
      '通过英语六级',
      '广东物理类高考录取分数线 590 分',
    ],
    courses: ['Graphic Design', 'UI Design', 'Design Psychology'],
    coursesCn: ['平面设计', '用户界面设计', '设计心理学'],
  },
]

// ------------------------------------------------------------
// SECTION 4 — 第二行：实习关键词，突出 AI 能力
// ------------------------------------------------------------
export const aiCapabilities = [
  {
    id: '01',
    title: 'AGENT ORCHESTRATION',
    titleCn: 'Agent 编排',
    desc: 'Multi-stage task flows, intent taxonomies, state decomposition and Function Calling strategies for production agents.',
    descCn: '多阶段任务流、意图体系、任务状态拆解与 Function Calling 策略设计',
    metric: '90%',
    metricLabel: 'END-TO-END TASK SUCCESS',
  },
  {
    id: '02',
    title: 'MODEL EVALUATION',
    titleCn: '模型评测',
    desc: 'Building benchmark suites from scratch — gate-controlled scoring, severity tiers, anchor cases, annotation consistency testing.',
    descCn: '从 0 搭建评测体系：门控打分、P0/P1/P2 严重性分级、锚点 case、标注一致性验证',
    metric: '12',
    metricLabel: 'CATEGORIES / 50 CASES',
  },
  {
    id: '03',
    title: 'SFT DATA PIPELINE',
    titleCn: 'SFT 数据生产',
    desc: 'Prompt-driven query generation, structured deduction prompts, automated pattern detection and quality-filter agents.',
    descCn: 'Prompt 驱动的 query 生成、结构化推导 Prompt、自动化 Pattern 检测与质量筛选 Agent',
    metric: '4.3w+',
    metricLabel: 'CURATED TRAINING SAMPLES',
  },
  {
    id: '04',
    title: 'A/B & GSB LIFT',
    titleCn: 'AB 实验与收益',
    desc: 'Offline eval sets plus online A/B and GSB readouts — every launch tied to a measurable delta.',
    descCn: '离线评测集 + 线上 A/B 与 GSB 收益验证，每一次上线都对应可量化增量',
    metric: '+6.67pp',
    metricLabel: 'GSB NET WIN RATE',
  },
  {
    id: '05',
    title: 'PROMPT ENGINEERING',
    titleCn: 'Prompt 工程',
    desc: 'Reusable prompt libraries, constraint design, tool-call strategy and reference-inheritance fixes for stable multi-turn agents.',
    descCn: '可复用 Prompt 库、约束设计、Tool 调用策略与参考信息继承优化',
    metric: '6',
    metricLabel: 'REUSABLE PROMPTS SHIPPED',
  },
  {
    id: '06',
    title: 'VIBE CODING',
    titleCn: 'Vibe Coding 原型',
    desc: 'Shipping runnable prototypes and internal skills myself — from graphics quality gates to doc-to-knowledge pipelines.',
    descCn: '自己动手产出可运行原型与内部 Skill：从视觉质量门控到文档知识库流水线',
    metric: 'TOP 3',
    metricLabel: 'SKILL STORE DOWNLOADS',
  },
]

// ------------------------------------------------------------
// SECTION 5 — 作品项目，突出设计能力
// ------------------------------------------------------------
export const projects = [
  {
    id: '01',
    title: 'VR Multimodal Serious Game',
    titleCn: '集度视觉设计',
    type: 'THESIS · XR DESIGN',
    year: '2026',
    summary:
      'Graduation project. A VR serious game that fuses multimodal interaction with training scenarios, designed around human-factors principles.',
    summaryCn:
      '围绕集度智能汽车数字体验，完成品牌视觉规范、智子 Web 平台、移动端与通用组件的系统化 UI 设计',
    href: './work/jidu/',
    tags: ['VR', 'Human Factors', 'Multimodal', 'Unity'],
    visual: 'isometric',
    placeholder: true,
  },
  {
    id: '02',
    title: 'Automotive HMI Interaction Design',
    titleCn: '优佳医美APP设计',
    type: 'INTERACTION DESIGN',
    year: '2024',
    summary:
      'In-car HMI interaction design internship — information architecture, driving-scenario flows and high-fidelity prototypes.',
    summaryCn:
      '围绕优佳医美业务，完成移动端 APP 与后台管理系统的产品分析、信息架构、视觉规范、核心页面及组件体系设计',
    href: './work/youjia/',
    tags: ['HMI', 'Figma', 'Scenario Flow', 'Prototyping'],
    visual: 'grid',
    placeholder: true,
  },
  {
    id: '03',
    title: 'Generative Style System',
    titleCn: 'VR英语学习系统设计',
    type: 'AIGC · STYLE DESIGN',
    year: '2025',
    summary:
      'End-to-end ownership of CG / Korean-comic / light-novel styles: selection, LoRA fine-tuning, data distillation and acceptance scoring.',
    summaryCn:
      '面向小学 3–6 年级儿童，设计融合动作识别、场景对话与人教版教材的 VR 英语学习系统，完成用户研究、APP 原型及 VR 任务交互',
    href: './work/vr-english/',
    tags: ['SDXL', 'LoRA', 'Civitai', 'Art Direction'],
    visual: 'halftone',
    placeholder: true,
  },
  {
    id: '04',
    title: 'Industrial Design Patent',
    titleCn: 'APP视觉改版',
    type: 'INDUSTRIAL DESIGN',
    year: '2022',
    summary:
      'Awarded a national-level design patent during undergraduate study — form exploration, CMF study and production-ready detailing.',
    summaryCn:
      '围绕生活方式社区 APP，完成产品分析、信息架构与核心页面改版，并建立色彩、字体、图标、IP 形象及运营活动的统一视觉体系',
    href: './work/xiwu/',
    tags: ['Industrial Design', 'CMF', 'Rhino', 'Rendering'],
    visual: 'cube',
    placeholder: true,
  },
]

// ------------------------------------------------------------
// SECTION 6 — 技能
// ------------------------------------------------------------
export const skillGroups = [
  {
    id: '01',
    group: 'AI PRODUCT',
    groupCn: 'AI 产品能力',
    items: [
      'Prompt Engineering',
      'Agent Orchestration',
      'Model Evaluation',
      'Vibe Coding Prototypes',
      'SFT Training',
    ],
    itemsCn: ['Prompt 工程', 'Agent 编排', '模型评测', 'Vibe Coding 原型', 'SFT 模型训练'],
  },
  {
    id: '02',
    group: 'DATA & ANALYSIS',
    groupCn: '数据处理与分析',
    items: ['SQL', 'Python', 'A/B Testing', 'GSB Evaluation', 'Badcase Analysis'],
    itemsCn: ['SQL', 'Python', 'AB 实验', 'GSB 评测', 'Badcase 分析'],
  },
  {
    id: '03',
    group: 'DESIGN',
    groupCn: '设计能力',
    items: ['AIGC', 'Figma', 'Axure', 'Illustrator', 'Photoshop'],
    itemsCn: ['AIGC', 'Figma', 'Axure', 'AI', 'PS'],
  },
  {
    id: '04',
    group: 'LANGUAGE',
    groupCn: '语言',
    items: ['Chinese — Native', 'English — CET-6 / Working', 'Japanese — Product Research'],
    itemsCn: ['中文 — 母语', '英语 — 六级 / 工作语言', '日语 — 产品调研'],
  },
]

// ------------------------------------------------------------
// SECTION 7 — 实习经历（全量，hover 展开详情）
// ------------------------------------------------------------
export const experiences = [
  {
    id: '01',
    company: 'Tencent',
    companyCn: '腾讯计算机系统有限公司',
    companyShortCn: '腾讯',
    product: 'CRAFT · AI GAME GENERATION',
    productCn: 'Craft · AI 游戏生成产品',
    role: 'AI AGENT PRODUCT MANAGER',
    roleCn: 'AI Agent 产品经理',
    internshipRoleCn: 'AI Agent 产品经理',
    period: '2026.05 — NOW',
    city: 'Shenzhen',
    accent: true,
    summary:
      'Owning Agent capability for the Craft platform — project scoping, 3D game generation quality and the evaluation system behind both.',
    summaryCn:
      '负责 Craft 平台 Agent 能力建设，覆盖游戏立项澄清、3D 游戏生成优化及效果评测体系搭建。',
    highlights: [
      'Intent accuracy 92% · end-to-end task success 90% · tool-call success 93%',
      'Visual net win rate 67%; skill hit Top 3 downloads within one month',
      'Built a 12-category / 50-case agent benchmark with a dual-gate scoring rubric',
    ],
    details: [
      {
        title: 'Game Scoping Clarification Agent',
        titleCn: '游戏立项澄清 Agent',
        body: 'Fixed the fractured 2D/3D split in the scoping stage. Designed a multi-stage flow — dynamic clarification → design-doc generation → dev confirmation — plus the intent taxonomy, task-state decomposition and Function Calling strategy. Co-owned the frontend component toolkit with engineering. Traced 200+ offline evals to isolate intent misclassification, over-planning and rule conflicts, then fixed reference inheritance, prompt constraints and tool-call strategy.',
        bodyCn:
          '针对立项阶段 2D/3D 选择分流前置导致体验割裂问题，独立负责立项澄清 Agent 策略设计。设计「动态信息澄清-策划案生成-开发确认」多阶段任务流程，完成意图体系、任务状态拆解、Function Calling 策略设计，与研发协作维护前端组件库工具。基于 200+ 条离线评测集及 Trace 分析定位意图误判、过度规划、规则冲突等 Badcase，优化参考游戏信息继承、Prompt 约束及 Tool 调用策略。',
        metrics: [
          { k: '92%', v: 'INTENT ACCURACY' },
          { k: '90%', v: 'TASK COMPLETION' },
          { k: '93%', v: 'TOOL CALL SUCCESS' },
        ],
      },
      {
        title: '3D Visual Uplift Skill',
        titleCn: '3D 游戏视觉提升 Skill',
        body: 'Agent-built 3D games were empty, off-brief and visually crude. I quantified visual scoring dimensions, designed an improvement router and added a mandatory improvement loop — so a single screenshot from a user drives automatic multi-round iteration until it passes.',
        bodyCn:
          '针对 Agent 生成 3D 游戏存在的场景空旷、资产跑题、UI 简陋等视觉问题，参考开源 Three.js 游戏 skill 的策略，对视觉评分维度进行量化、设计改进路由并引入强制改进账单等机制，实现用户仅凭截图反馈即可自动多轮迭代至达标的闭环。',
        metrics: [
          { k: '67%', v: 'VISUAL NET WIN' },
          { k: 'TOP 3', v: 'SKILL STORE RANK' },
        ],
        link: 'https://github.com/zii-i-del/graphics-quality-gate',
      },
      {
        title: 'Group Q&A Assistant',
        titleCn: '群问答助手搭建与提效',
        body: 'Test groups were drowning in repeat questions and bug reports. I built a doc-conversion skill, maintained the product knowledge base on Obsidian + LLM Wiki, and shipped a Q&A Agent on BOX-AI handling answers, feedback logging and escalation to humans.',
        bodyCn:
          '针对测试群重复咨询多、Bug 反馈频繁及人工维护成本高的问题，设计文档转化 Skill，并基于 Obsidian 与 LLM Wiki 维护产品知识库；依托 BOX-AI 搭建问答 Agent，实现产品答疑、反馈登记及疑难问题转人工沉淀。',
        metrics: [{ k: '20+', v: 'BACKLOG ITEMS IN 2 MONTHS' }],
      },
      {
        title: 'AI Game Generation Agent Benchmark',
        titleCn: 'AI 游戏生成 Agent Benchmark',
        body: 'Benchmarked against GameCraft-Bench and peers, then built a custom 12-category / 50-case suite with a "two gates + four stages" 100-point rubric (correctness 60 + experience 40). Difficulty alignment and staged gating pulled scores much closer to real product scenarios, giving releases one shared quality bar.',
        bodyCn:
          '对标 GameCraft-Bench 等业界方案，构建 12 品类 50 case 的定制评测集，设计「两道门控 + 四阶段」百分制评分体系（正确性 60 + 体验 40），通过难度对齐与分阶段门控使评分更贴合产品真实场景，为产品版本质量门禁与回归对比提供统一打分口径。',
        metrics: [
          { k: '50', v: 'CASES' },
          { k: '12', v: 'CATEGORIES' },
        ],
      },
    ],
  },
  {
    id: '02',
    company: 'Tencent',
    companyCn: '腾讯计算机系统有限公司',
    companyShortCn: '腾讯',
    product: 'YUANBAO',
    productCn: '元宝产品',
    role: 'LLM PRODUCT MANAGER',
    roleCn: '大模型产品经理',
    internshipRoleCn: '大模型产品经理',
    period: '2025.12 — 2026.04',
    city: 'Shenzhen',
    accent: true,
    summary:
      'Owned reply quality for Yuanbao’s conversational verticals — role-play (38.51% of rounds) and casual chat (13.43%).',
    summaryCn:
      '负责元宝主端对话类垂域：角色扮演（round 占比 38.51%）和闲聊（占比 13.43%）场景的回复效果提升。',
    highlights: [
      'Role-play GSB net win +6.67pp after data-quality rebuild',
      'Personalised memory: GSB +3.62% with memory-enabled replies',
      '20+ sub-labels across a four-layer evaluation framework',
    ],
    details: [
      {
        title: 'Casual Chat SFT Pipeline',
        titleCn: '闲聊场景 SFT 生产专项',
        body: 'Targeted high-frequency social pressure points — generational gaps, marriage and pregnancy pushing, family relations. Defined the AI companion goal (understand the relationship, ease communication, give actionable advice), built an ideal-state for high-EQ replies from competitor teardowns, and designed a dual-layer "issue / person" intent taxonomy across family, intimate and social dimensions. Prompt-driven automated query generation produced 20k+ tuning samples; a pattern-detection agent stripped out templated, preachy and over-reading outputs. 700+ high-quality SFT samples shipped.',
        bodyCn:
          '针对春节期间代际沟通、催婚催生、亲友关系等高频社交场景，定义「理解关系、促进沟通、提供可执行建议」的 AI 伙伴能力目标；通过分析竞品模型回复，建立高情商回复理想态，设计「对事/对人」双层意图体系，并结合家庭、亲密、社会关系等维度构建数据训练框架；设计 Prompt 驱动的自动化 query 生成和数据生产流程，累计生成 2w+ 调优数据；并设计自动化 Pattern 检测与策略改写 agent，降低模板化、说教化、过度解读等问题，最终产出 700+ 高质量 SFT 样本。',
        metrics: [
          { k: '2w+', v: 'QUERIES GENERATED' },
          { k: '700+', v: 'SFT SAMPLES' },
        ],
      },
      {
        title: 'Role-Play SFT Optimisation',
        titleCn: '角色扮演 SFT 数据生成优化',
        body: 'Role-play replies stalled on plot and broke world-building. I designed structured deduction prompts (worldview → situation → character → behaviour) to generate 30-turn in-character interactions, then built an RP/DM mode classifier plus a six-dimension quality agent to auto-evaluate 69k+ generated rows. 43k+ high-quality rows survived into training.',
        bodyCn:
          '针对角色扮演场景中角色剧情推进不足、世界观不一致等问题，负责 SFT 数据生产与质量优化；通过设计基于世界观-情境-角色-行为的结构化推导生成 Prompt，引导模型生成符合角色设定的 30 轮交互数据；搭建 RP/DM 交互模式识别及六维质量评估 agent，对 6.9w+ 条生成数据进行自动化评估筛选，保留 4.3w+ 条高质量数据用于模型训练迭代。',
        metrics: [
          { k: '6.9w+', v: 'ROWS EVALUATED' },
          { k: '4.3w+', v: 'ROWS RETAINED' },
          { k: '+6.67pp', v: 'GSB NET WIN' },
        ],
      },
      {
        title: 'Chat Vertical Benchmark',
        titleCn: '闲聊垂域 Benchmark 体系构建',
        body: 'Decomposed the ideal state into a four-layer evaluation framework with 20+ sub-labels for EQ and "feels alive". Severity tiers P0/P1/P2 defined per label × scenario, each with anchor cases, validated by annotation-consistency testing. The eval set samples real online conversations by scenario distribution; results drive targeted training, closing the loop eval → train → re-verify → ship.',
        bodyCn:
          '从理想态逐层拆解设计四层评测框架，系统化拆解高情商、活人感方面 20+ 子标签，按「标签 × 场景」定义 P0/P1/P2 严重性分级并配锚点 case，经标注一致性测试验证体系可靠性。评测集基于线上真实对话按场景分布配比采样，评完输出各标签维度问题分布驱动训练团队定向优化，形成「评测→定向训练→复验→上线」闭环。',
        metrics: [{ k: '20+', v: 'SUB-LABELS' }],
      },
      {
        title: 'Personalised Memory',
        titleCn: '微信元宝个性化记忆设计',
        body: 'Yuanbao kept losing context and felt generic. I designed the personalised memory framework and the reply generation spec — extracting long-term profile and preferences from history, updating them dynamically, and feeding them back into generation. A/B showed memory-enabled replies winning.',
        bodyCn:
          '针对元宝记忆丢失与缺乏个性化问题，设计个性化记忆框架与回复生成 SP，从用户历史对话中提取长期画像与偏好并动态更新，为模型回复提供个性化指导。AB 实验显示有记忆回复相比无记忆呈正向。',
        metrics: [{ k: '+3.62%', v: 'GSB' }],
      },
    ],
  },
  {
    id: '03',
    company: 'Xiaomi',
    companyCn: '小米科技有限公司',
    companyShortCn: '小米',
    product: 'XIAOAI VOICE ASSISTANT',
    productCn: '小爱语音助手',
    role: 'AI STRATEGY PRODUCT MANAGER',
    roleCn: 'AI 策略产品经理',
    internshipRoleCn: 'AI 策略产品经理',
    period: '2025.08 — 2025.12',
    city: 'Beijing',
    accent: false,
    summary:
      'Owned strategy for the map-navigation vertical on Xiaomi phones (PV 300k / UV 185k), focused on POI answer quality.',
    summaryCn:
      '负责小米手机端小爱语音助手地图导航垂域的策略优化（PV 30 万 / UV 18.5 万），聚焦地点问答可用率提升。',
    highlights: [
      'POI usability +8.6pp after routing the core intent to a new search backend',
      'Restrictions model fine-tune: satisfaction +35.72pp, GSB win 71.43%',
      'Full-stack badcase triage across ASR → NLU → dispatch → generation',
    ],
    details: [
      {
        title: 'Map POI Answer Accuracy',
        titleCn: '地图 POI 问答准确性优化',
        body: 'End-to-end badcase analysis showed POI retrieval quality — not generation — was the bottleneck. I designed a three-way comparison of web-search augmentation options, then fixed a real bug in the Baidu path: user location was being injected indiscriminately and skewing results. I led an LLM-based location-judgement and query-rewrite validation, and moved the core POI intent onto the new search solution.',
        bodyCn:
          '通过端到端 badcase 分析定位 POI 信息检索质量是影响地图 Agent 回复准确性的关键因素；设计三种联网搜索方案对比实验，评估不同搜索增强方案效果；针对百度搜索中用户位置无差别注入导致搜索偏移问题，主导搭建基于 LLM 的位置判断与查询改写验证方案，优化搜索请求并提升本地 POI 检索效果；推动 POI 问答核心意图切换新搜索方案。',
        metrics: [
          { k: '+8.6pp', v: 'USABILITY' },
          { k: '+1pp', v: 'SATISFACTION' },
        ],
      },
      {
        title: 'Restrictions Model Fine-Tune',
        titleCn: '限行模型微调',
        body: 'The restrictions intent (2k daily PV) replied with bloat, buried the answer and got interrupted constantly. I launched the fine-tune programme: defined strategies like "conclusion first", "assume private car by default", "supplement time/region", built a 100-row triplet dataset (query + knowledge injection + expected reply) and pushed v4.1 to production.',
        bodyCn:
          '针对限行意图（日均 PV 2000）在高代码链路下回复冗余、重点后置、用户频繁打断等问题，主导发起模型微调专项。基于线上 badcase 分析，定义「结论前置、默认私家车、补充时间/区域」等核心微调策略，构建 100 条三元组训练数据集（query + 知识注入 + 期望回复），推动微调模型 v4.1 上线。',
        metrics: [
          { k: '+4.09pp', v: 'USABILITY' },
          { k: '+35.72pp', v: 'SATISFACTION' },
          { k: '71.43%', v: 'GSB WIN RATE' },
        ],
      },
      {
        title: 'Quality Operations',
        titleCn: '质量运营',
        body: 'Ran the monthly evaluation review, tracing badcases along the full chain — ASR → semantic understanding / central dispatch → result generation — then turning findings into prioritised requirements for the algorithm and skill teams. Drove several P00 programmes into立项, while continuously evolving the eval standard and badcase set to stay close to real user experience.',
        bodyCn:
          '负责每月评测数据 review，沿「ASR识别→语义理解/中控分发→结果生成」全链路定位 badcase 根因，按影响面与优先级输出分析报告并向算法/skill 侧提出需求，推动落地。累计驱动多个 P00 专项立项，同时，结合评测实践持续迭代评测标准与 badcase 集，推动评测体系更贴近真实用户体验。',
        metrics: [{ k: 'P00', v: 'PROGRAMMES DRIVEN' }],
      },
    ],
  },
  {
    id: '04',
    company: 'Baidu International',
    companyCn: '百度国际科技有限公司',
    companyShortCn: '百度国际',
    product: 'SYNCLUB',
    productCn: 'Synclub · 虚拟聊天产品',
    role: 'AIGC PRODUCT MANAGER',
    roleCn: 'AIGC 产品经理',
    internshipRoleCn: 'AIGC 产品经理',
    period: '2024.11 — 2025.02',
    city: 'Shenzhen',
    accent: false,
    summary:
      'Synclub — Baidu’s AI companion product for the Japanese market. Virtual character chat and image creation, DAU 30k+.',
    summaryCn:
      'Synclub 是百度面向日本的 AI 虚拟陪伴产品，为海外用户提供虚拟角色聊天、图像创作等服务，DAU 3 万以上。',
    highlights: [
      'Dynamic avatars: CTR +10% vs static, new-user 24h chat conversion +7%',
      'Shipped CG / Korean-comic / light-novel styles end to end',
      'Added IP-likeness and realism metrics to the image eval system',
    ],
    details: [
      {
        title: 'Official Dynamic Avatars',
        titleCn: '官方动态虚拟人',
        body: 'Spotted that competitor dynamic avatars lifted immersion, and pushed to bring it to Synclub. After teardown and matching the solution to our character set, I settled on a video approach and produced dynamic videos for 25 official characters using Kling and Hailuo.',
        bodyCn:
          '发现竞品动态虚拟人设计显著提升沉浸感，主动提出将该功能引入 Synclub。分析竞品方案优劣，结合本产品角色特点，确定视频方案，使用可灵和海螺等视频生成工具完成 25 个官方角色的动态视频制作。',
        metrics: [
          { k: '+10%', v: 'CTR VS STATIC' },
          { k: '+7%', v: '24H CHAT CONVERSION' },
        ],
      },
      {
        title: 'New Style Launch & Acceptance',
        titleCn: '新风格上线与验收',
        body: 'Owned CG, Korean-comic and light-novel styles from selection to acceptance. Shortlisted candidates on Civitai, validated preference with Japanese teammates, fine-tuned LoRA on SDXL with distilled training data, then pulled 60+ live cases for acceptance scoring before launch. Also ran online issue monitoring — traced the noise-generation bug and built a content-safety prompt library.',
        bodyCn:
          '负责 CG、韩漫、轻小说等新风格从选型到验收的全流程。在 Civitai 筛选候选风格并与日本本土同学确认用户偏好，基于 SDXL 底模 + LoRA 微调，采用数据蒸馏方式构建训练数据。微调完成后拉取 60+ 条线上 case 进行生图验收，按质量指标打分确认达标后推动上线。同时负责线上问题监控，定位噪声生成 bug 根因，建设黄反提示词库保障内容安全。',
        metrics: [
          { k: '60+', v: 'ACCEPTANCE CASES' },
          { k: '3', v: 'STYLES SHIPPED' },
        ],
      },
      {
        title: 'Image Quality Metrics',
        titleCn: '生图质量评测指标构建',
        body: 'Working from live cases, I added IP-character likeness and human-likeness dimensions to the existing evaluation system, lifting both coverage and discrimination.',
        bodyCn:
          '结合现网 case，针对现有评测体系提出 IP 角色还原度、真人还原度等评测指标，提升评测覆盖度与区分度。',
        metrics: [{ k: '+2', v: 'NEW EVAL DIMENSIONS' }],
      },
    ],
  },
]

// ------------------------------------------------------------
// SECTION 2 — 轮播：实习经历 + 项目精选
// ------------------------------------------------------------
export const showcase = [
  {
    id: '01',
    kind: 'PRODUCT',
    label: 'TENCENT · YUANBAO',
    labelCn: '腾讯 · 元宝',
    title: 'LLM Strategy Product',
    titleCn: '大模型策略产品',
    desc: 'Owned reply quality for role-play and casual chat verticals. Rebuilt the SFT data pipeline and shipped personalised memory.',
    descCn: '负责角色扮演与闲聊垂域回复效果，重构 SFT 数据生产链路并落地个性化记忆',
    metric: '+6.67pp',
    metricLabel: 'GSB NET WIN',
    tags: ['SFT', 'Benchmark', 'Memory', 'A/B'],
    visual: 'wave',
  },
  {
    id: '02',
    kind: 'PRODUCT',
    label: 'TENCENT · CRAFT',
    labelCn: '腾讯 · Craft',
    title: 'AI Agent Product',
    titleCn: 'AI Agent 产品',
    desc: 'Agent capability for AI game generation — scoping clarification, 3D visual uplift skill and the benchmark behind releases.',
    descCn: 'AI 游戏生成 Agent 能力：立项澄清、3D 视觉提升 Skill 与版本质量 Benchmark',
    metric: '92%',
    metricLabel: 'INTENT ACCURACY',
    tags: ['Agent', 'Function Calling', 'Eval', 'Vibe Coding'],
    visual: 'iso',
  },
  {
    id: '03',
    kind: 'PRODUCT',
    label: 'XIAOMI · XIAOAI',
    labelCn: '小米 · 小爱同学',
    title: 'AI Strategy Product',
    titleCn: 'AI 策略产品',
    desc: 'Map-navigation vertical. Fixed POI retrieval quality and ran a fine-tune programme that nearly doubled satisfaction.',
    descCn: '地图导航垂域：定位 POI 检索质量瓶颈，主导限行意图模型微调专项',
    metric: '+35.72pp',
    metricLabel: 'SATISFACTION',
    tags: ['RAG', 'Fine-tune', 'Badcase', 'GSB'],
    visual: 'grid',
  },
  {
    id: '04',
    kind: 'PRODUCT',
    label: 'BAIDU · SYNCLUB',
    labelCn: '百度 · Synclub',
    title: 'AIGC Product',
    titleCn: 'AIGC 产品',
    desc: 'AI companion product for Japan. Dynamic avatars, generative style systems and image-quality evaluation metrics.',
    descCn: '面向日本市场的 AI 虚拟陪伴产品：动态虚拟人、生成式风格体系与生图质量评测',
    metric: '+10%',
    metricLabel: 'AVATAR CTR',
    tags: ['AIGC', 'LoRA', 'Art Direction', 'Localisation'],
    visual: 'halftone',
  },
  {
    id: '05',
    kind: 'DESIGN',
    label: 'THESIS · XR',
    labelCn: '毕设 · XR',
    title: 'VR Serious Game Design',
    titleCn: 'VR 严肃游戏设计',
    desc: 'Graduation project grounded in human-factors research — multimodal interaction inside a VR training scenario.',
    descCn: '以人因工程为研究底座的毕设项目：VR 训练场景中的多模态交互设计',
    metric: '2026',
    metricLabel: 'IN PROGRESS',
    tags: ['VR', 'Human Factors', 'Multimodal'],
    visual: 'cube',
  },
  {
    id: '06',
    kind: 'DESIGN',
    label: 'AUTOMOTIVE HMI',
    labelCn: '车企 HMI',
    title: 'Interaction Design',
    titleCn: '交互设计',
    desc: 'In-car HMI internship — information architecture, driving-scenario flows and high-fidelity interaction prototypes.',
    descCn: '车载 HMI 交互设计实习：信息架构、驾驶场景流程与高保真原型',
    metric: 'HMI',
    metricLabel: 'INTERACTION DESIGN',
    tags: ['HMI', 'Figma', 'Prototyping'],
    visual: 'grid',
  },
]

// ------------------------------------------------------------
// 导航
// ------------------------------------------------------------
export const navItems = [
  { id: 'hero', label: 'HOME', labelCn: '首页' },
  { id: 'services', label: 'OVERVIEW', labelCn: '概览' },
  { id: 'press', label: 'EXPERIENCE', labelCn: '实习' },
  { id: 'cases', label: 'WORK', labelCn: '作品' },
  { id: 'contact', label: 'CONTACT', labelCn: '联系' },
]

// ------------------------------------------------------------
// 尾部长跑马灯（textMarquee）
// ------------------------------------------------------------
export const closingMarquee = [
  'EVALUATION-DRIVEN DELIVERY',
  'AGENT ORCHESTRATION',
  'MODEL EVALUATION',
  'PROMPT ENGINEERING',
  'VIBE CODING',
]

// ------------------------------------------------------------
// 通栏大图（largeImage）
// ------------------------------------------------------------
export const largeImage = {
  // Pre-cropped from cat.jpg: the top 37% of the original is blank wall, so the
  // band would have wasted a third of its height. This derivative is 1706×806.
  src: './images/cat-band.jpg',
  ditheredSrc: './images/cat-band-dithered.png',
  alt: '薛惠姊的猫',
  ratio: '2.117 / 1',
  caption: 'CO-PILOT · 首席监督员',
  captionCn: '陪我改完每一版 Prompt 的同事',
}
