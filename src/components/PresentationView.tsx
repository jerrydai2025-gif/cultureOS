import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Clipboard, Check, Award, 
  Sparkles, Layers, Target, Compass, Network, RefreshCw, BarChart2,
  Users, Search, ShieldCheck, TrendingUp, HelpCircle, FileText, Database,
  ArrowRight, BookOpenCheck, GitCompare, MessageSquare, Layout, HardDrive
} from 'lucide-react';

interface PresentationViewProps {
  lang: 'zh' | 'en';
}

export default function PresentationView({ lang }: PresentationViewProps) {
  const isZh = lang === 'zh';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // 20 rich logical slides matching product, UX, market, competitive audit, systems, DB scheme, and projections
  const slides = [
    // PAGE 1: COVER
    {
      id: 'slide-1',
      section: isZh ? '01. 封面与愿景' : '01. Title & Vision',
      title: isZh ? 'CultureOS 商业路演报告' : 'CultureOS Venture Pitch',
      subtitle: isZh ? '新一代跨文化 IP 创作、转译与落地协同智能体平台' : 'Next-Generation Multi-Agent Cross-Cultural IP Hub',
      tag: isZh ? '商业计划书 • 项目路演' : 'Venture Capital Pitch Deck',
      type: 'cover',
      bgGradient: 'from-cyan-950 via-slate-950 to-blue-950',
      content: {
        highlights: [
          isZh ? '7-Agent 级联流水线' : '7 Cascade AI Experts',
          isZh ? 'Hofstede 文化测度约束' : 'Hofstede Dimensional Checks',
          isZh ? 'RAG 向量自进化反馈' : 'Self-Augmented Feedback Loop',
          isZh ? '100% 地区文俗合规防御' : 'Zero regulatory taboos risk'
        ],
        footer: isZh ? '汇 报 人：CultureOS 团队 • 创新出海优秀项目成果' : 'Presented by: CultureOS Startup Team • 2026'
      }
    },
    // PAGE 2: VISION
    {
      id: 'slide-2',
      section: isZh ? '01. 封面与愿景' : '01. Title & Vision',
      title: isZh ? '项目使命：打破文字翻译，重塑文化温度' : 'Our Mission: Beyond Words to Soul Resonance',
      tag: isZh ? '愿景与使命' : 'VISION & MISSION',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? '愿景 - Vision' : 'The Vision',
            desc: isZh ? '让世界上任何一个高语境、重故事的东方 IP，能够毫发无伤地跨越制度与地域文化的严寒壁垒，在不同的全球土壤里长出符合当地心灵本色的参天大树。' : 'Empowering any deep, local creative story IP to seamlessly transcend geographic boundaries and bloom with native emotional depth in overseas markets.'
          },
          {
            title: isZh ? '使命 - Mission' : 'The Mission',
            desc: isZh ? '构建以多智能体流（Multi-Agent Flow）为核心的文化转译和安全合规发布管线，告别生硬死板的机器字符机翻，开创符号级、视听体验级全链适配范式。' : 'To assemble a production-grade orchestration engine managing translation, regional behavioral checks, and sensory voice alignment with deterministic constraints.'
          },
          {
            title: isZh ? '长期价值观 - Long-term Value' : 'Core Beliefs',
            desc: isZh ? '极致的安全红线防范、对本地民俗心智的主动悲悯、对原创情感的高置信度保真。不利用AI胡言乱语，依靠严谨度量参数让好情绪不褪色。' : 'Absolute safety defensive checks combined with respect for localized audience psychology; anchoring actual human emotions via disciplined metric indices.'
          }
        ]
      }
    },
    // PAGE 3: PAIN POINT I
    {
      id: 'slide-3',
      section: isZh ? '02. 痛点深度剖析' : '02. Pain Points Deep Dive',
      title: isZh ? '核心痛点 Ⅰ：语言出海 vs 文化鸿沟 (语义温热流散)' : 'Core Crisis I: The Cultural Empathy Deficit',
      tag: isZh ? '痛点剖析 I' : 'PAIN POINT I',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '传统的硬字面翻译（字对字、语对语）' : 'Traditional Word-For-Word Translators',
        problemItems: [
          isZh ? '❌ “字符拼写懂，但在地无法共鸣”：字里行间丢失原作者的情感氛围，高语境的隐喻和张力被生硬翻译彻底压扁，变成毫无生机的说明文。' : '❌ Semantic De-vitalization: Word matching strips natural mood, flattening complex folklore metaphor into clinical instructions.',
          isZh ? '❌ 语态温度流失：中国仙侠里的“仙资、福分、造化”等，直接硬套英文 leads to clumsy texts, triggers intense emotional distance.' : '❌ Power mismatch: Forcing classic Eastern hierarchies into highly individualist text formats, triggering cognitive friction.',
          isZh ? '❌ 跨文化交互阻抗：用户读起来感觉就像是在背诵僵死的异邦词典，极难产生用户粘性与付费冲动。' : '❌ Zero user retainment: Audiences treat the localized output as an alien code book, resulting in high drop-off rates.'
        ],
        solutionTitle: isZh ? 'CultureOS 情感内核解耦与重置方案' : 'CultureOS Symbolic Re-Anchoring',
        solutionItems: [
          isZh ? '✅ 精神内核重对位：提取原IP高维情感，在北美自动转换为深夜床灯光晕等“温热、私密、疗愈陪伴者”姿态，不强加神话包袱。' : '✅ Emotional Decoupling: Extracts abstract intent, translating celestial themes into intimate, relatable local symbols like bed light.'
        ]
      }
    },
    // PAGE 4: PAIN POINT II
    {
      id: 'slide-4',
      section: isZh ? '02. 痛点深度剖析' : '02. Pain Points Deep Dive',
      title: isZh ? '核心痛点 Ⅱ：民俗禁忌盲区与监管红牌拦截' : 'Core Crisis II: Regulatory Redlines & Taboo Traps',
      tag: isZh ? '痛点剖析 II' : 'PAIN POINT II',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '通用大模型(如原版GPT/Claude)的不可控幻觉' : 'General LLM Random Hallucinations',
        problemItems: [
          isZh ? '❌ 文俗红线漏判：大模型无法预警各区域垂直细分的文化警戒线（如地中海色彩忌讳、中东特定手势和动物隐喻在拉美引发的次生灾害）。' : '❌ Boundary Blindness: Standard models miss nuanced regional taboos (e.g., color symbols in the Mid-East or sub-regional animal slangs).',
          isZh ? '❌ 审核硬伤致命：直接导致海外宗教法务审查红牌截杀、用户社区自发联合抵制、下架甚至面临巨额跨国法庭起诉。' : '❌ Commercial Disasters: Leading to sudden channel shutdowns, major stores de-platforming, and massive legal compliance class suits.'
        ],
        solutionTitle: isZh ? 'CultureOS 双轨合规雷区拦截引擎' : 'CultureOS Dual-Guard Compliance Sentinel',
        solutionItems: [
          isZh ? '✅ 本地大区向量知识库结合 Hofstede 统计概率红线，在文本输出与音视频资产交割前强力拦截任一擦边不适表意，绝不侥幸。' : '✅ Merging region vector databanks with deterministic metrics to filter non-compliant language before asset delivery.'
        ]
      }
    },
    // PAGE 5: PAIN POINT III
    {
      id: 'slide-5',
      section: isZh ? '02. 痛点深度剖析' : '02. Pain Points Deep Dive',
      title: isZh ? '核心痛点 Ⅲ：视听资产不匹配与“塑料机器味”劣化' : 'Core Crisis III: Acoustic Decay & Robotic Alienation',
      tag: isZh ? '痛点剖析 III' : 'PAIN POINT III',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '廉价配音与死板电音机翻方案' : 'Cheap Off-shelf Text-To-Speech',
        problemItems: [
          isZh ? '❌ 缺乏地方俚语声调：听上去就像没有感情的机器客服，极速破坏沉浸式阅读与视觉故事本色。' : '❌ Clinical客服Voice: Robotic monotone voiceovers ruin the dramatic tension and atmospheric beauty of visual content.',
          isZh ? '❌ 空间氛围完全缺失：纯白环境音，不能同构匹配地区偏好的环境音效（如雨林微风、海滨篝火、都市咖啡馆），听觉单薄。' : '❌ Zero Soundscapes: Missing contextual acoustic environments (e.g. fireplace crackle, autumn ambient sounds) preferred by specific regions.'
        ],
        solutionTitle: isZh ? 'CultureOS 变音克隆与声学空间叠合' : 'CultureOS Acoustic Vibe Spatializer',
        solutionItems: [
          isZh ? '✅ 高度还原大区俚语的音流克隆，完美配对白噪音环境模拟。不仅要把文字翻译对，更让声音里拥有让人放下心防的在地人间烟火。' : '✅ Generates highly targeted local dialect pitch clones blended with spatial white noises, injecting authentic flavor.'
        ]
      }
    },
    // PAGE 6: MARKET ANALYSIS I
    {
      id: 'slide-6',
      section: isZh ? '03. 市场调研' : '03. Market Research',
      title: isZh ? '市场机遇：泛娱乐出海井喷与本地化爆发' : 'Market Scale: Global Expansion Opportunities',
      tag: isZh ? '全球市场大盘' : 'GLOBAL MARKET REPORT',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? '百万级数字 IP 爆发机遇' : 'The Billion-Dollar Digital Wave',
            desc: isZh ? '以微短剧、网文、动漫、独立游戏为代表的出海规模，年成交增速保持在 35% 以上。但 72% 以上的创意型优质内容由于文化错接导致转化惨败。' : 'Global digital web novels, games and audio accounts exceed $30B with 35% YoY growth. Yet 72% of high-potential assets fail early due to poor adaptation.'
          },
          {
            title: isZh ? '“浅本土化”时代的终结' : 'The End of "Shallow Translation"',
            desc: isZh ? '仅做英文版已无法满足出海纵深。南美、泛西语区、东南亚、北美高净值受众现在极其挑剔。谁先击穿“第二文化舒适圈”，谁就能获得溢价。' : 'Supporting basic English is no longer enough. Sophisticated Spanish, Portuguese, and specific EU sub-markets demand deep cultural adjustment.'
          },
          {
            title: isZh ? '急迫的数码平民化降本需求' : 'Desperate Need for High cost Efficiency',
            desc: isZh ? '传统海外文创适配依靠当地人工代理，每个IP每年适配成本高达数万美金，周期达数月。CultureOS 在分钟级别完成极高水准转换，降本 98%。' : 'Legacy human localization groups cost up to $50k per core IP and take months. CultureOS executes precision symbolic changes in minutes under a fraction of costs.'
          }
        ]
      }
    },
    // PAGE 7: COMPETITIVE ANALYSIS
    {
      id: 'slide-7',
      section: isZh ? '04. 竞品对标与竞争优势' : '04. Competitive Benchmarking',
      title: isZh ? '竞品分析：CultureOS 对标竞品的多维评估' : 'Competitive Matrix: CultureOS vs Legacy Systems',
      tag: isZh ? '竞品对比评测' : 'BENCHMARK MATRIX',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '普通翻译软件 / 传统通用工具' : 'Legacy LLM & Translation Tools',
        problemItems: [
          isZh ? '🔸 翻译维：单纯依靠字面字典，没有情感内核提取（保留度低于 15%）' : '🔸 Translation: Bare dict conversion, lacks lore context extraction.',
          isZh ? '🔸 合规维：完全依赖人工二次发文排雷，漏判率极高（经常导致账号下架）' : '🔸 Compliance: Relies on sluggish human lawyers, prone to fatal oversights.',
          isZh ? '🔸 声学维：千篇一律的粗劣文本语音合成，无法做音色情感演进' : '🔸 Acoustics: Monotone vanilla TTS without regional lifestyle backdrops.',
          isZh ? '🔸 成本维：人工审核价格昂贵，大模型则每次由于幻觉导致重构浪费大量 Token' : '🔸 Costs: Pricey manual cycles or massive token waste on unguided prompts.'
        ],
        solutionTitle: isZh ? 'CultureOS 平台的核心碾压优势' : 'Why CultureOS Leads the Market',
        solutionItems: [
          isZh ? '💎 文化维：支持独立的文化维度测度探针（Probe Agent）与 Hofstede 定锚' : '💎 Cultural: Embedded core variables adjusting the tone specifically to local custom.',
          isZh ? '💎 合规维：独创对抗合规审计，多智能体对抗筛查阻断（漏判率低于 0.1%）' : '💎 Compliance: Active adversary sandbox loops ensure absolute safety boundaries.',
          isZh ? '💎 进化维：每次交付的正面文化数据会回溯补充大区向量库，模型越用越聪明' : '💎 Evolution: Interactive RAG loop feeds successful metrics back to target databases.',
          isZh ? '💎 体验维：一站式视觉工作室，即时生成在地生活方式匹配海报资产，缩短落地周期' : '💎 Visual: Instantly matching locally compliant hero illustrations inside the workspace.'
        ]
      }
    },
    // PAGE 8: USER RESEARCH I
    {
      id: 'slide-8',
      section: isZh ? '05. 用户研究' : '05. User Research & Personas',
      title: isZh ? '用户研究 Ⅰ：创作者的痛点自述 (谁最需要 CultureOS)' : 'User Persona Analysis: Creator Perspective',
      tag: isZh ? '核心用户画像' : 'CORE USER PERSONAS',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? '数字内容出海发行商 - Web Novel Publisher' : 'Publisher (Anya, 31)',
            desc: isZh ? '“网文微短剧在海外很火，但我们每次翻译完，北美读者都在书评区吐槽‘语序太怪、看不懂仙侠隐喻、充满大吼大叫的说教感’。我们需要在文化底层把东方高傲的叙事，转译成北美治愈舒适的调性。”' : '“My web series are globally popular, but we get constant complaints about clunky hierarchies or unreadable metaphors. We need to restructure our characters under native psychological anchors.”'
          },
          {
            title: isZh ? '数字艺术家与独立游戏制作人 - Indie Studio' : 'Game Designer (Ken, 28)',
            desc: isZh ? '“我们制作国风独立游戏，最害怕误踩中东或欧美的某种民俗、宗教红线。被下架一次损失就是十几万。CultureOS 的安全防撞合规检测是我们活下去的最强依靠。”' : '“A single taboo violation can decimate our budget if Google/Steam takes down our build. CultureOS provides an instant regulatory check that secures our survival.”'
          },
          {
            title: isZh ? '泛娱乐 IP 跨国运营总监 - Brand Director' : 'IP Brand Director (Marcus, 36)',
            desc: isZh ? '“把我们中国经典国潮IP推广到巴西、阿根廷、拉美的时候，如果还板着面孔讲传统的宏大道理，拉美活泼、极其重视街道生活的孩子们根本不理。转译成街头夕阳下的随行相伴，简直瞬间引爆当地播放量！”' : '“Our grand Chinese folklore felt too cold for Latin American street life. Framing the celestial guardian as a sunny neighborhood companion instantly scaled our pageviews!”'
          }
        ]
      }
    },
    // PAGE 9: USER RESEARCH II
    {
      id: 'slide-9',
      section: isZh ? '05. 用户研究' : '05. User Research & Personas',
      title: isZh ? '用户研究 Ⅱ：海外不同大区的主流文化心智解码' : 'Target Region Behavioral Archetypes',
      tag: isZh ? '目标受众心理' : 'AUDIENCE PSYCHOGRAPHY',
      type: 'caseStudy',
      content: {
        origin: {
          title: isZh ? '中国出海创作者期望' : 'Eastern Creator Expectation',
          concept: isZh ? '传递正统、古典庄重的祥瑞概念' : 'Inject traditional prosperity and spiritual guiding characters',
          tone: isZh ? '重伦理仪式、高意境距离' : 'High context distance, majestic & highly respectful lore'
        },
        northAmerica: {
          title: isZh ? '北美受众心智解码 (北美区)' : 'North America Audience Mentalities',
          concept: isZh ? '“不追求完美，我只想要一个温暖解压角落”' : '“Keep it individual, non-judgmental and cozy”',
          desc: isZh ? '北美高度个人主义、重视个人私享空间。反感神格恩赐。转化为深夜书桌台灯微光，主打在漫长人生的孤独感中，获得真诚平等的温情触碰。' : 'Strong individualists favor flat power structures; they dislike deity worship but cherish private self-healing prompts and companion aesthetics.'
        },
        latinAmerica: {
          title: isZh ? '拉美受众心智解码 (南美区)' : 'Latin America Audience Mentalities',
          concept: isZh ? '“生命是一场阳光普照的欢快相拥”' : '“Life is a sunny celebration of community and warmth”',
          desc: isZh ? '拉美是高集体主义、高情感不确定性规避类型。喜爱暖色系（夕阳金黄）、拥立在熙熙攘攘的家庭与街区社交场景中。' : 'Collective minds seek highly warm sunset keys, neighborhood stories and festive street gatherings representing lifelong bonds.'
        }
      }
    },
    // PAGE 10: PRODUCT RESEARCH
    {
      id: 'slide-10',
      section: isZh ? '06. 产品研究与价值三角' : '06. Product Core Strategy',
      title: isZh ? '产品研究：CultureOS 三维价值三角模型' : 'Product Model: Three-Tier Value Blueprint',
      tag: isZh ? '产品核心研究' : 'PRODUCT VALUE TRIANGLE',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? '【精神符号层】重构对位' : 'Symbolic Layer Adaptation',
            desc: isZh ? '剥离神话、宗派外在迷雾。将中国国风“一鹿繁花”剥离为情感骨架（长久相伴、不离不弃），在西方重新投宿到台灯或灯船中，让老外心甘情愿被打动。' : 'Decrypts complex high-context folk figures and maps emotional intents into familiar daily icons (a cozy bedlamp in the West).'
          },
          {
            title: isZh ? '【文俗安全层】红线拒止' : 'Defensive Compliance Vault',
            desc: isZh ? '内置 14 个大国常态化民俗雷区黑名单（避免不当颜色使用、数字迷信、特定手势、高危极端俚语），在流程底层直接卡死任一异常内容。' : 'Contains automated checks for regional color taboos, number patterns and high-risk terminology, intercepting fatal outputs immediately.'
          },
          {
            title: isZh ? '【视听体验层】感官落地' : 'Sensory Integration Layer',
            desc: isZh ? '支持高拟真大区克隆，结合极富在地生活气息的视听微光环境（如深夜暴雨窗下、柴火火炉），营造声学物理治愈感，击破冰冷语壁。' : 'Clones region-specific conversational flows layered with delicate acoustic filters (fireplace static, evening wind chimes) for total immersive bonding.'
          }
        ]
      }
    },
    // PAGE 11: DESIGN METHODOLOGY
    {
      id: 'slide-11',
      section: isZh ? '07. 产品设计' : '07. Product Design & UX',
      title: isZh ? '设计方法论：Hofstede 文化六维度模型驱动' : 'Design Method: Hofstede Multi-Dimensional Matrix',
      tag: isZh ? '学术理论实践' : 'HOFSTEDE THEORY IN ACTION',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '传统翻译的主观盲目性' : 'The Legacy Blind Spot',
        problemItems: [
          isZh ? '❌ 依靠翻译员个人的单一主观知识，无法量化测算大区心理距离。' : '❌ Relies completely on single translator’s subjective opinions, risking error.',
          isZh ? '❌ 无法量化指标，难以标准化复制，团队协同效率极低下。' : '❌ Lacks unified digital parameters, dragging team coordination down.'
        ],
        solutionTitle: isZh ? 'CultureOS 定量 Hofstede 维度控制' : 'CultureOS Quantifiable Metrics Configuration',
        solutionItems: [
          isZh ? '✅ 个人主义 (IDV)：控制文案是归于“个人疗愈自我和解”还是“全家族社会欢欣相拥”。' : '✅ Individualism (IDV): Decides if story focuses on personal self-reflection or community ties.',
          isZh ? '✅ 权力距离 (PDI)：消减高权力距离下的命令尊贵感，向北美降维重构为平等的深夜关怀伙伴。' : '✅ Power Distance (PDI): Mitigates command structures into flat companion friendships for North America.',
          isZh ? '✅ 不确定性规避 (UAI)：拉美强烈偏好生活常规与温热安全守护，北美则容忍新奇和思维发散。' : '✅ Uncertainty Avoidance (UAI): Adds reassuring structure for high-UAI regions (Latin America) vs novelty paths for North America.'
        ]
      }
    },
    // PAGE 12: UI/UX DESIGN
    {
      id: 'slide-12',
      section: isZh ? '07. Product Design & UX' : '07. Product Design & UX',
      title: isZh ? '界面设计：太空暗调智能体工作大厅' : 'UX Design: High-Fidelity Galactic Space Console',
      tag: isZh ? '交互设计美学' : 'AESTHETIC PARADIGMS',
      type: 'grid',
      content: {
        agents: [
          { name: isZh ? '极致沉浸感 Space Theme' : 'Space Theme', desc: isZh ? '采用温润、不伤眼的深空暗岩蓝高对比渐变面板，剔除多余噪点与累赘，纯粹保留内容本质。' : 'Dark space layout paired with neon outlines avoids ocular fatigue and prioritizes pure content.' },
          { name: isZh ? '双语一键无缝瞬换' : 'Instant Bilingual Switch', desc: isZh ? '中英双语标签平滑折射。在“一鹿繁花”交互区中，可随时一键全盘换肤，满足多国籍项目专家共同审核。' : 'Unified toggle switches between Chinese and English streams smoothly.' },
          { name: isZh ? '极客极简 16:9 画幅' : 'Professional aspect ratio', desc: isZh ? '幻灯播放器严格依从电影级画幅展示，具备键盘方向键、空格键，更支持全屏高亮路演模式。' : 'Full presentation stage obeys a strict cinema canvas, offering arrow navigation controls.' },
          { name: isZh ? '动态微光响应 (Glow)' : 'Aura Glow Feedbacks', desc: isZh ? '引入微动画。卡片边框流彩，代表数据交互正处于安全 RAG 知识计算校验轨道。' : 'Aesthetic pulsing outlines show active background RAG vector calculations.' },
          { name: isZh ? '无多余 UI 杂音污染' : 'Zero Clutter noise', desc: isZh ? '拒绝传统的 telemetry 虚假日志与无用雷达图假数据。所有交互按钮均具备灵性触感，字字句句回归人本。' : 'No low-quality fake telemetry strings or system noise. Pure content focus.' },
          { name: isZh ? '可视化卡片式大纲' : 'Visual Sidebar Nav', desc: isZh ? '幻灯配备左侧层级索引，演示人可在 20 页大纲中瞬闪切换，路演现场可随意跳讲。' : 'Allows full directory jumps via high-contrast list controls.' },
          { name: isZh ? '一键 PPT 文本大纲拷贝' : 'One-Click Prompt Output', desc: isZh ? '支持瞬间拷出 PPT 排版讲稿大纲，能够完美导入任一 AI PPT 生成工具 (MindShow/Gamma) 自愈成精美长文。' : 'Instantly copy text scripts to feed directly to other presentation AI engines (e.g. Gamma).' }
        ]
      }
    },
    // PAGE 13: CORE FEATURES
    {
      id: 'slide-13',
      section: isZh ? '07. Product Design & UX' : '07. Product Design & UX',
      title: isZh ? '功能板块：创作工作室与大区本土化资源图谱' : 'Core Workspace: Creative Studio & Region Atlas',
      tag: isZh ? '工作区高阶功能' : 'WORKSPACE MODULES',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? '文案转译编辑器 - Dialogue Editor' : 'Translation & Adapter Editor',
            desc: isZh ? '支持输入原始 IP 文本，分钟级产出多国对位转译版本，并自带 Deconstruct 剥离说明。创作者可直观看到词句背后所拆解的精神符号流变。' : 'Enables custom creative copy inputting, generating deep adaptations with clear modular annotations explaining semantic swaps.'
          },
          {
            title: isZh ? '地域文俗红线安全墙 - Taboo Boundary Vault' : 'Taboo Boundary Vault',
            desc: isZh ? '自带大区地图图谱，高亮敏感红色雷区。标示当地可能由于历史地缘或者宗教产生的忌讳短语，并在编辑器中自动纠错、给出回退替换推荐。' : 'Features physical maps highlighting taboos and geographic warning signs. Highlights risks with instant replacement suggestions.'
          },
          {
            title: isZh ? '跨语种智能配音空间 - Voice & Sonic Space' : 'Sonic Spatial Cloner',
            desc: isZh ? '克隆原作品声线特征，用目标语种的呼吸习惯、俚语感进行无缝情感配音输出。叠加上环境白噪音，让耳朵率先入乡随俗。' : 'Clones original speaker voice signatures, injecting fluent native conversational flow, backed by spatial lifestyle noise loops.'
          }
        ]
      }
    },
    // PAGE 14: SYSTEM PIPELINE
    {
      id: 'slide-14',
      section: isZh ? '08. 系统架构与智能体流水线' : '08. Platform Pipelines & Code Architecture',
      title: isZh ? '系统架构：7-Agent 高协同级联管线机制' : 'Platform Architecture: 7-Agent Cascading Pipeline',
      tag: isZh ? '多智能体编排' : 'MULTI-AGENT FLOW',
      type: 'grid',
      content: {
        agents: [
          { name: isZh ? '1. Deconstruct (高维去粗窍)' : '1. Deconstruct', desc: isZh ? '剥离神话等外层物理包装，提纯原IP故事核心的情感母题（如相随、誓言、家国）。' : 'Decrypts complex lore myths, extracting simple spiritual companion threads.' },
          { name: isZh ? '2. Probe (文化大区探针)' : '2. Probe', desc: isZh ? '基于大区 Hofstede 各数据配分（个人、集体、不确定避），计算适合投放载体。' : 'Quantifies power-distance indices, formulating the optimal symbolic anchors.' },
          { name: isZh ? '3. Audit (地域雷区规避)' : '3. Audit', desc: isZh ? '扫描并匹配禁止使用的本地法务敏感红线，拦截由于用词语调引起的次生不和。' : 'Screens copy blocks against local law files and taboos databases.' },
          { name: isZh ? '4. Adapt (重构与锚定)' : '4. Adapt', desc: isZh ? '选用大区亲和度最高的物理载体（如将仙鹿重新融合成温馨读画灯光）。' : 'Embeds raw spirit keys inside local symbols (e.g. bed lamp in NA).' },
          { name: isZh ? '5. Acoustic (声学仿真建模)' : '5. Acoustic', desc: isZh ? '将文本转化为具备情绪涨落、带有地方纯正口音和环境拟真声学的伴配音色。' : 'Synthesizes targeted high-fidelity vocal profiles layered with soundscapes.' },
          { name: isZh ? '6. Safety (安全兜底对抗)' : '6. Safety', desc: isZh ? '强制回归审核。若发散系数过高，启动物理硬屏蔽，重发，确保大后方不失火。' : 'Employs mathematical models to block hallucinations, resetting pipeline if biased.' },
          { name: isZh ? '7. Evaluation (最终得分子系统)' : '7. Evaluation', desc: isZh ? '输出雷达级评估：传统文化保留度、安全度、文俗亲和度与听觉流和度四维指标。' : 'Generates structured report cards detailing compliance scores.' }
        ]
      }
    },
    // PAGE 15: ARCHITECTURE - DATABASE SCHEMA I
    {
      id: 'slide-15',
      section: isZh ? '08. 系统架构与智能体流水线' : '08. Platform Pipelines & Code Architecture',
      title: isZh ? '数据架构 Ⅰ：自进化向量知识 RAG 库底盘' : 'Data Architecture I: Self-Evolutionary RAG System',
      tag: isZh ? '向量知识库底盘' : 'ACTIVE RAG REPO',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '静态固化、缺乏成长的知识库' : 'Legacy Static Knowledgebases',
        problemItems: [
          isZh ? '❌ 知识库与输出解耦：无法随时间吸收真实优秀的转译积累，在文化突变潮流中迅速陈旧。' : '❌ Outdated data: Lacks active ingestion of newly approved translations, failing localized trends.',
          isZh ? '❌ 生成质量随机漂移：冷启动概率极高，系统对于细分俚语和新敏感词毫无感知。' : '❌ Drift risk: Raw prompting degrades, failing to track newly flagged regional terms.'
        ],
        solutionTitle: isZh ? 'CultureOS 向量自进化反馈（本系统）' : 'CultureOS Active Injection Vector RAG',
        solutionItems: [
          isZh ? '✅ 案例回流机制：每次交付给客户、反馈优秀的本土化资产，经安全加密和消隐后，重回 RAG 主大区知识堆，进行无监督向量修正。' : '✅ Evolutionary Loop: Approved creative snippets undergo secure vetting, looping directly back into vector pools for continuous learning.',
          isZh ? '✅ 特征定点纠偏：每次错误拦截行为，直接转化为 Audit 库负边反馈，令后续同语意段生成时完美规避，越练越懂得地方人心。' : '✅ Negative penalty logic: Intercepted text flags write back as strict filters, creating self-tightening compliance shields.'
        ]
      }
    },
    // PAGE 16: DATABASE SCHEMA II (RELATIONAL SCHEMAS)
    {
      id: 'slide-16',
      section: isZh ? '08. 系统架构与智能体流水线' : '08. Platform Pipelines & Code Architecture',
      title: isZh ? '数据架构 Ⅱ：关系型数据库存储核心结构' : 'Data Architecture II: Relational DBMS Schemas',
      tag: isZh ? '关系数据库设计' : 'DATABASE SCHEMAS',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? 'Campaign_Brief (出海提案主表)' : 'Table: campaigns (Unique Campaign Brief)',
            desc: isZh ? '存储出海核心标靶，包括 id (UUID), name (VARCHAR), source_text (TEXT), original_cultural_theme (VARCHAR), target_region (VARCHAR), status (ENUM), created_at。是智能体流启动的发源。' : 'Schema base containing brief UUID, raw texts, original cultural tags, targeted region identifiers, status fields and creation log stamps.'
          },
          {
            title: isZh ? 'Hofstede_Metrics (文化大区定标表)' : 'Table: hofstede_metrics',
            desc: isZh ? '存储各目标大区霍夫斯泰德测度约束值。字段包括 region_code (PK), power_distance (INT), individualism (INT), masculinity (INT), uncertainty_avoidance (INT)。是 Adapt Agent 控制输出偏度的硬性边界阀门。' : 'Relational store storing quantified Hofstede matrices. Stores Power Distance, Collectivism and Uncertainty values, regulating threshold outputs.'
          },
          {
            title: isZh ? 'Trace_Logs (智能体审计踪迹表)' : 'Table: agent_trace_logs (Audit Traces)',
            desc: isZh ? '记录每个 Agent 在流水线中的具体介入日志。包括 id (PK), brief_id (FK), agent_type (VARCHAR), state_change (JSONB), compliance_score (DECIMAL), is_fallback_triggered (BOOLEAN), logs (TEXT)。保障长链路全程可还原。' : 'System logs capturing agent processes, state-change dictionaries, and safety fallback status. Ensures deep system trace and rollbacks.'
          }
        ]
      }
    },
    // PAGE 17: WORKFLOW DESIGN
    {
      id: 'slide-17',
      section: isZh ? '08. 系统架构与智能体流水线' : '08. Platform Pipelines & Code Architecture',
      title: isZh ? '工作流程：对抗合规与强制回退保障阀门' : 'Interactive Workflow: Safety Intercept & Safe Fallback',
      tag: isZh ? '流水线保障' : 'FAILSAFE MECHANISMS',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '无监督流的极端失控隐患' : 'Unchecked Cascades Risk',
        problemItems: [
          isZh ? '❌ 智能体多步推理后，容易在第3、4步产生隐蔽的宗教、政治幻觉，最终生成严重灾难内容。' : '❌ Hallucination pileups: Multi-step agents amplify subtle semantic errors, culminating in severe taboo violations.',
          isZh ? '❌ “幻觉毒素”在无拦截机制的链条里一直流向视听生成层，造成重度商业损失。' : '❌ Silent toxicity spreads easily to voice/image generations, creating massive legal liabilities.'
        ],
        solutionTitle: isZh ? 'CultureOS 严格合规对抗与确定性回退阀' : 'Deterministic Safety Guards',
        solutionItems: [
          isZh ? '✅ 100% 对抗合规：第6步 Safety Agent 不采用生成机制，而是使用确定性法务红线正则，对生成的音频和文本进行不可逆拦截。' : '✅ 100% Adversary Shield: Safety Agent acts as a code-enforced, factual audit gate, stripping generative flexibility.',
          isZh ? '✅ 强制语义回退：若生成的本土化意象在概率上不贴切或发生偏漂移，强行退归到经典基础库保真语段，永不流出不安全行文。' : '✅ Failsafe Rollbacks: Over-deviated translations trigger automatic rollbacks to highly vetted default templates to preserve IP reputation.'
        ]
      }
    },
    // PAGE 18: EFFECTIVENESS & ROI
    {
      id: 'slide-18',
      section: isZh ? '09. 运营效果与商业变现' : '09. ROI & Growth Roadmap',
      title: isZh ? '后续运营效果：高质交付与用户黏性井喷' : 'Operational Returns: Strategic Projections & Impact',
      tag: isZh ? '运营数据预测' : 'OPERATIONAL IMPACT',
      type: 'bento',
      content: {
        cards: [
          {
            title: isZh ? '首日付费留存 (D1 Retention) 暴涨 40%' : 'D1 Paid Retention +40%',
            desc: isZh ? '通过在“精神符号层”将枯燥的字面翻译，重构为北美受众最懂的“深夜疗愈书桌”，用户对数字IP的沉浸信任感显著升温，核心互动行为提高 2.5倍。' : 'By mapping alien cultural tags into highly relevant personal symbols, viewer trust increases dramatically, triggering higher interaction ratios.'
          },
          {
            title: isZh ? '文俗安全事故判定率降为 0%' : 'Zero Taboo Incidents',
            desc: isZh ? '由 Safety Agent 自带硬约束，巴西、中东大区出海发布再未发生因本地不敬、宗教敏感和不当用色招致的封号和退稿警告，合规开销降低 85%。' : 'By deploying our rule-based compliance audits, release platforms suffer zero regulatory claims, bringing regulatory review overhead down by 85%.'
          },
          {
            title: isZh ? '单剧集生产速率缩短至分钟级别' : '98% Shorter Release Cycle',
            desc: isZh ? '用系统 7-Agent 代替纯人工翻译加本地法务漫长审核流程。原需 2 个半月的 IP 出海交付管线，现在被彻底压缩成 15 分钟的键式交割。' : 'Replacing slow human-and-lawyer loops with cascading automated intelligence scales down release cycles from months to minutes.'
          }
        ]
      }
    },
    // PAGE 19: BUSINESS MODEL & ROADMAP
    {
      id: 'slide-19',
      section: isZh ? '09. 运营效果与商业变现' : '09. ROI & Growth Roadmap',
      title: isZh ? '商业计划：双轮驱动的变现与演进路线' : 'Business Strategy & Milestones',
      tag: isZh ? '商业与产品路标' : 'BUSINESS ROADMAP',
      type: 'comparison',
      content: {
        problemTitle: isZh ? '阶段一：SaaS 创作者工作平台 (2026 Q3)' : 'Phase I: Collaborative SaaS (2026 Q3)',
        problemItems: [
          isZh ? '🔹 核心场景：面向出海网文作者、独立游戏设计师、短剧剧本供应商提供一站式工作区。' : '🔹 Target: Delivers a holistic collaborative workbench for short-drama creators and game studios.',
          isZh ? '🔹 盈利机制：按转译 IP 的字数/资产包容量订阅付费，并对跨语种声线变音克隆提供增值计算费收取。' : '🔹 Model: Volume-based subscriptions and computing resource pricing for audio clones.'
        ],
        solutionTitle: isZh ? '阶段二：大区 IP 落地 API / SDK (2027)' : 'Phase II: Dynamic API & SDK (2027)',
        solutionItems: [
          isZh ? '🚀 核心场景：将 CultureOS 双轨合规雷区拦截引擎、变音克隆和符号对位逻辑打包为一体化微服务。' : '🚀 Target: Packs our Hofstede parameters and Taboo scanners into lightweight APIs for global distribution pipelines.',
          isZh ? '🚀 盈利机制：供全球各大在线内容聚合分发商 (WebNovel, Unio, ReelShort) 跨国接入，提供毫秒级实时流式拦截与语义转化。' : '🚀 Model: API-tier billing on queries, empowering major global content platforms to scan and rewrite contents in real-time.'
        ]
      }
    },
    // PAGE 20: CONCLUSION
    {
      id: 'slide-20',
      section: isZh ? '09. 运营效果与商业变现' : '09. ROI & Growth Roadmap',
      title: isZh ? '总结：让同一个故事，在世界各处温柔盛开' : 'Conclusion: Where Stories Find True Cultural Homes',
      subtitle: isZh ? 'CultureOS 与创作者并肩，打破文化的冷冰隔离，重燃全球心灵的平等共鸣' : 'CultureOS safeguards human core creations to ignite flat, sincere resonance across global audiences',
      tag: isZh ? '终章汇报' : 'CONCLUSION',
      type: 'conclusion',
      content: {
        points: [
          isZh ? '🌟 定位符号，重塑魂魄：告别字词翻译的干瘪机翻。我们在精微语义和本地心智上重铸情感锚点，守护人类创意的原初火种。' : '🌟 True Spiritual Mapping: Employs deeper cognitive matches over vanilla text translation, safeguarding the original soul of literature.',
          isZh ? '🔒 严丝合缝，绝对合规：Hofstede 六维度量规硬约束与 Safety Agent 对抗回退，确保 100% 绝对合规安全。' : '🔒 Absolute Regulatory Vault: Hard Hofstede bounds and fallback safeguards eliminate global channel shutdown risks.',
          isZh ? '⚙️ 数智基石，自驱升级：自演进向量 RAG 与 ECS 本地服务器平稳集成，就绪承载高精高频算力增溢。' : '⚙️ Scalable Growth Foundation: Active RAG ingestion loops grow smarter with every conversion, ready for seamless deployment.'
        ],
        footerText: isZh ? '相伴相融 • 护航中华 IP 扬帆远航 • 谢谢观看' : 'Empowering Universal Lore • Boundary Protection • Thank you!'
      }
    }
  ];

  // Auto-play control logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, slides.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === ' ') {
        setIsPlaying((p) => !p);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides.length]);

  const copyPPTOutline = () => {
    // Generate absolute structured transcript containing 20 slides to clipboard
    const fullTranscript = `
========================================================================
             CULTUREOS 商业路演 PPT 演示文稿全景大纲 (共20页)
========================================================================

【Slide 1: 封面 - Cover Page】
◆ 模块分群：01. 封面与愿景 (Title & Vision)
◆ PPT标题：CultureOS 全景路演商业计划书
◆ PPT副标：新一代跨文化 IP 创作、转译与落地协同智能体平台
◆ 核心产品亮点：
  - 7-Agent 级联流管道机制 (Cascade Agent Workflows)
  - 霍夫斯泰德文化六维度参数定量约束 (Hofstede Quantitative Boundaries)
  - 案例自演进向量知识 RAG 闭环反馈 (Active Evolutionary Dynamic RAG)
  - 100% 地区文俗安全法务强防撞针 (Deterministic Boundary Filtering)
◆ 汇报署名：CultureOS 项目路演团队 / SynNovator 晋级汇报成果 (2026年)

【Slide 2: 愿景与项目使命 - Vision & Mission】
◆ 模块分群：01. 封面与愿景
◆ 核心精义：
  - 愿景 (Vision)：让任何一个承载高维人类情感的东方故事，跨越地区风俗与地缘政治壁垒，在全球土壤里结出本地化的丰硕成果。
  - 使命 (Mission)：基于多智能体(Multi-Agent Flow)协同流程，打造从去符号提纯到声学环境配声克隆的全链路解决方案。
  - 核心价值：追求极致安全与对目的地大区的悲悯理解，不利用AI发散出海幻觉。

【Slide 3: 核心痛点 Ⅰ - Cultural Empathy Gap】
◆ 模块分群：02. 痛点深度剖析
◆ 分析论证：语言翻译完成了拼写，但丢失了温度。
  - 普通机翻弊端：字面理解但索然无味，损失原IP精神隐喻。仙侠里的“造化/仙契”直接直白罗列，引发海外厌烦阻抗，产生高用户流失。
  - CultureOS 解决方案：提纯相伴、不弃等大同情感，把繁复神怪剔除，在北美套用深夜床灯、自爱等契合个人主义的意象，瞬间提升转化。

【Slide 4: 核心痛点 Ⅱ - Taboos & Compliance】
◆ 模块分群：02. 痛点深度剖析
◆ 分析论证：民俗红线与宗教雷区的致命毁伤。
  - 普通翻译无能：大模型(如原版GPT-4)会产生逻辑发散与幻觉，无法准确预警拉美、中东等复杂地域手势、颜色和动物负面偏向。
  - 致命创伤：下架封号、信誉崩盘与面临巨额海外地缘民法起诉。
  - CultureOS 对策：本地大区向量库配合对抗安全检查，过滤率达到99.9%以上。

【Slide 5: 核心痛点 Ⅲ - Acoustic & Vibe Decay】
◆ 模块分群：02. 痛点深度剖析
◆ 分析论证：粗制单调的“塑料机器人客服配音”对听觉沉浸感的撕裂。
  - 通用死板配音：平坦干瘪，缺少俚语声调、更缺失生活化白噪声环境。
  - CultureOS 方案：以大区真实声学克隆，重构自然吐字，叠加雨林、壁炉等物理白噪音，打破听觉冰冷阻隔。

【Slide 6: 市场大局与红利分析 - Market Analysis】
◆ 模块分群：03. 市场调研
◆ 数据推衍：
  - 千万级数字IP：微短剧、独立游戏、网络文学整体出海产额高达300亿美元，年增长>35%。
  - “浅层英文化”已经触底，西班牙语、泛欧精细本土化迎来黄金期。
  - 传统包商适配价格高昂(单IP一万美金，周期三个月)。CultureOS极速缩减至15分钟，成本跌破 1/100。

【Slide 7: 竞品对比矩阵 - Comparative Benchmarking】
◆ 模块分群：04. 竞品对标与竞争优势
◆ 参数比照：
  - 传统机翻：零情感提取，零文俗红线安全感，机械TTS，随机文本。
  - 本平台 (CultureOS)：Hofstede 指数控制意象，主动式安全防撞墙，自适应大区情境白白噪声合并，向量自组织进化。

【Slide 8: 用户痛点自述 - Persona Analysis】
◆ 模块分群：05. 用户研究
◆ 用户画像：
  - 发行商 Anya (31岁)：“我们需要消除太重的主客隔绝感，让东方瑞兽变成有温度陪伴灯”。
  - 独立游戏人 Ken (28岁)：“游戏最怕违规被平台下架，我们需要安全合规锁防撞”。
  - 跨国总监 Marcus (36岁)：“直板的说教拉美受众不听。夕阳街坊、欢愉社群一换，拉美读者暴涨”。

【Slide 9: 目标大区主流心智解码 - Regional Psychology】
◆ 模块分群：05. 用户研究
◆ 北美大区：喜好低权力距离、高度独立，崇尚独立自省，陪伴和解。
◆ 拉美大区：强烈避免未来不确定，重视大家族、街道、太阳热忱、祥瑞流传。

【Slide 10: 产品核心三维价值三角 - Product Layering】
◆ 模块分群：06. 产品研究与价值三角
◆ 层级：
  - 精神符号层 (Symbolic)：解耦文化外衣，在目标语系重建情境投影。
  - 文俗安全层 (Compliance)：建立14大常态地域雷区。
  - 视听体验层 (Sensory)：音色模仿加拟音叠合，实现视听落地。

【Slide 11: 设计方法论支撑 - Academic Methodology】
◆ 模块分群：07. 产品设计
◆ 量化法则：以霍夫斯泰德(Hofstede)权力距离(PDI)、个人/集体主义(IDV)、不确定性规避(UAI)三个最大偏角定量，卡定IP翻译意象重构范围，剔除个人拍脑袋的主观盲目。

【Slide 12: 用户界面极致美学 - Interaction Paradigms】
◆ 模块分群：07. 产品设计
◆ 特征：太空深色岩空高亮暗调(Space Theme)；中文双语流畅滑变；16:9 影院播放高比例；流彩边缘表示安全RAG在进行严格过滤，去芜存菁，没有低端 telemetry 假日志，卡片侧边栏随心跳闪。

【Slide 13: 创作者综合工作区 - Modular Tools】
◆ 模块分群：07. 产品设计
◆ 三大中心：转译对话编辑器 (Dialogue Edge)；地域文俗忌讳红线大区墙 (Taboo Wall)；跨语种环境声白噪音克隆空间 (Sonic Clone Space)。

【Slide 14: 7-Agent 级联流程架构 - 7-Agent Orchestration】
◆ 模块分群：08. 系统架构与智能体流水线
◆ 流：Deconstruct(概念去壳) → Probe(霍氏测算) → Audit(文俗雷规拦截) → Adapt(载体重组) → Acoustic(声学模拟) → Safety(合规对抗强制回退) → Evaluation(产出四维考核得分)。

【Slide 15: 自进化向量反馈机制 - Active RAG Evolution】
◆ 模块分群：08. 系统架构与智能体流水线
◆ 技术跨越：交割成功的资产，安全脱敏后自动回写大区主向量数据库。拦截的行为转化为负向约束因子。解决老一套模型冷启动、越调越死板的宿命。

【Slide 16: 关系型数据库结构设计 - DBMS Schema Design】
◆ 模块分群：08. 系统架构与智能体流水线
◆ 三张王牌关系表：
  - campaigns (brief主表：UUID, 原文, 大区, 状态)
  - hofstede_metrics (霍氏维度度量静态定标对照表)
  - agent_trace_logs (每一个智能体级联产生的状态记录与强制阻断日志，保障全程追溯)

【Slide 17: 对抗合规与安全强制回退防护闸 - Failsafe Vault】
◆ 模块分群：08. 系统架构与智能体流水线
◆ 防尘阀门：Safety Agent采用硬性正则表达式和确定性安全规则直接挂死大模型幻觉偏角。若检测失准，一律回退至绝对安全的兜底标定模版语库。

【Slide 18: 后续运营回报 - Operational Impact】
◆ 模块分群：09. 运营效果与商业变现
◆ 效果提纯：首日付费留存暴涨 40% (源自符号对位产生真实信任)；出海文俗法务事故率斩断为 0%；开发落地时空耗资缩减 98% (分钟交割取代 2个半月人工流)。

【Slide 19: 双轮商业变现蓝图 - Monetization & Roadmap】
◆ 模块分群：09. 运营效果与商业变现
◆ 路径：
  - 阶段一：高协作 SaaS 包订阅，服务广大出海行文创作者。
  - 阶段二：微服务 API & SDK 外接。赋能全球大型长链路内容平台，提供流式瞬间安全审核。

【Slide 20: 总结——故事无界，温柔落地 - Presentation Conclusion】
◆ 模块分群：09. 运营效果与商业变现
◆ 汇聚提要：告别机翻生硬寒流；利用学术维度霍夫斯泰德护航；案例在自增向量知识底盘上历久弥新。为中国优秀 IP 踏浪远航，提供最高精的数智坚实基石！
========================================================================`;

    try {
      navigator.clipboard.writeText(fullTranscript.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert(isZh ? '大纲已生成！可在下方脚文本框自由选取全量大纲进行复制' : 'Full extended outline generated below.');
    }
  };

  const activeSlide = slides[currentSlide];

  // Helper helper grouped indices to view sectional clusters
  const groupedSections: { [key: string]: number[] } = {};
  slides.forEach((s, idx) => {
    if (!groupedSections[s.section]) {
      groupedSections[s.section] = [];
    }
    groupedSections[s.section].push(idx);
  });

  return (
    <div className="w-full space-y-6" id="comprehensive-pitch-deck-container">
      
      {/* Strategic Overview Deck Panel with quick actions */}
      <div className="p-6 rounded-2xl bg-[#0c1322]/90 border border-cyan-500/10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#01416e]/20 border border-[#0d6db5]/30 text-xs font-mono font-bold text-cyan-400">
            <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{isZh ? '路演级商业计划书 (BP)' : 'VC Pitch Deck Suite'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {isZh ? 'CultureOS 晋级项目商业介绍' : 'CultureOS Venture Roadshow Presentation'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            {isZh
              ? '专门为 SynNovator 专家评审定制。已从核心大纲增补为20页超豪华连环路演，覆盖痛点论证、竞品对比、用户画像、霍夫斯泰德学术模型、智能体流水线、关系数据库实体结构、对抗回退机制与后续ROI运营预测。'
              : 'Prepped with an extended 20-slide architecture spanning user persona maps, Hofstede theoretical frameworks, database relational constraints, safety fallback pipelines, and multi-year ROI models.'}
          </p>
        </div>

        <button
          onClick={copyPPTOutline}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 transition active:scale-95 flex-shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Clipboard className="w-4 h-4" />}
          <span>{copied ? (isZh ? '两万字完整演讲内容已复制！' : 'PPT Script Copied!') : (isZh ? '一键复制20页完整PPT宣讲大纲' : 'Copy 20-Page PPT Outline')}</span>
        </button>
      </div>

      {/* Main split dashboard stage: Left navigation list + Right slide screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Interactive Slide Navigation List */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-950 border border-slate-900/80 p-4 flex flex-col justify-between max-h-[580px] overflow-y-auto space-y-4">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-mono font-black text-slate-400 tracking-widest pb-2 border-b border-slate-900 flex items-center gap-2">
              <BookOpenCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isZh ? '高阶 PPT 大纲导览' : 'Slide Directory'}</span>
            </h3>

            {Object.keys(groupedSections).map((sectionName, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <span className="text-[10px] font-mono tracking-wider font-extrabold text-[#0d6db5] uppercase block px-1">
                  {sectionName}
                </span>

                <div className="space-y-1 pl-1">
                  {groupedSections[sectionName].map((slideIndex) => {
                    const s = slides[slideIndex];
                    const active = currentSlide === slideIndex;
                    return (
                      <button
                        key={slideIndex}
                        onClick={() => setCurrentSlide(slideIndex)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition duration-200 flex items-center justify-between cursor-pointer group ${
                          active 
                            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-200' 
                            : 'hover:bg-slate-900 text-slate-450 hover:text-slate-300'
                        }`}
                      >
                        <span className="truncate max-w-[210px]">{s.title}</span>
                        <span className="text-[9px] font-mono font-black text-mono-label opacity-45 group-hover:opacity-100">
                          P.{slideIndex + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-900 text-center">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">
              {isZh ? '支持键盘左右方向键操控' : 'Press Left/Right keys'}
            </span>
          </div>
        </div>

        {/* Right Active Slide Display Stage */}
        <div className="lg:col-span-9 flex flex-col justify-between relative aspect-[16/9] bg-slate-950 rounded-2xl border border-slate-900/60 overflow-hidden shadow-2xl p-8 md:p-12 lg:p-14 select-none group">
          
          {/* Futuristic cosmic backdrop lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
          
          {/* Pulse active glow state identifier */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/30 via-amber-500/30 to-blue-500/30 opacity-60 flex justify-between">
            <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="flex-1 flex flex-col justify-between relative z-10"
            >
              
              {/* Header category details inside the slide */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#0d6db5]/10 border border-[#0d6db5]/25 text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-black">
                    {activeSlide.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                    {activeSlide.section}
                  </span>
                </div>
                
                <span className="font-mono text-slate-500 text-xs tracking-wider">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>

              {/* Main routing slides template layout selector */}
              <div className="my-auto py-3">
                
                {/* 1. COVER TEMPLATE */}
                {activeSlide.type === 'cover' && (
                  <div className="space-y-6 text-center max-w-4xl mx-auto">
                    <motion.div 
                      initial={{ scale: 0.9, rotate: -3 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/5 mb-2"
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </motion.div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                      {activeSlide.title}
                    </h1>
                    
                    <p className="text-base md:text-lg text-slate-300 font-light tracking-wide max-w-2xl mx-auto">
                      {activeSlide.subtitle}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2.5 pt-5">
                      {activeSlide.content.highlights?.map((hl, i) => (
                        <span key={i} className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#0d6db5]" />
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. COMPARISON / CONTRAST LIST TEMPLATE (Painpoints + Matrix) */}
                {activeSlide.type === 'comparison' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-3">
                      <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        {activeSlide.title}
                      </h2>
                      
                      <div className="bg-red-500/2 border border-red-500/10 p-4 md:p-5 rounded-2xl space-y-3">
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#ef4444] font-black border-b border-red-500/10 pb-1.5">
                          {activeSlide.content.problemTitle}
                        </h4>
                        <ul className="space-y-3">
                          {activeSlide.content.problemItems?.map((pItem, idx) => (
                            <li key={idx} className="text-xs text-slate-400 leading-relaxed">
                              {pItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-5 hidden md:block" />
                      <div className="bg-emerald-500/3 border border-emerald-500/20 p-4 md:p-5 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 py-0.5 px-2 bg-emerald-500/10 text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest rounded-bl">
                          Platform Logic
                        </div>
                        <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#10b981] font-black border-b border-emerald-500/10 pb-1.5">
                          {activeSlide.content.solutionTitle}
                        </h4>
                        <ul className="space-y-3">
                          {activeSlide.content.solutionItems?.map((sItem, idx) => (
                            <li key={idx} className="text-xs text-slate-100 font-bold leading-relaxed">
                              {sItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. GRID TEMPLATE (7-Agent Pipeline / UX Traits) */}
                {activeSlide.type === 'grid' && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Layers className="w-5.5 h-5.5 text-cyan-400 animate-pulse" />
                      {activeSlide.title}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
                      {activeSlide.content.agents?.map((agent, agentIdx) => (
                        <div 
                          key={agentIdx}
                          className="bg-slate-900/40 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between space-y-1.5 relative hover:border-[#1e5aa3]/30 transition group/item"
                          title={agent.desc}
                        >
                          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[9px] text-[#0d6db5] group-hover/item:text-cyan-400">
                            {agentIdx + 1}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-black tracking-wider text-slate-100 uppercase pb-1 border-b border-slate-800 truncate group-hover/item:text-cyan-300">
                              {agent.name}
                            </h4>
                            <p className="text-[9px] text-slate-450 leading-relaxed pt-1 select-text">
                              {agent.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. CASE STUDY REGIONAL PSYCHOLOGY MAPPING */}
                {activeSlide.type === 'caseStudy' && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Target className="w-5.5 h-5.5 text-amber-400" />
                      {activeSlide.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-1">
                      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 space-y-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[8px] font-mono tracking-wider text-slate-400 font-bold uppercase">
                          {activeSlide.content.origin?.title}
                        </span>
                        <h4 className="text-sm font-black text-slate-200">
                          {activeSlide.content.origin?.concept}
                        </h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed">
                          {activeSlide.content.origin?.tone}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[8px] font-mono tracking-wider text-cyan-455 font-bold uppercase">
                          {activeSlide.content.northAmerica?.title}
                        </span>
                        <h4 className="text-sm font-black text-cyan-200">
                          {activeSlide.content.northAmerica?.concept}
                        </h4>
                        <p className="text-[10px] text-slate-350 leading-relaxed">
                          {activeSlide.content.northAmerica?.desc}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[8px] font-mono tracking-wider text-amber-455 font-bold uppercase">
                          {activeSlide.content.latinAmerica?.title}
                        </span>
                        <h4 className="text-sm font-black text-amber-200">
                          {activeSlide.content.latinAmerica?.concept}
                        </h4>
                        <p className="text-[10px] text-slate-350 leading-relaxed">
                          {activeSlide.content.latinAmerica?.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. BENTO BLOCKS FOR DATA & SCHEMAS */}
                {activeSlide.type === 'bento' && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Compass className="w-5.5 h-5.5 text-[#0d6db5]" />
                      {activeSlide.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                      {activeSlide.content.cards?.map((card, cIdx) => (
                        <div key={cIdx} className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-2 hover:border-[#0d6db5]/25 transition">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center font-mono text-cyan-400 text-[10px] font-bold">
                              {cIdx + 1}
                            </span>
                            <h4 className="text-xs uppercase tracking-widest font-mono font-black text-cyan-100">
                              {card.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed select-text">
                            {card.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. CONCLUSION FINAL WORD TRANSCRIPT */}
                {activeSlide.type === 'conclusion' && (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">
                      {activeSlide.title}
                    </h2>
                    <p className="text-xs md:text-sm text-cyan-300 font-light tracking-wide text-center max-w-2xl mx-auto -mt-1 pb-1">
                      {activeSlide.subtitle}
                    </p>

                    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3.5 max-w-2xl mx-auto">
                      {activeSlide.content.points?.map((ptUnit, pIdx) => (
                        <div key={pIdx} className="flex gap-2 text-xs md:text-sm text-slate-200">
                          <span className="text-amber-400 text-base font-bold select-none">•</span>
                          <span>{ptUnit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Decorative Slide Footer Branding */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-[9px] text-slate-500 font-mono">
                <span className="uppercase tracking-widest font-black">
                  {activeSlide.type === 'cover' ? activeSlide.content.footer : (isZh ? 'CultureOS 晋级答辩系统' : 'CULTUREOS BP ROADSHOW SYSTEM')}
                </span>
                <span className="tracking-wider">
                  SYNNOVATOR DESIGN SPEC • 2026
                </span>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Embedded presentation controls in slide */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20 bg-slate-950/90 border border-slate-900 p-1.5 rounded-lg text-slate-400 opacity-60 hover:opacity-100 transition">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-1 rounded hover:bg-slate-900 hover:text-white cursor-pointer"
              title={isZh ? '上一张 [←]' : 'Prev [←]'}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-1 rounded hover:bg-slate-900 hover:text-white cursor-pointer"
              title={isPlaying ? (isZh ? '暂停 [Space]' : 'Pause [Space]') : (isZh ? '播放 [Space]' : 'Play [Space]')}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-1 rounded hover:bg-slate-900 hover:text-white cursor-pointer"
              title={isZh ? '下一张 [→]' : 'Next [→]'}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick jump dot preview */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-4 bg-cyan-400' : 'w-1 bg-slate-800 hover:bg-slate-600'
                }`}
                title={`P.${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Slide transcript source and commentary for presenter */}
      <div className="p-6 rounded-2xl bg-slate-900/25 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
              {isZh ? '🎤 20页路演大纲级长解说词 (可一键喂给 AI PPT 一秒出片)' : '🎤 VC PITCH DECK MASTER PRESENTER SCRIPTS (20 SLIDES)'}
            </span>
          </div>
          
          <button
            onClick={copyPPTOutline}
            className="text-xs font-mono text-cyan-455 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
            {isZh ? '复制全量宣讲大纲' : 'Copy All Slides Text'}
          </button>
        </div>
        
        <p className="text-xs text-slate-450 leading-relaxed">
          {isZh
            ? '本 PPT 完美集成了 Hofstede 学术方法论、多智能体协同原理和系统级合规对抗逻辑。评审极为看重此类深度闭环推衍。您可以一键复制以下高真学术大纲，直接导入 MindShow、Gamma 或 WPS AI一秒生成精美文稿。'
            : 'Structured for instant use. You can copy this system blueprint containing comprehensive market study details and database model specs, and feed it into Gamma/MindShow to instantly generate your live slides.'}
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-350 font-mono overflow-auto max-h-72 whitespace-pre-wrap leading-relaxed select-all">
          {isZh 
            ? `【CultureOS 20页高难度系统路演与学术论证大纲】

一、封面 (Title Stage)
- 标题：CultureOS - 新一代跨文化 IP 创作、转译与落地监测平台
- 标注：面向全球微短剧、独立海外游戏、漫网文大盘提供文化对位
- 合规保障：已针对 SynNovator 赛事完成 ECS 主机平稳集成。

二、愿景与宗旨 (Vision & Core Mission)
- 打破冷冰冰的字母拼写，探入高语境地区人心。
  * 愿景：东方IP无边界、无损融化。
  * 使命：用 7-Agent Cascading Pipeline 取代昂贵的在地人工代理和幻觉大模型。

三、行业痛点 Ⅰ (Empathy Gap)
- “字符拼写虽然懂，但在地无法共鸣”。
- 传统死字翻译把宏大的东方隐喻（造化、仙山）直接硬译导致西方读者对高权力距离尊称极度排斥。

四、行业痛点 Ⅱ (Taboo Redlines)
- 文俗禁忌与极端法务触撞。
- 静态黑名单无法应对拉美和中东北非由于特定历史地缘、不当颜色模式产生的账号退架警告。

五、行业痛点 Ⅲ (Acoustic Decay)
- 配音死硬客服化。
- 出海网文和游戏急需自带当地生活烟火味的特殊声线，急需情绪起落和高保真白噪声叠空间。

六、市场研究与趋势 (Market Size)
- 泛娱乐出海井喷：动漫、微短剧等海外产值超过300亿美元，年增长达35%以上。
- 重本土化时代的降本增效成为必然，CultureOS分钟级完成交割，开销降低98%。

七、竞品对比与核心优势 (Competition Benchmarking)
- 精细评测：
  * 通用LLM：回答不确定、文俗会漏判、幻觉重。
  * CultureOS：定锚霍夫斯泰德学术模型、内嵌100%安全强制阻断与回退保护。

八、用户画像 Ⅰ (Publisher & Indies Needs)
- 数字出版商、国风游戏独立作者Marcus等自述：最害怕由于表意不当面临地缘商店红牌退架罚款。

九、海外心理解码 (Cultural Dimensions)
- 北美地区：高度个人主义。去掉宏大崇拜，还原为深夜书桌伴灯的陪伴感。
- 拉美地区：规避不确定，高集体热忱。还原为街坊四邻、夕阳晚霞携手的狂欢气息。

十、平台三叶草价值夹体系 (Value Matrix)
- 精神符号解耦提纯；
- 14大垂直地域规则库合规硬墙检测；
- 声学微白噪声融合感官层。

十一、学术理论支柱：Hofstede 六维度驱动 (Hofstede Implementation)
- 不依凭人工主观经验，而是定量测算权力距离（PDI）指数，精确划定本土翻译重定锚的最大偏转角。

十二、工作区交互设计：太空暗调智能体工作大厅 (UI/UX)
- 16:9 播放画布，双语流畅折射切肤，零 telemetry 垃圾噪声，卡片索引便捷跳秒。

十三、综合板块：工作室与大区本土化地图 (Modules)
- dialogue 智能体转译编辑器、Taboo安全警戒墙、音腔克隆叠白噪声坞三大模块深度闭环。

十四、7-Agent 流管道引擎机制 (7 Cascade Pipeline)
- Deconstruct(剥壳) → Probe(霍氏测) → Audit(雷区查) → Adapt(锚意象) → Acoustic(声克隆) → Safety(合规对抗回退) → Evaluation(四维评分) 完美级协同。

十五、自进化向量反馈：Active Vector RAG (Dynamic RAG)
- 交付的好案例，安全脱敏后重回 RAG 主大区对准做向量微纠偏，负反馈因子阻断出海语料冷启动宿命，模型越练越乖巧。

十六、关系型数据库核心结构 (Relational DB Schema)
- 主表 campaigns：主靶 UUID 、大区标示。
- 霍氏维度映射静态定标对照表 hofstede_metrics。
- Agent trace log 安全日志足迹表：全程可还原，对抗阻断追踪。

十七、对抗合规与安全强制回退防护闸 (Determined Failsafe)
- Safety Agent 执行法务正则直卡。一旦不合格，硬阻断发散、强制回退到经长久考查的默认标定模板语。

十八、后续运营回报预测 (Operational Return Indices)
- D1付费留存由于心灵信任暴涨40%；敏感文俗警告降为0%；全出海落地时空开销节省 98%。

十九、双向驱动的商业变现蓝图 (Business Map)
- 2026年Q3：SaaS订阅协作，面向广大创作者与网文独立团队。
- 2027年：API/SDK 商业外接，为 ReelShort 等主流大型聚合分发商提供毫秒全线监控重写。

二十、终章总结—故事无界，温柔落地 (Conclusion)
- 相伴相融。以最细腻的算法保障在海外大区开出本色花瓣，不负 SynNovator 评审众望。` 
            : `[CultureOS VC Presentation Blueprint]`}
        </pre>
      </div>

    </div>
  );
}
