import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Settings, Terminal, Sparkles, CheckCircle2, RotateCw, 
  AlertTriangle, Layers, Activity, Check, Bookmark, Info, Flame, Trash2
} from 'lucide-react';
import { CampaignBrief, AgentNode, TraceLog, CulturePack } from '../types';
import { PRESETS } from '../data/presets';

interface WorkspaceViewProps {
  lang: 'zh' | 'en';
  agents: AgentNode[];
  onWorkflowComplete: (pack: CulturePack, finalLogs: TraceLog[], brief: CampaignBrief) => void;
  activeRunId: string | null;
  setActiveRunId: (id: string | null) => void;
  currentUser?: any;
  onConsumeQuota?: (actionName: string) => boolean;
}

export default function WorkspaceView({
  lang,
  agents: defaultAgents,
  onWorkflowComplete,
  activeRunId,
  setActiveRunId,
  currentUser,
  onConsumeQuota
}: WorkspaceViewProps) {
  const isZh = lang === 'zh';

  // State managers
  const [selectedPreset, setSelectedPreset] = useState<string>('lucky_deer');
  const [ipName, setIpName] = useState('');
  const [cultureAsset, setCultureAsset] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [emotionalKernelText, setEmotionalKernelText] = useState('');
  const [mustHaveText, setMustHaveText] = useState('');
  const [mustNotText, setMustNotText] = useState('');
  const [brandTone, setBrandTone] = useState('');
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);

  // Simulation running states
  const [copiedRun, setCopiedRun] = useState<string | null>(null);
  const [runHistory, setRunHistory] = useState<{ id: string; timestamp: string; ipName: string; status: 'completed' | 'running' }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [simulationLogs, setSimulationLogs] = useState<TraceLog[]>([]);
  const [localAgents, setLocalAgents] = useState<AgentNode[]>(defaultAgents);
  const [retryLoopCount, setRetryLoopCount] = useState(0); // For visualizing fallback block re-rerun

  const logConsoleRef = useRef<HTMLDivElement>(null);
  const stepIntervalRef = useRef<any>(null);

  // Load preset fields
  const loadPreset = (presetId: string) => {
    const p = PRESETS[presetId];
    if (!p) return;
    setIpName(p.brief.name);
    setCultureAsset(p.brief.cultureAsset);
    setBusinessGoal(p.brief.businessGoal);
    setEmotionalKernelText(p.brief.emotionalKernel.join(', '));
    setMustHaveText(p.brief.mustHave.join('; '));
    setMustNotText(p.brief.mustNot.join('; '));
    setBrandTone(p.brief.brandTone);
    setTargetRegions(p.brief.targetRegions);
    setTargetPlatforms(p.brief.targetPlatforms);
    setSelectedPreset(presetId);
  };

  // Prefill default preset on outer component mounting
  useEffect(() => {
    loadPreset('lucky_deer');
    // Load local history list
    const hist = localStorage.getItem('cultureos_run_history');
    if (hist) {
      try {
        setRunHistory(JSON.parse(hist));
      } catch (e) {}
    }
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, []);

  // Sync scroll on simulated output term console
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  // Handle region toggle
  const toggleRegion = (region: string) => {
    setTargetRegions(prev => 
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  // Handle platform toggle
  const togglePlatform = (platform: string) => {
    setTargetPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  // Delete run history
  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = runHistory.filter(h => h.id !== id);
    setRunHistory(updated);
    localStorage.setItem('cultureos_run_history', JSON.stringify(updated));
    if (activeRunId === id) {
      setActiveRunId(null);
    }
  };

  // Main high-fidelity sequential execution simulation
  const startSimulation = () => {
    if (onConsumeQuota && !onConsumeQuota(isZh ? '协同工作台 - 7-Agent 出海仿真演算' : 'Adaptation Desk - 7-Agent Copipeline simulation')) {
      return;
    }

    if (stepIntervalRef.current) {

      clearInterval(stepIntervalRef.current);
    }
    setIsRunning(true);
    setRetryLoopCount(0);
    setCurrentStepIndex(0);
    setSimulationLogs([]);

    // Initialize agent statuses
    const resetNodes = defaultAgents.map(a => ({
      ...a,
      status: 'waiting' as const
    }));
    setLocalAgents(resetNodes);

    const timestampStr = new Date().toLocaleTimeString();
    const currentBrief: CampaignBrief = {
      id: 'custom-' + Date.now().toString().slice(-4),
      name: ipName,
      cultureAsset,
      businessGoal,
      emotionalKernel: emotionalKernelText.split(/[,，;；]/).map(t => t.trim()).filter(Boolean),
      mustHave: mustHaveText.split(/[;；]/).map(t => t.trim()).filter(Boolean),
      mustNot: mustNotText.split(/[;；]/).map(t => t.trim()).filter(Boolean),
      brandTone,
      targetRegions,
      targetPlatforms
    };

    // Check for evolved RAG entries in localStorage
    let hasEvolvedRag = false;
    let evolvedVersion = '1.0';
    try {
      const savedRag = localStorage.getItem('cultureos_rag_entries');
      if (savedRag) {
        const parsed = JSON.parse(savedRag);
        const deerEntry = parsed.find((p: any) => p.id === 'rag-001');
        if (deerEntry && parseFloat(deerEntry.version) > 1.0) {
          hasEvolvedRag = true;
          evolvedVersion = deerEntry.version;
        }
      }
    } catch (e) {
      console.warn("Could not load RAG store", e);
    }

    // Preset loaded outputs
    const activePresetData = PRESETS[selectedPreset] || PRESETS.lucky_deer;
    const finalPack = activePresetData.culturePack;
    const mockLogs = activePresetData.logs;

    let index = 0;
    let localRetryLoopCount = 0;
    const logsToFeed: TraceLog[] = [];

    // Custom logger append function
    const pushLog = (agent: string, event: string, msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const log = { timestamp: new Date().toLocaleTimeString(), agent, event, message: msg, type };
      logsToFeed.push(log);
      setSimulationLogs([...logsToFeed]);
    };

    pushLog('System', 'Initialization', 'Booting CultureOS engine... Setting session namespace workspace.', 'info');
    if (hasEvolvedRag) {
      pushLog('System', 'RAG Autolink', `[RAG 数据库同步成功]: 检索到已进化的 IP 文化规则 (V${evolvedVersion})，高敏感大区指令已被强制重构融入出海元边界！`, 'success');
    }
    pushLog('OrchestratorAgent', 'Active', 'Applying campaign boundaries... parsing target markets.', 'info');

    stepIntervalRef.current = setInterval(() => {
      if (index === 0) {
        // Step 1: Orchestrating
        setCurrentStepIndex(0);
        setLocalAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'running' } : a));
        pushLog('OrchestratorAgent', 'Context Decouple', `Disassembling emotional core: [${currentBrief.emotionalKernel.join(', ')}]`, 'info');
        pushLog('OrchestratorAgent', 'Context Anchor Set', `Anchoring Must-Have requirements: ${currentBrief.mustHave.slice(0, 2).join('; ')}`, 'success');
        pushLog('OrchestratorAgent', 'Context Anchor Set', `Blocking Must-Not triggers: ${currentBrief.mustNot.slice(0, 2).join('; ')}`, 'success');
        index++;
      } else if (index === 1) {
        // Step 2: Market research
        setCurrentStepIndex(1);
        setLocalAgents(prev => prev.map((a, i) => i === 0 ? { ...a, status: 'done' } : i === 1 ? { ...a, status: 'running' } : a));
        pushLog('MarketResearchAgent', 'Retrieval Active', `Searching trends across: ${currentBrief.targetPlatforms.join(', ')}`, 'info');
        pushLog('MarketResearchAgent', 'Vulnerabilities Checked', `Discovered strict advertising bounds matching specified keywords. RAG index loaded.`, 'success');
        index++;
      } else if (index === 2) {
        // Step 3: Cultural mapping
        setCurrentStepIndex(2);
        setLocalAgents(prev => prev.map((a, i) => i === 1 ? { ...a, status: 'done' } : i === 2 ? { ...a, status: 'running' } : a));
        pushLog('CultureAdapterAgent', 'Hofstede Metrics', 'Applying Hofstede metrics model: NA IDV 91/PDI 40 vs LATAM IDV 30/PDI 70', 'info');
        if (hasEvolvedRag) {
          pushLog('CultureAdapterAgent', 'Evolved Heuristics', `正在执行自进化 RAG V${evolvedVersion} 定制化映射：北美规避任何‘焦虑、抑郁、治疗’宣示；拉美配乐导入暖色民俗排笛中和低保真。`, 'success');
        } else {
          pushLog('CultureAdapterAgent', 'Isolated RAG Search', 'Query bounds scoped to Region specific catalogs. No-cross pollution verified.', 'info');
        }
        pushLog('CultureAdapterAgent', 'Synaptic Adaptation', 'Refactoring original assets into appropriate target equivalent symbols.', 'success');
        index++;
      } else if (index === 3) {
        // Step 4: Story strategy
        setCurrentStepIndex(3);
        setLocalAgents(prev => prev.map((a, i) => i === 2 ? { ...a, status: 'done' } : i === 3 ? { ...a, status: 'running' } : a));
        pushLog('ContentStrategistAgent', 'Concept Locked', 'Defining creative pillars: "After-work rest moments" & "Tiny ambient rituals"', 'info');
        pushLog('ContentStrategistAgent', 'Distribution A/B Plan', 'A/B testing bounds: Alone-Time Cozy vs Mascot Reality collision.', 'success');
        index++;
      } else if (index === 4) {
        // Step 5: Content writing / Copy
        setCurrentStepIndex(4);
        setLocalAgents(prev => prev.map((a, i) => i === 3 ? { ...a, status: 'done' } : i === 4 ? { ...a, status: 'running' } : a));
        pushLog('CopyAgent', 'Generatings Text', 'Composing bilingual captions, music prompts, and visual asset schemas...', 'info');
        pushLog('CopyAgent', 'Format Compliances', 'Length restricted to 9:16 safe zones. Hashtags groups and hooks formatted.', 'success');
        index++;
      } else if (index === 5) {
        // Step 6: Safety Compliance (Show Block Fallback)
        setCurrentStepIndex(5);
        setLocalAgents(prev => prev.map((a, i) => i === 4 ? { ...a, status: 'done' } : i === 5 ? { ...a, status: 'running' } : a));
        pushLog('ComplianceAgent', 'Adversarial Audit', 'Running Red-Team audit on copy output against Context Anchor borders...', 'info');
        
        if (hasEvolvedRag) {
          // Dynamic Bypass showing the direct benefit of evolution!!
          setTimeout(() => {
            pushLog('ComplianceAgent', '✔ Clear Audit', `[自进化RAG前置拦截成功]: 由于RAG已升级至 V${evolvedVersion}，法律词库中已前置拦截医疗焦虑倾向并自动对北美改用“软氛围意境描述”，拉美配乐中已融合温暖排笛。直接 100% 通过过滤！`, 'success');
            setLocalAgents(prev => prev.map((a, i) => i === 5 ? { ...a, status: 'done' } : i === 6 ? { ...a, status: 'running' } : a));
            setRetryLoopCount(0);
            localRetryLoopCount = 2; // Jump straight to score step
          }, 1200);
        } else {
          // Standard timeout fallback loop
          setTimeout(() => {
            pushLog('ComplianceAgent', '⚠️ Risk Alert', 'Sleepless anxiety medical claim detected. Golden halos matching Catholic iconostasis triggered.', 'warning');
            setLocalAgents(prev => prev.map((a, i) => i === 5 ? { ...a, status: 'failed' } : a));
            
            setTimeout(() => {
              pushLog('System', 'Fallback Loop', '⚠️ MUST-NOT boundary violation! Triggering RECURRENT REDO fallback to ContentStrategistAgent.', 'error');
              setLocalAgents(prev => prev.map((a, i) => i === 3 ? { ...a, status: 'running' } : i === 5 ? { ...a, status: 'waiting' } : a));
              setRetryLoopCount(1);
              localRetryLoopCount = 1;
              
              setTimeout(() => {
                pushLog('ContentStrategistAgent', 'Re-evaluation', 'Erasing anxiety cure promises. Replaced with calming desk lights.', 'info');
                setLocalAgents(prev => prev.map((a, i) => i === 3 ? { ...a, status: 'done' } : i === 4 ? { ...a, status: 'running' } : a));
                
                setTimeout(() => {
                  pushLog('CopyAgent', 'Text Mutation', 'Recompiling storyboard frames. Removed halo, applied gold stardust sparkles.', 'success');
                  setLocalAgents(prev => prev.map((a, i) => i === 4 ? { ...a, status: 'done' } : i === 5 ? { ...a, status: 'running' } : a));
                  
                  setTimeout(() => {
                    pushLog('ComplianceAgent', 'Re-evaluation', 'Conflict cleared. Secondary audit passes with green metrics!', 'success');
                    setLocalAgents(prev => prev.map((a, i) => i === 5 ? { ...a, status: 'done' } : i === 6 ? { ...a, status: 'running' } : a));
                    setRetryLoopCount(2);
                    localRetryLoopCount = 2;
                  }, 1000);
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }

        index++;
      } else if (index === 6) {
        // Step 7: Evaluator scoring (Only runs once compliance re-run completed)
        if (localRetryLoopCount === 2) {
          setCurrentStepIndex(6);
          pushLog('EvaluatorAgent', 'Analytics Done', 'Calculating score matrices across 9 coordinates...', 'info');
          const finalScore = hasEvolvedRag ? `4.8/5.0 (优秀高效 - 完美拦截规避风控 - 自进化 RAG V${evolvedVersion} 辅佐)` : '4.3/5. Excellent compliance buffer.';
          pushLog('EvaluatorAgent', 'Score Cleared', `Calculated composite score: ${finalScore}`, 'success');
          
          setLocalAgents(prev => prev.map((a, i) => i === 6 ? { ...a, status: 'done' } : a));
          
          // Complete pipeline
          if (stepIntervalRef.current) {
            clearInterval(stepIntervalRef.current);
          }
          setIsRunning(false);
          setCurrentStepIndex(-1);

          // Invoke main landing callback
          onWorkflowComplete(finalPack, logsToFeed, currentBrief);

          // Add to running history
          const newRunId = 'run-' + Date.now().toString().slice(-6);
          setActiveRunId(newRunId);
          setRunHistory(prev => {
            const newHistory = [
              { id: newRunId, timestamp: timestampStr, ipName, status: 'completed' as const },
              ...prev
            ];
            localStorage.setItem('cultureos_run_history', JSON.stringify(newHistory));
            return newHistory;
          });
        }
      }
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Info Banner */}
      <div className="border border-slate-800/80 p-6 rounded-2xl bg-slate-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>{isZh ? '7-Agent 极速协同终端' : '7-Agent Mission Control'}</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            {isZh 
              ? '在这里配置产品 brief，设定正负向 Context Anchor（必须遵守及禁止出现原则）。加载下方预设，即可自动填写并启动高拟真合规对抗仿真流。'
              : 'Configure your campaign parameters below. Meta constraints are anchored and passed dynamically across downstream agent outputs.'}
          </p>
        </div>

        {/* Preset Buttons Grid */}
        <div className="space-y-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
            {isZh ? '加载演示预设' : 'Quick Presets Loader'}
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map(key => (
              <button
                key={key}
                id={`preset-${key}`}
                disabled={isRunning}
                onClick={() => loadPreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                  selectedPreset === key 
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{PRESETS[key].name.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Configurations Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              <span>{isZh ? '配置出海 Brief' : 'Configure Campaign Brief'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{isZh ? '项目及 IP 名称' : 'IP / Asset Name'}</label>
                <input 
                  type="text"
                  value={ipName}
                  disabled={isRunning}
                  onChange={(e) => setIpName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-sm outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{isZh ? '起源意义或品牌资产' : 'Culture Asset Foundation'}</label>
                <input 
                  type="text"
                  value={cultureAsset}
                  disabled={isRunning}
                  onChange={(e) => setCultureAsset(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-sm outline-none transition"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{isZh ? '出海核心业务目标' : 'Aspirational Business Goal'}</label>
                <input 
                  type="text"
                  value={businessGoal}
                  disabled={isRunning}
                  onChange={(e) => setBusinessGoal(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-sm outline-none transition"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{isZh ? '情绪内核 (Emotional Kernel)' : 'Core Emotional Kernels'}</label>
                <input 
                  type="text"
                  value={emotionalKernelText}
                  disabled={isRunning}
                  onChange={(e) => setEmotionalKernelText(e.target.value)}
                  placeholder="e.g. self-care, rain ambient, silence protection"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-sm outline-none transition"
                />
                <span className="text-[10px] text-slate-500 block leading-none">{isZh ? '用逗号分隔，代表角色或资产最深沉的心灵感应点。' : 'Separate kernels by commas. These define the emotional deconjugation anchor triggers.'}</span>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{isZh ? '品牌基调 / 风格语气' : 'Brand Tone & Atmosphere'}</label>
                <input 
                  type="text"
                  value={brandTone}
                  disabled={isRunning}
                  onChange={(e) => setBrandTone(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-sm outline-none transition"
                />
              </div>

              {/* Target Markets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">{isZh ? '目标大区 (RAG命名防偏命名空间)' : 'Target RAG Regions'}</label>
                <div className="flex gap-2">
                  {['North America', 'Latin America'].map(region => (
                    <button
                      key={region}
                      disabled={isRunning}
                      onClick={() => toggleRegion(region)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                        targetRegions.includes(region)
                          ? 'bg-cyan-500/10 border-cyan-450 text-cyan-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Platforms */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">{isZh ? '目标自媒体平台' : 'Target Media Outlets'}</label>
                <div className="flex flex-wrap gap-1.5">
                  {['TikTok', 'Instagram Reels', 'YouTube Shorts'].map(platform => (
                    <button
                      key={platform}
                      disabled={isRunning}
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                        targetPlatforms.includes(platform)
                          ? 'bg-purple-500/10 border-purple-450 text-purple-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Must Have Constraints & Must Not Prohibits */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-teal-400 uppercase tracking-wide block">
                  {isZh ? 'Must-Have 基因约束' : 'Must-Have Core Directives'}
                </label>
                <textarea
                  value={mustHaveText}
                  disabled={isRunning}
                  onChange={(e) => setMustHaveText(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-805 hover:border-slate-750 focus:border-teal-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-xs min-h-[60px] outline-none transition line-normal"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-red-400 uppercase tracking-wide block">
                  {isZh ? 'Must-Not 刚性严禁红线 (合规回退引擎检测指标)' : 'Must-Not Strict Boundaries'}
                </label>
                <textarea
                  value={mustNotText}
                  disabled={isRunning}
                  onChange={(e) => setMustNotText(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-805 hover:border-slate-750 focus:border-red-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-xs min-h-[60px] outline-none transition line-normal"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>DB Size: 2.1 MB | Ready</span>
              </span>

              <button
                id="btn-run-workflow"
                onClick={startSimulation}
                disabled={isRunning || !ipName || targetRegions.length === 0}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 disabled:opacity-40 disabled:pointer-events-none transform hover:-translate-y-0.5 active:translate-y-0 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/10 flex items-center gap-2 cursor-pointer transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isZh ? '启动 7-Agent 对抗工作流' : 'Execute 7-Agent Red Pipeline'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Console & Active Execution state */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Status Header */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{isZh ? '实时管线监控监视器' : 'Live Pipe Monitor'}</span>
            </h3>

            {/* Simulated Live Terminal */}
            <div className="border border-slate-950 bg-slate-950/90 rounded-xl overflow-hidden font-mono text-xs flex flex-col h-[340px]">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-950 flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Agent Stream Trace</span>
                </span>
                <span className="text-[10px]">9600 bps</span>
              </div>

              {/* Scrolling Console Content */}
              <div ref={logConsoleRef} className="flex-1 p-4 space-y-3.5 overflow-y-auto leading-relaxed select-text select-all">
                {simulationLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700" />
                    <span>{isZh ? '等待流程被唤醒...' : 'Waiting for trigger payload...'}</span>
                    <span className="text-[10px] block">{isZh ? '点击左侧启动工作流，查看高拟真流' : 'Press Run to launch sequential trace logs.'}</span>
                  </div>
                ) : (
                  simulationLogs.map((log, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-slate-950 pb-0.5">
                        <span>[{log.timestamp}] @{log.agent}</span>
                        <span className={`uppercase font-bold ${
                          log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-amber-300' : log.type === 'success' ? 'text-green-400' : 'text-cyan-400'
                        }`}>{log.event}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed break-words ${
                        log.type === 'error' ? 'text-red-300 bg-red-500/5 p-2 rounded border border-red-500/10' : log.type === 'warning' ? 'text-amber-200 bg-amber-500/5 p-2 rounded border border-amber-500/10' : log.type === 'success' ? 'text-green-400' : 'text-slate-300'
                      }`}>
                        {log.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Custom loop fallback indicator */}
            {currentStepIndex === 5 && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <RotateCw className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <strong className="text-xs text-red-200 block">
                      {retryLoopCount === 1 ? (isZh ? '正在循环重写中..' : 'Fallback mutated draft active..') : (isZh ? 'Compliance Blocked' : 'Comp audit flagged errors!')}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {isZh ? '自适应循环回退控制: 第一轮重写过滤...' : 'Re-routing ad pack text back to strategy...'}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-500/20 font-bold uppercase tracking-wider font-mono">
                  Redux Loop
                </span>
              </div>
            )}
          </div>

          {/* Local Run History list */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 border-b border-slate-850 pb-2 flex items-center justify-between">
              <span>{isZh ? '本地运行 Trace 记录' : 'Local Run Persistence Logs'}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold">
                {runHistory.length} Total
              </span>
            </h3>

            {runHistory.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-2">{isZh ? '暂无本地运行存档' : 'No persistent entries loaded.'}</p>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {runHistory.map(hist => (
                  <div
                    key={hist.id}
                    onClick={() => setActiveRunId(hist.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      activeRunId === hist.id
                        ? 'bg-amber-500/5 border-amber-450 text-amber-200'
                        : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                      <strong>{hist.id}</strong>
                      <span className="text-slate-500">({hist.timestamp})</span>
                      <span className="text-slate-300 block truncate max-w-[120px]">{hist.ipName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-green-500/10 text-green-400 border border-green-500/15">
                        Pass
                      </span>
                      <button
                        onClick={(e) => deleteHistory(hist.id, e)}
                        className="p-1 rounded text-slate-650 hover:bg-slate-800 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
