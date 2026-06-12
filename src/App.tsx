import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Layers, Cpu, Compass, BookOpen, AlertCircle, Award, 
  Sparkles, Clipboard, Check, ArrowRight, Download, BookOpenCheck
} from 'lucide-react';
import LandingView from './components/LandingView';
import WorkspaceView from './components/WorkspaceView';
import CulturePackView from './components/CulturePackView';
import CreativeStudioView from './components/CreativeStudioView';
import DatabaseEvolutionView from './components/DatabaseEvolutionView';
import { AgentNode, CulturePack, CampaignBrief, TraceLog } from './types';
import { PRESETS } from './data/presets';
import { prdMarkdown, designMarkdown, adapterMarkdown, evalMarkdown } from './data/prd_content';

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace' | 'studio' | 'docs' | 'database'>('landing');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Default initial states based on presets
  const [currentPack, setCurrentPack] = useState<CulturePack>(PRESETS.lucky_deer.culturePack);
  const [currentLogs, setCurrentLogs] = useState<TraceLog[]>(PRESETS.lucky_deer.logs);
  const [currentBrief, setCurrentBrief] = useState<CampaignBrief>(PRESETS.lucky_deer.brief);
  const [hasRun, setHasRun] = useState<boolean>(false);
  
  // Doc sub-tabs
  const [activeDocTab, setActiveDocTab] = useState<'prd' | 'design' | 'adapter' | 'eval'>('prd');
  const [copied, setCopied] = useState(false);

  // Sync loaded history run details when user selects from local history
  useEffect(() => {
    if (activeRunId) {
      // Find preset corresponding to selection or keep current
      const matchedPreset = Object.values(PRESETS).find(p => p.brief.name === currentBrief.name);
      if (matchedPreset) {
        setCurrentPack(matchedPreset.culturePack);
        setCurrentLogs(matchedPreset.logs);
        setHasRun(true);
      }
    }
  }, [activeRunId]);

  const handleWorkflowComplete = (pack: CulturePack, finalLogs: TraceLog[], brief: CampaignBrief) => {
    setCurrentPack(pack);
    setCurrentLogs(finalLogs);
    setCurrentBrief(brief);
    setHasRun(true);
  };

  const handleCopyMarkdown = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveDocContent = () => {
    switch (activeDocTab) {
      case 'prd': return prdMarkdown;
      case 'design': return designMarkdown;
      case 'adapter': return adapterMarkdown;
      case 'eval': return evalMarkdown;
      default: return prdMarkdown;
    }
  };

  const isZh = lang === 'zh';

  // Constant agent data node configs for interactive landing/workspcaes
  const agentsList: AgentNode[] = [
    {
      id: 'orchestrator',
      name: 'OrchestratorAgent (编排器)',
      icon: 'Cpu',
      color: 'cyan',
      role: 'Resolves campaign metrics, anchors rigid Must-Have/Must-Not boundaries.',
      roleZh: '解析 Brief 大纲，设定刚性 Context Anchor 基因约束与严禁词红线矩阵。',
      input: 'Campaign Brief specifications and target regions parameters.',
      inputZh: '原始出海创意、品牌要素与目标平台/市场参数。',
      output: 'Injectable context bounds context headers passed to downstream nodes.',
      outputZh: '生成的拦截元数据 Boundary Headers，用于注入中下游代理输入头部。',
      status: 'waiting',
      risk: 'instruction_decay',
      riskDesc: 'Defense against instruction drift in long serial pipelines.'
    },
    {
      id: 'market_research',
      name: 'MarketResearchAgent (调研专家)',
      icon: 'TrendingUp',
      color: 'gold',
      role: 'Scouts regional media patterns, trends and search query insights.',
      roleZh: '检索目标大区自媒体流行风向、音乐趋势、用户痛点、以及相关广告违规边界。',
      input: 'Target region scope and brand tone goals.',
      inputZh: '目标大区边界及品牌资产标签。',
      output: 'Insight summary documents detailing regional formats and viral factors.',
      outputZh: '大区趋势研报，包含 ASMR/Lo-fi 等高黏性流媒体关键词推荐。',
      status: 'waiting',
      risk: 'market_irrelevance',
      riskDesc: 'Maintains fresh, platforms-aligned target demographic indexes.'
    },
    {
      id: 'culture_adapter',
      name: 'CultureAdapterAgent (文化映射核)',
      icon: 'Compass',
      color: 'purple',
      role: 'Translates spiritual elements across Hofstede cultural dimension matrix.',
      roleZh: '执行 Hofstede 六维度文化框架映射，将源 IP 解析为当地同等情绪代偿符号。',
      input: 'Extracted core emotional kernels, raw symbols, and Hofstede先验库.',
      inputZh: '原子级情绪内核、品牌起源故事、霍夫斯泰德区域社会雷达。',
      output: 'Deconjugated mapping protocols and localized scene suggestions.',
      outputZh: '三层等效情绪转译决案，规避直译，推荐契合本土中产的减压形式。',
      status: 'waiting',
      risk: 'orientalist_cliche',
      riskDesc: 'Breaks away from outdated, lazy ethnic costume presets and stereotypes.'
    },
    {
      id: 'content_strategist',
      name: 'ContentStrategistAgent (内容制片)',
      icon: 'BookOpen',
      color: 'purple',
      role: 'Establishes creative video scripts guidelines and A/B test groups.',
      roleZh: '生成短视频创意大纲、拍摄氛围脚本、以及大区平台 A/B 测试流量策略。',
      input: 'Emotional adapter codes and target platform guidelines.',
      inputZh: '转译适配契合点与社交软件算法偏好。',
      output: 'A/B video theme concepts and short form clip distributions allocation grids.',
      outputZh: '创意支柱主题、视频大区 A/B 分流对照路径。',
      status: 'waiting',
      risk: 'redundancy',
      riskDesc: 'Generates robust production concepts ready for micro-budget filming.'
    },
    {
      id: 'copy_writer',
      name: 'CopyAgent (文案及分镜)',
      icon: 'Music',
      color: 'cyan',
      role: 'Drafts localized captions, storyboard timelines, and audio-visual prompts.',
      roleZh: '撰写平台标题贴纸、高传染性 Lyrics Hooks 音乐提示词与竖屏镜头脚本。',
      input: 'Creative content pillars, specific regional platform limitations.',
      inputZh: '拟定支柱创意、各平台长宽比及安全屏区限定。',
      output: 'Bilingual captions packs, 3-frame audio/music generator prompt blocks.',
      outputZh: '双语言分发文案包、Suno/Udio 配乐配音控制字与分剪脚本。',
      status: 'waiting',
      risk: 'semantic_drift',
      riskDesc: 'Strict layout compliance to ensure safe borders are maintained.'
    },
    {
      id: 'compliance',
      name: 'ComplianceAgent (安全审查)',
      icon: 'AlertCircle',
      color: 'red',
      role: 'Runs automated adversarial blacklists check. Flags violations; triggers fallbacks.',
      roleZh: '对抗式审查。一旦发现偷跑医疗疗效、过度圣像等违规，强制锁定回退回炉修改。',
      input: 'Generated ad copy, prompt schemas, and Must-Not rigid block limits.',
      inputZh: '文案及提示词终稿、Must-Not 刚性熔断红线词库（FTC/FDA 数据库）。',
      output: 'Publish authorization decision: Pass, Revise, or Block with recursion loop.',
      outputZh: '安全准入判词（通过 / 需修订 / 阻断），自带回退至内容层之指令反馈。',
      status: 'waiting',
      risk: 'regulatory_fines',
      riskDesc: 'Filters extreme claims to keep the enterprise away from regulatory penalties.'
    },
    {
      id: 'evaluator',
      name: 'EvaluatorAgent (质量评价器)',
      icon: 'Award',
      color: 'green',
      role: 'Scores deliverables across 9 fine-grained viral/cultural dimensions.',
      roleZh: '评估传播效率。根据适配率、可行性、吸睛力等 9 维经典指标综合打评分。',
      input: 'Bilingual compliance deliverables and campaign targets.',
      inputZh: '全套完成版 CulturePack 大包裹、社交圈引流话术。',
      output: 'Composite 1-5 spider assessment chart and bilingual coordinate analytics.',
      outputZh: '多维度一至五分评析雷达。输出行动优化见解，汇总归包为最终成品。',
      status: 'waiting',
      risk: 'cliche_fatigue',
      riskDesc: 'Delivers high-fidelity analytics to guarantee maximum click-through potentials.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f1f5f9] flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Top Professional Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0c1322]/80 backdrop-blur-md border-b border-[#1e2f4d]/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setView('landing')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-900 shadow-md shadow-cyan-500/10 cursor-pointer hover:opacity-90 transition"
          >
            <Layers className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <span 
              onClick={() => setView('landing')}
              className="font-bold text-lg md:text-xl tracking-tight text-white hover:text-cyan-400 transition cursor-pointer font-sans"
            >
              CultureOS
            </span>
            <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-[10px] font-mono text-amber-400 uppercase font-black tracking-widest leading-none">
              7-Agent Pipeline
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 md:gap-4">
          <button
            id="nav-home"
            onClick={() => setView('landing')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view === 'landing' ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isZh ? '首页指南' : 'Home Hub'}</span>
          </button>
          
          <button
            id="nav-workspace"
            onClick={() => setView('workspace')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view === 'workspace' ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{isZh ? '协同工作台' : 'Adaptation Desk'}</span>
          </button>

          <button
            id="nav-studio"
            onClick={() => setView('studio')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view === 'studio' ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{isZh ? 'AI 创意工坊' : 'AI Studio'}</span>
          </button>

          <button
            id="nav-database"
            onClick={() => setView('database')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view === 'database' ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{isZh ? '知识库自进化' : 'RAG Evolution'}</span>
          </button>

          <button
            id="nav-docs"
            onClick={() => setView('docs')}
            className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              view === 'docs' ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpenCheck className="w-4 h-4 text-cyan-400" />
            <span>{isZh ? '开发设计文档' : 'System Docs'}</span>
          </button>
        </nav>

        {/* Global Control Buttons */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex bg-[#0a0f1d] p-1 rounded-lg border border-[#1e2f4d]/65 text-xs">
            <button
              onClick={() => setLang('zh')}
              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                lang === 'zh' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              中
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                lang === 'en' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main View Port Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <LandingView 
                lang={lang}
                onEnterWorkspace={() => setView('workspace')}
                agents={agentsList}
                defaultPack={PRESETS.lucky_deer.culturePack}
                scoreDims={PRESETS.lucky_deer.culturePack.evaluation_score.scores}
              />
            </motion.div>
          )}

          {view === 'workspace' && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <WorkspaceView 
                lang={lang}
                agents={agentsList}
                activeRunId={activeRunId}
                setActiveRunId={setActiveRunId}
                onWorkflowComplete={handleWorkflowComplete}
              />

              {/* Interactive CulturePack delivers render area */}
              {hasRun && (
                <div className="space-y-6 pt-6 border-t border-[#1e2f4d]/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                        <span>{isZh ? '已核发: ' + currentBrief.name + ' CulturePack 交割物' : 'Qualified Delivery: ' + currentBrief.name + ' CulturePack'}</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isZh ? '7-Agent 完成对抗性安全回退和传核保真评估。' : 'Evaluated and approved with secure RAG context anchors.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setView('docs')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 border border-cyan-500/25 bg-cyan-500/5 hover:bg-cyan-500/10 cursor-pointer flex items-center gap-1.5 transition"
                    >
                      <BookOpenCheck className="w-3.5 h-3.5" />
                      <span>{isZh ? '查看系统架构规范' : 'Check System Specs'}</span>
                    </button>
                  </div>

                  <CulturePackView 
                    lang={lang}
                    pack={currentPack}
                  />
                </div>
              )}
            </motion.div>
          )}

          {view === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <CreativeStudioView 
                lang={lang}
              />
            </motion.div>
          )}

          {view === 'database' && (
            <motion.div
              key="database"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <DatabaseEvolutionView 
                lang={lang}
              />
            </motion.div>
          )}

          {view === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Documentation header */}
              <div className="p-6 rounded-2xl bg-[#0c1322]/80 border border-[#1e2f4d]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                    <BookOpenCheck className="w-6.5 h-6.5 text-cyan-400" />
                    <span>{isZh ? '产品开发需求文档 (System Specs PRD)' : 'Development Requirements & Specs'}</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-xl">
                    {isZh 
                      ? '包含 CultureOS 系统全套的产品需求、系统架构设计、文化映射映射决案以及对抗审查合规指标定义。' 
                      : 'Comprehensive technical blueprints, Hofstede dimensional metrics, and compliance loop configurations.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopyMarkdown(getActiveDocContent())}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 flex items-center gap-2 transition cursor-pointer font-sans shadow-md"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-slate-900" /> : <Clipboard className="w-3.5 h-3.5 text-slate-900" />}
                    <span>{copied ? (isZh ? '已复制 markdown' : 'Copied!') : (isZh ? '复制 Markdown 源码' : 'Copy MD Source')}</span>
                  </button>
                </div>
              </div>

              {/* Document Categories / Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#1e2f4d]/40 pb-4">
                <button
                  onClick={() => setActiveDocTab('prd')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeDocTab === 'prd' 
                      ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <span>{isZh ? '💼 1. 产品需求规格 (PRD)' : '💼 1. Product Requirements'}</span>
                </button>

                <button
                  onClick={() => setActiveDocTab('design')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeDocTab === 'design' 
                      ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <span>{isZh ? '📐 2. 软件架构设计 (Design)' : '📐 2. Architecture & Design'}</span>
                </button>

                <button
                  onClick={() => setActiveDocTab('adapter')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeDocTab === 'adapter' 
                      ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <span>{isZh ? '🧠 3. 文化映射框架 (Hofstede)' : '🧠 3. Culture Adaptation'}</span>
                </button>

                <button
                  onClick={() => setActiveDocTab('eval')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    activeDocTab === 'eval' 
                      ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <span>{isZh ? '📈 4. 红队安全与9维评测 (Evals)' : '📈 4. Red-Team Compliance'}</span>
                </button>
              </div>

              {/* Styled Documentation Render */}
              <div className="p-8 rounded-2xl bg-[#090f1e]/90 border border-[#1e2f4d]/50 shadow-xl min-h-[500px] overflow-x-auto leading-relaxed text-slate-300 select-text select-all">
                <div className="prose prose-invert prose-slate max-w-none text-sm md:text-base space-y-6">
                  {getActiveDocContent().split('\n\n').map((block, bIdx) => {
                    const line = block.trim();
                    if (line.startsWith('# ')) {
                      return <h1 key={bIdx} className="text-2xl md:text-3xl font-black text-white tracking-tight border-b border-[#1e2f4d]/40 pb-2 mt-4">{line.replace('# ', '')}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={bIdx} className="text-xl font-bold text-amber-300 tracking-wide mt-4">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={bIdx} className="text-base font-bold text-cyan-400 tracking-wide mt-2">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('> ')) {
                      return (
                        <blockquote key={bIdx} className="border-l-4 border-amber-400 bg-amber-500/5 p-4 rounded-r-xl italic text-slate-300">
                          {line.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <ul key={bIdx} className="list-disc pl-5 space-y-2 text-xs md:text-sm">
                          {line.split('\n').map((li, lIdx) => (
                            <li key={lIdx} className="leading-relaxed">{li.replace(/^[-*]\s+/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    // Handle markdown table rendering for Hofstede and coordinates
                    if (line.includes('|') && line.split('\n')[0].includes('|')) {
                      const rows = line.split('\n').filter(r => r.trim() && !r.includes(':---'));
                      return (
                        <div key={bIdx} className="overflow-x-auto my-4 border border-[#1e2f4d]/40 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#14233c]/60 text-slate-200 border-b border-[#1e2f4d]/40 font-bold font-mono">
                                {rows[0].split('|').filter((c, cIdx) => cIdx > 0 && cIdx < rows[0].split('|').length - 1).map((cell, cIdx) => (
                                  <th key={cIdx} className="p-3">{cell.trim()}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2f4d]/20 text-slate-300">
                              {rows.slice(1).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-900/40 transition">
                                  {row.split('|').filter((c, cIdx) => cIdx > 0 && cIdx < row.split('|').length - 1).map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3 leading-relaxed">{cell.trim()}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    // Code block parsing
                    if (line.startsWith('```')) {
                      return (
                        <pre key={bIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                          {line.replace(/```[a-z]*/g, '').trim()}
                        </pre>
                      );
                    }
                    return <p key={bIdx} className="text-xs md:text-sm leading-relaxed font-sans">{line}</p>;
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Professional Footer */}
      <footer className="bg-[#080d1a] border-t border-[#1e2f4d]/40 py-8 px-6 mt-12 text-center text-xs text-slate-500 space-y-2">
        <p className="font-sans leading-relaxed">
          {isZh ? 'CultureOS (文化出海智能体协同终端) — 搭载双物理命名隔离与 RAG 元数据对抗机制' : 'CultureOS Collaborative Globalization workspace Powered by 7-Agent Fallback Loop Technology.'}
        </p>
        <p className="font-mono text-[10px] uppercase text-slate-600">
          All Rights Reserved. MIT-licensed. Fully Compatible with ISO 1801 Advertising Standard.
        </p>
      </footer>
    </div>
  );
}
