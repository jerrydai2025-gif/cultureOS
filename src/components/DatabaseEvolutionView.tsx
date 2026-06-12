import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Sparkles, RefreshCw, Layers, History, Check, AlertTriangle, 
  ArrowRight, Tag, HelpCircle, Flame, Plus, Play, ChevronRight, CheckCircle2, FileText
} from 'lucide-react';
import { RagEntry, RagFeedback, EvolutionTrace } from '../types';
import { INITIAL_RAG_ENTRIES } from '../data/rag_presets';

interface DatabaseEvolutionViewProps {
  lang: 'zh' | 'en';
}

export default function DatabaseEvolutionView({ lang }: DatabaseEvolutionViewProps) {
  const isZh = lang === 'zh';

  // State
  const [entries, setEntries] = useState<RagEntry[]>(() => {
    try {
      const saved = localStorage.getItem('cultureos_rag_entries');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load initial RAG store", e);
    }
    return INITIAL_RAG_ENTRIES;
  });
  const [selectedEntryId, setSelectedEntryId] = useState<string>('rag-001');
  const [isEvolving, setIsEvolving] = useState(false);
  const [modelProvider, setModelProvider] = useState<'gemini' | 'deepseek'>('gemini');
  const [customFeedback, setCustomFeedback] = useState<string>('');
  const [feedbackSource, setFeedbackSource] = useState<string>('TikTok Comments');
  
  // Real-time trace lists
  const [evolutionLog, setEvolutionLog] = useState<EvolutionTrace[]>([]);
  const [currentTraceIndex, setCurrentTraceIndex] = useState<number>(-1);
  const [reasoningResult, setReasoningResult] = useState<string>('');
  const [mutatedEntryData, setMutatedEntryData] = useState<any | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [evolutionSuccess, setEvolutionSuccess] = useState(false);

  // Initialize and sync presets to localStorage if not exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cultureos_rag_entries');
      if (!saved) {
        localStorage.setItem('cultureos_rag_entries', JSON.stringify(INITIAL_RAG_ENTRIES));
      }
    } catch (e) {
      console.warn("Could not write RAG presets to localStorage", e);
    }
  }, []);

  const activeEntry = entries.find(e => e.id === selectedEntryId) || entries[0];

  // Quick feedback templates
  const feedbackTemplates = [
    {
      label: isZh ? '拉美配乐单调低沉反馈' : 'Mexico low conversion & slow beat',
      source: 'TikTok LATAM Audience',
      content: isZh 
        ? '拉美观众反馈：木吉他氛围很温暖，但70BPM的Lo-fi敲击和雨声有点太致郁，感觉缺乏阳光市井气，希望加入稍微开朗一点的小排笛或手摇沙锤节拍。'
        : 'LATAM performance feed: Nylon guitar was cozy, but the heavy rain Lofi rhythm felt too isolating and depressing. Request sunset community vibe with cheerful percussion or pan flute.',
      icon: '🎵'
    },
    {
      label: isZh ? '北美焦虑宣称违规警告' : 'US anxiety claim warning',
      source: 'Compliance Audit Council',
      content: isZh 
        ? '北美法律红线警示：在文案中用到的 "curb all your nighttime anxieties" (遏制你的黑夜焦虑) 原版，在美加地区有被起诉“涉嫌虚假医疗或无证心理治疗暗示”的风险！必须立即将治愈、疗效类宣称回退修改为纯氛围意境描述。'
        : 'Standard compliance: Original tagline "curb all your nighttime anxieties" violates US FTC regulations for non-medical ads! Needs immediate rollback to atmospheric, non-clinical description only.',
      icon: '⚠️'
    }
  ];

  const handleApplyTemplate = (tpl: typeof feedbackTemplates[0]) => {
    setCustomFeedback(tpl.content);
    setFeedbackSource(tpl.source);
  };

  // Run evolution trigger
  const triggerEvolution = async () => {
    if (!customFeedback.trim()) return;

    setIsEvolving(true);
    setEvolutionSuccess(false);
    setShowDiff(false);
    setMutatedEntryData(null);
    setReasoningResult('');
    setEvolutionLog([]);
    setCurrentTraceIndex(0);

    const requestBody = {
      entry: activeEntry,
      feedbackContent: customFeedback,
      feedbackSource: feedbackSource,
      provider: modelProvider,
      model: modelProvider === 'gemini' ? 'gemini-3.5-flash' : 'deepseek-chat'
    };

    try {
      // Simulate real-time trace stepping with artificial delay for stunning UI experience
      const initialLogs: EvolutionTrace[] = [
        { timestamp: new Date().toLocaleTimeString(), phase: 'parsing', message: isZh ? `[解析层] 分析负面异常：对 [${feedbackSource}] 的真实抗性做语义分词...` : `[Parsing] Analyzing raw feedback from [${feedbackSource}]...` },
        { timestamp: new Date().toLocaleTimeString(), phase: 'retrieving', message: isZh ? '[检索层] 激活 RAG 匹配：锚定地区「一鹿繁花」文化元数据特征键...' : '[Retrieval] Fetching local Hofstede coordinates & guidelines...' },
        { timestamp: new Date().toLocaleTimeString(), phase: 'reasoning', message: isZh ? '[推演层] 大模型分析：推理大区法律与审美底线，寻找冲突成因...' : '[Reasoning] Simulating cultural and regulatory boundaries to identify conflict origin...' },
        { timestamp: new Date().toLocaleTimeString(), phase: 'mutation', message: isZh ? '[变异层] 知识突变：生成新一代正负向 Must-Have / Must-Not 元边界...' : '[Mutation] Applying dynamic updates to JSON directives schema...' },
        { timestamp: new Date().toLocaleTimeString(), phase: 'verification', message: isZh ? '[验证层] 对抗回检：自我审计以防止进化导致过度泛化或违规偷跑...' : '[Verification] Running safety sandbox verification on evolved constraints...' }
      ];

      // Set logs increment
      setEvolutionLog([initialLogs[0]]);
      
      const res = await fetch('/api/rag/evolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error('Evolution server error.');
      }

      const data = await res.json();

      // Gorgeous stepped animation delay
      for (let i = 1; i < initialLogs.length; i++) {
        await new Promise(r => setTimeout(r, 900));
        setEvolutionLog(prev => [...prev, initialLogs[i]]);
        setCurrentTraceIndex(i);
      }

      await new Promise(r => setTimeout(r, 600));

      if (data.success && data.updatedEntry) {
        setMutatedEntryData(data.updatedEntry);
        setReasoningResult(data.reasoningText);
        setEvolutionLog(prev => [
          ...prev, 
          { timestamp: new Date().toLocaleTimeString(), phase: 'completed', message: isZh ? '🎉 进化计算完成！生成了全新的 V' + data.updatedEntry.version + ' 隔离约束集。' : '🎉 Evolution computed successfully! New V' + data.updatedEntry.version + ' directives compiled.' }
        ]);
        setCurrentTraceIndex(5);
        setEvolutionSuccess(true);
        setShowDiff(true);
      } else {
        throw new Error('Invalid format returned by the RAG model.');
      }

    } catch (e: any) {
      console.error(e);
      setEvolutionLog(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), phase: 'completed', message: isZh ? '❌ 智能体演化被迫中止：' + e.message : '❌ Evolution aborted: ' + e.message }
      ]);
    } finally {
      setIsEvolving(false);
    }
  };

  // Commit updated entry to memory
  const acceptAndCommitEvolution = () => {
    if (!mutatedEntryData) return;

    const updatedList = entries.map(entry => {
      if (entry.id === selectedEntryId) {
        const newFeedback: RagFeedback = {
          id: 'fb-' + Date.now().toString().slice(-4),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          source: feedbackSource,
          content: customFeedback,
          sentiment: 'negative'
        };

        const newChangeLog = {
          version: mutatedEntryData.version,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          triggerFeedbackId: newFeedback.id,
          changeSummary: mutatedEntryData.changeLogSummary || 'Feedback adaptive evolution.'
        };

        return {
          ...entry,
          version: mutatedEntryData.version,
          lastUpdated: newChangeLog.timestamp,
          descriptionZh: mutatedEntryData.descriptionZh,
          descriptionEn: mutatedEntryData.descriptionEn,
          coreConcepts: mutatedEntryData.coreConcepts || entry.coreConcepts,
          regionalGuidelines: mutatedEntryData.regionalGuidelines || entry.regionalGuidelines,
          feedbacks: [newFeedback, ...entry.feedbacks],
          changeLogs: [newChangeLog, ...entry.changeLogs]
        };
      }
      return entry;
    });

    setEntries(updatedList);
    localStorage.setItem('cultureos_rag_entries', JSON.stringify(updatedList));

    // Reset loop states
    setMutatedEntryData(null);
    setCustomFeedback('');
    setShowDiff(false);
    setEvolutionSuccess(false);

    alert(isZh ? '🎉 新规则已成功确立合并并写入自进化 RAG 数据库！出海创意管线将实时加载此版新规规避红线。' : '🎉 New evolved directives successfully committed and saved to your RAG store! The campaign desk will instantly read this schema for compliance audits.');
  };

  if (!activeEntry) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 font-mono text-sm">
        {isZh ? '正在加载 RAG 数据库...' : 'Loading RAG Database...'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner Intro */}
      <div className="border border-slate-800/80 p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-400">
              RAG Dynamic Evolution
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6.5 h-6.5 text-cyan-400" />
            <span>{isZh ? '知识库自进化中心' : 'RAG Evolutionary Hub'}</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {isZh 
              ? '探讨 RAG 知识库与大区文化的自我成长流转方案。输入或加载营销反馈、违法警告及点击率波动数据，底层代理将重塑「一鹿繁花」文化映射的正负向刚性约束，自我调整进化。'
              : 'Construct and evolve your cultural mapping metadata dynamically. Run AI mutations on compliance warnings or user friction logs to auto-tune rules without manual updates.'}
          </p>
        </div>

        <div className="flex-shrink-0 flex bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          <button 
            onClick={() => setModelProvider('gemini')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${modelProvider === 'gemini' ? 'bg-cyan-550 text-white' : 'text-slate-550 hover:text-slate-300'}`}
          >
            Gemini 3.5
          </button>
          <button 
            onClick={() => setModelProvider('deepseek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${modelProvider === 'deepseek' ? 'bg-cyan-550 text-white' : 'text-slate-550 hover:text-slate-300'}`}
          >
            DeepSeek
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Modules List & Detail preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* List Entries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                onClick={() => {
                  setSelectedEntryId(entry.id);
                  setMutatedEntryData(null);
                  setShowDiff(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between h-[120px] ${
                  selectedEntryId === entry.id
                    ? 'bg-cyan-550/5 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2 text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded font-bold">{entry.category.toUpperCase()}</span>
                    <span>Ver {entry.version}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 truncate">{entry.name}</h4>
                  <p className="text-xs text-slate-450 line-clamp-1 mt-1">
                    {isZh ? entry.descriptionZh : entry.descriptionEn}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-right flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Update: {entry.lastUpdated.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Entry Detail */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-6 shadow-md relative">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">ACTIVE RAG SCHEMA</span>
                <h3 className="font-black text-lg text-white">{activeEntry.name}</h3>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                <p>Ver {activeEntry.version}</p>
                <p className="text-[10px] text-slate-500">{activeEntry.lastUpdated}</p>
              </div>
            </div>

            {/* Core Concepts */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isZh ? '元特征基因定义' : 'Ontological Concepts & Tokens'}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEntry.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900 space-y-2">
                    <p className="text-xs font-bold text-cyan-300 font-mono">{isZh ? concept.name : concept.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {concept.values.map((v, vIdx) => (
                        <span key={vIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Rules Detail */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isZh ? '正负向区域过滤指令系统' : 'Region Bi-Directional Active Directives'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEntry.regionalGuidelines.map((guideline, gIdx) => (
                  <div key={gIdx} className="border border-slate-800/60 rounded-xl bg-slate-950/40 overflow-hidden flex flex-col justify-between">
                    <div className="bg-slate-900/65 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
                      <strong className="text-xs text-slate-300 font-sans">{guideline.region}</strong>
                      <div className="flex gap-1">
                        {guideline.vibeStickers.map((sticker, sIdx) => (
                          <span key={sIdx} className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {sticker}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      {/* Must haves */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-green-400 block font-black uppercase">✔ Must-Have (加分基因)</span>
                        <ul className="text-xs text-slate-300 space-y-1 list-none">
                          {guideline.mustHaves.map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-1 pb-1 border-b border-slate-900/20">
                              <span className="text-green-500 font-bold">+</span>
                              <span className="leading-snug">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Must nots */}
                      <div className="space-y-1 pt-2">
                        <span className="text-[9px] font-mono text-red-400 block font-black uppercase">✘ Must-Not (熔断红线)</span>
                        <ul className="text-xs text-slate-300 space-y-1 list-none">
                          {guideline.mustNots.map((n, nIdx) => (
                            <li key={nIdx} className="flex items-start gap-1 pb-1 border-b border-slate-900/20 text-slate-400">
                              <span className="text-red-500 font-bold">-</span>
                              <span className="leading-snug">{n}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Version ChangeLogs list */}
            <div className="space-y-2.5 pt-3">
              <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isZh ? '进化突变历史与版本修订' : 'Evolutionary Mutation History'}</span>
              </h4>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {activeEntry.changeLogs && activeEntry.changeLogs.map((log, lIdx) => (
                  <div key={lIdx} className="p-3 rounded-lg bg-slate-950/50 border border-slate-900 text-xs flex justify-between gap-4 font-mono">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-black">
                          v{log.version}
                        </span>
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans mt-1">{log.changeSummary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Seeded Feedbacks list */}
            {activeEntry.feedbacks.length > 0 && (
              <div className="space-y-2.5 pt-3">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isZh ? '已存储的历史受众反馈' : 'Ingested Feedbacks Archive'}</span>
                </h4>
                <div className="space-y-2 max-h-[145px] overflow-y-auto">
                  {activeEntry.feedbacks.map((fb, fIdx) => (
                    <div key={fb.id} className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>[{fb.timestamp}] - {fb.source}</span>
                        <span className={`capitalize font-bold px-1.5 py-0.1 rounded text-[9px] ${fb.sentiment === 'positive' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {fb.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed font-sans">{fb.content}</p>
                      {fb.impactMetrics && (
                        <p className="text-[10px] text-amber-400/85 font-mono">Impact: {fb.impactMetrics}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ingest feedback and run evolution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Loop Ingestion Form */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{isZh ? '注入反馈以启动进化优化' : 'Inject Feedback Delta'}</span>
            </h3>

            {/* Ingestion Templates Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                {isZh ? '一键载入抗性测试场景 (墨西哥/美加)' : 'Load Scenario Presets'}
              </span>
              <div className="space-y-2">
                {feedbackTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 text-xs border border-slate-850 hover:bg-slate-900 hover:border-slate-800 hover:text-white transition flex items-start gap-3 cursor-pointer"
                  >
                    <span className="text-lg flex-shrink-0 pt-0.5">{tpl.icon}</span>
                    <div className="space-y-0.5 min-w-0">
                      <strong className="block text-slate-300 font-sans truncate">{tpl.label}</strong>
                      <span className="block text-[10px] text-slate-500 font-mono">{tpl.source}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom inputs */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">{isZh ? '反馈来源名称' : 'Feedback Source Node'}</label>
                <input
                  type="text"
                  value={feedbackSource}
                  disabled={isEvolving}
                  onChange={(e) => setFeedbackSource(e.target.value)}
                  placeholder="e.g. TikTok LATAM General Comments, Red-team compliance"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-xs outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">{isZh ? '反馈或警告内容大纲' : 'Raw Feedback Text'}</label>
                <textarea
                  value={customFeedback}
                  disabled={isEvolving}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder={isZh ? '输入具体的用户评价波动，或合规警示。比如：拉美夕阳太冷，需要沙锤节奏...' : 'Explain the campaign feedback warning. For example, US legal warned against stating curb daytime anxieties...'}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-cyan-400 font-medium px-4 py-2.5 rounded-xl text-slate-200 text-xs min-h-[110px] outline-none transition line-normal"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <button
                onClick={triggerEvolution}
                disabled={isEvolving || !customFeedback.trim()}
                className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 disabled:opacity-40 disabled:pointer-events-none transform hover:-translate-y-0.5 active:translate-y-0 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RefreshCw className={`w-4 h-4 ${isEvolving ? 'animate-spin' : ''}`} />
                <span>{isZh ? '启动大模型知识自进化' : 'Evolve Guidelines via AI'}</span>
              </button>
            </div>
          </div>

          {/* Stepped Thinking Terminal */}
          {(isEvolving || evolutionLog.length > 0) && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black flex items-center justify-between">
                <span>REVOLVING EVOLUTION TRACE (进化链路跟踪)</span>
                {isEvolving && <span className="text-[9px] text-amber-400 animate-pulse font-bold">{isZh ? '推演中' : 'EVOLVING'}</span>}
              </h3>

              {/* Streaming Logs */}
              <div className="space-y-3 font-mono text-xs text-slate-350 max-h-[300px] overflow-y-auto leading-relaxed">
                {evolutionLog.map((log, idx) => (
                  <div key={idx} className="space-y-0.5 text-[11px] pb-1.5 border-b border-slate-900/40">
                    <p className="text-slate-500 font-bold">[{log.timestamp}]</p>
                    <p className={`font-black ${idx === currentTraceIndex ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {log.message}
                    </p>
                    {log.details && (
                      <p className="text-slate-400 text-[10px] pl-2 border-l border-slate-800 leading-normal mt-0.5">{log.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning Insights Card */}
          {evolutionSuccess && reasoningResult && (
            <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-550/5 space-y-2.5">
              <strong className="text-xs uppercase font-mono text-cyan-300 block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-bounce" />
                <span>{isZh ? '突变逻辑合理性自评估' : 'Mutation Analysis'}</span>
              </strong>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{reasoningResult}</p>
            </div>
          )}

          {/* Evolved schema DIFF View & Merge commit button */}
          {showDiff && mutatedEntryData && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-amber-500/25 space-y-5 animate-fadeIn">
              <h3 className="text-xs font-mono text-amber-300 uppercase tracking-widest font-black flex items-center justify-between">
                <span>{isZh ? '突变前后 Schema 差值比对' : 'Directives Evolution Diff'}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-550/20 text-[9px] font-bold">
                  VER: {activeEntry.version} ➔ {mutatedEntryData.version}
                </span>
              </h3>

              <div className="space-y-4">
                {mutatedEntryData.regionalGuidelines.map((mutatedGuideline: any, idx: number) => {
                  const originalGuideline = activeEntry.regionalGuidelines.find(r => r.region === mutatedGuideline.region) || activeEntry.regionalGuidelines[0];
                  
                  return (
                    <div key={idx} className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 border-b border-slate-900 pb-1.5">{mutatedGuideline.region}</h4>
                      
                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">{isZh ? '演变增量 (Evolutions)' : 'Directives Evolved'}</span>
                          <div className="space-y-1 mt-1 pl-2 border-l border-cyan-500/30">
                            {/* Compare array items to highlight changes */}
                            {mutatedGuideline.mustHaves.map((mH: string, mHIdx: number) => {
                              const isNew = !originalGuideline.mustHaves.includes(mH);
                              return (
                                <p key={mHIdx} className={`leading-normal ${isNew ? 'text-green-300 font-bold bg-green-500/5 px-1 py-0.5 rounded' : 'text-slate-400'}`}>
                                  {isNew ? '★ [ADD] ' : '• '} {mH}
                                </p>
                              );
                            })}

                            {mutatedGuideline.mustNots.map((mN: string, mNIdx: number) => {
                              const isNew = !originalGuideline.mustNots.includes(mN);
                              return (
                                <p key={mNIdx} className={`leading-normal ${isNew ? 'text-red-300 font-bold bg-red-500/5 px-1 py-0.5 rounded' : 'text-slate-400'}`}>
                                  {isNew ? '✦ [RESTRICT] ' : '• '} {mN}
                                </p>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-slate-500 font-black block uppercase">{isZh ? '修订快照 (Version Change Summary)' : 'Revision Log'}</span>
                          <p className="text-xs text-amber-200/90 font-mono mt-0.5 italic">{mutatedEntryData.changeLogSummary || 'Feedback absorption'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Commit button */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={acceptAndCommitEvolution}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-350 hover:to-emerald-200 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow-md flex items-center justify-center gap-2 cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CheckCircle2 className="w-4 h-4 fill-current text-slate-950" />
                  <span>{isZh ? '合并增量规则，确立升级系统库' : 'Confirm Evolution & Save to DB'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
