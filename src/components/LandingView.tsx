import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, Award, Sparkles, ShieldAlert, Cpu, 
  Repeat, ArrowRight, Zap, CheckCircle2, Languages,
  Music, Camera, Phone, Terminal, Play, Flame, HelpCircle
} from 'lucide-react';
import { AgentNode, CulturePack } from '../types';

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
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{isZh ? '7-Agent 全新一代文化转译协议' : '7-Agent NEXT-GEN CULTURAL GLOBALIZATION'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {isZh ? '文化出海 ' : 'Cultural globalization is '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 glow-gold">
                {isZh ? '不仅是翻译' : 'NOT translation'}
              </span>
              <br className="hidden sm:inline" />
              <span className="text-xl md:text-3xl font-light text-slate-300 tracking-wide mt-3 block leading-[1.3]">
                {isZh ? '7-Agent 管线，将东方 IP 适配为本土爆款' : '7 autonomous agents adapting IP for exact local resonates'}
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl">
              {isZh 
                ? 'CultureOS 用智能体集群编排流程，彻底攻克长链路出海内容“幻觉”和“语义温热流散”。结合 RAG 本地大区知识库、Hofstede 规则引擎与 Compliance 对抗合规机制，在保证 100% 海外安全边界的前提下，让同一个东方 IP 在北美温柔陪伴，在拉美同行暖心。'
                : 'Translation solves linguistic spelling, but fails cultural resonance. CultureOS resolves this meaning gap via independent RAG vectors, Hofstede metric restraints, and Compliance loop Fallbacks that guard your IP across global markets safely.'}
            </p>

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
                  ? '让大语言模型连续撰写、修改、翻译，信息犹如击鼓传花：最初坚守的品牌宗旨“克制温柔安抚”到第 5 个文案阶段可能被异化为廉价的“孤独鸡汤文字”，彻底背离原始品牌形象。'
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
                  ? '市面普通翻译一说到出海宣发，就将拉丁美洲默认设定为“狂欢节、桑巴、斗牛与极度活跃热情”，却不知拉美同样对温厚、宁静的亲情和小吉他日常有无声而宏大的心灵需求。'
                  : 'Standard translators box Latin America into carnival dances and louder colors, totally missing the massive market in slow quiet daily intimacy and family warmth.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Case Study Section */}
      <section className="py-20 px-6 lg:px-16 relative" id="case-study">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {isZh ? '双区域文化映射深度对比' : 'MAPPING MATRIX IN REAL-TIME'}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {isZh ? '中国「一鹿繁花」IP' : 'Deer in Bloom (一鹿繁花) IP Paradigm'}
              </h2>
              <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                {isZh 
                  ? '同一个情感内核下的中国「一鹿繁花」，在北美化为“自我疗愈的深夜床灯”，在拉美化为“夕阳街角随行的温润福照”。选择标签，查看其令人惊叹的转译详情：'
                  : 'See how the same character morphs across low-power distance individualist and collectivist audiences.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex-shrink-0">
              <button 
                id="tab-na-deer"
                onClick={() => setActiveCaseTab('na')}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition duration-150 cursor-pointer ${
                  activeCaseTab === 'na' 
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                North America (北美)
              </button>
              <button 
                id="tab-latam-deer"
                onClick={() => setActiveCaseTab('latam')}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition duration-150 cursor-pointer ${
                  activeCaseTab === 'latam' 
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Latin America (拉美)
              </button>
            </div>
          </div>

          {/* Tab Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Brief & Local Canons */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{isZh ? '目标大区转译规格 (Specs)' : 'Region Specifications'}</span>
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 font-mono text-xs uppercase">{isZh ? '目标区域' : 'Region'}</span>
                    <span className="text-slate-200 font-bold">{activeCaseTab === 'na' ? 'North America' : 'Latin America'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 font-mono text-xs uppercase">{isZh ? '情绪核 (local_emotion)' : 'Local Emotion'}</span>
                    <span className="text-amber-300 font-bold">
                      {activeCaseTab === 'na' 
                        ? (isZh ? '安静的自我温柔 (Quiet Self-Kindness)' : 'Quiet Companion') 
                        : (isZh ? '同行日常微光 (Suerte Contigo)' : 'Warm Companionship')}
                    </span>
                  </div>

                  <div className="py-2 border-b border-slate-800/40 space-y-1">
                    <span className="text-slate-500 font-mono text-xs uppercase block">{isZh ? '推荐场景 (scenes)' : 'Best Scenes'}</span>
                    <span className="text-slate-300 text-xs block leading-relaxed">
                      {activeCaseTab === 'na' 
                        ? (isZh ? '城市夜晚 · Lo-Fi书桌 · 昏暗台灯 · 玻璃窗雨打声' : 'Rainy window, cozy lamp lights, lo-fi table') 
                        : (isZh ? '旧小提琴吉他 · 落日余晖街头 · 社区合伙茶暖色彩' : 'Warm sunset colonial streets, guitar melody, community bench')}
                    </span>
                  </div>

                  <div className="py-2 border-b border-slate-800/40 space-y-1">
                    <span className="text-slate-500 font-mono text-xs uppercase block">{isZh ? '音色氛围气声 (sound_prompt)' : 'Acoustics'}</span>
                    <span className="text-slate-300 text-xs block leading-relaxed">
                      {activeCaseTab === 'na' 
                        ? (isZh ? '雨滴轻打玻璃声、Lo-fi 深夜舒缓钢琴节拍、闷盖 sub-bass' : 'Cozy lo-fi raindups, soft piano reverb, warm synth base') 
                        : (isZh ? '原声尼龙弦吉他扫弦、软排笛气声、落日余晖声场回音' : 'Nylon guitar strums, breezy pan-flutes, sunset room echo')}
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <span className="text-red-400 font-mono text-xs uppercase block">{isZh ? '禁止触犯 (dont)' : 'Rigid Taboos (\'Dont\')'}</span>
                    <span className="text-red-300 text-xs block leading-relaxed">
                      {activeCaseTab === 'na' 
                        ? (isZh ? '严禁出现主观情绪疗效疗法宣告、神化信仰；不灌空洞鸡汤文字' : 'Do not hint spiritual cure or miracle remedies. Keep away from religious halo.') 
                        : (isZh ? '严防正圆光环重合头部违规圣像；坚决拒绝狂欢热舞群体刻板偏见' : 'Strictly forbid circular halo composition matching religious martyrs.')}
                    </span>
                  </div>
                </div>
              </div>

              {/* RAG Context block */}
              <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-900 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0 border border-cyan-500/15">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">{isZh ? 'RAG 知识库隔离检索机制' : 'RAG Region Isolation Engaged'}</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    {isZh 
                      ? '在运行中，本系统会在检索条件物理嵌入 [region: ' + activeCaseTab + '] 限定。系统在检索本地黑词和民俗库时实现 100% 纳米级拦截，拒绝拉美资料污染北美决策、避免偏见发生。'
                      : 'Our RAG architecture physical binds region tags at search-time, avoiding cross-pollination between separate continent briefs.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Prompts & Ad Copy Pack Preview */}
            <div className="lg:col-span-7 space-y-6">
              {/* Copy Pack Previews */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase pb-2 border-b border-slate-800">
                    <span>TikTok / Reels Caption</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>Hook A-Test</span>
                    </span>
                  </div>
                  <p className="text-xl font-medium italic text-slate-200 font-serif leading-snug glow-gold">
                    {activeCaseTab === 'na' 
                      ? '"A little golden deer for the nights when you forget to be kind to yourself."'
                      : '"La suerte camina contigo, incluso en los días lentos."'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeCaseTab === 'na' 
                      ? (isZh ? '中文内译：“深夜，当你记起了要对自己轻声温柔，这只闪亮的发光小鹿精灵便趴在你身旁。”' : 'Designed to tap perfectly into self-care / alone-time mentalities of NA white-collar workers.')
                      : (isZh ? '中文内译：“即使日子再慢，温度再淡，好运其实正和你并排笃步、同行。”' : 'Designed with high community warmth and acompañamiento tone for Latin markets.')}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase pb-2 border-b border-slate-800">
                    <span>Lyrics Hook</span>
                    <span>Music Generation Prompt</span>
                  </div>
                  <p className="text-sm font-mono text-cyan-300">
                    &quot;{activeCaseTab === 'na' 
                      ? "You don't need a miracle. Just a small light on your desk..." 
                      : "No necesitas un milagro. Solo una colita dorada que camina contigo..."}&quot;
                  </p>
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-900 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">{isZh ? 'AI 音乐提示词' : 'Suno/Udio Compliant Prompt'}</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      {activeCaseTab === 'na' 
                        ? defaultPack.copy_pack.regions[0].musicPrompt 
                        : defaultPack.copy_pack.regions[1].musicPrompt}
                    </p>
                  </div>
                </div>

                {/* 3-layer adaptation logic bullet visualization */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                    {isZh ? '🧠 CultureAdapter 3层文化映射细节' : 'Three-Layer Mapping Execution'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/40 border border-slate-900/80">
                      <span className="font-bold text-cyan-300">1. Hofstede restrains</span>
                      <p className="text-slate-400 leading-normal text-[11px]">
                        {activeCaseTab === 'na' 
                          ? (isZh ? '映射低PDI高IDV空间。排除高高在上的福泽，拉近至自我关怀日常。' : 'Low PDI constraint pulls down "blessed luck" into democratic companion.')
                          : (isZh ? '映射高UAI高COL空间。融合温暖、可靠和日常陪伴，避开空落绝望。' : 'High COL + High UAI restrains loneliness. Infuses cozy warmth and predictability.')}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/40 border border-slate-900/80">
                      <span className="font-bold text-amber-300">2. KB Taboo Filtering</span>
                      <p className="text-slate-400 leading-normal text-[11px]">
                        {activeCaseTab === 'na' 
                          ? (isZh ? '自动截断 RAG 类似 "fortune", "wealth cures illness" 等可能越界广告禁忌的名词。' : 'FTS5 vector blocks terms like "cure depression" to pass strict FTC compliance.')
                          : (isZh ? '自动检测鹿角后的圆轮发光。判定天主教对烛圣光混同危险等级高，拦截。' : 'Checks deer silhouettes to prevent religious saint gold halo collision.')}
                      </p>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/40 border border-slate-900/80">
                      <span className="font-bold text-purple-300">3. Kernel Reconstruct</span>
                      <p className="text-slate-400 leading-normal text-[11px]">
                        {activeCaseTab === 'na' 
                          ? (isZh ? '“守护” 变更为 “quiet companion”，“治愈” 降解为桌面的一盏 Lo-fi 温暖灯缕。' : 'Deconjugates "protect" into window lofi rain ambient, reshaping local meaning.')
                          : (isZh ? '“灵动” 重组为 “sunset walker”；“陪伴” 定位至老式民谣和手捂热茶的生活。' : 'Reframes "spirit" into local sunset walk, bringing collective belonging.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
