import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Sparkles, Network, Orbit, TrendingUp, GitPullRequest, 
  Cpu, Award, ArrowRight, Layers, Star, Compass, Play, 
  CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, 
  Flame, ChevronRight, Users, Plus, Search, Check, Info, ShieldAlert
} from 'lucide-react';
import { RagEntry, RagFeedback } from '../types';

interface StrategicStarChartProps {
  isZh: boolean;
  entries: RagEntry[];
  setEntries: React.Dispatch<React.SetStateAction<RagEntry[]>>;
  selectedEntryId: string;
  setSelectedEntryId: (id: string) => void;
  setSubTab: (tab: 'starchart' | 'evolution' | 'cases') => void;
  onFeedbackSimulated?: () => void;
}

// Static fallback nodes representing original framework for completeness
interface OriginalNode {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  x: number;
  y: number;
  glowColor: string;
}

export default function StrategicStarChart({ 
  isZh, 
  entries = [], 
  setEntries, 
  selectedEntryId, 
  setSelectedEntryId,
  setSubTab,
  onFeedbackSimulated
}: StrategicStarChartProps) {
  // Toggle between dynamic database stars vs static strategic blueprint framework
  const [constellationType, setConstellationType] = useState<'dynamic' | 'static'>('dynamic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Simulation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [flaringNodeId, setFlaringNodeId] = useState<string | null>(null);
  const [isPositiveFlare, setIsPositiveFlare] = useState<boolean>(true);
  const [simulationLog, setSimulationLog] = useState<{ id: string; text: string; type: 'success' | 'alert' }[]>([]);

  // Static original constellation nodes
  const staticNodes: OriginalNode[] = [
    {
      id: 'blueprint',
      nameZh: '最终战略定位蓝图',
      nameEn: 'Core Strategy Blueprint',
      descriptionZh: '中国文化热点的 AI 内容转译与 IP 资产化系统：阿琪是我 (前台 IP) × CultureOS (后台产品)',
      descriptionEn: 'Chinese Hot-spots to Outbound AI Content Translation and IP Assetization System',
      category: 'blueprint',
      x: 400,
      y: 300,
      glowColor: 'shadow-cyan-500/80 text-cyan-400 border-cyan-400'
    },
    {
      id: 'monetization',
      nameZh: 'Top X 创作者盈利模式',
      nameEn: 'IP Creator Monetization Map',
      descriptionZh: '解密五大生态商业模式：工具产品型、知识资产型、广告流量型、资讯聚合型、品牌商用型',
      descriptionEn: 'Five major monetization frameworks: tools, intellectual assets, ads, newsletters & brands',
      category: 'monetization',
      x: 180,
      y: 180,
      glowColor: 'shadow-emerald-500/80 text-emerald-400 border-emerald-400'
    },
    {
      id: 'signal',
      nameZh: '五层底层信号系统',
      nameEn: '5-Tier Bottom Signal Map',
      descriptionZh: '捕获确定性红利：世界级合规、文化级图腾、平台级算法、商业级转化、自我能力基因',
      descriptionEn: 'Global laws, local totems, algorithmic hooks, commercial bidding & individual assets',
      category: 'signal',
      x: 620,
      y: 170,
      glowColor: 'shadow-amber-500/80 text-amber-400 border-amber-400'
    },
    {
      id: 'players',
      nameZh: '全球生态玩家地图',
      nameEn: 'Ecosystem Player Matrix',
      descriptionZh: '上下游全链路价值链拆解：热点 IP、TikTok/YT 平台、创作者、To C 情感用户、To B 出海品牌',
      descriptionEn: 'Full ecosystem synergy: upstream IPs, platforms, AI creators, To C users & To B brands',
      category: 'players',
      x: 150,
      y: 420,
      glowColor: 'shadow-violet-500/80 text-violet-400 border-violet-400'
    },
    {
      id: 'strategy',
      nameZh: '打法地图：一体两翼三阶段',
      nameEn: 'The Tactical Pathway Map',
      descriptionZh: '核心 IP + 内容翼 + 产品翼，本地验证、案例产品化到全球生态协作的演进图腾',
      descriptionEn: 'Core IP + Content Wing + Product Wing: Local proof, packing CulturePack & global growth',
      category: 'strategy',
      x: 650,
      y: 430,
      glowColor: 'shadow-rose-500/80 text-rose-400 border-rose-400'
    },
    {
      id: 'assets',
      nameZh: '资源资产化与赛道诊断',
      nameEn: 'Resource Assetization & Diagnosis',
      descriptionZh: '四大资产化体系（能力、案例、关系、工具/数据）与华语青春记忆垂直赛道红利诊断',
      descriptionEn: 'Transforming custom triggers into reusable IP value. Track analysis for high margin scale.',
      category: 'assets',
      x: 400,
      y: 90,
      glowColor: 'shadow-blue-500/80 text-blue-400 border-blue-400'
    }
  ];

  // Set the first item of entries as active selection if none is selected
  useEffect(() => {
    if (entries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId, setSelectedEntryId]);

  // Compute stats of the dynamic database
  const totalEntries = entries.length;
  const combinedVersions = entries.reduce((acc, entry) => acc + (parseFloat(entry.version) || 1.0), 0).toFixed(1);
  const totalFeedbacks = entries.reduce((acc, entry) => acc + (entry.feedbacks?.length || 0), 0);
  
  // Calculate compliance safety rating (negative feedback / total feedback)
  const totalNegatives = entries.reduce((acc, entry) => 
    acc + (entry.feedbacks?.filter(f => f.sentiment === 'negative').length || 0), 0
  );
  const safetyRating = totalFeedbacks > 0 
    ? Math.round(100 - (totalNegatives / totalFeedbacks) * 100) 
    : 100;

  // Group and assign dynamic polar coordinates inside SVG viewBox="0 0 800 600"
  const centerX = 400;
  const centerY = 300;

  const getCategoryDistance = (category: string) => {
    switch (category) {
      case 'symbol': return 95;      // Inner circle - core IP assets
      case 'regulatory': return 160;  // Inner-middle circle - rigid boundaries
      case 'music_visual': return 220; // Middle-outer - sensory mechanics
      case 'audience': return 275;    // Outer - localization matching
      case 'case_study': return 330;  // Far outer - industry proven models
      default: return 220;
    }
  };

  const categoryOffsets: Record<string, number> = {
    symbol: 0,
    regulatory: Math.PI / 4,
    music_visual: Math.PI / 2,
    audience: 3 * Math.PI / 4,
    case_study: Math.PI
  };

  const getCategoryThemeColor = (category: string) => {
    switch (category) {
      case 'symbol': return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400', stroke: '#22d3ee', glow: 'shadow-cyan-500/80' };
      case 'regulatory': return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-400', stroke: '#f43f5e', glow: 'shadow-rose-500/80' };
      case 'music_visual': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-400', stroke: '#f59e0b', glow: 'shadow-amber-500/80' };
      case 'audience': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400', stroke: '#a855f7', glow: 'shadow-purple-500/80' };
      case 'case_study': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-400', stroke: '#10b981', glow: 'shadow-emerald-500/80' };
      default: return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-400', stroke: '#94a3b8', glow: 'shadow-slate-500/80' };
    }
  };

  // Group entries to calculate index per category to avoid overlapping
  const categoryCounts: Record<string, number> = {};
  const categoryIndices: Record<string, number> = {};

  entries.forEach(entry => {
    const cat = entry.category || 'symbol';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const processedNodes = entries.map(entry => {
    const cat = entry.category || 'symbol';
    const totalInCat = categoryCounts[cat];
    const indexInCat = categoryIndices[cat] || 0;
    categoryIndices[cat] = indexInCat + 1;

    const radius = getCategoryDistance(cat);
    const startOffset = categoryOffsets[cat] || 0;
    const angle = totalInCat > 1 
      ? startOffset + (indexInCat / totalInCat) * 2 * Math.PI 
      : startOffset;

    // Calculate node coordinates
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Dynamic size scaling: based on feedbacks + version mutations
    const feedbackCount = entry.feedbacks?.length || 0;
    const versionNum = parseFloat(entry.version) || 1.0;
    const baseSize = 28;
    const weight = feedbackCount * 3 + (versionNum - 1.0) * 10;
    const size = Math.min(68, Math.max(28, baseSize + weight));

    return {
      ...entry,
      x,
      y,
      size,
      theme: getCategoryThemeColor(cat)
    };
  });

  // Filter dynamic nodes
  const filteredNodes = processedNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.descriptionZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || node.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Find selected active node
  const activeNode = processedNodes.find(n => n.id === selectedEntryId) || processedNodes[0];

  // original framework's currently selected static node
  const [activeStaticId, setActiveStaticId] = useState<string>('blueprint');
  const activeStaticNode = staticNodes.find(s => s.id === activeStaticId) || staticNodes[0];

  // Preset feedback messages for dynamic simulation
  const positivePresets = [
    { text: "北美Reddit出海社区强烈点赞此音画策略！完播率拉升了28%，网友自发配图传播。", source: "Reddit Outbound Community" },
    { text: "拉美TikTok实测：更换了木吉他与温和排箫配乐后，墨西哥观众停留时长突破22秒！", source: "TikTok LatAm Live Stats" },
    { text: "YouTube Shorts数据：国潮古风元素重新打包，二代移民华人转发分享量翻了3倍。", source: "YouTube Analytics" },
    { text: "拉美DTC电商转化：与本地手工艺故事IP联名分发，CTR相比常规贴片广告暴涨38%！", source: "DTC Merchant Group" }
  ];

  const complianceRiskPresets = [
    { text: "北美FTC合规红牌：警告，视频描述中含有‘本音频保证100%催眠’等绝对药效说辞，涉嫌无证医学暗示，须立即修订！", source: "FTC Legal Scanner" },
    { text: "拉美天主教区反馈风险：发光圆环不符合当地视觉去神秘化TOS，被标记为疑似擦边宗教元素，可能遭到平台限流。", source: "LatAm Cultural Board" },
    { text: "TikTok版权系统：视频第11秒至14秒音轨卡点与已有曲目雷同度达15%，触发自动二次合规调校指令。", source: "Copyright Safeguard Agent" },
    { text: "YouTube算法预警：高频Lo-Fi深夜低音撞击声可能导致部分敏感听众生理不适，被下调绿标指数，需降噪55BPM。", source: "YouTube Safety Council" }
  ];

  // Ingest Feedback Simulation
  const handleSimulateFeedback = (isPositive: boolean) => {
    if (!activeNode) return;
    setIsSimulating(true);
    setFlaringNodeId(activeNode.id);
    setIsPositiveFlare(isPositive);

    // Pick a preset randomly
    const presets = isPositive ? positivePresets : complianceRiskPresets;
    const selectedPreset = presets[Math.floor(Math.random() * presets.length)];

    setTimeout(() => {
      // Create new feedback object
      const newFeedback: RagFeedback = {
        id: `fb-sim-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        source: selectedPreset.source,
        content: selectedPreset.text,
        sentiment: isPositive ? 'positive' : 'negative',
        impactMetrics: isPositive 
          ? 'CTR raised by 22.8% | Organic Feed push' 
          : 'Compliance Advisory: HIGH | Required Revision'
      };

      // Increment version of the mutated entry
      const currentVerNum = parseFloat(activeNode.version) || 1.0;
      const nextVerNum = (currentVerNum + 0.1).toFixed(1);

      // Create mutated entry
      const updatedEntries = entries.map(item => {
        if (item.id === activeNode.id) {
          const updatedFeedbacks = [newFeedback, ...(item.feedbacks || [])];
          const updatedChangeLogs = [
            {
              version: nextVerNum,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              triggerFeedbackId: newFeedback.id,
              changeSummary: isPositive 
                ? `[数据吞吐进化] 注入用户真实流量意见，核心基因尺寸膨胀，版本升级至 v${nextVerNum}。` 
                : `[安全机制修订] 捕获大区合规警告，系统自动自适应调校RAG约束，重构北美/拉美规章，迭代至 v${nextVerNum}。`
            },
            ...(item.changeLogs || [])
          ];

          return {
            ...item,
            version: nextVerNum,
            lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
            feedbacks: updatedFeedbacks,
            changeLogs: updatedChangeLogs
          };
        }
        return item;
      });

      // Update parent state & storage
      setEntries(updatedEntries);
      localStorage.setItem('cultureos_rag_entries', JSON.stringify(updatedEntries));
      
      // Notify parent of feedback simulation event to update onboarding
      onFeedbackSimulated?.();

      // Append to local sim log
      setSimulationLog(prev => [
        {
          id: `log-${Date.now()}`,
          text: isZh 
            ? `【星宿进化成功】已向 [${activeNode.name}] 注入 [${newFeedback.source}] 数据！节点版本升级至 v${nextVerNum}，受众体积扩大。`
            : `[Constellation Grown] Injected data to [${activeNode.name}]! Updated to v${nextVerNum}.`,
          type: isPositive ? 'success' : 'alert'
        },
        ...prev
      ]);

      setIsSimulating(false);
      
      // Keep flare animation active for a short while, then remove
      setTimeout(() => {
        setFlaringNodeId(null);
      }, 1000);

    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Dynamic Galactic Header / Control Deck */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-[#0a1122] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-24 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-400 tracking-wider">
              CULTURE_OS GALAXY CONSTELLATION MAP
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400">REAL-TIME DB SYNC ACTIVE</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Orbit className="w-6 h-6 text-cyan-400 animate-spin-slow" />
            <span>{isZh ? "数据星图图谱 & RAG自适应基因星系" : "Database Stars Constellation & Adaptive RAG Galaxy"}</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {isZh 
              ? "真正呈现用户录入与编辑的基因数据！每个节点代表一个RAG数据库规则，随着你在此处注入流量反馈或触发AI演变，节点的物理尺寸、亮度、轨道位置和突变版本会自适应发生变化。"
              : "Directly rendering real-time user database entries! Stars grow and brighten as feedback accumulates and versions mutate. Inspect and simulate live content traffic."}
          </p>
        </div>

        {/* Dynamic Database Statistics Panels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 font-mono text-[10px] min-w-[340px] z-10">
          <div className="space-y-1">
            <span className="text-slate-500 block">TOTAL STARS</span>
            <span className="text-cyan-400 font-extrabold text-xs">{totalEntries} {isZh ? '个星宿节点' : 'Nodes'}</span>
          </div>
          <div className="w-px h-8 bg-slate-900 hidden sm:block" />
          <div className="space-y-1">
            <span className="text-slate-500 block">MUTATION INDEX</span>
            <span className="text-amber-400 font-extrabold text-xs">v{combinedVersions} {isZh ? '综合版本' : 'Index'}</span>
          </div>
          <div className="w-px h-8 bg-slate-900 hidden sm:block" />
          <div className="space-y-1">
            <span className="text-slate-500 block">TRAFFIC FEEDBACK</span>
            <span className="text-purple-400 font-extrabold text-xs">{totalFeedbacks} {isZh ? '条吞吐记录' : 'Ingests'}</span>
          </div>
          <div className="w-px h-8 bg-slate-900 hidden sm:block" />
          <div className="space-y-1">
            <span className="text-slate-500 block">COMPLIANCE SAFETY</span>
            <span className="text-emerald-400 font-extrabold text-xs">{safetyRating}% {isZh ? '合规率' : 'Safety'}</span>
          </div>
        </div>
      </div>

      {/* Constellation Type Selector & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-slate-900/40 rounded-xl border border-slate-900">
        
        {/* Toggle between Active RAG Stars vs Static Framework */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConstellationType('dynamic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              constellationType === 'dynamic'
                ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/30 font-extrabold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>{isZh ? 'RAG 动态基因星图 (用户真实数据)' : 'RAG Active DB Stars (Real Data)'}</span>
          </button>
          <button
            onClick={() => setConstellationType('static')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              constellationType === 'static'
                ? 'bg-[#14233c] text-amber-300 border border-amber-500/30 font-extrabold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>{isZh ? 'CultureOS 经典对标星空' : 'CultureOS Classic Constellation'}</span>
          </button>
        </div>

        {/* Interactive Filters for Dynamic Nodes */}
        {constellationType === 'dynamic' && (
          <div className="flex items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-bold focus:border-cyan-500/50 outline-none cursor-pointer"
            >
              <option value="all">{isZh ? '全部轨道星宿' : 'All Orbits'}</option>
              <option value="symbol">{isZh ? '情感 IP 符号 (Inner)' : 'Symbol (Inner)'}</option>
              <option value="regulatory">{isZh ? '防封与合规 (Middle-Inner)' : 'Regulatory (Mid-Inner)'}</option>
              <option value="music_visual">{isZh ? '音画自愈节拍 (Middle)' : 'Music & Visual (Mid)'}</option>
              <option value="audience">{isZh ? '地区受众心智 (Middle-Outer)' : 'Audience (Mid-Outer)'}</option>
              <option value="case_study">{isZh ? '品牌对标案例 (Far Outer)' : 'Brand Cases (Outer)'}</option>
            </select>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? "搜索星图节点..." : "Search stars..."}
                className="pl-8 pr-3 py-1.5 w-40 sm:w-48 bg-slate-950 border border-slate-800 rounded-lg text-[11px] placeholder-slate-550 focus:border-cyan-500/50 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200 text-xs">
                  ×
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Star Map & Inspector Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: THE GORGEOUS SVG COSMIC GALAXY CANVAS */}
        <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-2xl bg-[#030610] border border-slate-800/80 relative min-h-[480px] overflow-hidden group shadow-inner">
          
          {/* Subtle tech coordinates background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#081125_1px,transparent_1px),linear-gradient(to_bottom,#081125_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Map Subheader */}
          <div className="z-10 flex justify-between items-center text-[10px] font-mono text-slate-450 border-b border-slate-900 pb-2 mb-2 select-none">
            <span className="flex items-center gap-1.5 font-bold">
              <Network className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>COSMIC ORBITAL STELLAR RADAR</span>
            </span>
            <span className="text-slate-550">
              {constellationType === 'dynamic' 
                ? (isZh ? "动态 RAG 基因星云：点击恒星可注入流量并促进生长" : "DYNAMIC RAG CLOUDS: SELECT STARS TO EVOLVE") 
                : (isZh ? "战略对标架构：六个静态系统星宿锚" : "STATIC BLUEPRINTS SYSTEM")}
            </span>
          </div>

          {/* DYNAMIC CANVAS (SVG-based for responsive coordinate scale) */}
          <div className="relative w-full aspect-[4/3] min-h-[360px] my-auto z-10 flex items-center justify-center">
            
            <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full select-none">
              
              {/* ORBITAL RING CIRCLES (Guides for dynamic RAG categories) */}
              {constellationType === 'dynamic' && (
                <g opacity="0.3">
                  {/* Orbit Ring 1 - Symbol (radius 95) */}
                  <circle cx="400" cy="300" r="95" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3,6" />
                  <text x="400" y="195" fill="#22d3ee" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.7">ORBIT-01 • SYMBOL</text>
                  
                  {/* Orbit Ring 2 - Regulatory (radius 160) */}
                  <circle cx="400" cy="300" r="160" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4,8" />
                  <text x="400" y="130" fill="#f43f5e" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.7">ORBIT-02 • REGULATORY</text>
                  
                  {/* Orbit Ring 3 - Music & Visual (radius 220) */}
                  <circle cx="400" cy="300" r="220" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,5" />
                  <text x="400" y="70" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.7">ORBIT-03 • SENSORY BEATS</text>

                  {/* Orbit Ring 4 - Audience (radius 275) */}
                  <circle cx="400" cy="300" r="275" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="5,10" />
                  <text x="400" y="15" fill="#a855f7" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.7">ORBIT-04 • AUDIENCE</text>

                  {/* Orbit Ring 5 - Case Study (radius 330) */}
                  <circle cx="400" cy="300" r="330" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="1,4" />
                  <text x="400" y="-40" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.7">ORBIT-05 • CASE STUDY</text>
                </g>
              )}

              {/* CONSTELLATION ENERGY CONNECTORS & PIPELINES */}
              <g>
                {constellationType === 'dynamic' ? (
                  // Connect dynamic nodes back to central hub
                  filteredNodes.map(node => (
                    <g key={`pipeline-${node.id}`} opacity="0.7">
                      {/* Base connection pipeline */}
                      <line
                        x1="400"
                        y1="300"
                        x2={node.x}
                        y2={node.y}
                        stroke={node.theme.stroke}
                        strokeWidth={selectedEntryId === node.id ? "1.5" : "0.75"}
                        strokeDasharray={selectedEntryId === node.id ? "none" : "3,6"}
                        className="transition-all duration-500"
                        opacity={selectedEntryId === node.id ? "0.95" : "0.35"}
                      />
                      
                      {/* Active running packet pulses along the line */}
                      {selectedEntryId === node.id && (
                        <circle r="3.5" fill={node.theme.stroke} className="shadow-lg shadow-cyan-500/50">
                          <animateMotion
                            path={`M 400 300 L ${node.x} ${node.y}`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  ))
                ) : (
                  // Connect static original nodes to central blueprint hub
                  staticNodes.map(node => {
                    if (node.id === 'blueprint') return null;
                    return (
                      <g key={`static-pipeline-${node.id}`} opacity="0.6">
                        <line
                          x1="400"
                          y1="300"
                          x2={node.x}
                          y2={node.y}
                          stroke="#22d3ee"
                          strokeWidth={activeStaticId === node.id ? "1.5" : "0.75"}
                          strokeDasharray={activeStaticId === node.id ? "none" : "5,5"}
                          opacity={activeStaticId === node.id ? "0.9" : "0.4"}
                        />
                        {activeStaticId === node.id && (
                          <circle r="3" fill="#22d3ee">
                            <animateMotion
                              path={`M 400 300 L ${node.x} ${node.y}`}
                              dur="2.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })
                )}
              </g>

              {/* THE CENTRAL ORBIT HUB STAR: CultureOS Core */}
              <g transform="translate(400, 300)" className="cursor-pointer">
                <circle
                  r="24"
                  fill="#020617"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                <circle
                  r="30"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                  className="animate-spin-slow"
                />
                <circle
                  r="12"
                  fill="url(#coreGlow)"
                />
                {/* Rotating atomic tech shape inside core */}
                <path
                  d="M -10 -10 L 10 10 M 10 -10 L -10 10"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <text
                  y="42"
                  fill="#e2e8f0"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {constellationType === 'dynamic' ? 'CultureOS CORE' : 'POSITIONING BLUEPRINT'}
                </text>
              </g>

              {/* DEFINITIONS FOR GRADIENTS */}
              <defs>
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                </radialGradient>
              </defs>

            </svg>

            {/* DYNAMIC DATABASE STELLAR NODES (HTML over SVG for pristine styling and clickability) */}
            {constellationType === 'dynamic' ? (
              filteredNodes.map(node => {
                const isSelected = selectedEntryId === node.id;
                const isFlaring = flaringNodeId === node.id;
                const feedbackCount = node.feedbacks?.length || 0;
                
                // Style positions
                const leftPos = `${(node.x / 800) * 100}%`;
                const topPos = `${(node.y / 600) * 100}%`;

                return (
                  <div
                    key={node.id}
                    style={{ left: leftPos, top: topPos }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-25 flex flex-col items-center group"
                  >
                    {/* Pulsing expand background ring */}
                    {isSelected && (
                      <span className="absolute rounded-full border border-cyan-400/50 animate-ping opacity-60 pointer-events-none" style={{ width: node.size + 14, height: node.size + 14 }} />
                    )}

                    {/* Simulation dynamic flare injection visual wave */}
                    <AnimatePresence>
                      {isFlaring && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 1 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute rounded-full border-4 pointer-events-none"
                          style={{ 
                            width: node.size, 
                            height: node.size,
                            borderColor: isPositiveFlare ? '#10b981' : '#f43f5e' 
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Glowing Beacon Star */}
                    <button
                      onClick={() => {
                        setSelectedEntryId(node.id);
                        setSimulationLog([]); // Clear sim logs for fresh inspection
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      style={{ width: node.size, height: node.size }}
                      className={`rounded-full border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-lg relative ${
                        isSelected 
                          ? `bg-slate-950 scale-110 z-35 ${node.theme.border} ${node.theme.glow}`
                          : `bg-slate-900/90 hover:bg-slate-950 hover:scale-105 border-slate-800`
                      }`}
                    >
                      {/* Icon */}
                      <span className={`text-[11px] ${isSelected ? node.theme.text : 'text-slate-400'}`}>
                        {node.category === 'symbol' && '🎭'}
                        {node.category === 'regulatory' && '🛡️'}
                        {node.category === 'music_visual' && '🎵'}
                        {node.category === 'audience' && '👥'}
                        {node.category === 'case_study' && '🏢'}
                      </span>

                      {/* Small notification badge for active feedback warnings */}
                      {node.feedbacks?.some(f => f.sentiment === 'negative') && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border border-slate-950 flex items-center justify-center text-[7px] font-bold text-white animate-pulse">
                          !
                        </span>
                      )}

                      {/* Small version tag inside star if large enough */}
                      {node.size > 44 && (
                        <span className="text-[7px] font-mono font-black text-slate-500 mt-0.5 uppercase">
                          v{node.version}
                        </span>
                      )}
                    </button>

                    {/* Tiny text label under star */}
                    <div className="absolute top-full mt-2 whitespace-nowrap bg-slate-950/95 px-2 py-0.5 rounded border border-slate-850 text-[9px] font-extrabold font-mono tracking-wide z-20 flex items-center gap-1">
                      <span className={isSelected ? node.theme.text : 'text-slate-400 group-hover:text-slate-200'}>
                        {node.name.split(' ')[0]}
                      </span>
                      <span className="text-slate-600">v{node.version}</span>
                    </div>

                    {/* Tooltip on hovering star */}
                    {hoveredNodeId === node.id && (
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-950/95 p-3 rounded-xl border border-slate-800 text-[10px] w-52 shadow-2xl z-40 text-left pointer-events-none space-y-1">
                        <span className="font-mono text-[8px] text-slate-500 uppercase font-black block tracking-widest">{node.category.toUpperCase()} • v{node.version}</span>
                        <p className="font-bold text-slate-200 text-xs truncate">{node.name}</p>
                        <p className="text-slate-400 leading-normal line-clamp-2">{isZh ? node.descriptionZh : node.descriptionEn}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 mt-1.5 text-slate-500 font-mono text-[9px]">
                          <span>{feedbackCount} FEEDBACKS</span>
                          <span className={node.feedbacks?.some(f => f.sentiment === 'negative') ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {node.feedbacks?.some(f => f.sentiment === 'negative') ? 'REVISION NEEDED' : 'PASS'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // STATIC STELLARS (Original design mapping)
              staticNodes.map(node => {
                const isSelected = activeStaticId === node.id;
                
                // Style positions
                const leftPos = `${(node.x / 800) * 100}%`;
                const topPos = `${(node.y / 600) * 100}%`;

                return (
                  <div
                    key={node.id}
                    style={{ left: leftPos, top: topPos }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                  >
                    <button
                      onClick={() => setActiveStaticId(node.id)}
                      className={`w-11 h-11 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg relative ${
                        isSelected 
                          ? 'bg-slate-950 scale-110 z-30 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                          : 'bg-slate-900 border-slate-850 hover:border-slate-400'
                      }`}
                    >
                      <span className={`text-base ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {node.id === 'blueprint' && '🪐'}
                        {node.id === 'monetization' && '💰'}
                        {node.id === 'signal' && '📡'}
                        {node.id === 'players' && '👥'}
                        {node.id === 'strategy' && '🗺️'}
                        {node.id === 'assets' && '🔬'}
                      </span>

                      {isSelected && (
                        <span className="absolute inset-0 rounded-full border border-cyan-400/50 animate-ping opacity-60 pointer-events-none" />
                      )}
                    </button>

                    <div className="absolute top-12 whitespace-nowrap bg-slate-950/90 px-2 py-0.5 rounded border border-slate-850 text-[9px] font-black font-mono tracking-wide">
                      <span className={isSelected ? 'text-cyan-400' : 'text-slate-450'}>
                        {isZh ? node.nameZh : node.nameEn}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Orbit rings description / Legend */}
          <div className="z-10 p-3.5 rounded-xl bg-slate-950/90 border border-slate-900 text-[11px] leading-relaxed select-none">
            <div className="flex items-center gap-1.5 font-bold text-slate-350 border-b border-slate-900 pb-1.5 mb-1.5">
              <Star className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              <span>{isZh ? "星云图鉴与数据生长释义" : "Stellar Nebula Map Legend"}</span>
            </div>
            
            {constellationType === 'dynamic' ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[9px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>1圈: 情感 IP 符号</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>2圈: 广告合规红线</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>3圈: 音画自愈节拍</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>4圈: 本地受众心智</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>5圈: 品牌出海对标</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">
                {isZh 
                  ? "CultureOS 系统战略星图。点击五个分支分支节点，在右侧面板中获取阿琪是我等效文化转译海报，查看从单体冷启动迈向联盟的路线轨迹。"
                  : "Original CultureOS structural outlines. Highlighting monetization, compliance signaling & player value exchange networks."}
              </p>
            )}
            
            <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isZh 
                  ? "⭐ 节点生长机制：随着吞吐反馈数累积，恒星质量增加（物理半径变大，亮光变强烈），展示真实数据繁盛与AI自更新进程。"
                  : "⭐ Data Growth Mechanism: Ingesting comments triggers custom flaring, physically scaling node visual weight live."}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-TECH ACTIVE STAR INSPECTOR & INJECTOR PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          
          <AnimatePresence mode="wait">
            {constellationType === 'dynamic' ? (
              // 1. DYNAMIC RAG STAR INSPECTOR
              <motion.div
                key={selectedEntryId || 'none'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-2xl bg-[#090f1e] border-2 border-cyan-500/20 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between"
              >
                {/* Tech decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                {activeNode ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="border-b border-slate-900 pb-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest ${activeNode.theme.bg} ${activeNode.theme.text} border ${activeNode.theme.border}/20`}>
                          RAG NODE: {activeNode.id.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <span>VERSION:</span>
                          <span className="text-amber-400 font-extrabold">v{activeNode.version}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-black text-white mt-1 leading-snug">
                        {activeNode.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isZh ? activeNode.descriptionZh : activeNode.descriptionEn}
                      </p>
                    </div>

                    {/* Content concepts & details */}
                    <div className="space-y-3.5 my-3 flex-1 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin">
                      
                      {/* Regional guidelines quick glance */}
                      {activeNode.regionalGuidelines?.[0] && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 space-y-1.5 text-[11px]">
                          <span className="font-extrabold text-cyan-400 block font-mono text-[9px] uppercase tracking-wider">
                            📌 北美大区等效指令 (NA Guidelines)
                          </span>
                          <div className="text-[10px] text-slate-350 space-y-1">
                            <p><strong className="text-slate-200">必须展示:</strong> {activeNode.regionalGuidelines[0].mustHaves?.slice(0, 2).join('；') || '暂无'}</p>
                            <p><strong className="text-slate-200">规避红线:</strong> {activeNode.regionalGuidelines[0].mustNots?.slice(0, 2).join('；') || '暂无'}</p>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Feedbacks history */}
                      <div className="space-y-2">
                        <span className="font-extrabold text-purple-400 block font-mono text-[9px] uppercase tracking-wider">
                          💬 吞吐用户意见库 ({activeNode.feedbacks?.length || 0} Ingested Feedbacks)
                        </span>
                        
                        {activeNode.feedbacks && activeNode.feedbacks.length > 0 ? (
                          <div className="space-y-1.5">
                            {activeNode.feedbacks.slice(0, 2).map((fb, idx) => (
                              <div key={fb.id || idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-950 text-[10px] space-y-0.5">
                                <div className="flex items-center justify-between text-[8px] font-mono">
                                  <span className="text-slate-500 font-bold">{fb.source}</span>
                                  <span className={fb.sentiment === 'negative' ? 'text-rose-400' : 'text-emerald-400'}>
                                    {fb.sentiment.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-slate-300 leading-relaxed line-clamp-2">{fb.content}</p>
                              </div>
                            ))}
                            {activeNode.feedbacks.length > 2 && (
                              <p className="text-[9px] text-slate-500 font-mono text-center">
                                + 还有 {activeNode.feedbacks.length - 2} 条历史吞吐反馈记录
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 text-center rounded-xl bg-slate-950/30 border border-slate-900 text-slate-550 text-[10px]">
                            目前未注入用户反馈数据，该星宿恒星初始稳定。
                          </div>
                        )}
                      </div>
                    </div>

                    {/* INTERACTIVE TRAFFIC FEEDBACK INJECTOR (SANDTABLE) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                          {isZh ? "恒星生长进化沙盒 (Dynamic Simulator)" : "STARS GROWTH INGEST SANDBOX"}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal">
                        {isZh 
                          ? "你可以对本恒星进行两种极端大区模拟。注入后，节点会发生物理形变（半径比例由于意见库与突变堆积变宽）："
                          : "Simulate dual regional feedback cycles to expand this node's atomic weight:"}
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Ingest Positive Traffic feedback */}
                        <button
                          onClick={() => handleSimulateFeedback(true)}
                          disabled={isSimulating}
                          className="py-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isZh ? "注入流量好评" : "Inject Positive"}</span>
                        </button>

                        {/* Ingest Negative Regulatory Warning */}
                        <button
                          onClick={() => handleSimulateFeedback(false)}
                          disabled={isSimulating}
                          className="py-1.5 px-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-[10px] font-black transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{isZh ? "注入合规红牌" : "Inject Alert"}</span>
                        </button>
                      </div>

                      {/* Display live simulation log feedback */}
                      {simulationLog.length > 0 && (
                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-950 font-mono text-[8px] text-slate-300 leading-normal max-h-[50px] overflow-y-auto">
                          {simulationLog.map(log => (
                            <div key={log.id} className="flex items-start gap-1">
                              <span className={log.type === 'alert' ? 'text-rose-400' : 'text-emerald-400'}>▶</span>
                              <span className={log.type === 'alert' ? 'text-rose-300' : 'text-slate-300'}>{log.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="border-t border-slate-900 pt-3.5 mt-2 flex items-center justify-between gap-4">
                      <span className="text-[9px] font-mono text-slate-500">
                        MUTATION ENGINE • LOCALSTORAGE SYNC
                      </span>
                      
                      <button
                        onClick={() => {
                          setSelectedEntryId(activeNode.id);
                          setSubTab('evolution');
                        }}
                        className="text-[10px] font-extrabold text-cyan-300 hover:text-cyan-150 transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isZh ? "⚡ 立即进入自进化坊" : "⚡ Go to Evolution Studio"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs my-auto">
                    请在星图中选择一个数据星宿
                  </div>
                )}
              </motion.div>
            ) : (
              // 2. STATIC FRAMEWORK INSPECTOR (Original details view for perfect alignment)
              <motion.div
                key={activeStaticId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 md:p-8 rounded-2xl bg-[#090f1e] border-2 border-amber-500/20 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between"
              >
                {/* Tech corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="border-b border-slate-900 pb-3 space-y-1">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                      FRAMEWORK MODULE • {activeStaticNode.id.toUpperCase()}_MAP
                    </span>
                    <h4 className="text-base font-black text-white mt-1">
                      {isZh ? activeStaticNode.nameZh : activeStaticNode.nameEn}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isZh ? activeStaticNode.descriptionZh : activeStaticNode.descriptionEn}
                    </p>
                  </div>

                  {/* Inner static templates */}
                  <div className="text-xs text-slate-300 space-y-3.5 my-3 flex-1 overflow-y-auto max-h-[220px]">
                    {activeStaticId === 'blueprint' && (
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-[10px]">
                          <strong className="text-white block mb-0.5">前台 IP (阿琪是我)</strong>
                          <span>华语青春音画自愈，利用极致美学、纯真歌声与治愈情绪建立信任。</span>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px]">
                          <strong className="text-white block mb-0.5">后台产品 (CultureOS)</strong>
                          <span>把等效转译和红线审查打包，输出特定的 ContentPack 按年订阅收费。</span>
                        </div>
                      </div>
                    )}

                    {activeStaticId === 'monetization' && (
                      <div className="space-y-1.5 text-[10px]">
                        <p>💡 <strong>1. 工具产品:</strong> 销售特定ASMR主题、音色、字幕、画面素材包。</p>
                        <p>💡 <strong>2. 知识资产:</strong> 开启 IP 出海私董会，高单价培训等效转译方法论。</p>
                        <p>💡 <strong>3. 流量收益:</strong> 联盟创作者瓜分 YouTube/TikTok 播放分成与软广。</p>
                        <p>💡 <strong>4. 咨询报告:</strong> 提供周度大区合规熔断情报按月订阅。</p>
                        <p>💡 <strong>5. 供应链出海:</strong> 携手国内名茶、国潮实体通过联名 IP 本地化卖货。</p>
                      </div>
                    )}

                    {activeStaticId === 'signal' && (
                      <div className="space-y-1.5 text-[10px]">
                        <p>📡 <strong>L1 法律合规 (TOS/FTC/FDA):</strong> 一票否决权，审查药效夸大或宗教禁忌。</p>
                        <p>📡 <strong>L2 文化大区 (Hofstede Match):</strong> 解析极简独立还是抱团陪伴暖色。</p>
                        <p>📡 <strong>L3 算法钩子 (Hooks/BGM):</strong> 提取完播率黄金三秒、热门鼓点BPM、音质分贝。</p>
                        <p>📡 <strong>L4 商业转化 (CTR/CPM):</strong> 挖掘垂直出海高单价品类（如桌面摆件、电量续航）。</p>
                        <p>📡 <strong>L5 自我基因 (Genetic Fit):</strong> 绑定创作者个人的嗓音特质或高敏情绪提取天赋。</p>
                      </div>
                    )}

                    {activeStaticId === 'players' && (
                      <div className="space-y-2 text-[10px]">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                          <span className="text-violet-400 font-bold block">供给端协同 (Supply)</span>
                          <span className="text-slate-400">上游经典华语版权持有方 🔄 CultureOS 转化 🔄 联盟中小创作者海量发布。</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                          <span className="text-violet-400 font-bold block">需求端转化 (Demand)</span>
                          <span className="text-slate-400">海外高情绪空窗粉丝（购买情感小确幸） 🔄 出海实体品牌（购买文化包装代投服务）。</span>
                        </div>
                      </div>
                    )}

                    {activeStaticId === 'strategy' && (
                      <div className="space-y-1.5 text-[10px]">
                        <p>📍 <strong>第一阶段:</strong> 阿琪是我自测多大区冷启动，跑通0-1并打爆流量。</p>
                        <p>📍 <strong>第二阶段:</strong> 将方法论与合规红线打包成 SaaS 模板（CulturePack）启动工具按年订阅变现。</p>
                        <p>📍 <strong>第三阶段:</strong> 召集全球创作者建分发同盟，大批量赋能国内品牌定位出海。</p>
                      </div>
                    )}

                    {activeStaticId === 'assets' && (
                      <div className="space-y-1.5 text-[10px]">
                        <p>✔ <strong>能力资产化:</strong> 将治愈嗓音及音乐敏锐度，固化为可复用的 AI 视频生产工作流。</p>
                        <p>✔ <strong>案例资产化:</strong> 将成功的海外破百万视频，归档进等效 RAG 库中提供长线信用支撑。</p>
                        <p>✔ <strong>关系资产化:</strong> 签下上游版权以及锁定第一批大区粉丝的极度粘性信任。</p>
                        <p>✔ <strong>数据资产化:</strong> 建立北美、拉美对中国传统美学与情绪共鸣的高频度量模型数据库。</p>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-3">
                    STATIC REFERENCE BLUEPRINT MODEL V1.0
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
