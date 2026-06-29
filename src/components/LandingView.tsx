import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, Award, Sparkles, ShieldAlert, Cpu, 
  Repeat, ArrowRight, Zap, CheckCircle2, Languages,
  Music, Camera, Phone, Terminal, Play, Flame, HelpCircle,
  Mail, Users
} from 'lucide-react';
import { AgentNode, CulturePack } from '../types';
import { PRESETS } from '../data/presets';
import CulturePackView from './CulturePackView';

interface LandingViewProps {
  lang: 'zh' | 'en';
  onEnterWorkspace: () => void;
  agents: AgentNode[];
  defaultPack: CulturePack;
  scoreDims: {
    key: string;
    labelZh: string;
    labelEn: string;
    score: number;
  }[];
}

export default function LandingView({ 
  lang, 
  onEnterWorkspace, 
  agents, 
  defaultPack,
  scoreDims 
}: LandingViewProps) {
  const [activeCaseTab, setActiveCaseTab] = useState<'na' | 'latam'>('na');
  const [pipelineIndex, setPipelineIndex] = useState(0);

  // Auto-running interactive pipeline node simulation on the landing page
  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineIndex((prev) => (prev + 1) % agents.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [agents.length]);

  const isZh = lang === 'zh';

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:px-16 overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-[550px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{isZh ? '文化连接世界 • 内容驱动增长' : 'Culture Connects the World • Content Drives Growth'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {isZh ? 'CultureOS ' : 'CultureOS '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 glow-cyan">
                {isZh ? '全球IP内容增长操作系统' : 'Global IP Content Growth OS'}
              </span>
              <br className="hidden sm:inline" />
              <span className="text-xl md:text-3xl font-light text-slate-350 tracking-wide mt-3 block leading-[1.3]">
                {isZh ? '让每一个创作者和品牌，都能用 IP 内容撬动全球流量，实现跨文化增长' : 'Empowering every creator and brand to leverage global traffic with IP content'}
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl">
              {isZh 
                ? '内容竞争已经从“创作能力”转向“系统能力”。随着 AI 让内容生产成本趋近于 0，平台分发全面依赖推荐算法，唯一的流量入口就是优质 IP。CultureOS 帮您构建“IP + 内容结构 + 增长路径”的三位一体系统，解决出海本地化水土不服、选题难爆、规则违规下架痛点，提供一站式全球化增长闭环基础设施。'
                : 'Content competition has shifted from "creation" to "system capabilities". As AI lowers production costs to near zero and platform distribution relies entirely on algorithms, IP becomes the ultimate gateway. CultureOS establishes a unified system of "IP + Content Structure + Growth Path" for your global expansion.'}
            </p>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-xl">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
                <span className="text-xs font-bold text-cyan-400">🌐 {isZh ? '连接全球文化' : 'Culture Connection'}</span>
                <span className="text-[10px] text-slate-400 mt-1">{isZh ? '打破文化边界，深度文化适配' : 'Transcend regional bias and borders'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
                <span className="text-xs font-bold text-amber-400">🎯 {isZh ? 'IP驱动内容' : 'IP-Driven Content'}</span>
                <span className="text-[10px] text-slate-400 mt-1">{isZh ? '持续创造情感价值与认可' : 'Consistently generate symbolic value'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
                <span className="text-xs font-bold text-blue-400">🚀 {isZh ? '算法助大增长' : 'Algorithm Acceleration'}</span>
                <span className="text-[10px] text-slate-400 mt-1">{isZh ? '匹配算法触发机制，精准爆量' : 'Trigger platform recommendations'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
                <span className="text-xs font-bold text-purple-400">🔄 {isZh ? '数据反馈迭代' : 'Data Evolutionary Loop'}</span>
                <span className="text-[10px] text-slate-400 mt-1">{isZh ? '自进化闭环反馈，持续成长' : 'Continuous self-learning feedback'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                id="btn-enter-workspace"
                onClick={onEnterWorkspace}
                className="px-6 py-3.5 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transform hover:-translate-y-0.5 transition duration-200 cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <span>{isZh ? '立即进入工作台' : 'Launch Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a 
                href="#how-it-works"
                className="px-6 py-3.5 rounded-xl font-bold bg-slate-800/80 text-slate-200 border border-slate-700/80 hover:bg-slate-700/80 transition duration-200 flex items-center gap-2"
              >
                <span>{isZh ? '看协作管线' : 'Explore Pipe'}</span>
              </a>

              <a 
                href="#case-study"
                className="px-6 py-3.5 rounded-xl font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition duration-200 flex items-center gap-2"
              >
                <span>{isZh ? '一鹿繁花 案例' : 'Deer in Bloom Case'}</span>
              </a>
            </div>
          </motion.div>

          {/* Hero Pipeline Interactive Visualization */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative lg:pl-6"
            id="how-it-works"
          >
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pipeline Sync: Active</span>
                </div>
              </div>

              <div className="space-y-3">
                {agents.map((agent, i) => {
                  const isCurrent = pipelineIndex === i;
                  const isCompleted = i < pipelineIndex;
                  
                  return (
                    <div key={agent.id} className="space-y-2">
                      <div 
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-amber-500/10 border-amber-400/50 scale-[1.02] shadow-md shadow-amber-500/5' 
                            : isCompleted 
                              ? 'bg-slate-800/30 border-slate-800/50 opacity-70' 
                              : 'bg-slate-900/20 border-slate-950/20 opacity-40'
                        }`}
                      >
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isCurrent 
                              ? 'bg-amber-400 text-slate-900 glow-gold' 
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                              {agent.name}
                            </h4>
                            {i === 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold uppercase tracking-wider">
                                Anchor Set
                              </span>
                            )}
                            {i === 5 && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/15 font-bold uppercase tracking-wider">
                                Red Loop
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {isZh ? agent.roleZh : agent.role}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isCurrent ? (
                            <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>{isZh ? '运行中' : 'Running'}</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 font-bold border border-green-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span>{isZh ? '已完成' : 'Done'}</span>
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-slate-800/40 text-slate-500 font-bold border border-slate-800/10">
                              {isZh ? '等待中' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Connection divider line */}
                      {i < agents.length - 1 && (
                        <div className="h-4 w-px bg-slate-800 ml-7 relative">
                          {isCompleted && <div className="absolute inset-0 bg-green-500/40" />}
                          {isCurrent && <div className="absolute inset-0 bg-amber-500 animate-pulse" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founders & Core Team Section */}
      <section className="py-10 px-6 lg:px-16 border-b border-slate-900/50 relative overflow-hidden bg-gradient-to-b from-slate-950/60 to-[#070d19]/40">
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[400px] h-[150px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-900/80">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{isZh ? '💡 我们的核心主创团队' : '💡 CORE CREATION TEAM'}</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {isZh ? '主创团队 & 开发者介绍' : 'Meet Our Founders & Developers'}
              </h2>
            </div>
            <div className="text-left md:text-right text-xs text-slate-400 leading-relaxed max-w-sm">
              {isZh 
                ? 'CultureOS 由富有出海增长与技术转译实战经验的跨文化增长极客、AI工程师联合打造。' 
                : 'CultureOS is crafted by global growth hackers and AI engineers with rich transcultural expansion experience.'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Member 1: Dai Jiapeng */}
            <motion.div 
              whileHover={{ y: -3, scale: 1.005 }}
              className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-950 border border-slate-800/80 relative overflow-hidden group transition duration-300 shadow-xl"
            >
              <div className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 rounded-bl-xl border-l border-b border-slate-800/60 uppercase tracking-widest">
                Co-Founder / Tech Lead
              </div>
              <div className="flex items-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/10 shrink-0">
                  代
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <h4 className="text-lg font-black text-white group-hover:text-cyan-400 transition duration-200">
                      {isZh ? '代嘉鹏' : 'Dai Jiapeng'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {isZh ? '联合创始人 / 首席技术架构师' : 'Co-Founder / Chief Technical Architect'}
                    </p>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {isZh 
                      ? '具有近20年经验的产品和用户体验专家。深耕 IP 内容多智能体系统与跨文化符号转译引擎研发。致力于通过自动化管线和安全 RAG 约束模型，解决创作者出海水土不服与高危违规难题。'
                      : 'A product and user experience expert with nearly 20 years of experience. Specializes in multi-agent content pipelines and transcultural semantic constraint systems.'}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a 
                      href="mailto:daijiapeng2012@gmail.com"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 hover:bg-slate-900 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition border border-slate-850"
                    >
                      <Mail className="w-3 h-3 text-cyan-400" />
                      <span>daijiapeng2012@gmail.com</span>
                    </a>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 text-[11px] font-sans text-slate-300 border border-slate-850">
                      <span className="text-cyan-400 font-extrabold">{isZh ? '微信:' : 'WeChat:'}</span>
                      <span>Golden_moon</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Member 2: Ren Huan */}
            <motion.div 
              whileHover={{ y: -3, scale: 1.005 }}
              className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-950 border border-slate-800/80 relative overflow-hidden group transition duration-300 shadow-xl"
            >
              <div className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 rounded-bl-xl border-l border-b border-slate-800/60 uppercase tracking-widest">
                Co-Founder / Growth Lead
              </div>
              <div className="flex items-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/10 shrink-0">
                  任
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <h4 className="text-lg font-black text-white group-hover:text-amber-400 transition duration-200">
                      {isZh ? '任欢' : 'Ren Huan'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {isZh ? '联合创始人 / 出海增长主理人' : 'Co-Founder / Head of Global Growth'}
                    </p>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {isZh 
                      ? '20年经验的市场和品牌专家。多语模态视听本土适配专家，具有丰富的短视频及社媒实战流量爆量经验。通过多维文化包（CulturePack™）赋能实体与IP实现商业闭环。'
                      : 'A marketing and brand expert with 20 years of experience. Expert in localized short video and social media growth formats.'}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a 
                      href="mailto:cathy.ren@163.com"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 hover:bg-slate-900 text-[11px] font-mono text-slate-300 hover:text-amber-300 transition border border-slate-850"
                    >
                      <Mail className="w-3 h-3 text-amber-400" />
                      <span>cathy.ren@163.com</span>
                    </a>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 text-[11px] font-sans text-slate-300 border border-slate-850">
                      <span className="text-amber-400 font-extrabold">{isZh ? '微信:' : 'WeChat:'}</span>
                      <span>Mickey_Ren</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 text-[11px] font-sans text-slate-300 border border-slate-850">
                      <span className="text-rose-400 font-extrabold">抖音:</span>
                      <span>阿琪是我</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Direct Value Proposition & Feature Contrast */}
      <section className="py-12 px-6 lg:px-16 bg-slate-900/25 border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-gradient-to-b from-[#0b1324] to-[#040812] border border-cyan-500/20 p-6 md:p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-cyan-700/25 border-l border-b border-cyan-500/20 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
              How CultureOS Works
            </div>
            
            <div className="max-w-3xl space-y-4">
              <span className="text-[10px] uppercase font-mono font-black text-cyan-400 tracking-wider">
                {isZh ? '💡 直白讲透：产品优势与本土适配原理' : '💡 CORE ADVANTAGE & ADAPTATION LOGIC'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-normal">
                {isZh ? '为什么不应该仅仅用翻译软件出海？' : 'Why simple translation software fails you?'}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {isZh 
                  ? '传统的翻译工具只改换文字字符（字面翻译），却往往踩中大区敏感雷区或令本地受众感觉词不达意、产生原声抗性。CultureOS 并非通用翻译，而是一站式【精神符号级、地区合规级、视听体验级】的深层文化转译引擎，其核心重构原理如下：'
                  : 'Traditional translation tools only swap words literal-to-literal, overlooking region taboos or emotional distance. CultureOS is the first systemic symbolic / sonic / regulatory adapter:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-800/60">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center font-mono text-xs">1</span>
                  <span>{isZh ? '符号内核解耦 & 精神对位' : 'Symbol Re-Anchoring'}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  {isZh 
                    ? '解耦东方 IP 原始精神（守望、陪伴、平安），转译为大区受众熟知的心灵锚点。例如，在北美，我们将“福星高照（FORTUNE）”拆解并重构为温润安心的“深夜床头台灯流金”，避免强加神明宗教负担。'
                    : 'Deconstruct cultural components (luck, destiny, duty) into familiar regional equivalents (personal self-care lights/rainy solo moments for high-individualism markets).'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-sm">
                  <span className="w-5 h-5 rounded-full bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center font-mono text-xs">2</span>
                  <span>{isZh ? '区域合规熔断 (FTC红线主动规避)' : 'Interactive Safeguard'}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  {isZh 
                    ? '内置大区自进化 RAG 合规及民俗黑名单。在撰写广告文案时，大模型自动前置拦截类似“抗抑郁/治疗失眠/祈福改运”等涉嫌医疗欺诈虚假宣称（FTC 严管）的越界词，并将其改换为安全的纯意境环境描写。'
                    : 'Built-in real-time local compliance RAG vectors to proactively block high-risk medical terms (e.g., "cure daytime insomnia/anxieties") or religious halos, keeping ads 100% safe.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                  <span className="w-5 h-5 rounded-full bg-purple-400/10 border border-purple-400/25 flex items-center justify-center font-mono text-xs">3</span>
                  <span>{isZh ? '多模态视听氛围等效转化' : 'Sonic & Music Equivalence'}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed pl-7">
                  {isZh 
                    ? '不仅翻译文案，更将声场、伴奏和乐器一并本土匹配。为拉美受众自动补充木吉他合奏和低保真手摇沙锤节拍调和社区阳光感；为北美配置深夜细腻雨音配温存 sub-bass，实现高品质文化共鸣。'
                    : 'Adapts sonic textures, beats, and instruments. Recommends nylon guitar to add warmth for Latin communities; suggests quiet Lo-fi ambient sounds with bedroom raindrops for individualist US listeners.'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                <span>{isZh ? '提示：你可以点击右上角导航栏「知识库自进化」，一键测试 RAG 自我适应、回吞反馈的硬核演示。' : 'Try our brand-new self-evolving RAG module in the top navigation!'}</span>
              </div>
              <button
                onClick={onEnterWorkspace}
                className="text-xs font-black text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition animate-bounce"
              >
                <span>{isZh ? '去智能协同工作台 ➜' : 'Launch Workspace & Try It ➜'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Solver Section */}
      <section className="py-20 px-6 lg:px-16 bg-slate-950/40 border-y border-slate-900/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              {isZh ? '直击出海最大真实痛点' : 'SOLVING ROOT GAPS'}
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {isZh ? '文化出海，为什么九死一生？' : 'Why Does Translating Copy Fail to Globalize?'}
            </h3>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              {isZh 
                ? '出海内容不仅面临语言隔阂，更常常面临底层民俗、宗教信仰、法律监管与海外平台严密风控的综合交叉重惩。'
                : 'Localizing social content requires mapping the mental trigger points of target users without triggering heavy regulatory red lines.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/60 space-y-4 hover:border-red-500/30 transition duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/15 group-hover:bg-red-500/20 transition duration-300">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 group-hover:text-red-400 transition duration-200">
                {isZh ? '01. 宗教与法律合规盲区' : '01. Compliance Blind Spots'}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isZh 
                  ? '国内常见的热词例如“招财改运、心理疗愈、护照升迁”，直译为 "Spiritual wealth cures anxiety" 会瞬间因夸大功效触犯美国 FTC/FDA 广告合规法规、或在拉美引发宗教亵渎检控。'
                  : 'Common phrases like "destiny wealth" or "spiritual cure" automatically run into severe medical claims and religious violations outside local regions.'}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/60 space-y-4 hover:border-amber-500/30 transition duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/15 group-hover:bg-amber-500/20 transition duration-300">
                <Repeat className="w-6 h-6 rotate-45" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition duration-200">
                {isZh ? '02. 多步骤串行中的语义漂移' : '02. Cascade Semantic Drift'}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isZh 
                  ? '让大语言模型连续撰写、修改、翻译，信息犹如击鼓传花：最初坚守的品牌宗旨“克制温柔安抚”到第 5 个文案阶段可能被异化为廉价的“大白话孤独”，彻底背离原始品牌形象。'
                  : 'Passing prompts forward through multiple writing turns dilutes original constraints. The core brand tone loses itself to ChatGPT template cliches.'}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/60 space-y-4 hover:border-cyan-500/30 transition duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/15 group-hover:bg-cyan-500/20 transition duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition duration-200">
                {isZh ? '03. 刻板族群审美的偏向谬论' : '03. Cliché Stereotype Presets'}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isZh 
                  ? '市面普通翻译一说到出海宣发，就将拉丁美洲默认设定为“狂欢节、桑巴、斗牛与极度活跃”，却不知拉美同样对温厚、宁静的亲缘或安静生活有无声而宏大的心灵渴望。'
                  : 'Standard translators box Latin America into carnival dances and louder colors, totally missing the massive market in slow quiet daily intimacy and family warmth.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Case Study / Judges rapid-access verification suite */}
      <section className="py-20 px-6 lg:px-16 relative border-t border-b border-slate-900/40 bg-gradient-to-b from-[#060a13] to-slate-950" id="case-study">
        {/* Decorative corner indicators */}
        <div className="absolute top-4 left-4 font-mono text-[9px] text-slate-600 tracking-widest pl-4 hidden md:block">
          BUILDATHON REAL-TIME PROTOTYPE VERIFICATION
        </div>
        <div className="absolute top-4 right-4 font-mono text-[9px] text-slate-600 tracking-widest pr-4 hidden md:block">
          JURY rapid ACCESS: SECURE & ACTIVE
        </div>

        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="mx-auto w-max inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-mono rounded-full font-black animate-pulse">
              🏆 协创松·评审专家快速验证通道 ( JURY rapid ON-SITE INSPECT )
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {isZh ? '免登录：7-Agent 落地成果极速查验' : 'No-Login Jury Deck: Dynamic Output Verification'}
            </h2>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
              {isZh 
                ? '为确保大赛评审会现场“开箱即用”的高校吞吐性，我们在此公开了未经登录、真实离岸流生成的 CulturePack 全套包，包括系统 7 大多智能体对抗审计的原始回退 Trace Logs。您可任意切换查看。'
                : 'To ensure effortless on-site auditability during the buildathon, we bypass logins for this rapid inspection desk. Explore original briefs, actual 7-agent trace loops, and final adaptively generated CulturePacks instantly.'}
            </p>
          </div>

          {/* Core Interactive Widget */}
          {(() => {
            const [selectedId, setSelectedId] = useState<'lucky_deer' | 'tea_ritual'>('lucky_deer');
            const [activeJuryTab, setActiveJuryTab] = useState<'brief' | 'logs' | 'deliverable'>('deliverable');

            const currentPreset = PRESETS[selectedId];
            if (!currentPreset) return null;

            return (
              <div className="border border-slate-800 rounded-2xl bg-[#090f1d] shadow-2xl relative overflow-hidden">
                
                {/* Header Row: Presets Selectors & Action Toggles */}
                <div className="p-4 sm:p-6 bg-[#040811] border-b border-slate-850 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  {/* Preset Selector tabs */}
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <span className="text-xs uppercase font-mono text-slate-500 font-bold block pr-2.5 border-r border-slate-800 hidden sm:inline-block">
                      {isZh ? '📁 选择 IP 预设模型大类:' : 'IP Preset:'}
                    </span>
                    {(Object.keys(PRESETS) as Array<'lucky_deer' | 'tea_ritual'>).map((id) => (
                      <button
                        key={id}
                        id={`jury-id-${id}`}
                        onClick={() => setSelectedId(id)}
                        className={`px-4 py-2.5 rounded-xl font-bold font-sans text-xs sm:text-sm tracking-wide transition cursor-pointer border flex items-center gap-2 ${
                          selectedId === id 
                            ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-405/10 scale-[1.01]' 
                            : 'text-slate-300 bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{PRESETS[id].name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Actions summary stat or button */}
                  <div className="text-right flex items-center justify-end gap-3 font-mono text-xs">
                    <span className="text-slate-500 uppercase tracking-wider hidden lg:inline">{isZh ? '当前评估状态：' : 'Compliance Security:'}</span>
                    <span className={`px-2.5 py-1 rounded border-2 uppercase font-black tracking-widest block ${
                      currentPreset.culturePack.compliance_review.decision === 'Pass' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/20 animate-pulse'
                    }`}>
                      {currentPreset.culturePack.compliance_review.decision} Locked
                    </span>
                  </div>
                </div>

                {/* Sub-Tabs Selector: Brief vs Logs vs Deliverable */}
                <div className="flex border-b border-slate-850/80 bg-[#070b16] p-1 gap-1">
                  <button
                    id="jury-tab-brief"
                    onClick={() => setActiveJuryTab('brief')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-bold tracking-wide transition cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
                      activeJuryTab === 'brief' 
                        ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20' 
                        : 'text-slate-450 hover:text-slate-350 border-transparent hover:bg-slate-900/10'
                    }`}
                  >
                    <span>📝 {isZh ? '原始 IP 简报评估' : 'Target Campaign Brief'}</span>
                  </button>
                  <button
                    id="jury-tab-logs"
                    onClick={() => setActiveJuryTab('logs')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-bold tracking-wide transition cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
                      activeJuryTab === 'logs' 
                        ? 'text-cyan-400 border-cyan-400 bg-cyan-950/20' 
                        : 'text-slate-450 hover:text-slate-350 border-transparent hover:bg-slate-900/10'
                    }`}
                  >
                    <span>⚡ {isZh ? '7-Agent 多智能体协同溯源日志' : '7-Agent Collab Trace Logs'}</span>
                  </button>
                  <button
                    id="jury-tab-deliverable"
                    onClick={() => setActiveJuryTab('deliverable')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-bold tracking-wide transition cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
                      activeJuryTab === 'deliverable' 
                        ? 'text-amber-300 border-amber-300 bg-amber-500/5' 
                        : 'text-slate-450 hover:text-slate-350 border-transparent hover:bg-slate-900/10'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>🎁 {isZh ? '多维输出: CulturePack™ 文化包' : 'Output CulturePack'}</span>
                    </span>
                  </button>
                </div>

                {/* Sub-Tab Contents display */}
                <div className="p-6 md:p-8 bg-[#080d19]/90 min-h-[420px]">
                  
                  {/* TAB 1: BRIEF */}
                  {activeJuryTab === 'brief' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                        <div className="p-5 rounded-xl bg-slate-950/65 border border-slate-900 space-y-3.5">
                          <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider block font-bold">🎯 {isZh ? '出海商业构想与目标' : 'Commercial Context'}</span>
                          <div className="space-y-2">
                            <h4 className="text-lg font-extrabold text-white">{currentPreset.brief.name}</h4>
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-slate-900/60">
                              <div>
                                <span className="text-slate-500 uppercase block">{isZh ? '原型文化资产' : 'Source Asset'}</span>
                                <span className="text-slate-300 font-bold block pt-0.5">{currentPreset.brief.cultureAsset}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 uppercase block">{isZh ? '目标出海大群' : 'Target Reach'}</span>
                                <span className="text-slate-300 font-bold block pt-0.5">{currentPreset.brief.targetRegions.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-950/65 border border-slate-900 space-y-3">
                          <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider block font-bold">✨ {isZh ? '核心情感核 (Emotional Kernels)' : 'Emotional Kernels'}</span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {currentPreset.brief.emotionalKernel.map((kern, i) => (
                              <span key={i} className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-850">
                                {kern}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Must Have & Must Not Contrast borders */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-950/50 border border-green-500/10 space-y-3">
                          <span className="text-xs text-green-400 uppercase font-mono font-black block flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {isZh ? '✓ 品牌原真必须承袭特质 (MUST-HAVE)' : 'Rigid Brand DNA (Must-HAVE)'}
                          </span>
                          <ul className="space-y-2 text-sm text-slate-300">
                            {currentPreset.brief.mustHave.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 italic">
                                <span className="text-green-400 mt-1 font-black">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-950/50 border border-red-500/10 space-y-3">
                          <span className="text-xs text-red-400 uppercase font-mono font-black block flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-450 animate-pulse" />
                            {isZh ? '🚫 本地禁忌与刚性禁入红线 (MUST-NOT)' : 'De-escalated Pitfalls (Must-NOT)'}
                          </span>
                          <ul className="space-y-2 text-sm text-slate-300">
                            {currentPreset.brief.mustNot.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 italic">
                                <span className="text-red-400 mt-1.5 font-black">×</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DETAILED LOGS TRACE */}
                  {activeJuryTab === 'logs' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-xs text-cyan-400 font-mono">
                        <span>Console Node: secure_pipeline_audit_run --preset={selectedId}</span>
                        <span className="animate-pulse">● System: Read-only Trace Sandbox</span>
                      </div>
                      
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 font-mono text-xs overflow-y-auto max-h-[380px] space-y-3 shadow-inner scrollbar-thin">
                        {currentPreset.logs.map((log, idx) => {
                          const isWarning = log.type === 'warning';
                          const isError = log.type === 'error';
                          const isSuccess = log.type === 'success';

                          let color = 'text-slate-400';
                          if (isWarning) color = 'text-amber-300';
                          if (isError) color = 'text-red-400 font-extrabold bg-red-950/15 p-1 rounded border border-red-900/30';
                          if (isSuccess) color = 'text-emerald-450';

                          return (
                            <div key={idx} className={`flex items-start gap-3.5 leading-relaxed py-1 border-b border-slate-900/30 ${color}`}>
                              <span className="text-slate-655 flex-shrink-0 select-none">[{log.timestamp}]</span>
                              <span className="font-bold text-cyan-405 flex-shrink-0">{log.agent}:</span>
                              <div className="flex-1 min-w-0">
                                <span className="font-extrabold pr-2 text-slate-200">({log.event})</span>
                                <span>{log.message}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 text-xs text-slate-450 leading-relaxed max-w-3xl font-sans italic">
                        {isZh 
                          ? '💡 提示：在 Trace Logs 中您能看到系统“自律对抗（Adversarial Self-Audit）”闭环。在初版送审违规时，ComplianceAgent 会主动触发 Block 并下发 Fallback 自动回退，指挥 Content/Copy Agent 自动擦除高危词，直至抗病及宗教侵权要素 100% 纠偏清零，最终评出高评分打包落地。这充分展示了多智能体串行工作流规避主观偏倚的技术优越性。'
                          : '💡 Insight: The trace details how the ComplianceAgent actively detects violations (such as the initial medical/anxiety claims violating US FTC regulations), blocks the release, and forces a closed-loop Fallback. This automated revision operates without any developer intervention.'}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LIVE RE-RENDERED CULTUREPACK VIEW */}
                  {activeJuryTab === 'deliverable' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CulturePackView lang={lang} pack={currentPreset.culturePack} />
                    </motion.div>
                  )}

                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* CTA final section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-5xl font-black text-white glow-gold">
          {isZh ? '30 秒，打包发布你的专属 CulturePack' : 'Package Your Own CulturePack In 30 Seconds'}
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
          {isZh 
            ? '进入工作台，加载预设并运行这套极其严密的 7-Agent 多语意转化工作流。' 
            : 'Explore presets, customize restrictions, audit with Compliance agents, and export traceable markdown specifications instantly.'}
        </p>

        <div className="pt-4 flex justify-center">
          <button 
            id="btn-launch-bottom"
            onClick={onEnterWorkspace}
            className="px-8 py-4 rounded-xl text-slate-900 bg-amber-400 hover:bg-amber-300 font-extrabold text-sm tracking-wide transform hover:-translate-y-0.5 transition duration-150 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-2"
          >
            <span>{isZh ? '进入工作台' : 'Launch Workspace'}</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </button>
        </div>
      </section>
    </div>
  );
}
