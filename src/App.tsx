import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Layers, Cpu, Compass, BookOpen, AlertCircle, Award, 
  Sparkles, Clipboard, Check, ArrowRight, Download, BookOpenCheck, Sun, Moon
} from 'lucide-react';
import LandingView from './components/LandingView';
import WorkspaceView from './components/WorkspaceView';
import CulturePackView from './components/CulturePackView';
import CreativeStudioView from './components/CreativeStudioView';
import DatabaseEvolutionView from './components/DatabaseEvolutionView';
import PresentationView from './components/PresentationView';
import { AgentNode, CulturePack, CampaignBrief, TraceLog } from './types';
import { PRESETS } from './data/presets';
import { prdMarkdown, designMarkdown, adapterMarkdown, evalMarkdown } from './data/prd_content';
import { 
  useAuthManager, AuthQuotaControl, AuthModal, QuotaExceededModal, AdminDashboardView, AccountManagerModal 
} from './components/AuthManager';
import { Shield } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace' | 'studio' | 'docs' | 'database' | 'ppt' | 'admin'>('landing');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cultureos-show-onboarding');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true; // Default to visible for new users
  });

  const [milestones, setMilestones] = useState<{
    runPipeline: boolean;
    exploreCases: boolean;
    injectFeedback: boolean;
    readPPT: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('cultureos-onboarding-milestones');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      runPipeline: false,
      exploreCases: false,
      injectFeedback: false,
      readPPT: false,
    };
  });

  const [rewardClaimed, setRewardClaimed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cultureos-onboarding-reward-claimed');
      return saved === 'true';
    } catch (e) {}
    return false;
  });

  // Persist Onboarding open/close selection
  useEffect(() => {
    try {
      localStorage.setItem('cultureos-show-onboarding', String(showOnboarding));
    } catch (e) {}
  }, [showOnboarding]);

  const {
    currentUser,
    usersList,
    auditLogs,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authView,
    setAuthView,
    quotaExceededModalOpen,
    setQuotaExceededModalOpen,
    upgradeRequests,
    handleLogin,
    handleRegister,
    handleGuestLogin,
    handleLogout,
    handleCheckAndConsumeQuota,
    handleRechargeUser,
    handleSubmitUpgradeRequest,
    handleProcessUpgradeRequest,
    handleUpdateUserProfile
  } = useAuthManager();

  // Theme support
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('cultureos-theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {}
    return 'dark';
  });

  // Sync theme selection to document element/body classes
  useEffect(() => {
    try {
      localStorage.setItem('cultureos-theme', theme);
    } catch (e) {}
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

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

  // Onboarding Roadmap Auto-Observers
  useEffect(() => {
    if (hasRun && !milestones.runPipeline) {
      setMilestones(prev => {
        const next = { ...prev, runPipeline: true };
        localStorage.setItem('cultureos-onboarding-milestones', JSON.stringify(next));
        return next;
      });
    }
  }, [hasRun, milestones.runPipeline]);

  useEffect(() => {
    if (view === 'database' && !milestones.exploreCases) {
      setMilestones(prev => {
        const next = { ...prev, exploreCases: true };
        localStorage.setItem('cultureos-onboarding-milestones', JSON.stringify(next));
        return next;
      });
    } else if (view === 'ppt' && !milestones.readPPT) {
      setMilestones(prev => {
        const next = { ...prev, readPPT: true };
        localStorage.setItem('cultureos-onboarding-milestones', JSON.stringify(next));
        return next;
      });
    }
  }, [view, milestones.exploreCases, milestones.readPPT]);

  const handleFeedbackSimulated = () => {
    if (!milestones.injectFeedback) {
      setMilestones(prev => {
        const next = { ...prev, injectFeedback: true };
        localStorage.setItem('cultureos-onboarding-milestones', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleClaimOnboardingReward = () => {
    if (!currentUser) return;
    setRewardClaimed(true);
    try {
      localStorage.setItem('cultureos-onboarding-reward-claimed', 'true');
    } catch (e) {}
    // Call standard recharge system to provide 50 free credits
    handleRechargeUser(currentUser.id, 50);
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
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc]' : 'bg-[#070b13]'} flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300 transition-colors duration-300`}>
      
      {/* Top Professional Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0c1322]/90 backdrop-blur-md border-b border-[#1e2f4d]/80 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo Title Section */}
          <div className="flex items-center gap-2.5">
            <div 
              onClick={() => setView('landing')}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-900 shadow-md shadow-cyan-500/10 cursor-pointer hover:opacity-90 transition shrink-0"
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span 
                onClick={() => setView('landing')}
                className="font-bold text-[#fafafa] hover:text-cyan-400 transition cursor-pointer font-sans leading-none block py-1"
                style={{ fontSize: '1.25rem' }}
              >
                CultureOS
              </span>
            </div>
          </div>

          {/* Right controls on mobile directly, inside the same row */}
          <div className="flex items-center gap-2 md:hidden">
            <AuthQuotaControl
              currentUser={currentUser}
              onLoginClick={() => {
                setAuthView('login');
                setIsAuthModalOpen(true);
              }}
              onLogout={handleLogout}
              onAvatarClick={() => setIsAccountModalOpen(true)}
              isZh={isZh}
            />

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center justify-center p-2 rounded-lg border border-[#1e2f4d]/60 bg-[#0a0f1d] hover:text-amber-400 transition cursor-pointer text-slate-450 shrink-0"
              title={isZh ? '点击切换白天/黑夜主题' : 'Toggle Light/Dark Theme'}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-cyan-600" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
            
            {/* Language Switcher */}
            <div className="flex bg-[#0a0f1d] p-0.5 rounded-lg border border-[#1e2f4d]/65 text-xs">
              <button
                onClick={() => setLang('zh')}
                className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer text-[10px] ${
                  lang === 'zh' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-450 hover:text-slate-300'
                }`}
              >
                中
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer text-[10px] ${
                  lang === 'en' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-450 hover:text-slate-300'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - swipeable/scrollable horizontally on mobile, spacious but compact on desktop */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none flex-1 max-w-full md:max-w-none">
          <nav className="flex items-center gap-1.5 md:gap-2.5 px-0.5 py-0.5">
            <button
              id="nav-home"
              onClick={() => setView('landing')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0 border text-xs md:text-sm font-semibold ${
                view === 'landing' 
                  ? 'bg-[#14233ccb] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <span>{isZh ? '首页' : 'Hub'}</span>
            </button>
            
            <button
               id="nav-workspace"
               onClick={() => setView('workspace')}
               className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 border text-xs md:text-sm font-semibold ${
                 view === 'workspace' 
                   ? 'bg-[#14233ccb] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                   : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
               }`}
            >
              <span>{isZh ? '创意工作台' : 'Workspace'}</span>
            </button>

            <button
              id="nav-database"
              onClick={() => setView('database')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 border text-xs md:text-sm font-semibold ${
                view === 'database' 
                  ? 'bg-[#14233ccb] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${view === 'database' ? 'text-cyan-300' : 'text-slate-450'}`} />
              <span>{isZh ? '自进化库' : 'Evolution DB'}</span>
            </button>

            <button
              id="nav-studio"
              onClick={() => setView('studio')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 border text-xs md:text-sm font-semibold ${
                view === 'studio' 
                  ? 'bg-[#14233ccb] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${view === 'studio' ? 'text-cyan-300' : 'text-slate-450'}`} />
              <span>{isZh ? 'AI 译配' : 'AI Studio'}</span>
            </button>

            <button
              id="nav-ppt"
              onClick={() => setView('ppt')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 border text-xs md:text-sm font-semibold ${
                view === 'ppt' 
                  ? 'bg-[#14233ccb] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${view === 'ppt' ? 'text-cyan-300' : 'text-slate-450'}`} />
              <span>{isZh ? '路演PPT' : 'Pitch Deck'}</span>
            </button>



            {currentUser?.role === 'admin' && (
              <button
                id="nav-admin"
                onClick={() => setView('admin')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 border text-xs md:text-sm font-semibold ${
                  view === 'admin' 
                    ? 'bg-[#14233ccb] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10' 
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${view === 'admin' ? 'text-cyan-300 animate-pulse' : 'text-slate-450'}`} />
                <span>{isZh ? '控制台' : 'Admin'}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Global Control Buttons - Desktop-Only */}
        <div className="hidden md:flex items-center gap-3">
          <AuthQuotaControl
            currentUser={currentUser}
            onLoginClick={() => {
              setAuthView('login');
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onAvatarClick={() => setIsAccountModalOpen(true)}
            isZh={isZh}
          />

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center justify-center p-2 rounded-lg border border-[#1e2f4d]/60 bg-[#0a0f1d] hover:text-amber-400 transition cursor-pointer text-slate-400"
            title={isZh ? '点击切换白天/黑夜主题' : 'Toggle Light/Dark Theme'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-cyan-600 animate-pulse" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </button>

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
                lang === 'en' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-355'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main View Port Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
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
                currentUser={currentUser}
                onConsumeQuota={handleCheckAndConsumeQuota}
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
                currentUser={currentUser}
                onConsumeQuota={handleCheckAndConsumeQuota}
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
                currentUser={currentUser}
                onConsumeQuota={handleCheckAndConsumeQuota}
                onFeedbackSimulated={handleFeedbackSimulated}
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

          {view === 'ppt' && (
            <motion.div
              key="ppt"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <PresentationView lang={lang} />
            </motion.div>
          )}

          {view === 'admin' && currentUser?.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 pt-4"
            >
              <AdminDashboardView
                usersList={usersList}
                auditLogs={auditLogs}
                requests={upgradeRequests}
                onRecharge={handleRechargeUser}
                onProcessRequest={handleProcessUpgradeRequest}
                isZh={isZh}
              />
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

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        view={authView}
        setView={setAuthView}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestLogin={handleGuestLogin}
        isZh={isZh}
      />

      {/* Account Manager Control Center */}
      <AccountManagerModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        usersList={usersList}
        onSwitchUser={handleLogin}
        onUpdateUserProfile={handleUpdateUserProfile}
        onLogout={handleLogout}
        onNavigateToAdmin={() => setView('admin')}
        isZh={isZh}
      />

      {/* Quota Limit Reached Modal Overlay */}
      <QuotaExceededModal
        isOpen={quotaExceededModalOpen}
        onClose={() => setQuotaExceededModalOpen(false)}
        onSubmitRequest={handleSubmitUpgradeRequest}
        onSignUpClick={() => {
          setAuthView('signup');
          setIsAuthModalOpen(true);
        }}
        currentUser={currentUser}
        isZh={isZh}
      />
    </div>
  );
}
