import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Sparkles, RefreshCw, Layers, History, Check, AlertTriangle, 
  ArrowRight, Tag, HelpCircle, Flame, Plus, Play, ChevronRight, CheckCircle2, FileText,
  Edit, Save, X, Trash2, Orbit, Compass, Link
} from 'lucide-react';
import { RagEntry, RagFeedback, EvolutionTrace } from '../types';
import { INITIAL_RAG_ENTRIES } from '../data/rag_presets';
import StrategicStarChart from './StrategicStarChart';
import {
  CATEGORIES_PRESETS,
  TARGET_MARKETS_PRESETS,
  AUDIENCES_PRESETS,
  CULTURE_NARRATIVES_PRESETS,
  PLATFORMS_PRESETS,
  RISK_RULES_PRESETS,
  CONTENT_TEMPLATES_PRESETS,
  KPI_PRESETS,
  CATEGORY_NARRATIVE_MAPS,
  CATEGORY_PLATFORM_MAPS,
  MARKET_PLATFORM_MAPS,
  CASES_PRESETS
} from '../data/csv_presets';

const GLOBAL_BRAND_CASES = [
  {
    id: "case-01",
    brand: "POP MART 泡泡玛特",
    categoryZh: "潮流玩具 / 盲盒收藏品",
    categoryEn: "Designer Art Toys / Collectible Figures",
    logoText: "🧸",
    domesticPositioningZh: "新锐抗压盲盒体验、强收集快感、社交身份标签",
    domesticPositioningEn: "Gen-Z emotional reward blind boxes, intense collectible rush, pop toy peer awards",
    overseasPositioningZh: "独立艺术家设计雕塑摆件、高级时尚桌搭、当代流行工艺美术",
    overseasPositioningEn: "Gallery-grade designer sculptures, elegant desk setup lifestyle aesthetics",
    domesticSloganZh: "“ 创造潮流，传递美好 ”",
    domesticSloganEn: "“ Create trends, convey happiness ”",
    overseasSloganZh: "“ To Light Up Passion and Bring Joy ”",
    overseasSloganEn: "“ To Light Up Passion and Bring Joy ” (去投机色彩，归真于精神向热爱)",
    keyInsightZh: "拒绝将低单价拼手气“盲盒”直译强推。将其精降为“艺术家授权收藏雕雕摆偶(Art Toys/Collectibles)”突显高美学自愈价值，不仅完美避过了美国多大区的博彩与分级反成瘾监管红线，更顺势抬高了客单价倍率。",
    keyInsightEn: "Reframed standard cheap blind boxes as high-end designer artist series collectibles. Avoided gambling and game addiction legal traps in North America while elevating aesthetic premium and margins.",
    naFocusZh: "强调独立IP合作、设计师签名溯源质感，推出精装办公桌摆插画主题、UL软塑质检。",
    latamFocusZh: "推出日常拟人化‘守护陪伴、共同成长’的趣味全场景生活视频，配合拉丁阳光夕阳。"
  },
  {
    id: "case-02",
    brand: "ANKER 安克创新",
    categoryZh: "消费电子 / 充电配电科技",
    categoryEn: "Consumer Electronics / Power Charging Devices",
    logoText: "⚡",
    domesticPositioningZh: "百瓦高能氮化镓、物理参数极佳、降价大促高性价比数码配件",
    domesticPositioningEn: "Brute-force high wattage (W) super chargers, affordable high-spec consumer adapters",
    overseasPositioningZh: "不可或缺的便携低熵安全科技伴侣、海洋塑料绿色再生环保艺术、科技探索精神支柱",
    overseasPositioningEn: "The ultimate secure eco-conscious charging companion, recycled marine plastic craft",
    domesticSloganZh: "“ 智电生活，安克随行 ”",
    domesticSloganEn: "“ Smart electricity, Anker is always with you ”",
    overseasSloganZh: "“ Charge Fast, Live More ”",
    overseasSloganEn: "“ Charge Fast, Live More ” (快快充电省下时间，去爱、去探索更辽阔的生命旅程)",
    keyInsightZh: "在海外完全摈弃枯燥的数据功率堆叠打法，将出海方向升华为“Eco-Friendly (绿色可循环)”与“Life Protection (安全续能)”。将日常电子损耗升华为一种“不被电量束缚、积极无忧”的利他生活信仰。",
    keyInsightEn: "Abandoned engineering feature wars. Aligned with environmental and premium security standards, turning emergency battery anxiety into a Zen-like self-care digital freedom.",
    naFocusZh: "UL高安全规格认证、亚马逊海洋塑料可循环特装标贴、极简冷灰质感太空金属桌搭配色。",
    latamFocusZh: "侧重于盛大公路出行、狂欢野外 Fiesta 篝火应急供电多场景互动故事，强调安全温馨。"
  },
  {
    id: "case-03",
    brand: "FLORASIS 花西子",
    categoryZh: "高端国风美妆 / 汉彩化妆品",
    categoryEn: "Oriental Botanical Aesthetics / Clean Makeup",
    logoText: "🌸",
    domesticPositioningZh: "东方古典温莹驻颜、药方调理养肤、浪漫中药古汉仪式美学",
    domesticPositioningEn: "Classical functional makeup, ancient royalty beauty and clinical natural herbal recipes",
    overseasPositioningZh: "馆藏艺术品般的精工微雕立体眼彩、100%植物纯素零残忍洁净美妆",
    overseasPositioningEn: "3D micro-relief-sculpted gallery compact artwork, 100% Vegan & Cruelty-Free botanical pigments",
    domesticSloganZh: "“ 东方彩妆，以花养妆 ”",
    domesticSloganEn: "“ Oriental cosmetics, nourishing makeup with flowers ”",
    overseasSloganZh: "“ Oriental Artistry on Clean Canvas ”",
    overseasSloganEn: "“ Oriental Artistry on Clean Canvas ” (在纯净画布上，用东方工艺美学讲述真实故事)",
    keyInsightZh: "由于FDA对中草药美妆的草本药物功效严控，花西子出海战略剔除一切“祛痘调理”功效主张，主攻“Clean Beauty (无公害零伤害纯素认证)”及“立体微雕奇迹 (Artisan 3D Carving)”。用眼见为实的手艺震撼，跨越语言障碍。",
    keyInsightEn: "Under FDA, botanical medicinal formulas have extreme liabilities. Florasis rebranded as 100% Vegan (Cruelty-Free) while emphasizing micro-sculpting visual masterpieces, winning Western aesthetic awe.",
    naFocusZh: "必须标贴 Cruelty-Free 零动物伤虐标识、东方微雕神妙纪录片（全手绘分明）、温润松烟黛色。",
    latamFocusZh: "耐高温防晕、对抗潮湿大色彩对比，色卡增加拉美高饱和度嘉年华狂欢适用妆容。"
  },
  {
    id: "case-04",
    brand: "CapCut 剪映海外版",
    categoryZh: "多合一创意媒体制作工具 / 剪辑软件",
    categoryEn: "Digital Video Workspace / Creator Accelerator",
    logoText: "🎬",
    domesticPositioningZh: "轻而易剪、抖音热门视频卡点、草根笑料搞笑段子一键套用",
    domesticPositioningEn: "Simple fast editor, synchronized one-click template library for Douyin viral memes",
    overseasPositioningZh: "赋能全球个体创作者的数码梦工厂、安全商业音乐赋能、TikTok算法裂变大杀器",
    overseasPositioningEn: "Unleashing individual digital potentials with secure pre-cleared audio & compliance speed",
    domesticSloganZh: "“ 轻而易剪，让创作更简单 ”",
    domesticSloganEn: "“ Easy edit, make creation simpler ”",
    overseasSloganZh: "“ Unleash Your Video Creativity ”",
    overseasSloganEn: "“ Unleash Your Video Creativity ” (释放个体的创作直觉，让每个片段闪闪发亮)",
    keyInsightZh: "将本土化的流行烂梗声效从预置中高规格清理，聚焦于“Creator Independence (创作者独立精神)”。预置百万首完全买断版权的海外商用声轨，彻底消除了欧美网红关于DMCA版权起诉、下架罚款的硬核惊惧。",
    keyInsightEn: "Purged generic localization content to support individual creator autonomy. Implemented secure full-use audio licensing, lifting legal concerns of DMCA copyright claims.",
    naFocusZh: "全面合规的Commercial Sound Library、云端多重团队协作自动音视频对轨字幕。",
    latamFocusZh: "热烈拉丁欢快鼓拍卡点、广场Fiesta多人节奏模板，动感活泼快切节奏。"
  }
];

const CSV_DATABASES = [
  { id: 'categories', nameZh: '产品品类行业 categories.csv', nameEn: 'categories.csv', data: CATEGORIES_PRESETS, description: '产品行业分类预设，包含品类代号、中英文标识与核心场景定位描述。' },
  { id: 'target_markets', nameZh: '目标国家大区 target_markets.csv', nameEn: 'target_markets.csv', data: TARGET_MARKETS_PRESETS, description: '全球主要地区大区霍夫斯泰德(Hofstede)文化维度、心理防线与合规审查红线库。' },
  { id: 'audiences', nameZh: '核心受众用户 audiences.csv', nameEn: 'audiences.csv', data: AUDIENCES_PRESETS, description: '出海营销的核心用户人群模型，包含年轻偏好与感官正念倾向。' },
  { id: 'culture_narratives', nameZh: '文化自愈叙事 culture_narratives.csv', nameEn: 'culture_narratives.csv', data: CULTURE_NARRATIVES_PRESETS, description: '预置情感主线库，提取手作ASMR微距、非遗情谊与民俗符号等美学。' },
  { id: 'platforms', nameZh: '投放媒体平台 platforms.csv', nameEn: 'platforms.csv', data: PLATFORMS_PRESETS, description: '主流渠道规范，包括TikTok、Reels、YouTube Shorts的视频时长和声学授权边界。' },
  { id: 'risk_rules', nameZh: '合规法律安全 risk_rules.csv', nameEn: 'risk_rules.csv', data: RISK_RULES_PRESETS, description: '跨境出海雷区拦截熔断表，包含FDA药用主张红线、GDPR数据和盲盒博彩监管。' },
  { id: 'content_templates', nameZh: '交付成果模板 content_templates.csv', nameEn: 'content_templates.csv', data: CONTENT_TEMPLATES_PRESETS, description: '多语言卡点脚本、标题矩阵分裂和Midjourney高清特写摄影提示词模板。' },
  { id: 'case_presets', nameZh: '示例场景案例 case_presets.csv', nameEn: 'case_presets.csv', data: CASES_PRESETS, description: '针对性出海优秀案例（阿琪是我 / 一鹿繁花）的详细元配置预案。' },
  { id: 'kpi_presets', nameZh: '效果考核指标 kpi_presets.csv', nameEn: 'kpi_presets.csv', data: KPI_PRESETS, description: '各维度的千次曝光CPM成本、加购率及法律诉讼驳回目标。' },
  { id: 'category_narrative_map', nameZh: '行业-叙事推荐推荐矩阵 category_narrative_map.csv', nameEn: 'category_narrative_map.csv', data: CATEGORY_NARRATIVE_MAPS, description: '行业品类代码到最兼容文化故事体系的情绪匹配分值图。' },
  { id: 'category_platform_map', nameZh: '行业-社交平台推荐 category_platform_map.csv', nameEn: 'category_platform_map.csv', data: CATEGORY_PLATFORM_MAPS, description: '行业品类至核心发布社媒大区受众契合度冷启动分值图。' },
  { id: 'market_platform_map', nameZh: '大区-平台投放关联 market_platform_map.csv', nameEn: 'market_platform_map.csv', data: MARKET_PLATFORM_MAPS, description: '大区文化消费粘性与社媒选择的相关矩阵。' }
];

