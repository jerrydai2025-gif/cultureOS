import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Clipboard, Check, Award, 
  Sparkles, Layers, Target, Compass, Network, RefreshCw, BarChart2,
  Users, Search, ShieldCheck, TrendingUp, HelpCircle, FileText, Database,
  ArrowRight, BookOpenCheck, GitCompare, MessageSquare, Layout, HardDrive,
  AlertTriangle, Shield, CheckCircle2, Zap, HelpCircle as HelpIcon, Globe,
  ShieldAlert, Activity, CheckSquare
} from 'lucide-react';

interface PresentationViewProps {
  lang: 'zh' | 'en';
}

export default function PresentationView({ lang }: PresentationViewProps) {
  const isZh = lang === 'zh';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Slide-specific interactive states
  const [activeCaseTab, setActiveCaseTab] = useState<'music' | 'anime' | 'sports'>('music');
  
  // Slide 4 interactive simulator states
  const [growthIPStrength, setGrowthIPStrength] = useState(60);
  const [growthAdpt, setGrowthAdpt] = useState(70);
  const [growthAlgo, setGrowthAlgo] = useState(65);

  // Slide 6 architecture explorer state
  const [activeLayer, setActiveLayer] = useState<number>(1);

  // Slide 7 demo flow simulation states
  const [demoStep, setDemoStep] = useState(0);
  const [demoIsRunning, setDemoIsRunning] = useState(false);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Slide 8 risk controller state
  const [activeRiskTab, setActiveRiskTab] = useState<'copyright' | 'trademark' | 'platform'>('copyright');

  // Slide 7 workflow simulator timer
  useEffect(() => {
    if (demoIsRunning) {
      demoIntervalRef.current = setInterval(() => {
        setDemoStep((prev) => (prev + 1) % 5);
      }, 2500);
    } else {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    }
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [demoIsRunning]);

  // Main PPT Slides list mapping the 10 images precisely
  const slides = [
    // SLIDE 1: COVER
    {
      id: 'slide-1',
      tag: isZh ? '01 公司封面' : '01 Cover Page',
      section: isZh ? '公司愿景' : 'Company Vision',
      title: isZh ? 'CultureOS 全球IP内容增长操作系统' : 'CultureOS: Global IP Content Growth OS',
      subtitle: isZh ? '让每一个创作者和品牌，都能用 IP 内容撬动全球流量，实现跨文化增长' : 'Empowering every creator and brand to leverage global traffic with IP content',
      type: 'cover',
    },
    // SLIDE 2: WHY NOW
    {
      id: 'slide-2',
      tag: isZh ? '02 Why Now' : '02 Why Now',
      section: isZh ? '市场结构变革' : 'Market Evolution',
      title: isZh ? '市场正在发生根本性变化' : 'The Content Industry is Undergoing Structural Shifts',
      subtitle: isZh ? '内容竞争已经从“创作能力”转向“系统能力”' : 'Content competition has shifted from "creation capability" to "systematic capability"',
      type: 'whynow',
    },
    // SLIDE 3: WHO WE SERVE
    {
      id: 'slide-3',
      tag: isZh ? '03 Who' : '03 Who',
      section: isZh ? '核心用户画像' : 'Core Persona',
      title: isZh ? '我们服务的核心用户：出海内容掘金者' : 'Our Core Audience: Global Content Creators',
      subtitle: isZh ? '他们面临的核心卡点：不是“不会做内容”，而是“没有内容系统”' : 'Their bottleneck: Not lacking creativity, but lacking a systematic content pipeline',
      type: 'who',
    },
    // SLIDE 4: CORE INSIGHTS
    {
      id: 'slide-4',
      tag: isZh ? '04 核心洞察' : '04 Core Insights',
      section: isZh ? '流量本质公式' : 'Traffic Mechanics Formula',
      title: isZh ? '核心洞察：流量的本质是“连接认知 + 触发情绪”' : 'Traffic Essence: Connecting Cognition + Triggering Emotion',
      subtitle: isZh ? '用系统化的公式与增长模型，让每一个 IP 成为全球流量引擎' : 'Systematizing growth structures to turn any IP into a global recommendation engine',
      type: 'insight',
    },
    // SLIDE 5: CASE MATRIX
    {
      id: 'slide-5',
      tag: isZh ? '05 Case Matrix' : '05 Case Matrix',
      section: isZh ? 'IP案例迁移矩阵' : 'IP Adaptability Verification',
      title: isZh ? 'IP案例矩阵：我们验证的是“结构可迁移性”' : 'Case Matrix: Verifying Replicable Growth Architecture',
      subtitle: isZh ? '所有 IP 本质不同，但底层的内容增长机制是高度统一的' : 'Different IPs, identical recommendation mechanics',
      type: 'case',
    },
    // SLIDE 6: SYSTEM ARCHITECTURE
    {
      id: 'slide-6',
      tag: isZh ? '06 Product Architecture' : '06 Product Architecture',
      section: isZh ? '全球化系统架构' : 'System Architecture',
      title: isZh ? 'CultureOS 系统架构：全球IP内容增长闭环' : 'CultureOS System Architecture: End-to-End Content Growth OS',
      subtitle: isZh ? '从 IP 深度洞察到自动化内容生产、全域分发及数据迭代的完整基建' : 'From multi-dimensional IP scanning to production, multi-channel deployment, and feedback loops',
      type: 'architecture',
    },
    // SLIDE 7: DEMO FLOW
    {
      id: 'slide-7',
      tag: isZh ? '07 Demo Flow' : '07 Demo Flow',
      section: isZh ? '工作流程演示' : 'Interactive Demo Flow',
      title: isZh ? '产品演示流程：从 IP 输入到增长闭环的完整路径' : 'Demo Flow: Complete Journey to Closed-Loop Growth',
      subtitle: isZh ? '全自动多智能体串行交互，生产提效 10 倍以上，分发触达提升 3-5 倍' : 'Multi-agent orchestration scaling speed by 10X+ and increasing target reach by 3-5X',
      type: 'demoflow',
    },
    // SLIDE 8: RISK CONTROL
    {
      id: 'slide-8',
      tag: isZh ? '08 风险控制' : '08 Risk Control',
      section: isZh ? '出海合规护城河' : 'Global Compliance Guards',
      title: isZh ? '风险控制：内容出海不仅要解决创作，更要合规' : 'Risk Control: Global Expansion Requires Strict Guidelines',
      subtitle: isZh ? 'CultureOS 不仅仅生成内容，更帮创作者守住版权、商标与平台合规红线' : 'Proactively guarding copyright, trademark, and platform regulation boundaries',
      type: 'risk',
    },
    // SLIDE 9: CURRENT STAGE
    {
      id: 'slide-9',
      tag: isZh ? '09 当前阶段' : '09 Current Stage',
      section: isZh ? '从小闭环到规模化' : 'Validation to Scale',
      title: isZh ? '当前阶段与卡点：跑通小闭环，寻求规模化' : 'Current Milestones: Small Loop Validated, Primed for Scale',
      subtitle: isZh ? '已完成核心端到端功能搭建并跑通多语种案例验证，进入加速规模化临界点' : 'Successfully built functional demo, seeking resources and partnerships to accelerate growth',
      type: 'stage',
    },
    // SLIDE 10: WHAT WE NEED & FLYWHEEL
    {
      id: 'slide-10',
      tag: isZh ? '10 我们的诉求' : '10 Our Ask',
      section: isZh ? '商业诉求与增长飞轮' : 'Commercial Needs & Flywheel',
      title: isZh ? '我们需要什么 & 增长飞轮价值' : 'What We Need & The Perpetual Growth Flywheel',
      subtitle: isZh ? '与我们一起，携手打造定义下一代全球内容增长基础设施！' : 'Join us in building the next-generation global content infrastructure',
      type: 'ask',
    }
  ];

  // Auto-play interval for PPT
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, slides.length]);

  // Keyboard navigation listener
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

  // Copy full outline logic
  const copyPPTOutline = () => {
    const fullTranscript = `
========================================================================
             CULTUREOS 商业路演 PPT 全景大纲与宣讲解说词 (共10页)
========================================================================

【Slide 1: 公司封面 - Cover Page】
◆ 标题：CultureOS 全球IP内容增长操作系统
◆ 副标：让每一个创作者和品牌，都能用 IP 内容撬动全球流量，实现跨文化增长
◆ 宣讲词：各位评委好！今天我为大家带来 CultureOS 系统的路演。传统的出海面临严重的“水土不服”与“生硬机翻”问题。CultureOS 是新一代全球IP内容增长操作系统，我们通过“IP + 内容结构 + 增长路径”三位一体的方式，让每一个中国文化IP与品牌都能精准破圈海外，撬动指数级全球流量。

【Slide 2: Why Now 市场正在发生根本性变化】
◆ 核心变革点：
  1. AI让内容生产进入无限生成时代 (内容成本趋近于0，创作门槛大幅降低)
  2. 平台分发完全依赖算法 (推荐驱动，内容即流量)
  3. IP成为唯一流量入口 (用户注意力高度集中，没有IP=没有冷启动能力)
◆ 结论：内容竞争已经从“创作能力”转向“系统能力”。
◆ 宣讲词：为什么是现在？内容生产正历经一场结构性巨变。AI使得生成成本几乎降为零，各大社交平台转向100%推荐分发，此时，没有IP的平庸内容很难脱颖而出。谁能率先建立体系化的内容和分发系统，谁就能垄断出海的流量漏斗。

【Slide 3: Who 我们服务的核心用户】
◆ 用户画像：独立创作者 / 小团队出海内容掘金者
◆ 核心痛点：
  1. 不知道做什么内容：缺乏选题和IP方向，没有内容方法论
  2. 没有IP资源：很难冷启动，难以从0沉淀初始影响力
  3. 海外表达能力弱：文化与喜好不通，极其水土不服
  4. 无法获得持续增长：发布即沉没，缺乏反馈闭环
◆ 结论：核心痛点不是“不会做内容”，而是“没有内容系统”。

【Slide 4: 核心洞察：流量的本质公式】
◆ 流量增长公式：IP(已有认知的符号) + 内容结构(可复制的模板) + 算法触发(平台信号匹配) = 增长(流量指数级放大)
◆ 宣讲词：我们的核心洞察极其简单而深刻：流量的本质是“连接认知”与“触发情绪”。我们把这拆解为科学的数学公式。高认知的IP加上标准化的内容结构模板，搭配特定推荐算法的热点触发，即可构成滚雪球般的有机增长。

【Slide 5: Case Matrix IP案例矩阵】
◆ 迁移矩阵验证：
  1. 华语IP (周杰伦)：验证情感共鸣、粉丝传播、文化记忆放大。结论：情绪本身就是流量入口。
  2. 日语二次元IP：验证世界观、二创极强、内容拆解。结论：结构比内容更重要。
  3. 体育/事件IP：验证强事件触发、高传播速度、算法匹配。结论：热点是算法的入口开关。
◆ 核心统一结论：所有IP的本质不同，但内容增长机制是统一的，即验证“IP增长结构是否可复制”。

【Slide 6: Product System Architecture 系统架构】
◆ 五大核心功能层：
  1. IP 输入层：评估IP价值、洞察画像、行业与竞品扫描。
  2. 内容结构引擎 (AI驱动)：提供高潜选题、吸引力脚本、AI画面匹配、本地化多语言、风格化合规检测。
  3. 多平台分发层：一键无缝覆盖 YouTube、TikTok、Instagram、X (Twitter)、Facebook 等。
  4. 增长反馈层：实时监控播放、互动、完播、ROI，捕获爆款因子。
  5. 优化迭代层：策略自动调整，大语言模型算法持续进化。

【Slide 7: Demo Flow 产品演示流程】
◆ 闭环增长五步走：
  - Step 1: 输入IP (全面分析IP价值与大区机会)
  - Step 2: 内容生成 (AI创作高质脚本，视频画面，合规评估评分)
  - Step 3: 多域分发 (一键分发至全球各主要平台渠道)
  - Step 4: 数据反馈 (一刻钟跟踪监控：1.23M播放、8.7%互动、4.6x ROI)
  - Step 5: 优化迭代 (大语言模型自动学习，改进下一轮内容选题)

【Slide 8: 风险控制：出海的核心合规红线】
◆ 痛点剖析：内容出海不只是要写好，还要防止侵权与下架封号。
◆ 风险象限：
  1. 版权风险：二创视频、音乐、影视素材、人物肖像侵权。
  2. 商标风险：国内注册无效，海外商标被恶意抢注，合规分类错误。
  3. 平台规则风险：违反社区守则，赛事预测误导，引发红牌警告。
◆ 应对机制：自动合规检测风险点、多平台动态规则库、安全分发与动态预警监控。

【Slide 9: 当前阶段与卡点】
◆ 现状：0 -> 1 验证阶段，已跑通小闭环。
◆ 已完成：Demo已搭建、多个大类IP(国潮音乐/日语动漫/体育热点)案例通过迁移验证、多语种方法论沉淀。
◆ 卡点：数据样本待扩充、平台机制需要更深度API整合、MCN及优质IP获取渠道需扩充。
◆ 结论：下一步需要更多伙伴支持与资源注入，加速进入规模化阶段。

【Slide 10: 我们的诉求与增长飞轮】
◆ 价值输出：创作者增长10X+，内容效率20X+，爆款胜率提升5X+。
◆ 诉求：寻求内容数据、MCN/创作者深度合作、海外平台对接、优质IP资源联名、法务/合规智囊支持。
◆ 增长飞轮：IP 输入 -> 极低成本高提效生产 -> 推荐算法推流 -> 触达全球海量受众 -> 沉淀效果反馈修正模型。
========================================================================`;
    
    try {
      navigator.clipboard.writeText(fullTranscript.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className="w-full space-y-6" id="roadshow-pitch-container">
      {/* PPT Control Header with quick outline copying */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-cyan-500/10 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#01416e]/20 border border-[#0d6db5]/30 text-xs font-mono font-bold text-cyan-400">
            <Award className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{isZh ? 'CultureOS 商业路演 PPT' : 'CultureOS VC Pitch Deck'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {isZh ? '全球IP内容增长操作系统路演报告' : 'Global IP Content Growth OS Venture Presentation'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            {isZh
              ? '按照您的路演框架和 PPT 结构已完美内置。本演示融合了行业调研数据、核心痛点、情感流量公式、可迁移案例矩阵、五层系统架构与直观工作流动画模拟，支持演示和宣讲大纲导出。'
              : 'Prepped with an interactive 10-slide roadmap tailored for VC presentations. Explore live simulators, layered structure viewers, and workflow animators.'}
          </p>
        </div>

        <button
          onClick={copyPPTOutline}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 transition active:scale-95 flex-shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Clipboard className="w-4 h-4" />}
          <span>{copied ? (isZh ? '宣讲词及大纲复制成功！' : 'Copied Successfully!') : (isZh ? '复制全套BP路演解说词' : 'Copy All Slides & Script')}</span>
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Interactive Slide Navigation List */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-950 border border-slate-900/80 p-4 flex flex-col justify-between max-h-[620px] overflow-y-auto space-y-4 shadow-inner">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-mono font-black text-slate-400 tracking-widest pb-2 border-b border-slate-900 flex items-center gap-2">
              <BookOpenCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isZh ? '路演幻灯片导航' : 'Slides Directory'}</span>
            </h3>

            <div className="space-y-1.5 pl-1">
              {slides.map((s, idx) => {
                const active = currentSlide === idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition duration-200 flex items-center justify-between cursor-pointer group ${
                      active 
                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 font-extrabold shadow-md' 
                        : 'hover:bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-mono font-black tracking-wider opacity-40 group-hover:opacity-100 uppercase text-cyan-400">
                        {s.tag}
                      </span>
                      <span className="truncate max-w-[170px] mt-0.5">{s.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${active ? 'text-cyan-400 transform translate-x-0.5' : 'text-slate-700 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 text-center">
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">
              {isZh ? '💡 支持键盘 左右方向键 快捷切换' : '💡 Use Left/Right Arrow Keys'}
            </span>
          </div>
        </div>

        {/* Right Active Slide Stage */}
        <div className="lg:col-span-9 flex flex-col justify-between relative min-h-[580px] lg:min-h-[620px] bg-slate-950 rounded-2xl border border-slate-900/60 overflow-hidden shadow-2xl p-6 md:p-10 lg:p-12 select-none group">
          {/* Subtle grid mesh background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
          
          {/* Top Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-400 transition-all duration-300" style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 flex flex-col justify-between relative z-10"
            >
              {/* Slide Meta Row */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-black">
                    {activeSlide.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider hidden sm:inline">
                    {activeSlide.section}
                  </span>
                </div>
                
                <span className="font-mono text-slate-400 text-xs font-bold bg-slate-900/60 px-2 py-1 rounded">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>

              {/* Main Template Core */}
              <div className="my-auto py-6">

                {/* 1. COVER PAGE VIEW */}
                {activeSlide.type === 'cover' && (
                  <div className="space-y-6 text-center max-w-3xl mx-auto py-8">
                    <motion.div 
                      initial={{ scale: 0.8, rotate: -6 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 mb-4"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      {activeSlide.title}
                    </h1>
                    
                    <p className="text-base md:text-lg text-slate-300 font-light tracking-wide max-w-2xl mx-auto">
                      {activeSlide.subtitle}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-8">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                        <span className="text-xs font-extrabold text-cyan-400 block">🌐 {isZh ? '打破文化壁垒' : 'Cross-Culture'}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">{isZh ? '深层符号重置' : 'Symbol Re-anchoring'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                        <span className="text-xs font-extrabold text-amber-400 block">🎯 {isZh ? 'IP内容结构化' : 'Structured IP'}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">{isZh ? '高可复制公式' : 'Replicable Formulas'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                        <span className="text-xs font-extrabold text-purple-400 block">🚀 {isZh ? '智能分发推荐' : 'Algorithmic Distribution'}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">{isZh ? '精准触达获流' : 'Target Recommendation'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                        <span className="text-xs font-extrabold text-green-400 block">🔄 {isZh ? '数据自演进闭环' : 'RAG feedback loop'}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block">{isZh ? '系统越用越聪明' : 'Self-evolving model'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. WHY NOW VIEW */}
                {activeSlide.type === 'whynow' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/90">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2">
                      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition duration-300 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-mono font-extrabold">
                          01
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{isZh ? '生产技术变革：无限生成' : 'Infinite Production'}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isZh 
                            ? 'AI 技术让多模态内容（文案、声线、视频画面）生成成本趋近于 0，人人都可以创作，全球内容大盘迎来暴涨，创作门槛基本消除。'
                            : 'Generative AI drives content cost towards zero. The barrier to creation has vanished, triggering a hyper-exponential spike in total content volume.'}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition duration-300 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-mono font-extrabold">
                          02
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{isZh ? '分发规则变革：推荐算法' : 'Algorithmic Distribution'}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isZh 
                            ? 'TikTok、YouTube等平台分发完全偏向推荐算法，不再受传统“粉丝基数”和静态私域绑死，爆款完全依赖推荐信号匹配，内容即流量。'
                            : 'Modern networks rely completely on recommended signal feeds. Traffic is merit-based. Having massive initial followers is no longer required.'}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition duration-300 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-mono font-extrabold">
                          03
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{isZh ? '入口形式变革：IP成为核心' : 'IP as Gateway'}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isZh 
                            ? '用户注意力极度碎片化，只有高辨识度、能连接既有认知的 IP 才有天然冷启动和强吸附能力。无 IP = 沉没、无冷启动优势。'
                            : 'As attention spans decay, only highly recognizable IP structures can bypass the noise. Raw translation without an IP framework gets buried.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f172a]/80 border border-cyan-500/10 text-center text-xs font-bold text-cyan-300 flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>{isZh ? '行业共识：要想在算法洪流里脱颖而出，必须建立一整套 IP 转译与智能增长的“操作系统”' : 'Core Consensus: To scale global traffic, you need a systematic IP Adaptability Engine'}</span>
                    </div>
                  </div>
                )}

                {/* 3. WHO WE SERVE VIEW */}
                {activeSlide.type === 'who' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-450/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-lg">
                            👤
                          </div>
                          <div>
                            <h3 className="font-extrabold text-white text-sm">{isZh ? '典型画像：独立创作者与小团队' : 'Creators & Small MCNs'}</h3>
                            <p className="text-[10px] text-slate-400">18-35岁 • 专注出海网文/短剧/动漫/游戏掘金</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-[11px] text-slate-350 border-t border-slate-800/80 pt-3">
                          <div className="flex items-center justify-between">
                            <span>{isZh ? '活动平台' : 'Platforms'}</span>
                            <span className="text-cyan-400">TikTok, YT Shorts, Instagram</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{isZh ? '创作经验' : 'Experience'}</span>
                            <span className="text-amber-400">{isZh ? '1-3年，本地化困难' : 'Limited localization expertise'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{isZh ? '最迫切需求' : 'Pain'}</span>
                            <span className="text-purple-400">{isZh ? '极低门槛冷启动，防范规则下架' : 'Cozy cold start, no ban policy'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-7 space-y-3">
                        <h4 className="text-xs uppercase font-mono text-slate-500 tracking-wider font-bold">{isZh ? '面临的四大真实问题：' : 'Four Core Bottlenecks:'}</h4>
                        
                        <div className="space-y-2.5">
                          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
                            <span className="text-xs bg-red-500/10 text-red-400 font-mono px-1.5 py-0.5 rounded">01</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{isZh ? '不知道做什么选题 (选题焦虑)' : 'Topic Selection Gap'}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{isZh ? '缺乏系统的海外受众偏好与选题发现方法论，每次都凭感觉盲猜。' : 'No systematic methodology to predict regional trends, relying entirely on wild guesses.'}</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
                            <span className="text-xs bg-red-500/10 text-red-400 font-mono px-1.5 py-0.5 rounded">02</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{isZh ? '没有冷启动 IP 资源 (流量干涸)' : 'Lack of IP Anchors'}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{isZh ? '缺少可吸附和承载认知基础的成熟 IP，从零积累粉丝周期过长。' : 'No pre-existing memory anchor, leading to an extremely slow follower accumulation cycle.'}</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
                            <span className="text-xs bg-red-500/10 text-red-400 font-mono px-1.5 py-0.5 rounded">03</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{isZh ? '海外表达能力极其薄弱 (文化偏离)' : 'Weak Localized Expressions'}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{isZh ? '生硬的中英直译、不解风情。容易触犯地缘、宗教政策遭到红牌封号。' : 'Literal machine translation. Missing the cultural vibe and violating severe store rules.'}</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-3">
                            <span className="text-xs bg-red-500/10 text-red-400 font-mono px-1.5 py-0.5 rounded">04</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{isZh ? '无法获得持续的数据增长 (沉没效应)' : 'No Closed Loop'}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{isZh ? '内容发布如泥牛入海，缺乏即时的分钟级数据反馈追踪，无法系统性调整策略。' : 'Content sinks instantly after release. No real-time analytics to refine next creations.'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CORE INSIGHTS VIEW WITH INTERACTIVE SIMULATOR */}
                {activeSlide.type === 'insight' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      {/* Left: formula visualizer */}
                      <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <h3 className="text-xs uppercase font-mono text-slate-500 tracking-wider font-extrabold">{isZh ? '流量增长数学公式：' : 'The Growth Equation:'}</h3>
                          <div className="flex flex-col gap-2 font-mono">
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-2">
                              <span className="text-xs bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">IP</span>
                              <span className="text-xs text-slate-200">{isZh ? '已有认知的文化符号 (降低理解成本)' : 'Pre-existing memory anchors'}</span>
                            </div>
                            <div className="text-center font-black text-slate-500 text-sm font-sans">+</div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-2">
                              <span className="text-xs bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">{isZh ? '结构' : 'Struct'}</span>
                              <span className="text-xs text-slate-200">{isZh ? '可复制的内容模板 (可迁移、可放大)' : 'Replicable content structures'}</span>
                            </div>
                            <div className="text-center font-black text-slate-500 text-sm font-sans">+</div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-2">
                              <span className="text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">{isZh ? '算法' : 'Algo'}</span>
                              <span className="text-xs text-slate-200">{isZh ? '匹配算法的分发机制 (推荐流量触发)' : 'Recommendation algorithm triggers'}</span>
                            </div>
                            <div className="text-center font-black text-cyan-455 text-sm font-sans">=</div>
                            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 flex items-center justify-between text-cyan-300 font-extrabold">
                              <span>🚀 {isZh ? '全球指数级增长' : 'Compound Growth'}</span>
                              <span className="text-xs bg-cyan-400 text-slate-900 px-2 py-0.5 rounded-full">10X+</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-450 leading-relaxed italic">
                          {isZh ? '💡 CultureOS 的核心逻辑：不仅是给大模型一个指令，而是用系统化的手段卡定情感共鸣点，直接撬动流量爆发。' : '💡 Logic: Turn abstract IP qualities into strict, scalable metrics.'}
                        </p>
                      </div>

                      {/* Right: Interactive simulation widget */}
                      <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/25 border border-cyan-500/10 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <h3 className="text-xs uppercase font-mono text-cyan-400 tracking-wider font-extrabold flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            <span>{isZh ? '📈 指数增长仿真模拟器' : 'Interactive Compound Growth Simulator'}</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            {isZh ? '拖动滑块调整系统核心因子，实时观测 CultureOS 对内容出海增长（流量放大倍数）的复利提振曲线：' : 'Adjust the weights below to see how systematic factors compound to amplify organic traffic scale:'}
                          </p>

                          <div className="space-y-3 pt-2">
                            {/* Factor 1 */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-300 font-bold">1. {isZh ? 'IP 认知层强度 (降低沟通成本)' : 'IP Baseline Recognition Strength'}</span>
                                <span className="text-cyan-400 font-mono font-bold">{growthIPStrength}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                value={growthIPStrength}
                                onChange={(e) => setGrowthIPStrength(Number(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                              />
                            </div>

                            {/* Factor 2 */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-300 font-bold">2. {isZh ? '内容结构适配度 (Hofstede 对位)' : 'Content Structure Adaptability (Hofstede)'}</span>
                                <span className="text-purple-400 font-mono font-bold">{growthAdpt}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                value={growthAdpt}
                                onChange={(e) => setGrowthAdpt(Number(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400" 
                              />
                            </div>

                            {/* Factor 3 */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-300 font-bold">3. {isZh ? '算法热点触发概率 (爆款信号)' : 'Algorithmic Hot-Trigger Signal Match'}</span>
                                <span className="text-amber-400 font-mono font-bold">{growthAlgo}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                value={growthAlgo}
                                onChange={(e) => setGrowthAlgo(Number(e.target.value))}
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Simulator Result Output */}
                        {(() => {
                          const multiplier = Math.round((growthIPStrength * growthAdpt * growthAlgo) / 5000 * 10) / 10;
                          return (
                            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-mono uppercase block">{isZh ? '估算流量增长：' : 'Estimated Traffic Growth'}</span>
                                <span className="text-xs text-slate-300">{isZh ? '超越传统浅机翻落地表现' : 'Multiplier over flat translation'}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">
                                  {multiplier}X
                                </span>
                                <span className="text-[10px] text-green-400 font-bold block">↑ {Math.round((multiplier - 1) * 100)}%</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CASE MATRIX VIEW */}
                {activeSlide.type === 'case' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Tabs */}
                      <div className="flex border-b border-slate-850 gap-2 p-1 bg-slate-900/40 rounded-xl">
                        <button 
                          onClick={() => setActiveCaseTab('music')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${activeCaseTab === 'music' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          🎵 {isZh ? '华语IP (周杰伦)' : 'Chinese IP (Jay Chou)'}
                        </button>
                        <button 
                          onClick={() => setActiveCaseTab('anime')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${activeCaseTab === 'anime' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          ⚔️ {isZh ? '日语二次元 IP (设定二创)' : 'Anime & Manga IP'}
                        </button>
                        <button 
                          onClick={() => setActiveCaseTab('sports')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${activeCaseTab === 'sports' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          ⚽ {isZh ? '体育事件 IP (事件算法)' : 'Sports & Hot Event IP'}
                        </button>
                      </div>

                      {/* Display panel */}
                      <div className="p-6 rounded-2xl bg-[#090e1a] border border-slate-900 min-h-[220px] flex flex-col justify-between space-y-4">
                        {activeCaseTab === 'music' && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            <div className="md:col-span-8 space-y-3">
                              <span className="text-[10px] font-mono text-cyan-400 font-extrabold block uppercase tracking-wider">🎯 {isZh ? '机制验证：高维度情感共鸣与粉丝裂变' : 'Emotional Resonance Mapping'}</span>
                              <h3 className="text-lg font-black text-slate-150">{isZh ? '华语核心音乐IP：情绪本身就是流量入口' : 'Folk Music IP: Emotional Resonance as Organic Entrance'}</h3>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {isZh 
                                  ? '华语经典具有深厚的跨世代集体记忆。我们剥离其“字面古风”，转化为“深夜卧室、平等的疗愈陪伴与内心宁静”的北美本地情境（高个人主义对位），利用粉丝对美好情感的主动传播。'
                                  : 'Folk music holds generation-wide memory tokens. Deconstructing superficial text translates Jay Chou’s retro vibe into "late-night individual bedroom healing and rain sounds" for highly individualist US listeners.'}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 情感共鸣' : '✓ Shared Emotion'}</span>
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 粉丝主动分发' : '✓ Fan Amplification'}</span>
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 文化记忆放大' : '✓ Deep Memory Retainment'}</span>
                              </div>
                            </div>
                            <div className="md:col-span-4 p-4 rounded-xl bg-slate-950 border border-slate-850/80 text-center">
                              <span className="text-[10px] text-slate-500 font-mono block">{isZh ? '验证结论：' : 'Verification Outcome'}</span>
                              <span className="text-2xl font-black text-cyan-400 block mt-1">EMOTION</span>
                              <span className="text-[10px] text-slate-300 block">{isZh ? '情绪是通用的分发信号' : 'Emotion is the core portal'}</span>
                            </div>
                          </div>
                        )}

                        {activeCaseTab === 'anime' && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            <div className="md:col-span-8 space-y-3">
                              <span className="text-[10px] font-mono text-purple-400 font-extrabold block uppercase tracking-wider">🎯 {isZh ? '机制验证：强世界观设定与高二创空间' : 'Setting & Worldbuilding Deconstruction'}</span>
                              <h3 className="text-lg font-black text-slate-150">{isZh ? '二次元/动漫 IP：结构比具体内容更加重要' : 'Anime/IP Setting: Architecture Over Raw Materials'}</h3>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {isZh 
                                  ? '二次元的核心在于坚固的世界观（Worldbuilding）与人物设定。系统通过将世界观、核心能力等级、角色互动冲突进行结构化解耦，形成模板化剧本框架，极高效率辅助粉丝进行本地化二创延展。'
                                  : 'The core of anime is structured lore and character profiles. Decoupling capabilities and narrative arcs into structured blocks enables automatic scenario generation, prompting fans to build limitless localized UGC content.'}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 完整世界观设定' : '✓ Cohesive World Setting'}</span>
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 无限二创延展性' : '✓ Highly Extensible UGC'}</span>
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 内容结构无限拆解' : '✓ Infinite Content Shredding'}</span>
                              </div>
                            </div>
                            <div className="md:col-span-4 p-4 rounded-xl bg-slate-950 border border-slate-850/80 text-center">
                              <span className="text-[10px] text-slate-500 font-mono block">{isZh ? '验证结论：' : 'Verification Outcome'}</span>
                              <span className="text-2xl font-black text-purple-400 block mt-1">STRUCTURE</span>
                              <span className="text-[10px] text-slate-300 block">{isZh ? '结构规范大于内容创作' : 'Structure is more key than content'}</span>
                            </div>
                          </div>
                        )}

                        {activeCaseTab === 'sports' && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                            <div className="md:col-span-8 space-y-3">
                              <span className="text-[10px] font-mono text-amber-400 font-extrabold block uppercase tracking-wider">🎯 {isZh ? '机制验证：即时事件触发与推荐池卡位' : 'Real-time Event Triggers'}</span>
                              <h3 className="text-lg font-black text-slate-150">{isZh ? '体育与事件 IP：热点是算法的最佳卡点入口' : 'Sports/Event IP: Hotspots as Algorithmic Feeds'}</h3>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {isZh 
                                  ? '体育赛事及突发热点具有极高的自然传播速度与平台流量权重。系统通过对爆点事件（如绝杀、逆转）进行实时跟踪，自动合成特定情绪化的视频分发包，在一秒内抢先拦截算法推荐池入口。'
                                  : 'Sports and hot emergencies possess immense propagation weight. Capturing peak high-tension seconds (e.g., last-second buzzer beaters) instantly constructs a viral package, occupying the recommendation queue immediately.'}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 强时效事件触发' : '✓ Time-critical triggers'}</span>
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 秒级极速分发响应' : '✓ Real-time dissemination'}</span>
                                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-350">{isZh ? '✓ 完美匹配推荐分发' : '✓ Algorithmic signal matching'}</span>
                              </div>
                            </div>
                            <div className="md:col-span-4 p-4 rounded-xl bg-slate-950 border border-slate-850/80 text-center">
                              <span className="text-[10px] text-slate-500 font-mono block">{isZh ? '验证结论：' : 'Verification Outcome'}</span>
                              <span className="text-2xl font-black text-amber-400 block mt-1">HOTSPOT</span>
                              <span className="text-[10px] text-slate-300 block">{isZh ? '热点是引爆算法的入口' : 'Hot topics trigger algorithm'}</span>
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-center text-[11px] font-bold text-slate-400">
                          {isZh ? '💡 统一结论：我们不仅仅是做案例，而是在验证 IP 的“结构化增长模型是否可以跨领域无损迁移”' : '💡 Collective insight: The underlying mechanics of viral content are globally unified'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SYSTEM ARCHITECTURE EXPLORER */}
                {activeSlide.type === 'architecture' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      {/* Left stack (5 Layers) */}
                      <div className="lg:col-span-5 flex flex-col justify-between gap-2">
                        <span className="text-xs font-mono uppercase text-slate-500 font-extrabold px-1">{isZh ? '🖥️ CultureOS 五大核心技术层：' : 'System layers:'}</span>
                        
                        {[
                          { layer: 5, num: '05', titleZh: '优化迭代层', titleEn: 'Evolutionary Loop', icon: '🔄', color: 'border-purple-500 bg-purple-500/10 text-purple-300' },
                          { layer: 4, num: '04', titleZh: '增长反馈层', titleEn: 'Analytics Feedback', icon: '📈', color: 'border-green-500 bg-green-500/10 text-green-300' },
                          { layer: 3, num: '03', titleZh: '多平台分发层', titleEn: 'Multi-Channel Push', icon: '🚀', color: 'border-amber-500 bg-amber-500/10 text-amber-300' },
                          { layer: 2, num: '02', titleZh: '内容结构引擎', titleEn: 'Content Generation', icon: '⚙️', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-300' },
                          { layer: 1, num: '01', titleZh: 'IP 输入层', titleEn: 'IP Ingestion Layer', icon: '📥', color: 'border-blue-500 bg-blue-500/10 text-blue-300' }
                        ].map((item) => {
                          const isSelected = activeLayer === item.layer;
                          return (
                            <button
                              key={item.layer}
                              onClick={() => setActiveLayer(item.layer)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                isSelected 
                                  ? `${item.color} font-black scale-[1.01] shadow-lg shadow-cyan-500/5` 
                                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs opacity-50">{item.num}</span>
                                <span className="text-xs font-bold">{isZh ? item.titleZh : item.titleEn}</span>
                              </div>
                              <span className="text-xs">{item.icon}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Detail Window */}
                      <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-b from-[#090e1a] to-slate-950 border border-cyan-500/10 flex flex-col justify-between min-h-[280px]">
                        {activeLayer === 1 && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-blue-400 font-extrabold uppercase tracking-widest">LAYER 01: IP INGESTION & DIAGNOSTICS</span>
                            <h3 className="text-base font-black text-slate-100">{isZh ? '1. IP 输入层 (多维度 IP 洞察与评估)' : 'IP Ingestion & Value Assessment'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? '出海的第一步是全面解构。IP 输入层在源头对 IP 的情感基调、受众契合度、核心认知符号进行多维度扫描，并分析出海目标大区的市场趋势与竞品大盘。'
                                : 'Deconstructs raw IP structures at the gateway. Scanning the original emotional theme, mapping core archetypes, matching audience psychographics, and studying direct competitors.'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                📊 <strong className="text-blue-300 font-bold block mt-0.5">{isZh ? 'IP 价值评估' : 'IP Valuation Index'}</strong>
                                {isZh ? '解耦提纯核心符号与文化内核' : 'De-nest raw lore signals'}
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                👥 <strong className="text-blue-300 font-bold block mt-0.5">{isZh ? '受众画像与对位' : 'Persona Demographics'}</strong>
                                {isZh ? '目标出海大区的文化心智锁定' : 'Map region psychographics'}
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                📈 <strong className="text-blue-300 font-bold block mt-0.5">{isZh ? '趋势与热点扫描' : 'Trend Spotlight Scanner'}</strong>
                                {isZh ? '洞悉海外短视频热点趋势' : 'Capture overseas social trends'}
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                🛡️ <strong className="text-blue-300 font-bold block mt-0.5">{isZh ? '竞品扫描大盘' : 'Competitive Footprint'}</strong>
                                {isZh ? '分析同赛道竞品，进行空隙占领' : 'Spot market gaps'}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeLayer === 2 && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest">LAYER 02: AI CONTENT GENERATION PIPELINE</span>
                            <h3 className="text-base font-black text-slate-100">{isZh ? '2. 内容结构引擎 (AI 驱动内容生产)' : 'AI-Powered Generative Architecture'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? 'CultureOS 强大的创作核心枢纽。完全自动化生产高潜能的适配文案、音色与视频素材，并在交割前通过多平台合规红线安全墙审核。'
                                : 'Our central creative refinery. Generates optimized topics, dynamic hook-scripts, multi-language dialogue adaptions, and matching imagery with local rule validation.'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                💡 <strong className="text-cyan-300 font-bold block">{isZh ? '选题选题发现' : 'Topic Discovery Engine'}</strong>
                                {isZh ? '发掘最具海外传播力的核心主题' : 'Target high-potential hooks'}
                              </div>
                              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                📝 <strong className="text-cyan-300 font-bold block">{isZh ? '脚本生成编辑器' : 'Script Drafting Core'}</strong>
                                {isZh ? '自动生成黄金开头引人入胜脚本' : 'Craft high-retention stories'}
                              </div>
                              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                🎨 <strong className="text-cyan-300 font-bold block">{isZh ? 'AI画面与视觉素材' : 'AI Asset Generation'}</strong>
                                {isZh ? '一秒产出匹配本地偏好的精美封面' : 'Render local aesthetic banners'}
                              </div>
                              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                🛡️ <strong className="text-cyan-300 font-bold block">{isZh ? '多平台合规雷区拦截' : 'Compliance Scan Vault'}</strong>
                                {isZh ? '剔除违规敏感信息安全发文' : 'Proactively block risk factors'}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeLayer === 3 && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-widest">LAYER 03: MULTI-CHANNEL DEPLOYMENT</span>
                            <h3 className="text-base font-black text-slate-100">{isZh ? '3. 多平台分发层 (一键全网无缝发布)' : 'One-Click Global Distribution'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? '消除了繁重的跨平台上传工作。多平台分发层支持将转译生成的音视频素材，一键一键分发覆盖全球主流的泛娱乐平台，精准引流。'
                                : 'Bypasses exhausting manually uploading overhead. Instantly publishes adapted social packages across YouTube, TikTok, Reels, X, and Facebook.'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300 flex items-center gap-2">
                                <span className="text-lg">🎬</span>
                                <div>
                                  <strong className="text-amber-300 font-bold block">{isZh ? 'YouTube Shorts' : 'YouTube Shorts'}</strong>
                                  <span className="text-slate-400 text-[9px]">{isZh ? '一键分发中长剧视频' : 'Long-tail organic reach'}</span>
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300 flex items-center gap-2">
                                <span className="text-lg">🎵</span>
                                <div>
                                  <strong className="text-amber-300 font-bold block">{isZh ? 'TikTok 推荐分发' : 'TikTok Integration'}</strong>
                                  <span className="text-slate-400 text-[9px]">{isZh ? '捕捉极速爆款推荐池' : 'Target recommendation feeds'}</span>
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300 flex items-center gap-2">
                                <span className="text-lg">📸</span>
                                <div>
                                  <strong className="text-amber-300 font-bold block">{isZh ? 'Instagram Reels' : 'Instagram Reels'}</strong>
                                  <span className="text-slate-400 text-[9px]">{isZh ? '高粘度高视觉质量分发' : 'Vibrant visual deployment'}</span>
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300 flex items-center gap-2">
                                <span className="text-lg">🐦</span>
                                <div>
                                  <strong className="text-amber-300 font-bold block">{isZh ? 'X (Twitter)' : 'X (Twitter) & Others'}</strong>
                                  <span className="text-slate-400 text-[9px]">{isZh ? '社交热点极速裂变传播' : 'Viral network ripple feeds'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeLayer === 4 && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-green-400 font-extrabold uppercase tracking-widest">LAYER 04: REAL-TIME DATA TRACKING & INSIGHTS</span>
                            <h3 className="text-base font-black text-slate-100">{isZh ? '4. 增长反馈层 (一刻钟效果追踪与捕获)' : 'Instant Feedback & Feature Extraction'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? '内容发出去并非终点，而是数据闭环的起点。增长反馈层提供实时的精细播放量、互动率、留存率监控，并识别核心的“爆款成功因子”。'
                                : 'Release is just the seed of growth. Relentlessly tracks views, conversion ratios, retention curves, and reverse-engineers underlying success factors.'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                📊 <strong className="text-green-300 font-bold block mt-0.5">{isZh ? '实时效果监控' : 'Real-Time Dashboard'}</strong>
                                {isZh ? '分钟级抓取推流表现与热度' : 'Scan playback scales hourly'}
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                                🔄 <strong className="text-green-300 font-bold block mt-0.5">{isZh ? '爆款因子识别' : 'Success Factor Decryptor'}</strong>
                                {isZh ? '自动抽取文案/声线的爆款机制' : 'Sift viral audio/visual markers'}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeLayer === 5 && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase tracking-widest">LAYER 05: MODEL OPTIMIZATION & RE-INGESTION</span>
                            <h3 className="text-base font-black text-slate-100">{isZh ? '5. 优化迭代层 (自进化 RAG 与数据回流)' : 'Self-Evolving RAG & Model Fine-Tuning'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? 'CultureOS 越用越聪明的奥秘。验证成功的优质案例脱敏后自动回吞到 RAG 大区知识库，不断自主演进优化模型提示语，消除数据冷启动壁垒。'
                                : 'The core evolutionary brain. Approved high-ROI scripts are safely re-ingested into target vector databases, making future generations increasingly native.'}
                            </p>
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-300">
                              🧬 <strong className="text-purple-300 font-bold block mt-0.5">{isZh ? '自进化向量知识回吞' : 'Active Feedback Loop'}</strong>
                              {isZh ? '闭环反馈，自动修正后续选题的大区偏好偏差，让系统真正具有进化自愈能力' : 'Auto-correct prompt drifts, minimizing cognitive distance for overseas regions.'}
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-450 italic">
                          {isZh ? '💡 提示：点击左侧其他层级，查看 CultureOS 五大核心层的精细架构。' : '💡 Tip: Click different layers on the left to examine core system architecture blocks.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. DEMO FLOW VIEW WITH LIVE SIMULATOR */}
                {activeSlide.type === 'demoflow' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                      {/* Left side: Step-by-step pipeline indicator */}
                      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-2 relative">
                          {[
                            { step: 0, title: isZh ? '1. IP 输入' : '1. Input IP', desc: isZh ? '资产解耦评估' : 'Assess Ingestion' },
                            { step: 1, title: isZh ? '2. 内容生成' : '2. Generative', desc: isZh ? 'AI 选题脚本' : 'Topic & Script' },
                            { step: 2, title: isZh ? '3. 域分发' : '3. Push', desc: isZh ? '全平台推流' : 'Deploy Assets' },
                            { step: 3, title: isZh ? '4. 反馈监控' : '4. Feedback', desc: isZh ? '分钟级分析' : 'Track Views' },
                            { step: 4, title: isZh ? '5. 策略迭代' : '5. Optimize', desc: isZh ? 'RAG向量自吞' : 'RAG Re-ingestion' }
                          ].map((node, nIdx) => {
                            const isCurrent = demoStep === node.step;
                            const isPassed = demoStep > node.step;
                            return (
                              <React.Fragment key={node.step}>
                                <button
                                  onClick={() => {
                                    setDemoStep(node.step);
                                    setDemoIsRunning(false);
                                  }}
                                  className={`flex-1 w-full p-3 rounded-xl border transition-all text-center cursor-pointer ${
                                    isCurrent 
                                      ? 'bg-cyan-500/10 border-cyan-455 text-cyan-200 scale-[1.02] shadow-lg shadow-cyan-500/5' 
                                      : isPassed 
                                        ? 'bg-slate-900/30 border-green-500/20 text-slate-400'
                                        : 'bg-slate-950/30 border-slate-900 text-slate-500'
                                  }`}
                                >
                                  <div className="text-xs font-black">{node.title}</div>
                                  <div className="text-[9px] opacity-60 mt-0.5">{node.desc}</div>
                                </button>
                                {nIdx < 4 && (
                                  <div className="hidden sm:block text-slate-700 font-mono">➜</div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Interactive simulation dynamic logger */}
                        <div className="p-5 rounded-2xl bg-[#090e1a] border border-slate-900 space-y-4 min-h-[180px] flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                              <span className="text-[10px] font-mono text-cyan-400 font-extrabold flex items-center gap-1.5 uppercase">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                <span>{isZh ? '🚀 Pipeline 实况日志仿真：' : 'Pipeline Trace Sandbox:'}</span>
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">STAGE_ACTIVE: OK</span>
                            </div>

                            {demoStep === 0 && (
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-300 font-bold">➜ [IP Ingestion] {isZh ? '载入原始国潮 IP: “一鹿繁花”' : 'Loading source IP: "Deer in Bloom"'}</p>
                                <p className="text-slate-400">{isZh ? '分析原始情感核心：守望、平安、相伴不离。' : 'Analysing core emotional theme: Protection, Peace, Eternal Companion.'}</p>
                                <p className="text-slate-500 font-mono text-[10px]">{isZh ? '扫描目标大区：北美大区。大区特征测定中...' : 'Targeting North America. Computing Hofstede parameters...'}</p>
                              </div>
                            )}

                            {demoStep === 1 && (
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-300 font-bold">➜ [AI Generation] {isZh ? '生成北美对位选题及多语言脚本' : 'Generating high-retention script payload'}</p>
                                <p className="text-slate-400">{isZh ? '将“仙鹿降福”意象，等效转译为北美极其偏好的“深夜书桌床头台灯”。' : 'Translating "celestial deer blessing" into an "evening cozy desktop bedlamp".'}</p>
                                <p className="text-slate-500 font-mono text-[10px]">{isZh ? '多平台合规红线安全扫描：安全等级 99.9% 审阅通过！' : 'Compliance RAG screening: Copyright check Pass, Taboos filter Pass.'}</p>
                              </div>
                            )}

                            {demoStep === 2 && (
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-300 font-bold">➜ [Multi-Channel] {isZh ? '全域多平台一键视频部署' : 'Publishing active package to networks'}</p>
                                <p className="text-slate-400">{isZh ? '成功导出 TikTok / YouTube Shorts 出海打包资源规格规范。' : 'Formulating YouTube Shorts & TikTok feed-ready MP4 asset specs.'}</p>
                                <p className="text-slate-500 font-mono text-[10px]">{isZh ? '分发队列部署：YouTube, TikTok, Reels 发布锁定。' : 'Queue dispatched. 3 major APIs responding with live status.'}</p>
                              </div>
                            )}

                            {demoStep === 3 && (
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-300 font-bold">➜ [Growth Feedback] {isZh ? '一刻钟效果监控数据回传' : 'Tracking real-time audience analytics'}</p>
                                <p className="text-slate-400 font-bold text-cyan-300">{isZh ? '实战表现数据：播放量 1.23M | CTR 8.7% | ROI 4.6x' : 'Live CTR: 8.7% | Peak Views: 1.23M | Compound ROI: 4.6X'}</p>
                                <p className="text-slate-500 font-mono text-[10px]">{isZh ? '完播留存曲线高企，成功提炼爆款高转化情绪特征因子。' : 'Retention curve remains high. Extracted cozy lightning visual as major multiplier.'}</p>
                              </div>
                            )}

                            {demoStep === 4 && (
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-300 font-bold">➜ [Model Evolution] {isZh ? '自进化 RAG 向量回吞修正' : 'Self-improving Vector Database update'}</p>
                                <p className="text-slate-400">{isZh ? '将成功爆款案例安全消隐，自动注入北美大区向量库，进行无监督聚类对准。' : 'Anonymizing successful script elements and re-ingesting into active NA vectors.'}</p>
                                <p className="text-slate-500 font-mono text-[10px]">{isZh ? '提示语适配库自动优化，下一轮选题命中率预测提高 15%' : 'Next prompt cluster adjusted. Next topic hit rate projection +15%.'}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                            <span className="text-[10px] text-slate-500">{isZh ? '💡 提示：点击上方的五个节点可手动切换演示阶段' : '💡 Tip: Click nodes above to inspect separate workflow parts'}</span>
                            <button
                              onClick={() => setDemoStep(0)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                            >
                              {isZh ? '↺ 重置仿真' : '↺ Reset'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Simulation controller */}
                      <div className="md:col-span-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase font-mono text-slate-500 tracking-wider font-black">{isZh ? '仿真控制器：' : 'Animator Control:'}</h4>
                          <p className="text-[11px] text-slate-400">
                            {isZh ? '启动全自动多智能体串联管线运动，观察数据与信号在各中心间的闭环流动：' : 'Start the automatic cascade animation to observe how a creative brief flows into traffic feedback:'}
                          </p>
                        </div>

                        <div className="space-y-2 pt-4">
                          <button
                            onClick={() => setDemoIsRunning(!demoIsRunning)}
                            className={`w-full py-3.5 rounded-xl text-xs font-black cursor-pointer transition flex items-center justify-center gap-2 ${
                              demoIsRunning 
                                ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-505/15' 
                                : 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-505/15'
                            }`}
                          >
                            {demoIsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 animate-pulse" />}
                            <span>{demoIsRunning ? (isZh ? '⏸ 暂停自动演播' : 'Pause Animator') : (isZh ? '▶ 启动全自动流程演示' : 'Start Workflow Demo')}</span>
                          </button>
                          
                          <div className="text-center">
                            <span className="text-[9px] text-slate-500 font-mono uppercase">
                              {demoIsRunning ? 'Status: Active simulating...' : 'Status: Idling'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. RISK CONTROL VIEW */}
                {activeSlide.type === 'risk' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                      {/* Left: 3 major risk categories */}
                      <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
                        <span className="text-xs font-mono uppercase text-slate-500 font-extrabold px-1">{isZh ? '⚠️ 出海核心三大风险象限：' : 'Three Critical Risk Areas:'}</span>
                        
                        <button 
                          onClick={() => setActiveRiskTab('copyright')}
                          className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${activeRiskTab === 'copyright' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                        >
                          <span className="text-xs font-bold">1. {isZh ? '版权侵权风险' : 'Copyright Infringement'}</span>
                          <span className="text-xs">🎵</span>
                        </button>

                        <button 
                          onClick={() => setActiveRiskTab('trademark')}
                          className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${activeRiskTab === 'trademark' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                        >
                          <span className="text-xs font-bold">2. {isZh ? '海外商标被恶意抢注' : 'Trademark Hijacking'}</span>
                          <span className="text-xs">🛡️</span>
                        </button>

                        <button 
                          onClick={() => setActiveRiskTab('platform')}
                          className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${activeRiskTab === 'platform' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                        >
                          <span className="text-xs font-bold">3. {isZh ? '平台规则社区违规警告' : 'Platform Policy Ban'}</span>
                          <span className="text-xs">⚠️</span>
                        </button>
                      </div>

                      {/* Right: Defensive detailed panel */}
                      <div className="md:col-span-7 p-6 rounded-2xl bg-[#090e1a] border border-slate-900 flex flex-col justify-between min-h-[260px]">
                        {activeRiskTab === 'copyright' && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-red-400 font-extrabold block uppercase tracking-wider">⚠️ RISK MATRIX 01: COPYRIGHT</span>
                            <h3 className="text-base font-black text-slate-150">{isZh ? '版权风险：音视频及肖像侵权导致平台下架' : 'Copyright Claims: Sound, Visual or Portrait Violations'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? '未授权使用热门配乐、影视剪辑、名人肖像或二创超过“合理使用边界”（Fair Use），在海外（如北美 DMCA 法规）会引发自动封锁和严重的损害赔偿起诉。'
                                : 'Unauthorized pop soundtracks, movie segments or portrait mimics easily violate foreign DMCA acts. Platforms enforce strict automated content sweeps and penalize accounts.'}
                            </p>
                            <div className="p-3 bg-red-950/10 border border-red-500/20 text-[11px] text-red-300 rounded-xl leading-relaxed">
                              🔒 <strong>CultureOS {isZh ? '防御层' : 'Defense Layer'}:</strong> {isZh ? '系统自动过滤高危受版权保护的音色和视频源，提供符合大区商用规范的免版权/正规授权音频，确保合规。' : 'System scans vector databases to extract commercial-ready copyright-free background music and safe vocal adapters.'}
                            </div>
                          </div>
                        )}

                        {activeRiskTab === 'trademark' && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-amber-400 font-extrabold block uppercase tracking-wider">⚠️ RISK MATRIX 02: TRADEMARK</span>
                            <h3 className="text-base font-black text-slate-150">{isZh ? '商标风险：国内注册无效导致品牌在海外停售' : 'Trademark Pitfalls: Local Rights Do Not Safeguard Global Sales'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? '由于“商标地域性保护原则”，国内注册的名称不等于海外能安全使用。在不经意中使用已被当地注册的品牌词汇，会导致分发账号被直接下架封号。'
                                : 'Since trademark registration is strictly national, raw domestic names face catastrophic hijack risk globally. Using occupied brand names on socials triggers rapid page takedowns.'}
                            </p>
                            <div className="p-3 bg-amber-950/10 border border-amber-500/20 text-[11px] text-amber-300 rounded-xl leading-relaxed">
                              🔒 <strong>CultureOS {isZh ? '防御层' : 'Defense Layer'}:</strong> {isZh ? '在内容策划和发文前，系统自动对接大区商标和品牌注册数据库，自动筛查及重写高危重合词，避免侵权。' : 'Our database proactively verifies brand terminology against active global registration tables, instantly rewording high-risk slogans.'}
                            </div>
                          </div>
                        )}

                        {activeRiskTab === 'platform' && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-mono text-purple-400 font-extrabold block uppercase tracking-wider">⚠️ RISK MATRIX 03: PLATFORM RULES</span>
                            <h3 className="text-base font-black text-slate-150">{isZh ? '平台规则风险：平台社区规范变化与医疗预测欺诈' : 'Platform Regulation: Fluctuating Community Rules & Claims'}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {isZh 
                                ? 'TikTok、YouTube等社区风控条例瞬息万变。不妥的使用类似“本疗愈音频可以治愈深度失眠/焦虑”（触犯虚假医疗FTC宣称）或违规赛事比分预测，将遭到严厉封号重惩。'
                                : 'Network algorithms audit copy for forbidden medical claims (e.g. "this zen visual fully cures insomnia") or deceptive prediction scams, slapping immediate flags.'}
                            </p>
                            <div className="p-3 bg-purple-950/10 border border-purple-500/20 text-[11px] text-purple-300 rounded-xl leading-relaxed">
                              🔒 <strong>CultureOS {isZh ? '防御层' : 'Defense Layer'}:</strong> {isZh ? '独创合规检测系统与大区自进化规则库，智能拦截医疗欺诈或博弈敏感诱导字眼，并一秒替换为安全环境描写。' : 'Dual RAG engines intercept forbidden medical anchors or lottery baits, reframing expressions into fully safe ambient lines.'}
                            </div>
                          </div>
                        )}

                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{isZh ? '🔒 出海合规安全防撞综合评分：' : '🔒 Cumulative Safety Defense Rating:'}</span>
                          <span className="font-mono font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded">99.9% PASSED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. CURRENT STAGE & BOTTLENECKS */}
                {activeSlide.type === 'stage' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                      {/* Box 1 */}
                      <div className="p-5 rounded-2xl bg-slate-900/40 border border-emerald-500/20 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/10 text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest rounded-bl">
                          Done
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{isZh ? '01 已跑通小闭环' : '01 Small Loop Active'}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isZh 
                            ? '完整搭建端到端 Demo，验证华语音乐、日语二次元、体育事件多类 IP 增长公式可复制性，沉淀出高效的跨语言文俗重构方法论。'
                            : 'Built unified functional prototype, completed zero-lag validation across music, anime, and hot news presets, settling robust local adapters.'}
                        </p>
                      </div>

                      {/* Box 2 */}
                      <div className="p-5 rounded-2xl bg-slate-900/40 border border-amber-500/20 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500/10 text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest rounded-bl animate-pulse">
                          Active Bottlenecks
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{isZh ? '02 当前核心卡点' : '02 Current Roadblocks'}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isZh 
                            ? '数据样本规模仍待扩充，海外平台底层分发数据与 API 回调仍需深度对接验证，MCN、优质 IP 合作渠道需要进一步打通。'
                            : 'Needs massive expansion in sample size, deeper TikTok/YT API feeds to map daily distribution loops, and direct partnerships with major IP owners.'}
                        </p>
                      </div>

                      {/* Box 3 */}
                      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0f172a] to-slate-950 border border-cyan-500/20 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyan-500/10 text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest rounded-bl">
                          Target
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{isZh ? '03 我们的目标位置' : '03 Next Milestones'}</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isZh 
                            ? '我们正处于从 0->1 验证迈向规模化爆发的黄金临界点。急需资源与合伙伙伴合力注入，加速从手搓验证进入工业化高增长阶段。'
                            : 'Golden tipping point between raw concept and industrial scale. Poised to onboard creators and automate workflows for mass-market expansion.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-center text-xs font-bold text-slate-300">
                      {isZh ? '💡 结论：我们已经成功完成了底层逻辑的闭环探索，蓄势待发，期待与伙伴携手撬动规模红利！' : '💡 Verdict: Core mechanics fully proven, ready for commercial scaling.'}
                    </div>
                  </div>
                )}

                {/* 10. WHAT WE NEED & GROWTH FLYWHEEL */}
                {activeSlide.type === 'ask' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">{activeSlide.title}</h2>
                      <p className="text-sm text-cyan-400/95">{activeSlide.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Left: What we need */}
                      <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                        <span className="text-xs font-mono uppercase text-slate-500 font-extrabold px-1 block">{isZh ? '🤝 我们需要的伙伴资源支持：' : 'Our Commercial Ask:'}</span>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-350">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span><strong>{isZh ? '内容数据源' : 'Content Ingestion Data'}:</strong> {isZh ? '泛娱乐出海分发实战数据' : 'Social traffic feedback datasets'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-350">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span><strong>{isZh ? 'MCN/创作者合作' : 'MCN & Creator Channels'}:</strong> {isZh ? '携手首批创作者开展端到端孵化' : 'Onboard pilot teams'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-350">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span><strong>{isZh ? '海外分发渠道' : 'Global Distribution Pipelines'}:</strong> {isZh ? '短剧/网文主流大分发API渠道' : 'Integrate with mainstream distributors'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-350">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span><strong>{isZh ? 'IP 授权合作' : 'IP Owners & Licensing'}:</strong> {isZh ? '国潮、动漫、体育IP授权与变现' : 'Connect with prime IP holders'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Flywheel SVG animation & value blocks */}
                      <div className="md:col-span-7 p-6 rounded-2xl bg-[#090e1a] border border-cyan-500/10 flex flex-col justify-between space-y-4 min-h-[220px]">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-extrabold block uppercase tracking-wider">{isZh ? '🚀 SYSTEM VALUE' : 'SYSTEM VALUE'}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="p-3 bg-slate-950 rounded-xl text-center">
                                <span className="text-xs text-slate-400 block">{isZh ? '创作者成长' : 'Creator scale'}</span>
                                <span className="text-xl font-black font-mono text-cyan-400 block mt-0.5">10X+</span>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl text-center">
                                <span className="text-xs text-slate-400 block">{isZh ? '内容生产效率' : 'Production speed'}</span>
                                <span className="text-xl font-black font-mono text-purple-400 block mt-0.5">20X+</span>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl text-center">
                                <span className="text-xs text-slate-400 block">{isZh ? '爆款成功概率' : 'Viral probability'}</span>
                                <span className="text-xl font-black font-mono text-amber-400 block mt-0.5">5X+</span>
                              </div>
                            </div>
                          </div>

                          {/* Rotating flywheel visualization */}
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-500/30 flex items-center justify-center relative animate-spin [animation-duration:15s] flex-shrink-0">
                            <div className="absolute inset-1.5 rounded-full border border-purple-500/20 flex items-center justify-center">
                              <div className="absolute inset-1.5 rounded-full bg-slate-950 flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-cyan-400 animate-pulse" />
                              </div>
                            </div>
                            <span className="absolute -top-1.5 text-[8px] bg-slate-950 px-1 border border-cyan-500/20 rounded font-mono text-cyan-400 font-bold uppercase select-none">IP</span>
                            <span className="absolute -bottom-1.5 text-[8px] bg-slate-950 px-1 border border-purple-500/20 rounded font-mono text-purple-400 font-bold uppercase select-none">Data</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl text-center text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">
                          {isZh ? '💡 与我们一起，重新定义全球内容增长基础设施，让好内容被世界看见！' : '💡 Partner with CultureOS: Let every masterpiece be loved by the world!'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-4 text-[9px] text-slate-500 font-mono">
                <span className="uppercase tracking-widest font-black">
                  CULTUREOS 全球IP内容增长操作系统 • {isZh ? '商业计划书' : 'VC PITCH DECK'}
                </span>
                <span className="tracking-wider">
                  SYSTEM VERSION 1.1.0 • 2026
                </span>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Player controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20 bg-slate-950/90 border border-slate-900 p-1.5 rounded-lg text-slate-400 opacity-60 hover:opacity-100 transition shadow-lg">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-1 rounded hover:bg-slate-900 hover:text-white cursor-pointer"
              title={isZh ? '上一张 [←]' : 'Prev [←]'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-1 rounded hover:bg-slate-900 hover:text-white cursor-pointer"
              title={isPlaying ? (isZh ? '暂停 [Space]' : 'Pause [Space]') : (isZh ? '自动演播 [Space]' : 'Autoplay [Space]')}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-1 rounded hover:bg-slate-900 hover:text-white cursor-pointer"
              title={isZh ? '下一张 [→]' : 'Next [→]'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal dot previews */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-800 hover:bg-slate-600'
                }`}
                title={`P.${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Copyable Presentation Slides detailed transcript & guidelines */}
      <div className="p-6 rounded-2xl bg-slate-900/25 border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
              {isZh ? '🎤 宣讲解说词与全套 PPT 排版文本导出中心' : '🎤 VC PITCH DECK MASTER PRESENTER SCRIPTS (10 SLIDES)'}
            </span>
          </div>
          
          <button
            onClick={copyPPTOutline}
            className="text-xs font-mono text-cyan-455 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
            <span>{isZh ? '复制全套BP宣讲词与大纲' : 'Copy Full Transcript'}</span>
          </button>
        </div>
        
        <p className="text-xs text-slate-450 leading-relaxed">
          {isZh
            ? '本大纲完美整合了市场调研、画像分析、IP情感增长模型、技术系统五层架构和安全风险风控应对，能高品质契合评委及投资人审美需求。可一秒复制大纲，直接导入 MindShow、Gamma 或 WPS AI 快速产出排版精美的幻灯片！'
            : 'Pre-formatted outline prepped to be fed directly into Gamma/WPS AI tools to automatically produce highly polished slides for your presentation.'}
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 font-mono overflow-auto max-h-60 whitespace-pre-wrap leading-relaxed select-all">
          {isZh 
            ? `【CultureOS 10页路演大纲及宣讲解说词】

一、封面 (Title Stage)
- 标题：CultureOS 全球IP内容增长操作系统
- 副标：让每一个创作者和品牌，都能用 IP 内容撬动全球流量，实现跨文化增长
- 解说：各位评委好，今天路演的主题是《CultureOS 全球IP内容增长操作系统》。传统出海面临严重的“浅层英文化”困境和高合规风险。我们帮大家搭建一套“IP + 内容结构 + 增长路径”三位一体的基础设施，让好的故事，在世界大区里温柔落地并实现指数级增长。

二、Why Now 市场正在变化 (Market Shifts)
- 核心变革：
  1. AI让内容生产进入无限生成时代（生成成本趋近于0）
  2. 平台分发完全依赖推荐算法（从粉丝基数转为推荐机制，内容即流量）
  3. IP成为唯一流量入口（用户注意力高度碎片化，没有IP=没有冷启动优势）
- 结论：内容竞争已经从“创作能力”转向“系统能力”。

三、Who 我们服务的核心用户 (Core Target)
- 目标：独立创作者 / 小团队运营出海内容掘金者
- 痛点：不知道做什么选题、没有IP资源冷启动慢、海外本地化表达弱极易踩雷封号、没有即时分钟级反馈。
- 结论：痛点不是“不会做内容”，而是“没有内容系统”。

四、核心洞察：流量公式 (Essence of Traffic)
- 流量增长公式：IP(已有认知符号) + 内容结构(可复制的模板) + 算法触发(平台信号匹配) = 指数增长(流量指数级放大)
- 解说：我们的核心逻辑是用高认知的IP提纯符号，搭配Hofstede文化度量的内容框架，配合算法引爆点，实现流量的大爆发。

五、IP案例矩阵：迁移验证 (Case Matrix)
- 华语IP(周杰伦)：验证情感共鸣、文化记忆放大。情绪即流量入口。
- 日语二次元IP：世界观、极强二创性。结构比内容更重要。
- 体育事件IP：高时效触发、高传播。热点是推荐机制的开关。
- 结论：所有IP底层内容增长机制是统一的，即“IP增长结构的可复制性”。

六、CultureOS 系统架构 (Product System Architecture)
- 5大层级：
  1. IP 输入层：评估IP价值、画像、竞品扫描
  2. 内容结构引擎(AI驱动)：选题发现、吸引力脚本、AI素材、合规检测
  3. 多平台分发层：YouTube Shorts, TikTok, Reels一键分发
  4. 增长反馈层：实时监控播放量、爆款因子识别
  5. 优化迭代层：策略自动修正，自进化 RAG 回吞

七、产品演示流程 (Demo Flow)
- 路径：输入IP -> 智能内容生成 -> 全网多平台一键部署 -> 增长数据监控 -> 策略自愈迭代。
- 解说：全自动化智能体流水线协同，生产效率大幅提速20X，爆款概率提升5X以上！

八、风险控制 (Compliance Guards)
- 风险象限：版权侵权风控、海外商标防抢注、平台风控及医疗虚假欺诈敏感词拦截。
- 方案：自进化大区法务库与安全回退拦截体系，守住安全大后方。

九、当前阶段与卡点 (Milestones & Stage)
- 现状：跑通从0到1的小闭环，验证多类Presest高适应性，沉淀多语种方法论。
- 卡点：数据样本扩容需求、平台规则与底层API深度整合对接、MCN与优质IP授权通路。
- 位置：处于向规模化爆发的临界期，寻求资源与合伙人加入。

十、我们的诉求与增长飞轮 (Ask & Value)
- 价值提振：创作者增长10X+，生产提效20X+，爆款命中率5X+。
- 诉求：数据合作、MCN合伙、分发渠道对接、优质IP授权、法务智囊支持。
- 飞轮：IP 输入 -> 低成本量产 -> 算法爆发 -> 触达海量受众 -> 数据反馈回吞，滚动增长。` 
            : `[CultureOS 10-Slide VC Pitch Deck Blueprint]`}
        </pre>
      </div>

    </div>
  );
}