interface DatabaseEvolutionViewProps {
  lang: 'zh' | 'en';
  currentUser?: any;
  onConsumeQuota?: (actionName: string) => boolean;
  onFeedbackSimulated?: () => void;
}

export default function DatabaseEvolutionView({
  lang,
  currentUser,
  onConsumeQuota,
  onFeedbackSimulated
}: DatabaseEvolutionViewProps) {
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
  const [subTab, setSubTab] = useState<'starchart' | 'evolution' | 'cases' | 'csv-database'>('starchart');
  const [selectedCsvDbId, setSelectedCsvDbId] = useState<string>('categories');
  const [csvSearchTerm, setCsvSearchTerm] = useState<string>('');

  // Startup brand customizer states
  const [startupCategory, setStartupCategory] = useState<string>('pet_tech');
  const [startupCustomCategory, setStartupCustomCategory] = useState<string>('');
  const [startupRegion, setStartupRegion] = useState<'NA' | 'LATAM'>('NA');
  const [startupRawSlogan, setStartupRawSlogan] = useState<string>('');
  const [appliedRagId, setAppliedRagId] = useState<string>('rag-002');
  const [isBrandingEvolving, setIsBrandingEvolving] = useState<boolean>(false);
  const [customBrandResult, setCustomBrandResult] = useState<any | null>(null);
  const [brandingTraces, setBrandingTraces] = useState<string[]>([]);
  
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

  // Non-blocking in-app custom notification and confirmation overlay states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(prev => prev?.message === msg ? null : prev);
    }, 4500);
  };

  // Direct editing states
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescZh, setEditDescZh] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editRegion1MustHaves, setEditRegion1MustHaves] = useState('');
  const [editRegion1MustNots, setEditRegion1MustNots] = useState('');
  const [editRegion1Vibes, setEditRegion1Vibes] = useState('');
  const [editRegion2MustHaves, setEditRegion2MustHaves] = useState('');
  const [editRegion2MustNots, setEditRegion2MustNots] = useState('');
  const [editRegion2Vibes, setEditRegion2Vibes] = useState('');

  // Creation state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'symbol' | 'regulatory' | 'music_visual' | 'audience' | 'case_study'>('symbol');
  const [newDescZh, setNewDescZh] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newConcept1Name, setNewConcept1Name] = useState('');
  const [newConcept1Values, setNewConcept1Values] = useState('');
  const [newConcept2Name, setNewConcept2Name] = useState('');
  const [newConcept2Values, setNewConcept2Values] = useState('');
  const [newRegion1MustHaves, setNewRegion1MustHaves] = useState('');
  const [newRegion1MustNots, setNewRegion1MustNots] = useState('');
  const [newRegion1Vibes, setNewRegion1Vibes] = useState('');
  const [newRegion2MustHaves, setNewRegion2MustHaves] = useState('');
  const [newRegion2MustNots, setNewRegion2MustNots] = useState('');
  const [newRegion2Vibes, setNewRegion2Vibes] = useState('');

  // Handle deletion of custom cards
  const handleDeleteCustomCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'rag-001' || id === 'rag-002' || id === 'rag-003') {
      showNotification(isZh ? '系统置顶示例卡片不能删除。请仅删除自定义创建的卡片。' : 'Built-in template cards cannot be deleted.', 'error');
      return;
    }
    setDeleteConfirmId(id);
  };

  const confirmDeleteCustomCard = () => {
    if (!deleteConfirmId) return;
    const updated = entries.filter(item => item.id !== deleteConfirmId);
    setEntries(updated);
    localStorage.setItem('cultureos_rag_entries', JSON.stringify(updated));
    setSelectedEntryId('rag-001');
    setDeleteConfirmId(null);
    showNotification(isZh ? '🎉 自定义基因规章卡删除成功！' : '🎉 Custom card deleted successfully!', 'success');
  };

  const activeEntry = entries.find(e => e.id === selectedEntryId) || entries[0];

  useEffect(() => {
    if (activeEntry) {
      setEditName(activeEntry.name);
      setEditDescZh(activeEntry.descriptionZh);
      setEditDescEn(activeEntry.descriptionEn);
      
      const r1 = activeEntry.regionalGuidelines?.[0];
      const r2 = activeEntry.regionalGuidelines?.[1];
      
      if (r1) {
        setEditRegion1MustHaves(r1.mustHaves?.join('\n') || '');
        setEditRegion1MustNots(r1.mustNots?.join('\n') || '');
        setEditRegion1Vibes(r1.vibeStickers?.join(', ') || '');
      } else {
        setEditRegion1MustHaves('');
        setEditRegion1MustNots('');
        setEditRegion1Vibes('');
      }
      
      if (r2) {
        setEditRegion2MustHaves(r2.mustHaves?.join('\n') || '');
        setEditRegion2MustNots(r2.mustNots?.join('\n') || '');
        setEditRegion2Vibes(r2.vibeStickers?.join(', ') || '');
      } else {
        setEditRegion2MustHaves('');
        setEditRegion2MustNots('');
        setEditRegion2Vibes('');
      }
    }
  }, [selectedEntryId, entries]);

  // Auto-load raw slogans when changing startup category
  useEffect(() => {
    const defaultSlogansList = [
      "",
      "智能定时定量、不卡粮极速放电。随时看宠解焦虑白菜促销！",
      "Smart timing, 2K cam to watch pet to solve separation anxiety with cheap pricing!",
      "时速40迈超速狂飙跑山、极速跑更远、性能完爆全网！",
      "40mph speeds, long range trail riding, best stats on the market!",
      "中药植物老方，排毒解酒护肝利尿、省下一大笔咖啡钱！",
      "Ancient herbs of secret recipe, detoxifies liver/fat, perfect price!"
    ];

    if (defaultSlogansList.includes(startupRawSlogan.trim())) {
      if (startupCategory === 'pet_tech') {
        setStartupRawSlogan(isZh ? "智能定时定量、不卡粮极速放电。随时看宠解焦虑白菜促销！" : "Smart timing, 2K cam to watch pet to solve separation anxiety with cheap pricing!");
      } else if (startupCategory === 'ebike') {
        setStartupRawSlogan(isZh ? "时速40迈超速狂飙跑山、极速跑更远、性能完爆全网！" : "40mph speeds, long range trail riding, best stats on the market!");
      } else if (startupCategory === 'herbal_tea') {
        setStartupRawSlogan(isZh ? "中药植物老方，排毒解酒护肝利尿、省下一大笔咖啡钱！" : "Ancient herbs of secret recipe, detoxifies liver/fat, perfect price!");
      } else {
        setStartupRawSlogan('');
      }
    }
  }, [startupCategory, isZh]);

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      showNotification(isZh ? '请输入 RAG 规章名称' : 'Please input a name.', 'error');
      return;
    }

    const nextVer = (parseFloat(activeEntry.version || '1.0') + 0.1).toFixed(1);
    
    const updatedEntry: RagEntry = {
      ...activeEntry,
      name: editName,
      descriptionZh: editDescZh,
      descriptionEn: editDescEn,
      version: nextVer,
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      regionalGuidelines: [
        {
          region: activeEntry.regionalGuidelines?.[0]?.region || 'North America (北美)',
          mustHaves: editRegion1MustHaves.split('\n').map(l => l.trim()).filter(Boolean),
          mustNots: editRegion1MustNots.split('\n').map(l => l.trim()).filter(Boolean),
          vibeStickers: editRegion1Vibes.split(/[,，]/).map(s => s.trim()).filter(Boolean)
        },
        {
          region: activeEntry.regionalGuidelines?.[1]?.region || 'Latin America (拉美)',
          mustHaves: editRegion2MustHaves.split('\n').map(l => l.trim()).filter(Boolean),
          mustNots: editRegion2MustNots.split('\n').map(l => l.trim()).filter(Boolean),
          vibeStickers: editRegion2Vibes.split(/[,，]/).map(s => s.trim()).filter(Boolean)
        }
      ],
      changeLogs: [
        {
          version: nextVer,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          triggerFeedbackId: 'manual',
          changeSummary: isZh ? '人工规则直编：修改了边界词库和正负基因控制指标。' : 'Manual rules adjustment: Modified region tags and boundary limits.'
        },
        ...(activeEntry.changeLogs || [])
      ]
    };

    const updatedList = entries.map(e => e.id === activeEntry.id ? updatedEntry : e);
    setEntries(updatedList);
    localStorage.setItem('cultureos_rag_entries', JSON.stringify(updatedList));
    setIsEditingActive(false);
  };

  const handleCreateNew = () => {
    if (!newName.trim()) {
      showNotification(isZh ? '请输入 RAG 规章名称' : 'Please input a name.', 'error');
      return;
    }

    const generatedId = 'rag-user-' + Date.now().toString().slice(-4);
    const newEntry: RagEntry = {
      id: generatedId,
      name: newName,
      category: newCategory,
      version: '1.0',
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      descriptionZh: newDescZh || '新定义的出海水准及过滤指南。',
      descriptionEn: newDescEn || 'Custom globalization dynamic guide.',
      coreConcepts: [
        { 
          name: newConcept1Name.trim() || (isZh ? '品牌核心定义' : 'Brand Definition'), 
          values: newConcept1Values.split(/[,，]/).map(v => v.trim()).filter(Boolean) 
        },
        ...(newConcept2Name.trim() ? [{ 
          name: newConcept2Name.trim(), 
          values: newConcept2Values.split(/[,，]/).map(v => v.trim()).filter(Boolean) 
        }] : [])
      ],
      regionalGuidelines: [
        {
          region: 'North America (北美)',
          mustHaves: newRegion1MustHaves.split('\n').map(l => l.trim()).filter(Boolean),
          mustNots: newRegion1MustNots.split('\n').map(l => l.trim()).filter(Boolean),
          vibeStickers: newRegion1Vibes.split(/[,，]/).map(s => s.trim()).filter(Boolean)
        },
        {
          region: 'Latin America (拉美)',
          mustHaves: newRegion2MustHaves.split('\n').map(l => l.trim()).filter(Boolean),
          mustNots: newRegion2MustNots.split('\n').map(l => l.trim()).filter(Boolean),
          vibeStickers: newRegion2Vibes.split(/[,，]/).map(s => s.trim()).filter(Boolean)
        }
      ],
      feedbacks: [],
      changeLogs: [
        {
          version: '1.0',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          triggerFeedbackId: 'initial',
          changeSummary: isZh ? '全新定制 RAG 知识链创建完毕。' : 'Brand new custom RAG segment registered.'
        }
      ]
    };

    const updatedList = [newEntry, ...entries];
    setEntries(updatedList);
    localStorage.setItem('cultureos_rag_entries', JSON.stringify(updatedList));
    setSelectedEntryId(generatedId);
    
    // Reset fields
    setNewName('');
    setNewDescZh('');
    setNewDescEn('');
    setNewConcept1Name('');
    setNewConcept1Values('');
    setNewConcept2Name('');
    setNewConcept2Values('');
    setNewRegion1MustHaves('');
    setNewRegion1MustNots('');
    setNewRegion1Vibes('');
    setNewRegion2MustHaves('');
    setNewRegion2MustNots('');
    setNewRegion2Vibes('');
    
    setIsCreatingNew(false);
  };

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

    if (onConsumeQuota && !onConsumeQuota(isZh ? '自进化 RAG 数据库安全审计分析' : 'Self-evolving RAG database threat analysis loop')) {
      return;
    }

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
      model: modelProvider === 'gemini' ? 'gemini-3.5-flash' : modelProvider === 'openai' ? 'gpt-4o-mini' : 'deepseek-chat'
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

    // Notify onboarding guide of the RAG evolution commitment
    onFeedbackSimulated?.();

    // Reset loop states
    setMutatedEntryData(null);
    setCustomFeedback('');
    setShowDiff(false);
    setEvolutionSuccess(false);

    showNotification(isZh ? '🎉 新规则已成功确立合并并写入自进化 RAG 数据库！出海创意管线将实时加载此版新规规避红线。' : '🎉 New evolved directives successfully committed and saved to your RAG store! The campaign desk will instantly read this schema for compliance audits.', 'success');
  };

  const handleGenerateBranding = async () => {
    if (onConsumeQuota && !onConsumeQuota(isZh ? '出海初创品牌基因翻译与文案定制' : 'Startup global brand positioning & campaign copywriting translation')) {
      return;
    }

    setIsBrandingEvolving(true);
    setBrandingTraces([]);
    setCustomBrandResult(null);

    const steps = [
      isZh ? "🧬 [解析层] 读取初创企业品牌基因和诉求语意..." : "🧬 [Parsing] Ingesting domestic startup brand attributes & raw slogans...",
      isZh ? "🔍 [风控过滤] 开始进行合规雷区审计（FTC法案第5节、FDA标签草案）..." : "🔍 [Audit] Scanning advertising clinical risks against FDA/FTC checklists...",
      isZh ? "🧠 [文化等效映射] 应用霍夫斯泰德六维度指数（北美高IDV / 拉美高集体主义）等效转换..." : "🧠 [Mapping] Synthesizing equivalent symbols under Hofstede matrix criteria...",
      isZh ? "✍️ [智能话术合成] 智能解耦“粗放硬广”，重塑高质感温润出海 slogan 和品牌定位..." : "✍️ [Slogan Synthesis] Polishing raw taglines into high-end contextual slogans...",
      isZh ? "✅ [安全沙盒自校验] 验证规则完整度，核发 RAG 可存续单元结构..." : "✅ [Verification] Finalizing compliance ruleset structures for RAG database..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setBrandingTraces(prev => [...prev, steps[i]]);
    }

    // Prepare Result Data
    let brandName = "";
    let finalCategory = "";
    let domesticSlogan = "";
    let overseasSlogan = "";
    let overseasPositioning = "";
    let keyStrategy = "";
    let mustHaves: string[] = [];
    let mustNots: string[] = [];

    const categoryLabel = startupCategory;
    const regionText = startupRegion === "NA" ? "North America (北美)" : "Latin America (拉美)";

    if (categoryLabel === "pet_tech") {
      brandName = isZh ? "PAW-ZEN 智能温宠" : "PAW-ZEN Smart Companion";
      finalCategory = isZh ? "智能宠物用具与喂食器 (Pet Tech)" : "Smart Pet Care & Feeder";
      domesticSlogan = startupRawSlogan || (isZh ? "“ 2K高清夜视不卡粮、超长放电白菜价，随时看宠解焦虑！”" : "“2K Night Vision, clog-free feeder, ultra battery life with cheap prices!”");
      
      if (startupRegion === "NA") {
        overseasSlogan = "“ Because love feeds on quiet presence. ”";
        overseasPositioning = isZh 
          ? "关注爱宠福祉与人宠情感互动的平视情绪守护品牌" 
          : "Mindful animal wellness companion focusing on peaceful human-pet lifestyle synchronicity";
        keyStrategy = isZh
          ? "将国内“监控卡粮、狂看爱宠解焦虑”等偏向主人过度掌控的负压词软化，包装为“关注宠物健康自主与双向安全陪伴”。完美契合北美对宠物作为独立家庭角色的社会环保消费舆情。"
          : "Softened monitoring metaphors. Reframed monitoring features as pet comfort freedom and mental calmness, adhering to NA progressive animal welfare ethics.";
        const rEntry = entries.find(e => e.id === 'rag-006');
        const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes('North America'));
        mustHaves = rGuideline ? rGuideline.mustHaves : [
          isZh ? "强调爱宠独立自我的高画质“不被打扰时光”安详画面" : "Highlight scenes of pets enjoying cozy, distraction-free alone time",
          isZh ? "列明 UL 抗漏电防咬材质、食品级不含双酚A不卡粮认证" : "UL-certified safety materials and BPA-Free food security labels"
        ];
        mustNots = rGuideline ? rGuideline.mustNots : [
          isZh ? "严禁虚假声称该电子器物能“包治各种宠物郁结焦虑、保障宠物健康快乐成长”等越线医疗指控" : "Do NOT guarantee physical or psychological therapy claims for animals",
          isZh ? "杜绝不断强调“全网最低、白菜促销”等砸损高客单价溢价的话术" : "Avoid cheap discount copy like 'bargain bin' that ruins brand equity"
        ];
      } else {
        overseasSlogan = "“ Siempre juntos, siempre felices. ” (永远同行，永远温馨)";
        overseasPositioning = isZh 
          ? "家庭社区共享温馨人宠一同前行的快乐能量媒介" 
          : "The warm messenger of shared human-animal family moments";
        keyStrategy = isZh
          ? "融入拉美浓郁的生命集体融洽氛围，强调智能设备是为家庭成员共享快乐时光、保障安心而生的家庭好帮手，彻底摒弃冰冷单身独处镜头。"
          : "Integrated with LATAM family warmth. Position pet care devices as a reliable helper for family gatherings, avoiding cold isolation vibes.";
        
        const rEntry = entries.find(e => e.id === 'rag-006');
        const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes('Latin America'));
        mustHaves = rGuideline ? rGuideline.mustHaves : [
          isZh ? "展示宠物在明亮日落、全家Fiesta庭院烧烤派对中撒欢玩耍的温馨大视野场景" : "Display warm clips of pets participating in family outdoor celebrations",
          isZh ? "欢悦明快、带点低保真律动的西班牙尼龙木吉他背景音" : "Cheerful cozy spanish guitar backgrounds"
        ];
        mustNots = rGuideline ? rGuideline.mustNots : [
          isZh ? "严禁在视频开头使用幽暗、冰冷偏暗蓝的深夜关灯空禁闭色调" : "Do NOT utilize depressive, cold, nocturnal isolated setups for pets",
          isZh ? "避免照搬过于高冷的北欧风黑白灰单色极简主义UI色板" : "Avoid copying isolated minimalistic monochrome setups"
        ];
      }
    } else if (categoryLabel === "ebike") {
      brandName = "AERO-FLOW E-Bike";
      finalCategory = isZh ? "绿色低碳智能城市电单车 (E-Bike)" : "Eco-Tech Micro-Mobility E-Bike";
      domesticSlogan = startupRawSlogan || (isZh ? "“ 时速40迈跑山无阻、极大续航狂飙、全网极低性价比降维打击！”" : "“40mph ultra speed, long range, low prices crushing competitors!”");

      if (startupRegion === "NA") {
        overseasSlogan = "“ Reclaim your commute. Breathe your city. ”";
        overseasPositioning = isZh 
          ? "城市低碳正念通勤、倡导人际空间放空与低熵出行的高端倡导者" 
          : "Urban quiet commuter & eco-active freedom advocate";
        keyStrategy = isZh
          ? "淘汰国内喜好的“狂飙、秒杀、拼速度常数、低价降维打击”等带有危险危险和廉价街头感标签，重塑为“在拥挤的欧美地铁外获取专属于个体的两英里正念呼吸时间”。完美打入中产美学。"
          : "Eradicated aggressive speed/conquering marketing. Reframed micro-mobility as a premium, low-entropy mindfulness escape from heavy metropolitan subways, fully matching middle-class values.";
        const rEntry = entries.find(e => e.id === 'rag-007');
        const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes('North America'));
        mustHaves = rGuideline ? rGuideline.mustHaves : [
          isZh ? "明确标示碳平衡减排系数证书以及环保再生合金用料质认证" : "Highlight cargo certifications, eco-alloy and carbon reduction indexes",
          isZh ? "捕捉雨后清晨第一道街头阳光、车体顺滑掠过的静音特写" : "Serene sunlit morning streets, sleek noise-canceled design highlights"
        ];
        mustNots = rGuideline ? rGuideline.mustNots : [
          isZh ? "严禁将主视觉标语或口号设计为鼓励超越本地城市法定限速的违规野外狂跑山" : "Avoid marketing speeding beyond regulated city limits containing off-road risk",
          isZh ? "严禁在宣发物料中出现骑行未佩戴美国DOT头盔、甚至危险穿插行车线等反规雷区画面" : "Do NOT show reckless riders missing helmets or violating local safety guidelines"
        ];
      } else {
        overseasSlogan = "“ Tu viaje, tu libertad dorada. ” (你的旅程，你的金色穿梭)";
        overseasPositioning = isZh 
          ? "穿梭拉美斑驳古街、连接亲情友情与全家度假自由的金色伴侣" 
          : "The golden sunset companion connecting family on colonial streets";
        keyStrategy = isZh
          ? "针对拉美对自由探索和温暖社区人情的高感度。侧重于“长寿电量省下奔波时间、回家探望母亲、结伴看球夕阳Fiesta”的主题宣讲。"
          : "Focus on connection freedom and weekend family visits. Leverage community colors and romantic dapple sunset paths.";
        
        const rEntry = entries.find(e => e.id === 'rag-007');
        const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes('Latin America'));
        mustHaves = rGuideline ? rGuideline.mustHaves : [
          isZh ? "展示骑行穿过彩色殖民老楼、街坊亲昵挥手微笑的近焦深情谊画面" : "Showcase passing dapple colonial buildings with local neighbors waving hands",
          isZh ? "暖洋洋的高对比拉丁流行沙锤、经典尼龙弦即敲打击伴奏" : "Exquisite rhythmic percussion and warm Spanish acoustic"
        ];
        mustNots = rGuideline ? rGuideline.mustNots : [
          isZh ? "严防全盘挪用冰冷、高冷性冷淡、零温度的废墟工业朋克科技质感" : "Avoid cold, dark clinical gray mechanical isolation layouts",
          isZh ? "避忌使用未经审核的、可能冒犯或混淆本地特定原住民氏族土地所有权敏感性的装饰符号" : "Avoid naming vectors that touch indigenous territorial pride controversy"
        ];
      }
    } else if (categoryLabel === "herbal_tea") {
      brandName = "SAGE-BREW 研岩茶";
      finalCategory = isZh ? "东方精品冷泡草本武夷岩茶" : "Specialty Botanical Tea & Cold Brew Wuyi Rock Tea";
      domesticSlogan = startupRawSlogan || (isZh ? "“ 汉方老祖宗中草药秘方，解酒护肝、消水肿狂刮油！两杯省下星巴克钱！”" : "“Traditional secret herbal tea, detoxing fat away, lowers calorie, save coffee budgets!”");

      if (startupRegion === "NA") {
        overseasSlogan = "“ Steep your calm, unfurl your mind. ”";
        overseasPositioning = isZh 
          ? "工作日下午三点电脑前白领一族提神、正念松弛的咖啡高端代用品" 
          : "The premium 3:00 PM digital-unwind coffee alternative";
        keyStrategy = isZh
          ? "在国内被滥用的“老祖宗汉方消炎、排毒酒精、刮油、代替药物”在美加是触发FDA严重行政处罚的绝对熔断雷红线。CultureOS将其完全升级为“岩茶冲泡的蒸汽微距ASMR、给眼部电脑屏幕带来两分钟的东方非药物感官禅意冥想时刻”。"
          : "Excluding all health warnings about detoxification or obesity clinics. Rebuilt campaign as a 2-minute tea-steaming ASMR escape for overworked programmers or designers, fully safe under FTC codes.";
        const rEntry = entries.find(e => e.id === 'rag-008');
        const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes('North America'));
        mustHaves = rGuideline ? rGuideline.mustHaves : [
          isZh ? "展示质朴陶罐缓缓注入沸水、微距透光拍摄红茶岩骨花香茶汤交融的解压微镜头" : "Capture extreme macro-ASMR of thermal steam and clay cup texture",
          isZh ? "包装及详情页强制标注 100% Non-GMO（非转基因）及天然天然草本食品认证标牌" : "Verified natural organic botanical tags conforming to USDA Organic guidelines"
        ];
        mustNots = rGuideline ? rGuideline.mustNots : [
          isZh ? "绝对禁止提及任何关于“根制失眠、消弭长期焦虑、治疗脑神经衰弱”等不实药理承诺" : "Do NOT cite unqualified claims on blood pressure, weight-loss or diabetes",
          isZh ? "避免渲染大内皇宫、权贵独享、给百姓看病的封建尊卑姿态镜头" : "Avoid outdated Imperial dynasty costumes that create cultural distance"
        ];
      } else {
        overseasSlogan = "“ Sabor ancestral, alma tranquila. ” (远古的风味，安乐的心眸)";
        overseasPositioning = isZh 
          ? "连通大自然纯净母体与肥沃泥土的古老天然草本原汁能量" 
          : "The pure botanical lifeforce connecting to nature and soil";
        keyStrategy = isZh
          ? "针对拉美“尊重自然母体与泥土恩赐（Pachamama Vibe）”的朴素生态神学理念。着重塑造100%纯天然自然原叶收割、不添加糖、无人工色素，作为亲友野聚消暑圣品。"
          : "Evoke general Mother-Nature elements. Focus on 100% natural organic harvest and family cozy tables.";
        
        const rEntry = entries.find(e => e.id === 'rag-008');
        const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes('Latin America'));
        mustHaves = rGuideline ? rGuideline.mustHaves : [
          isZh ? "微距展现热带清露、雨林深处茶农质朴劳作，以及双手捧陶汤大口饱吸天然茶露的幸福" : "Show earthen clay pots, lush organic tea garden dew and tactile comfort snaps",
          isZh ? "展现一大壶冷茶摆放在开阔草坪，供整个街坊、多口之家开怀消遣的欢聚图景" : "Family share pitcher setups with glowing sunlit tables"
        ];
        mustNots = rGuideline ? rGuideline.mustNots : [
          isZh ? "切记不要将茶叶故事讲成带有符咒开光、辟邪做法迷信色彩、与天主教信仰发生强烈冲突的封建神秘主义" : "Strictly avoid pagan mysticism or superstitious claims provoking Catholic areas",
          isZh ? "极力规避单人处在黑漆房幽闭喝茶、愁云惨淡反思的情调，会引发本地社会抑郁症创伤敏感" : "Avoid dry, isolating dark meditative graphics"
        ];
      }
    } else {
      // Custom / Fallback category
      brandName = "VIRTUE-FLOW " + (startupCustomCategory || "Outbound Elite");
      finalCategory = startupCustomCategory || (isZh ? "初创定制出海商品 (Custom Vertical)" : "Startup Adaptive Enterprise");
      domesticSlogan = startupRawSlogan || (isZh ? "“ 狂暴秒杀、绝对低价好用、贴心解决你的一切烦恼和不爽不适！”" : "“Extreme results, low price, instant relief for your issues!”");

      overseasSlogan = startupRegion === "NA" 
        ? "“ Elevate the everyday, elegantly. ”"
        : "“ Hecho con alma, vivido con amor. ” (物造灵魂，生活以爱)";
      
      overseasPositioning = isZh 
        ? `致力于将匠心工艺等效融入${regionText}本土消费者日常生态的高美学品牌`
        : `A modern dedicated premium lifestyle provider built for specialized ${regionText} values`;

      keyStrategy = isZh
        ? "系统智能抓取到国内话术里的主观疗宣称，并判定“秒杀狂暴低价”等具有高反弹力负面品牌资产风险。CultureOS已强制将卖点突变重塑为“温润融入日常正念仪式、零压力合规”的高客单价叙事。"
        : "Detected heavy commercial slogans containing clinical claiming risks. Upgraded brand to sensory aesthetic focus, bypassing safety traps while amplifying premium trust.";

      const rEntry = entries.find(e => e.id === appliedRagId);
      const rGuideline = rEntry?.regionalGuidelines.find(g => g.region.includes(startupRegion === "NA" ? "North America" : "Latin America"));
      mustHaves = rGuideline ? rGuideline.mustHaves : [
        isZh ? "微距展示产品本真物理细节，运用自然斑驳柔光，在视觉上直接证明其质感和定价溢价度" : "Close-up tactile textures, authentic handmade/precision detailing highlights",
        isZh ? "符合大区DE&I多元共融(Diversity & Equity)审美的模特及日常社媒极简尺寸画面" : "Fully compliance certified aspect ratios and localized compliant diversity imagery"
      ];
      mustNots = rGuideline ? rGuideline.mustNots : [
        isZh ? "严禁虚假渲染包治情绪、解决生理病理或可取代专业治疗医生和健康检测的字眼" : "Zero mentions of professional psychological cures or diagnostic alternatives",
        isZh ? "杜绝一切粗暴的纯卖参数、反复洗脑大吼叫卖和带有赌性噱头的街头低端推销手法" : "Zero annoying aggressive loud selling clips or speculative gimmicks"
      ];
    }

    setCustomBrandResult({
      id: "rag-custom-" + Date.now().toString().slice(-4),
      brandName,
      category: finalCategory,
      domesticSlogan,
      overseasSlogan,
      overseasPositioning,
      keyStrategy,
      mustHaves,
      mustNots,
      region: regionText,
      vibeStickers: startupRegion === "NA" ? ["Mindful Trust (正念美学)", "Aesthetic Premium (高端溢价)"] : ["Warm Connection (社区温煦连接)", "Daily Happiness (日常陪伴确幸)"]
    });

    setIsBrandingEvolving(false);
  };

  const handleMergeCustomBrandToRag = () => {
    if (!customBrandResult) return;

    const newRagEntry: RagEntry = {
      id: customBrandResult.id,
      name: `★ ${customBrandResult.brandName} - Localized Brand Guide`,
      category: 'case_study',
      version: '1.0',
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      descriptionZh: `针对【${customBrandResult.category}】出海研发的定制文案及定位对标导则。原案：${customBrandResult.domesticSlogan}`,
      descriptionEn: `Localized brand guide of ${customBrandResult.brandName} for target category ${customBrandResult.category}.`,
      coreConcepts: [
        { name: isZh ? '国内原始设想' : 'Raw Domestic Setup', values: [customBrandResult.domesticSlogan] },
        { name: isZh ? '海外主打定位差异' : 'Overseas Brand Shift', values: [customBrandResult.overseasPositioning, customBrandResult.overseasSlogan] }
      ],
      regionalGuidelines: [
        {
          region: customBrandResult.region,
          mustHaves: customBrandResult.mustHaves,
          mustNots: customBrandResult.mustNots,
          vibeStickers: customBrandResult.vibeStickers
        }
      ],
      feedbacks: [],
      changeLogs: [
        {
          version: '1.0',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          triggerFeedbackId: 'initial',
          changeSummary: `通过初创品牌定位进化器一键生成，将国内原始概念一键解耦重塑，成功突变成符合 ${customBrandResult.region} 安全合规的大区执行规章。`
        }
      ]
    };

    const updatedList = [newRagEntry, ...entries];
    setEntries(updatedList);
    localStorage.setItem('cultureos_rag_entries', JSON.stringify(updatedList));
    setSelectedEntryId(newRagEntry.id);
    
    // Notify onboarding system of RAG update
    onFeedbackSimulated?.();
    
    // Switch to evolution view to show their entry dynamically selected in full glory!
    setSubTab('evolution');

    showNotification(isZh 
      ? `🎉 出海定制成功！品牌【${customBrandResult.brandName}】已作为全新 RAG 规章单元正式写入系统自进化数据库中心！创意生成器现已加载该合规过滤边界。` 
      : `🎉 Custom success! Outbound rules for [${customBrandResult.brandName}] have been merged into your active system RAG database.`, 'success'
    );
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

      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-800/60 pb-3 gap-4 items-center justify-between flex-wrap">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setSubTab('starchart');
              setIsCreatingNew(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'starchart'
                ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20 shadow shadow-cyan-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span>{isZh ? 'CultureOS 战略星图图谱' : 'Strategic Star Chart'}</span>
          </button>
          <button
            onClick={() => {
              setSubTab('evolution');
              setIsCreatingNew(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'evolution'
                ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20 shadow shadow-cyan-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isZh ? 'RAG 规则动态自进化' : 'RAG Database Evolution'}</span>
          </button>
          <button
            onClick={() => setSubTab('cases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'cases'
                ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20 shadow shadow-cyan-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isZh ? '出海名企案例与定位定制库' : 'Brand Cases & Slogan Generator'}</span>
          </button>
          <button
            onClick={() => {
              setSubTab('csv-database');
              setIsCreatingNew(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'csv-database'
                ? 'bg-[#14233c] text-indigo-300 border border-indigo-500/30 shadow shadow-indigo-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>{isZh ? '出海预设标签关系数据库' : 'DTC Outbound Preset Databases'}</span>
          </button>
        </div>

        {subTab === 'evolution' && (
          <button
            onClick={() => {
              setIsCreatingNew(prev => !prev);
              setIsEditingActive(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              isCreatingNew 
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' 
                : 'bg-gradient-to-r from-cyan-400 to-cyan-200 text-slate-950 hover:from-cyan-350 hover:to-cyan-150'
            }`}
          >
            {isCreatingNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isCreatingNew ? (isZh ? '取消录入' : 'Cancel') : (isZh ? '+ 新创出海规则卡' : '+ Create Custom Card')}</span>
          </button>
        )}
      </div>

      {subTab === 'starchart' ? (
        <StrategicStarChart 
          isZh={isZh}
          entries={entries}
          setEntries={setEntries}
          selectedEntryId={selectedEntryId}
          setSelectedEntryId={setSelectedEntryId}
          setSubTab={setSubTab}
          onFeedbackSimulated={onFeedbackSimulated}
        />
      ) : subTab === 'evolution' ? (
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
                  setIsEditingActive(false);
                  setIsCreatingNew(false);
                  setMutatedEntryData(null);
                  setShowDiff(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between h-[120px] relative ${
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
                  <h4 className="font-bold text-sm text-slate-100 truncate pr-5">{entry.name}</h4>
                  <p className="text-xs text-slate-450 line-clamp-1 mt-1">
                    {isZh ? entry.descriptionZh : entry.descriptionEn}
                  </p>
                </div>

                {/* Show deletion button if custom created */}
                {entry.id.startsWith('rag-user-') && (
                  <button
                    onClick={(e) => handleDeleteCustomCard(entry.id, e)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-850 transition z-10 cursor-pointer"
                    title={isZh ? "删除此卡" : "Delete Card"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="text-[10px] text-slate-500 font-mono text-right flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/40 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Update: {entry.lastUpdated.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* DYNAMIC: Create card panel OR edit card panel OR standard active card details display */}
          {isCreatingNew ? (
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-cyan-500/30 space-y-5 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">NEW BRAND KNOWLEDGE GATEWAY</span>
                  <h3 className="font-black text-lg text-white">{isZh ? '🚀 录入出海定制规则卡' : '🚀 Create Outbound Rules Card'}</h3>
                </div>
                <button 
                  onClick={() => setIsCreatingNew(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isZh ? '项目及卡片名称' : 'RAG Card / Brand Name'}</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. E-Bike Outbound Guidelines, Florasis Brand Gene"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 px-4 py-2.5 rounded-xl text-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">{isZh ? '产品及规章类目' : 'RAG Rule Category'}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 px-4 py-2.5 rounded-xl text-slate-200 text-xs outline-none text-slate-300"
                  >
                    <option value="symbol">{isZh ? '文化图腾与情绪符号 (symbol)' : 'Cultural Symbol'}</option>
                    <option value="regulatory">{isZh ? '大区合规硬隔离线 (regulatory)' : 'Advertising Safeguard'}</option>
                    <option value="case_study">{isZh ? '对标名企对位规则 (case_study)' : 'Brand Comparison Case'}</option>
                    <option value="audience">{isZh ? '大区受众画像细分 (audience)' : 'Audience Persona'}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isZh ? '规则描述 (中文)' : 'Description (ZH)'}</label>
                    <textarea
                      value={newDescZh}
                      onChange={(e) => setNewDescZh(e.target.value)}
                      placeholder="例如：针对出海运动品类的定位引导，划分阻尼保护，规避虚假宣称。"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 px-4 py-2.5 rounded-xl text-slate-200 text-xs min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isZh ? '规则描述 (英文)' : 'Description (EN)'}</label>
                    <textarea
                      value={newDescEn}
                      onChange={(e) => setNewDescEn(e.target.value)}
                      placeholder="e.g. Guidance for outbound sports products, focusing on safe claims and premium lifestyle re-framing."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 px-4 py-2.5 rounded-xl text-slate-200 text-xs min-h-[60px]"
                    />
                  </div>
                </div>

                {/* Concept Definition */}
                <div className="p-4 rounded-xl bg-slate-905/60 border border-slate-900 space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">{isZh ? '基因概念标签定义 (Concepts)' : 'Concepts definition'}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={newConcept1Name}
                        onChange={(e) => setNewConcept1Name(e.target.value)}
                        placeholder="第一组概念名 (如: 精神内核)"
                        className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-250 text-xs"
                      />
                      <input
                        type="text"
                        value={newConcept1Values}
                        onChange={(e) => setNewConcept1Values(e.target.value)}
                        placeholder="标签值，逗号隔开 (如: 自由, 自愈, 出发)"
                        className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={newConcept2Name}
                        onChange={(e) => setNewConcept2Name(e.target.value)}
                        placeholder="第二组概念名 (可选)"
                        className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-250 text-xs"
                      />
                      <input
                        type="text"
                        value={newConcept2Values}
                        onChange={(e) => setNewConcept2Values(e.target.value)}
                        placeholder="标签值，逗号隔开"
                        className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 space-y-4">
                  <span className="text-xs font-black uppercase text-amber-400 block">{isZh ? '分目标市场（大区）基因定制' : 'Region specific custom directives'}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Region 1: NA */}
                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 font-mono">North America (北美)</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-mono text-green-400 uppercase font-black block">✔ Must-Have (加分基因，换行分割)</label>
                          <textarea
                            value={newRegion1MustHaves}
                            onChange={(e) => setNewRegion1MustHaves(e.target.value)}
                            placeholder="e.g. UL Safety Certified&#13;Focus on off-road leisure"
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-205 text-xs min-h-[80px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-red-400 uppercase font-black block">✘ Must-Not (禁止违禁词 / 边界红线，换行分割)</label>
                          <textarea
                            value={newRegion1MustNots}
                            onChange={(e) => setNewRegion1MustNots(e.target.value)}
                            placeholder="e.g. Absolute clinical cure&#13;Over-promising mileage results"
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-205 text-xs min-h-[80px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-amber-400 uppercase font-black block">Vibe Stickers (氛围标签, 逗号隔开)</label>
                          <input
                            type="text"
                            value={newRegion1Vibes}
                            onChange={(e) => setNewRegion1Vibes(e.target.value)}
                            placeholder="Eco-Power, Off-road, Commute-zen"
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Region 2: LATAM */}
                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 font-mono">Latin America (拉美)</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-mono text-green-400 uppercase font-black block">✔ Must-Have (加分基因，换行分割)</label>
                          <textarea
                            value={newRegion2MustHaves}
                            onChange={(e) => setNewRegion2MustHaves(e.target.value)}
                            placeholder="e.g. Fiesta companion power&#13;Vibrant high saturation clips"
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-205 text-xs min-h-[80px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-red-400 uppercase font-black block">✘ Must-Not (熔断禁忌边界，换行分割)</label>
                          <textarea
                            value={newRegion2MustNots}
                            onChange={(e) => setNewRegion2MustNots(e.target.value)}
                            placeholder="e.g. Ultra depressive tones&#13;Avoid authoritative tone and lecturing"
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-205 text-xs min-h-[80px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-amber-400 uppercase font-black block">Vibe Stickers (氛围标签, 逗号隔开)</label>
                          <input
                            type="text"
                            value={newRegion2Vibes}
                            onChange={(e) => setNewRegion2Vibes(e.target.value)}
                            placeholder="Fiesta-Active, Familia, Calor"
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-200 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  {isZh ? '确认创建存储卡' : 'Save & Compile Card'}
                </button>
              </div>
            </div>
          ) : isEditingActive ? (
            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/30 space-y-5 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">MANUAL RULE DEFINITION</span>
                  <h3 className="font-black text-lg text-white">{isZh ? '✎ 直编约束标签集' : '✎ Edit Custom Active Constraints'}</h3>
                </div>
                <button 
                  onClick={() => setIsEditingActive(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isZh ? '基因规章名称' : 'RAG Card / Brand Name'}</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-405 px-4 py-2.5 rounded-xl text-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isZh ? '规章中文描述' : 'Description (ZH)'}</label>
                    <textarea
                      value={editDescZh}
                      onChange={(e) => setEditDescZh(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-405 px-4 py-2 rounded-xl text-slate-200 text-xs min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">{isZh ? '规章英文描述' : 'Description (EN)'}</label>
                    <textarea
                      value={editDescEn}
                      onChange={(e) => setEditDescEn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-405 px-4 py-2 rounded-xl text-slate-200 text-xs min-h-[60px]"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 space-y-4">
                  <span className="text-xs font-black uppercase text-amber-400 block">{isZh ? '按大区高亮设置正负基因指令' : 'Region-specific custom rules'}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NA */}
                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 font-mono">North America (北美)</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-mono text-green-400 uppercase font-black block">✔ Must-Have (加分基因, 换行分割)</label>
                          <textarea
                            value={editRegion1MustHaves}
                            onChange={(e) => setEditRegion1MustHaves(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-xs min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-red-400 uppercase font-black block">✘ Must-Not (刚性熔断红线, 换行分割)</label>
                          <textarea
                            value={editRegion1MustNots}
                            onChange={(e) => setEditRegion1MustNots(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-xs min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-amber-400 uppercase font-black block">Vibe Stickers (氛围标签, 逗号隔开)</label>
                          <input
                            type="text"
                            value={editRegion1Vibes}
                            onChange={(e) => setEditRegion1Vibes(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* LATAM */}
                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-950 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 font-mono">Latin America (拉美)</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[9px] font-mono text-green-400 uppercase font-black block">✔ Must-Have (加分基因, 换行分割)</label>
                          <textarea
                            value={editRegion2MustHaves}
                            onChange={(e) => setEditRegion2MustHaves(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-xs min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-red-400 uppercase font-black block">✘ Must-Not (刚性熔断红线, 换行分割)</label>
                          <textarea
                            value={editRegion2MustNots}
                            onChange={(e) => setEditRegion2MustNots(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-2 rounded-lg text-slate-200 text-xs min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-amber-400 uppercase font-black block">Vibe Stickers (氛围标签, 逗号隔开)</label>
                          <input
                            type="text"
                            value={editRegion2Vibes}
                            onChange={(e) => setEditRegion2Vibes(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  onClick={() => setIsEditingActive(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  {isZh ? '保存修改并更新版本' : 'Save Changes & Bump Version'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-6 shadow-md relative">
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">ACTIVE RAG SCHEMA</span>
                    <button
                      onClick={() => setIsEditingActive(true)}
                      className="px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center gap-1 cursor-pointer transition"
                    >
                      <Edit className="w-3 h-3" />
                      <span>{isZh ? '直编规则' : 'Direct Edit'}</span>
                    </button>
                  </div>
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
                  {activeEntry.coreConcepts && activeEntry.coreConcepts.map((concept, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-900 space-y-2">
                      <p className="text-xs font-bold text-cyan-300 font-mono">{concept.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {concept.values && concept.values.map((v, vIdx) => (
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
                  {activeEntry.regionalGuidelines && activeEntry.regionalGuidelines.map((guideline, gIdx) => (
                    <div key={gIdx} className="border border-slate-800/60 rounded-xl bg-slate-950/40 overflow-hidden flex flex-col justify-between">
                      <div className="bg-slate-900/65 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
                        <strong className="text-xs text-slate-300 font-sans">{guideline.region}</strong>
                        <div className="flex gap-1">
                          {guideline.vibeStickers && guideline.vibeStickers.map((sticker, sIdx) => (
                            <span key={sIdx} className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
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
                            {guideline.mustHaves && guideline.mustHaves.map((h, hIdx) => (
                              <li key={hIdx} className="flex items-start gap-1 pb-1 border-b border-slate-900/20">
                                <span className="text-green-500 font-bold">+</span>
                                <span className="leading-snug text-slate-200">{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Must nots */}
                        <div className="space-y-1 pt-2">
                          <span className="text-[9px] font-mono text-red-400 block font-black uppercase">✘ Must-Not (熔断红线)</span>
                          <ul className="text-xs text-slate-300 space-y-1 list-none text-slate-400">
                            {guideline.mustNots && guideline.mustNots.map((n, nIdx) => (
                              <li key={nIdx} className="flex items-start gap-1 pb-1 border-b border-slate-900/20 text-slate-400">
                                <span className="text-red-500 font-bold">-</span>
                                <span className="leading-snug text-slate-400">{n}</span>
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
        )}
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
      ) : subTab === 'cases' ? (
        <div className="space-y-8 animate-fade-in">
          {/* Top segment: Case Explorer cards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">CASE BENCHMARK STUDY</span>
                <h3 className="text-xl font-bold text-white">{isZh ? "中国名企全球化多维度定位对标" : "Multidimensional Brand Globalization Cases"}</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-sm sm:text-right leading-snug">
                {isZh ? "对比分析中国品类在国内与欧美/拉美的营销口号、定位与合规禁区，获取落地规章经验。" : "Analyze how top performers modified taglines to match regional ethics and culture."}
              </p>
            </div>

            {/* Grid of 4 brand cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {GLOBAL_BRAND_CASES.map((item) => (
                <div key={item.id} className="border border-slate-800/80 rounded-2xl bg-slate-900/40 overflow-hidden flex flex-col justify-between">
                  {/* Card header */}
                  <div className="bg-slate-900/60 p-4 border-b border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-slate-950 p-2 rounded-xl border border-slate-800">{item.logoText}</span>
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-snug">{item.brand}</h4>
                        <p className="text-[11px] text-amber-300 font-mono mt-0.5">{isZh ? item.categoryZh : item.categoryEn}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono border border-slate-800 bg-slate-950 px-2 py-0.5 rounded text-slate-400">BENCHMARK</span>
                  </div>

                  {/* Slogans and Positioning table */}
                  <div className="p-5 space-y-4 text-xs">
                    {/* Domestic vs Overseas Contrast Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-850/60 pb-4">
                      {/* Left: Domestic */}
                      <div className="space-y-2 border-slate-850 md:border-r md:pr-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{isZh ? "🇨🇳 国内定位与话术" : "🇨🇳 Domestic Setup"}</span>
                        <div className="p-2.5 rounded-lg bg-slate-950/40 space-y-1">
                          <p className="text-slate-350 leading-relaxed font-sans">{isZh ? item.domesticPositioningZh : item.domesticPositioningEn}</p>
                          <p className="text-pink-400 font-bold italic text-[11px] mt-1">{isZh ? item.domesticSloganZh : item.domesticSloganEn}</p>
                        </div>
                      </div>

                      {/* Right: Overseas */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>{isZh ? "🌐 外海定位与合规重塑" : "🌐 Globalized Upgrade"}</span>
                        </span>
                        <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/10 space-y-1">
                          <p className="text-slate-200 leading-relaxed font-sans">{isZh ? item.overseasPositioningZh : item.overseasPositioningEn}</p>
                          <p className="text-cyan-300 font-bold italic text-[11px] mt-1">{isZh ? item.overseasSloganZh : item.overseasSloganEn}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key takeaways */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{isZh ? "💡 核心合规与等效心智基因" : "💡 Strategic Takeaway"}</span>
                      <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-900/60 font-sans">{isZh ? item.keyInsightZh : item.keyInsightEn}</p>
                    </div>

                    {/* North America vs LATAM specifics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] pt-1">
                      <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 space-y-1">
                        <p className="font-bold text-slate-450 border-b border-slate-900 pb-1 flex items-center gap-1">
                          <span>🇺🇸 North America</span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">北美落地</span>
                        </p>
                        <p className="text-slate-400 leading-relaxed font-sans">{item.naFocusZh}</p>
                      </div>
                      <div className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-900/60 space-y-1">
                        <p className="font-bold text-slate-450 border-b border-slate-900 pb-1 flex items-center gap-1">
                          <span>🇲🇽 Latin America</span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">拉美落地</span>
                        </p>
                        <p className="text-slate-400 leading-relaxed font-sans">{item.latamFocusZh}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Startup Tool Section */}
          <div className="border border-amber-500/10 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 p-6 md:p-8 space-y-6 relative overflow-hidden">
            {/* Ambient accent lights */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 z-10 relative">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>AI BRANDING GENOME ADAPTER</span>
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{isZh ? "初创企业出海定位与 Slogan 定制一键适配引擎" : "Startup Brand Slogan Adaptive Engine"}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isZh ? "输入您的主营品类和国内爆款原始宣传，系统编译器将自动进行广告合规除菌、翻译等效益映射，生成可在系统 RAG 数据库中装载的定制合规导则。" : "Instantly adapt your domestic brand slogans into premium, localized, compliant global messaging assets."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              {/* Form Input fields */}
              <div className="lg:col-span-5 space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
                {/* Category Vertical picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-350">{isZh ? "首选产品行业垂直类目" : "Product Vertical"}</label>
                  <select
                    value={startupCategory}
                    onChange={(e) => setStartupCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/40"
                  >
                    <option value="pet_tech">{isZh ? "🧸 智能宠物电器/喂食器 (Pet Tech)" : "Smart Pet Care"}</option>
                    <option value="ebike">{isZh ? "⚡ 绿色智能低碳电动车 (E-Bike)" : "Carbon Commuter E-Bike"}</option>
                    <option value="herbal_tea">{isZh ? "🍵 东方植物古汉冷泡茶 (Herbal Tea)" : "Wellness Oriental Tea"}</option>
                    <option value="custom">{isZh ? "❖ 其它品类 (手动输入个性定制)" : "Custom Enterprise Categories"}</option>
                  </select>
                </div>

                {/* Conditional custom category name */}
                {startupCategory === 'custom' && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs font-bold text-slate-350">{isZh ? "自定义出海品类名称" : "Custom Brand Category"}</label>
                    <input
                      type="text"
                      value={startupCustomCategory}
                      onChange={(e) => setStartupCustomCategory(e.target.value)}
                      placeholder={isZh ? "例如: 智能降噪冲浪板 / 婴儿恒温奶嘴" : "e.g., Smart Surfboard / E-Yoga Mat"}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                )}

                {/* Target Region */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-350">{isZh ? "落地出海目标大区" : "Target Territory"}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStartupRegion('NA')}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        startupRegion === 'NA'
                          ? 'bg-cyan-550/10 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🇺🇸 North America (北美)
                    </button>
                    <button
                      onClick={() => setStartupRegion('LATAM')}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        startupRegion === 'LATAM'
                          ? 'bg-cyan-550/10 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🇲🇽 Latin America (拉美)
                    </button>
                  </div>
                </div>

                {/* Domestic raw slogan input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-350">{isZh ? "国内诉求文案 (建议包含过度吹嘘/中草药疗效词)" : "Domestic Raw Slogan / Claims"}</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (startupCategory === 'pet_tech') {
                          setStartupRawSlogan(isZh ? "智能定时定量、不卡粮极速放电。随时看宠解焦虑白菜促销！" : "Smart timing, 2K cam to watch pet to solve separation anxiety with cheap pricing!");
                        } else if (startupCategory === 'ebike') {
                          setStartupRawSlogan(isZh ? "时速40迈超速狂飙跑山、极速跑更远、性能完爆全网！" : "40mph speeds, long range trail riding, best stats on the market!");
                        } else if (startupCategory === 'herbal_tea') {
                          setStartupRawSlogan(isZh ? "中药植物老方，排毒解酒护肝利尿、省下一大笔咖啡钱！" : "Ancient herbs of secret recipe, detoxifies liver/fat, perfect price!");
                        } else {
                          setStartupRawSlogan('');
                        }
                        showNotification(isZh ? '已恢复该品类预设的演示诉求！' : 'Loaded category demo preset!', 'info');
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none py-0.5 px-1 rounded hover:bg-slate-900"
                      title={isZh ? "重置并重新加载默认示范" : "Reset & reload demo presets"}
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{isZh ? "加载推荐预设" : "Load Preset"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={startupRawSlogan}
                    onChange={(e) => setStartupRawSlogan(e.target.value)}
                    placeholder={
                      startupCategory === 'pet_tech'
                        ? (isZh ? "智能定时定量、不卡粮极速放电。随时看宠解焦虑白菜促销！" : "Smart timing, 2K cam to watch pet to solve separation anxiety with cheap pricing!")
                        : startupCategory === 'ebike'
                        ? (isZh ? "时速40迈超速狂飙跑山、极速跑更远、性能完爆全网！" : "40mph speeds, long range trail riding, best stats on the market!")
                        : startupCategory === 'herbal_tea'
                        ? (isZh ? "中药植物老方，排毒解酒护肝利尿、省下一大笔咖啡钱！" : "Ancient herbs of secret recipe, detoxifies liver/fat, perfect price!")
                        : (isZh ? "例如：“狂暴大功率、秒杀打骨折、包治你神经衰弱和睡眠焦虑...”" : "Input raw direct hardmatic domestic tags...")
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/40 font-mono resize-none"
                  />
                  <span className="text-[10px] text-slate-500 block leading-relaxed select-none">
                    {isZh ? "🔥 提示：试着输入一些极其“中国特色营销”的口号，观察 AI 文化编译器如何在翻译和重塑时，进行无害化解耦，转化为符合当地环保、反成瘾和 FDA 法令的高客单价叙事。" : "🔥 Inside tip: Add heavy clinical promises or severe pricing slangs to observe how our engine dissolves and reconstructs copy."}
                  </span>
                </div>

                {/* RAG core constraints link block */}
                <div className="p-4 rounded-xl border border-dashed border-cyan-500/25 bg-cyan-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Link className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isZh ? "🔗 RAG 核心合规库实时联动" : "🔗 Live RAG Alignment Link"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        let matched = entries.find(e => {
                          if (startupCategory === 'pet_tech') return e.id === "rag-006";
                          if (startupCategory === 'ebike') return e.id === "rag-007";
                          if (startupCategory === 'herbal_tea') return e.id === "rag-008";
                          return e.id === appliedRagId;
                        });
                        if (matched) {
                          setSelectedEntryId(matched.id);
                          setIsEditingActive(false);
                          setIsCreatingNew(false);
                          setSubTab('evolution');
                          showNotification(isZh ? `已跳转并定位至【${matched.name}】规则卡！` : `Navigated to [${matched.name}]!`, 'info');
                        }
                      }}
                      className="text-[9px] text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-0.5 cursor-pointer bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded"
                    >
                      <Edit className="w-2.5 h-2.5" />
                      <span>{isZh ? "跳转直编该规则" : "Edit Rule"}</span>
                    </button>
                  </div>

                  {/* Dropdown for custom applied RAG selection */}
                  {startupCategory === 'custom' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 block text-left">{isZh ? "应用哪个 RAG 规则作为编译硬约束？" : "Apply which RAG constraints?"}</label>
                      <select
                        value={appliedRagId}
                        onChange={(e) => setAppliedRagId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500/40"
                      >
                        {entries.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({e.category.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-900 flex items-start justify-between gap-2 text-left">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-200 leading-snug">
                          {startupCategory === 'pet_tech' && (entries.find(e => e.id === 'rag-006')?.name || "智能宠物安全规约")}
                          {startupCategory === 'ebike' && (entries.find(e => e.id === 'rag-007')?.name || "E-Bike 欧美法规")}
                          {startupCategory === 'herbal_tea' && (entries.find(e => e.id === 'rag-008')?.name || "古汉草本 FDA 规约")}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          {isZh ? "状态：已挂载并实时监听更新" : "Status: Mounted & listening for local updates"}
                        </p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/10 font-mono shrink-0">
                        Active
                      </span>
                    </div>
                  )}

                  {/* Live rules preview */}
                  <div className="space-y-1 text-[10px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-900">
                    <p className="text-slate-400 font-bold border-b border-slate-900 pb-1 flex items-center justify-between select-none">
                      <span>{isZh ? `当前大区 (${startupRegion}) RAG 安全红线预览:` : `Active Region (${startupRegion}) RAG Preview:`}</span>
                      <span className="text-[8px] bg-slate-850 text-slate-500 px-1 rounded">Live DB Ref</span>
                    </p>
                    {(() => {
                      const matched = entries.find(e => {
                        if (startupCategory === 'pet_tech') return e.id === "rag-006";
                        if (startupCategory === 'ebike') return e.id === "rag-007";
                        if (startupCategory === 'herbal_tea') return e.id === "rag-008";
                        return e.id === appliedRagId;
                      });
                      const regionCode = startupRegion === "NA" ? "North America" : "Latin America";
                      const guideline = matched?.regionalGuidelines.find(g => g.region.includes(regionCode));
                      if (!guideline) {
                        return <p className="text-slate-500 italic py-1 text-center">{isZh ? "未检测到该大区规则" : "No rules for this region"}</p>;
                      }
                      return (
                        <div className="space-y-2 pt-1 font-sans text-left">
                          <div>
                            <span className="text-green-400 font-bold block">{isZh ? "✔ 必须满足的本地化加分特征 (Must-Haves):" : "✔ Must-Haves:"}</span>
                            <ul className="list-disc pl-4 text-slate-300 space-y-0.5 max-h-[80px] overflow-y-auto">
                              {guideline.mustHaves.slice(0, 3).map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-red-400 font-bold block">{isZh ? "✘ 严禁触犯的合规与文化雷区 (Must-Nots):" : "✘ Must-Nots:"}</span>
                            <ul className="list-disc pl-4 text-slate-300 space-y-0.5 max-h-[80px] overflow-y-auto">
                              {guideline.mustNots.slice(0, 3).map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  disabled={isBrandingEvolving}
                  onClick={handleGenerateBranding}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                    isBrandingEvolving
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black hover:opacity-90 shadow-lg shadow-amber-500/10'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isBrandingEvolving ? 'animate-spin' : ''}`} />
                  <span>{isZh ? "一键运行品牌出海重塑映射" : "Mutate and Compile Localized Branding Matrix"}</span>
                </button>
              </div>

              {/* Progress Terminal and Output Display */}
              <div className="lg:col-span-7 space-y-5">
                {/* Traces execution log */}
                {(isBrandingEvolving || brandingTraces.length > 0) && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2.5 font-mono text-[11px] leading-relaxed relative">
                    <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-900">
                      <span>CULTURE_OS ADAPTER COMPILER COMPILING...</span>
                      <span className="w-2 h-2 rounded bg-green-450 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      {brandingTraces.map((trace, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-emerald-400">
                          <span className="text-emerald-600 select-none">&gt;</span>
                          <p>{trace}</p>
                        </div>
                      ))}
                      {isBrandingEvolving && (
                        <div className="flex items-center gap-2 text-amber-400 animate-pulse pl-4 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>AI Agent compiling cultural re-alignment data vectors...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Adapt Result Display */}
                {customBrandResult && !isBrandingEvolving && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border border-cyan-500/20 rounded-2xl bg-slate-900/40 p-6 space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-cyan-550/15 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-extrabold">
                            {customBrandResult.region} ADAPTATION COMPLETED
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-lg mt-1">{customBrandResult.brandName}</h4>
                        <p className="text-xs text-amber-300 font-mono mt-0.5">{customBrandResult.category}</p>
                      </div>
                      
                      {/* Vibe labels */}
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {customBrandResult.vibeStickers.map((label: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-mono font-bold bg-[#14233c] text-cyan-350 border border-cyan-500/10 px-2 py-0.5 rounded-lg">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Compare layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
                      {/* Raw input */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">🇨🇳 DOMESTIC RAW SETUP (国内原始包装及原始野蛮话术)</span>
                        <p className="text-slate-350 italic font-mono leading-relaxed">{customBrandResult.domesticSlogan}</p>
                      </div>

                      {/* Transformed */}
                      <div className="bg-cyan-950/20 p-4 rounded-xl border border-cyan-500/15 space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 uppercase">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>🌐 LOCALIZED OPTIMIZED ASSETS (海外重组高端美标文案)</span>
                        </span>
                        <p className="text-cyan-200 font-extrabold italic text-sm py-1 font-sans">{customBrandResult.overseasSlogan}</p>
                        <p className="text-slate-300 text-xs mt-0.5 leading-relaxed font-sans">{customBrandResult.overseasPositioning}</p>
                      </div>
                    </div>

                    {/* Shift insight analysis */}
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">🧠 ADAPTER SHIFT INSIGHT (底层去味除味与心智合规解析报告)</span>
                      <p className="text-slate-300 leading-relaxed font-sans">{customBrandResult.keyStrategy}</p>
                    </div>

                    {/* Hard Must-Have / Must-Not guidelines to merge */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                      <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                        <p className="font-bold text-green-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>MUST-HAVES 刚性契合基因</span>
                        </p>
                        <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed font-sans">
                          {customBrandResult.mustHaves.map((m: string, i: number) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                        <p className="font-bold text-rose-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>MUST-NOTS 禁忌规避熔断红线</span>
                        </p>
                        <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed font-sans">
                          {customBrandResult.mustNots.map((m: string, i: number) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action buttons to write to DB */}
                    <div className="flex justify-end pt-3 border-t border-slate-800/40">
                      <button
                        onClick={handleMergeCustomBrandToRag}
                        className="bg-cyan-550 hover:bg-cyan-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-md hover:shadow-cyan-500/10"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isZh ? "一键写入并合并至 RAG 核心知识库中" : "Merge and Export Guide into Active RAG Database"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Empty state visual */}
                {!customBrandResult && !isBrandingEvolving && (
                  <div className="border border-dashed border-slate-800/80 p-12 rounded-2xl bg-slate-900/10 text-center space-y-3 flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Sparkles className="w-10 h-10 text-slate-600 animate-pulse" />
                    <p className="text-slate-400 font-bold text-xs">{isZh ? "未运行品牌突变编译器" : "No adaptation matrix computed yet"}</p>
                    <p className="text-slate-500 text-[11px] max-w-xs leading-relaxed font-sans">
                      {isZh ? "请在左侧表单中配置您的出海垂直行业、大区以及国内口号。点击【一键运行】按钮，编译器会在 1.8 秒内运行基因重组和去伪过滤，自动合成符合欧美/拉美最高合规标准的高品质对标导则模板！" : "Select your category on the sidebar and click the mutate compiler button to generate localized brand definitions."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* subTab === 'csv-database' */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-left">
          {/* Left Column: Databases List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Database className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{isZh ? 'DTC 预设关系数据表' : 'DTC Relational Databases'}</h4>
                  <p className="text-[10px] text-slate-500 font-sans">{isZh ? '包含 12 个预置 CSV 数据文件' : 'Browse raw preset CSV data tables'}</p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {CSV_DATABASES.map(db => {
                  const isActive = selectedCsvDbId === db.id;
                  return (
                    <div
                      key={db.id}
                      onClick={() => {
                        setSelectedCsvDbId(db.id);
                        setCsvSearchTerm('');
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 text-left ${
                        isActive
                          ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-900/20 border-slate-800/50 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div className="space-y-0.5 text-left">
                        <h5 className="text-xs font-bold font-sans tracking-wide">{isZh ? db.nameZh : db.nameEn}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal font-sans text-left">{db.description}</p>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-950 text-slate-400 rounded-md font-mono border border-slate-850 font-extrabold block w-fit mt-1">
                          {db.data.length} {isZh ? '行数据' : 'Rows'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manifest reference */}
            <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-850 space-y-2 text-left">
              <span className="text-[9px] text-indigo-400 font-black tracking-widest uppercase block">📂 MANIFEST INDEX 元数据目录 (manifest.csv)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans text-left">
                {isZh
                  ? '系统已成功将 14 个关系型数据存储文件挂载于项目根目录 /csv/ 路径下。各表间通过映射表（例如 category_narrative_map）智能推荐配对，实现了完整的自动化出海推荐闭环。'
                  : 'The system has successfully mapped the database topology index using physical CSV tables under /csv/ directory, forming a highly integrated relational loop.'}
              </p>
            </div>
          </div>

          {/* Right Column: Database Table Spreadsheet Grid */}
          <div className="lg:col-span-8 space-y-4 text-left">
            {(() => {
              const activeDb = CSV_DATABASES.find(d => d.id === selectedCsvDbId);
              if (!activeDb) return null;

              // Filter rows by search term
              const filteredData = activeDb.data.filter(row => {
                if (!csvSearchTerm) return true;
                const search = csvSearchTerm.toLowerCase();
                return Object.values(row).some(val => 
                  String(val).toLowerCase().includes(search)
                );
              });

              // Extract columns
              const columns = activeDb.data.length > 0 ? Object.keys(activeDb.data[0]) : [];

              return (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-4 text-left">
                  {/* Table Header and Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80 text-left">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 text-left">
                        <span className="text-sm font-black text-white font-sans">{isZh ? activeDb.nameZh : activeDb.nameEn}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-md border border-indigo-500/20 font-extrabold">
                          csv/{activeDb.id}.csv
                        </span>
                      </div>
                      <p className="text-xs text-slate-450 leading-relaxed font-sans text-left">{activeDb.description}</p>
                    </div>

                    {/* Row count pill */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center font-mono">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isZh ? '搜索结果' : 'ROWS'}:</span>
                      <span className="text-xs bg-indigo-500/15 text-indigo-400 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/10">
                        {filteredData.length} / {activeDb.data.length}
                      </span>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-850 px-3 py-2 rounded-xl">
                    <Compass className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      placeholder={isZh ? '搜索表中任意列数据（如："tiktok" 或 "美妆"）...' : 'Search any column values in this table...'}
                      value={csvSearchTerm}
                      onChange={(e) => setCsvSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-200 border-none outline-none focus:ring-0 placeholder-slate-600 font-sans"
                    />
                    {csvSearchTerm && (
                      <button onClick={() => setCsvSearchTerm('')} className="text-slate-500 hover:text-slate-300 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Data Table */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/40 text-left">
                    <div className="overflow-x-auto max-h-[480px]">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-[#0b1220] border-b border-slate-850">
                            {columns.map(col => {
                              // Friendly title mapping
                              const friendlyName: Record<string, string> = {
                                id: 'ID',
                                nameZh: isZh ? '名称 (CN)' : 'Name (CN)',
                                nameEn: 'Name (EN)',
                                descriptionZh: isZh ? '描述 (CN)' : 'Description (CN)',
                                descriptionEn: 'Description (EN)',
                                active: isZh ? '状态' : 'Active',
                                hofstedeIdv: isZh ? '霍氏个人主义指数' : 'Hofstede IDV',
                                categoryId: 'Category ID',
                                narrativeId: 'Narrative ID',
                                platformId: 'Platform ID',
                                marketId: 'Market ID',
                                caseId: 'Case ID',
                                fitScore: 'Fit Score',
                                categoryZh: isZh ? '类别 (CN)' : 'Category (CN)',
                                categoryEn: 'Category (EN)',
                                ruleCode: 'Rule Code',
                                severity: isZh ? '严重度' : 'Severity',
                                formatZh: isZh ? '渠道特征' : 'Format (CN)',
                                formatEn: 'Format (EN)',
                                templateBodyZh: isZh ? '模板主体' : 'Template Body (CN)',
                                templateBodyEn: 'Template Body (EN)',
                                metricZh: isZh ? '评估维度' : 'Metric (CN)',
                                metricEn: 'Metric (EN)',
                                targetValue: isZh ? '度量目标' : 'Target Value',
                                briefJson: 'Brief JSON Configuration',
                                culturePackJson: 'Culture Pack JSON Payload'
                              };
                              return (
                                <th key={col} className="px-4 py-3 font-bold font-sans text-slate-400 border-r border-slate-850/60 uppercase tracking-wider select-none shrink-0 whitespace-nowrap">
                                  {friendlyName[col] || col}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/60 font-mono">
                          {filteredData.length > 0 ? (
                            filteredData.map((row: any, rIdx) => (
                              <tr key={rIdx} className="hover:bg-indigo-500/[0.02] transition">
                                {columns.map(col => {
                                  const cellValue = row[col];
                                  return (
                                    <td key={col} className="px-4 py-2.5 text-slate-300 border-r border-slate-850/40 align-top max-w-[250px] truncate-cell leading-relaxed font-sans text-[11px] text-left">
                                      {typeof cellValue === 'boolean' ? (
                                        cellValue ? (
                                          <span className="inline-flex items-center gap-1 text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded-full text-[9px] font-sans border border-green-500/10">
                                            <Check className="w-3 h-3" /> ACTIVE
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-800 px-1.5 py-0.5 rounded-full text-[9px] font-sans border border-slate-700">
                                            DISABLED
                                          </span>
                                        )
                                      ) : col === 'severity' ? (
                                        cellValue === 'high' ? (
                                          <span className="inline-flex items-center gap-1 text-red-400 font-black bg-red-500/10 px-1.5 py-0.5 rounded-full text-[9px] font-sans border border-red-500/10 uppercase">
                                            ⚠️ High Risk
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-full text-[9px] font-sans border border-amber-500/10 uppercase">
                                            Medium Risk
                                          </span>
                                        )
                                      ) : col === 'fitScore' ? (
                                        <div className="flex items-center gap-1 font-mono">
                                          <span className="text-green-400 font-black font-sans">{cellValue}%</span>
                                          <div className="w-8 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-green-500 h-full" style={{ width: `${cellValue}%` }}></div>
                                          </div>
                                        </div>
                                      ) : String(cellValue).startsWith('{') || String(cellValue).startsWith('[') ? (
                                        <div className="max-h-[100px] overflow-y-auto bg-slate-950 p-2 rounded border border-slate-900 font-mono text-[9px] text-indigo-300 leading-snug whitespace-pre-wrap text-left">
                                          {JSON.stringify(JSON.parse(cellValue), null, 2)}
                                        </div>
                                      ) : (
                                        <span className="line-clamp-4 leading-normal text-left">{String(cellValue)}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 text-xs font-sans">
                                {isZh ? '没有找到符合搜索条件的记录数据。' : 'No rows match search filter.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-slate-950/95 backdrop-blur-md shadow-2xl max-w-md"
            style={{
              borderColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : toast.type === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)',
              boxShadow: toast.type === 'error' ? '0 10px 30px -10px rgba(239, 68, 68, 0.15)' : toast.type === 'warning' ? '0 10px 30px -10px rgba(245, 158, 11, 0.15)' : '0 10px 30px -10px rgba(6, 182, 212, 0.15)'
            }}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <div className="text-xs font-sans text-slate-100 pr-4 leading-relaxed font-medium">
              {toast.message}
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-450 hover:text-slate-200 transition p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b1220] border border-red-500/25 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider font-sans">
                    {isZh ? '确认要永久删除吗？' : 'Confirm Permanent Deletion'}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {isZh 
                      ? '此操作是不可逆的。删除后，此自定义品牌/大区合规基因规章将从系统知识库中永久抹除。' 
                      : 'This action is completely irreversible. This custom ruleset card will be removed permanently from the RAG store.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900 text-xs">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:text-white text-slate-400 cursor-pointer transition font-sans"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={confirmDeleteCustomCard}
                  className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 font-extrabold text-white cursor-pointer transition font-sans shadow-md shadow-red-500/10"
                >
                  {isZh ? '确认删除' : 'Delete Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
