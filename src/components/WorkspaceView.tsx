import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Play, Settings, Terminal, Sparkles, CheckCircle2, RotateCw, 
  AlertTriangle, Layers, Activity, Check, Bookmark, Info, Flame, Trash2,
  Database, Volume2, RefreshCw, Compass, ShieldCheck, Award, ArrowRight
} from 'lucide-react';
import { CampaignBrief, AgentNode, TraceLog, CulturePack } from '../types';
import { PRESETS } from '../data/presets';
import { INITIAL_RAG_ENTRIES } from '../data/rag_presets';
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

interface WorkspaceViewProps {
  lang: 'zh' | 'en';
  agents: AgentNode[];
  onWorkflowComplete: (pack: CulturePack, finalLogs: TraceLog[], brief: CampaignBrief) => void;
  activeRunId: string | null;
  setActiveRunId: (id: string | null) => void;
  currentUser?: any;
  onConsumeQuota?: (actionName: string) => boolean;
}

interface ConsultationState {
  entityType: 'brand' | 'personal' | null;
  category: string | null;
  stage: string | null;
  painPoint: string | null;
}

const SIMPLE_TEMPLATES: Record<string, { zh: string; directEn: string; directEs: string; eqEn: string; eqEs: string; explanationZh: string; explanationEn: string }> = {
  cosmetics: {
    zh: "极致抗皱淡斑黄金面霜：纯人参提取物，10天内消除黑色素并抚平深层皱纹，让你年轻二十岁，重新拥有完美白皙肌肤！",
    directEn: "Ultimate Anti-Wrinkle Spot Fading Gold Cream: Pure ginseng extract, eliminates melanin and smooths deep wrinkles in 10 days, making you look twenty years younger and possess perfect white skin!",
    directEs: "Crema de oro definitiva para eliminar arrugas y manchas: Extracto puro de ginseng, elimina la melanina y suaviza las arrugas profundas en 10 días, ¡haciéndote lucir veintidós años más joven y con una piel blanca perfecta!",
    eqEn: "Clean Botanical Ginseng Skin Food: Gently soothe your skin's natural moisture barrier. Formulated with pure, sustainably sourced plant extracts to restore weightless luminosity and raw vitality.",
    eqEs: "Nutrición botánica purificada con ginseng: Calma suavemente la barrera de hidratación natural de tu piel. Formulado con extractos de plantas puros para restaurar una luminosidad ingrávida.",
    explanationZh: "【FDA/FTC风控对齐】：规避了『消除黑色素』、『年轻二十岁』等极高违规风险的绝对性药用宣传，转译为符合欧美高知识产阶级审美的『天然屏障营养』和『植物活力恢复』，将强硬的推销转为情绪悦己叙事。",
    explanationEn: "[FDA/FTC Compliance Realignment]: Replaced extreme medical claims ('eliminates melanin', 'looks 20 years younger') with compliant self-care elements ('nourish natural moisture barrier', 'sustainably sourced plant extracts') favored by high-end Western demographics."
  },
  personal_ip: {
    zh: "阿琪是我抖音电台：今晚阿琪为你翻唱一首张国荣的《风继续吹》，陪伴深夜加班的你。请双击屏幕点赞并分享给需要温暖的朋友！",
    directEn: "Aqi is me Douyin Radio: Tonight Aqi will cover Leslie Cheung's 'Wind Blows On' for you, accompanying you working late. Please double-click screen to like and share with friends who need warmth!",
    directEs: "Radio de Douyin de Aqi: Esta noche Aqi cantará un cover de 'Wind Blows On' de Leslie Cheung para ti, acompañándote a trabajar tarde. ¡Dale doble clic para dar me gusta!",
    eqEn: "Aqi Cover Acoustic: Strumming a vintage melody tonight just for you. Grab a warm cup of tea, take a slow breath, and let the busy day fade away into the late-night ambient breeze.",
    eqEs: "Aqi Cover Acústico: Tocando una melodía vintage esta noche solo para ti. Toma una taza de té caliente, respira lentamente y deja que el día se desvanezca en la brisa.",
    explanationZh: "【本土化内容起号对齐】：去除了带有明显中式带货套路的『点赞分享』，将其转译为西方极度流行的『ASMR深夜温情陪伴』与『Lo-fi慢生活美学』，完美契合 TikTok 推荐推流算法的情感共鸣因子。",
    explanationEn: "[Viral Algorithmic Seeding Realignment]: Replaced literal Chinese call-to-actions ('double-click to like', 'share to friends') with cozy late-night ASMR acoustic vibes and slow-living aesthetic cues that organically score high on Western FYP algorithms."
  },
  ebike: {
    zh: "极速智能电动自行车：超大容量电池，骑行续航高达200公里，时速50公里，电机动力超强，解决你的出行焦虑，碾压所有传统单车！",
    directEn: "Super Fast Smart Electric Bike: Super large capacity battery, riding range up to 200km, speed 50km/h, super strong motor power, solves your travel anxiety and crushes all traditional bicycles!",
    directEs: "Bicicleta eléctrica inteligente súper rápida: Batería de gran capacidad, autonomía de hasta 200 km, velocidad de 50 km/h, motor súper potente, ¡resuelve tu ansiedad de viaje!",
    eqEn: "Eco-Ebike Silent Cruiser: Rediscover your city with carbon-neutral freedom. Engineered with seamless battery efficiency for quiet weekend escapes and mindful, traffic-free daily commutes.",
    eqEs: "Eco-Ebike Silent Cruiser: Redescubre tu ciudad con libertad neutra en carbono. Diseñado con una eficiencia de batería perfecta para escapes de fin de semana silenciosos.",
    explanationZh: "【大区ESG准入对齐】：规避了可能引发地缘交通处罚的『时速50公里』超限宣称与侵略性对比词『碾压传统』，转译为欧洲极度崇尚的『碳中和自由』与『静音周末出逃』，提升品牌社会责任认知度。",
    explanationEn: "[ESG Regulatory Realignment]: Avoided aggressive speeds claims (50km/h violates EU Class-1 restrictions) and comparative brag words ('crushes others'). Reframed into highly praised 'carbon-neutral freedom' and 'quiet escapes' targeting European eco-conscious elites."
  },
  pet_iot: {
    zh: "智能宠物监控喂食器：高清摄像头24小时无死角监控你的小狗，一旦发出叫声立刻提醒，自动投喂零食，防止它得抑郁症和过度拆家！",
    directEn: "Smart Pet Camera Feeder: HD camera monitors your dog 24 hours with no dead angle, reminds you immediately if it barks, automatically feeds snacks to prevent depression and house destroying!",
    directEs: "Alimentador con cámara inteligente para mascotas: Cámara de alta definición que monitorea a tu perro las 24 horas, ¡alimentación automática para evitar la depresión!",
    eqEn: "PawsComfort Companion: Stay close to your furry friend, wherever the day takes you. Quiet notifications and balanced snack-dispensing keep tails wagging and paws happy, stress-free.",
    eqEs: "Compañero PawsComfort: Mantente cerca de tu amigo peludo, dondequiera que te lleve el día. Las notificaciones silenciosas mantienen las colas moviéndose de forma feliz.",
    explanationZh: "【情绪内核净化对齐】：将带有焦虑暗示的『拆家』、『抑郁症』和过度监控词『无死角监控』，转译为倡导宠物福利的『默默陪伴』与『无压力摇尾欢喜』，符合海外中产对动物福利的高感性定位。",
    explanationEn: "[Animal Welfare & Emotional Realignment]: Softened anxiety-inducing, micro-managing terminology ('no dead angle monitoring', 'prevent depression/house destroying') into animal-centric positive wellness narrative ('quiet companion', 'keep tails wagging and paws happy')."
  },
  wellness_tea: {
    zh: "东方安神降火本草茶：天然蒲公英金银花秘方，1天内消除身体炎症，快速降血压，清热解毒，是熬夜上火、高血压人群的救命神仙茶！",
    directEn: "Oriental Soothing Fire-Reducing Herbal Tea: Natural dandelion and honeysuckle secret formula, eliminates body inflammation in 1 day, rapidly lowers blood pressure, clears heat and detoxifies, is a life-saving fairy tea for people staying up late or having high blood pressure!",
    directEs: "Té de hierbas calmante oriental: Fórmula secreta de diente de león y madreselva, elimina la inflamación corporal en 1 día, ¡es un té de hadas que salva vidas para la presión alta!",
    eqEn: "Zen-Breeze Botanical Infusion: A comforting cup of wild dandelion and sweet honeysuckle. Unwind after a long day with a gentle, caffeine-free herbal brew designed to restore inner equilibrium.",
    eqEs: "Infusión botánica Zen-Breeze: Una reconfortante taza de diente de león silvestre y madreselva dulce. Desconéctate después de un largo día con una infusión suave.",
    explanationZh: "【药监法案合规对齐】：FDA 严格禁止非药品食品宣称任何治疗效果（如『消除炎症』、『降低血压』等）。转译为符合欧美瑜伽白领审美的『Zen-Breeze 深夜安神』与『恢复内在平衡』，完全符合安全监管并提升调性。",
    explanationEn: "[FDA Compliance Realignment]: FDA strictly bans dietary supplements from claiming therapeutic actions ('eliminates inflammation', 'lowers blood pressure'). Reframed into aesthetic wellness storytelling ('Zen-Breeze Botanical Infusion', 'restore inner equilibrium') suited for health food boutiques."
  },
  ai_tools: {
    zh: "智能AI视频爆款生成器：一键抓取全网热点视频，3秒钟自动配音剪辑合成，批量发布到TikTok，每天自动躺赚1000美金，小白也能轻松暴富！",
    directEn: "Smart AI Viral Video Generator: One-click scrape hot videos on whole web, 3 seconds auto dubbing and clipping synthesis, batch post to TikTok, auto earn $1000 daily, newbies easily get rich!",
    directEs: "Generador de video viral inteligente de IA: Raspado de videos calientes con un clic, earn $1000 al día, ¡los novatos se enriquecen fácilmente!",
    eqEn: "FlowEdit Creator Hub: Supercharge your visual storytelling. Elevate raw footage into thumb-stopping social clips with automated multi-format adjustments and seamless smart audio layering.",
    eqEs: "FlowEdit Creator Hub: Potencia tu narración visual. Convierte imágenes sin procesar en clips sociales atractivos con ajustes automáticos y capas de audio inteligentes.",
    explanationZh: "【合规与版权自清算对齐】：剔除可能触发平台封号和法律起诉的『抓取全网』、『暴富套现』和『小白躺赚』等灰色诱导性宣称，转译为高大上的『视觉叙事加速』及『多平台自适应』，完美通过社交媒体广告合规检测。",
    explanationEn: "[Platform Compliance & IP Safety Realignment]: Purged gray-hat claims ('scrape whole web', 'newbies easily get rich', 'earn $1000 daily') that trigger instant shadowbans and copyright lawsuits. Rebuilt as professional, high-vibe SaaS tool terminology ('supercharge visual storytelling', 'seamless smart audio layering')."
  }
};

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

  // --- Progressive Onboarding Experience States ---
  const [activeJourneyStep, setActiveJourneyStep] = useState<'consulting' | 'simple_edit' | 'purification' | 'advanced'>('consulting');
  const [skipToAdvanced, setSkipToAdvanced] = useState<boolean>(false);

  // Chat Consultation State
  const [consultationState, setConsultationState] = useState<ConsultationState>({
    entityType: null,
    category: null,
    stage: null,
    painPoint: null
  });
  const [consultationProgress, setConsultationProgress] = useState<number>(0); // 0 = entity, 1 = category, 2 = stage, 3 = painPoint, 4 = finished
  const [consultingChat, setConsultingChat] = useState<{ sender: 'advisor' | 'user'; text: string; options?: { label: string; value: string }[] }[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<number>(0);
  const [showDiagnosticResult, setShowDiagnosticResult] = useState<boolean>(false);
  const [diagnosticMessage, setDiagnosticMessage] = useState<string>('');

  // Step 2: Simple Edit States
  const [simpleInputText, setSimpleInputText] = useState<string>('');
  const [simpleOutputText, setSimpleOutputText] = useState<string>('');
  const [simpleDirectTranslation, setSimpleDirectTranslation] = useState<string>('');
  const [simpleAnalysisText, setSimpleAnalysisText] = useState<string>('');
  const [isTranslatingSimple, setIsTranslatingSimple] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Step 3: Database Purification States
  const [purifiedRules, setPurifiedRules] = useState<{ id: string; name: string; type: string; status: 'pending' | 'purifying' | 'purified' }[]>([
    { id: 'rule-1', name: 'FDA 宣称合规扫描 (Anti-aging claims screening)', type: 'regulatory', status: 'pending' },
    { id: 'rule-2', name: '地缘商标著作权防交叉侵权 (Trademark & Copyright audit)', type: 'copyright', status: 'pending' },
    { id: 'rule-3', name: 'FTC 联盟关系利益主动披露审查 (FTC Endorsement compliance)', type: 'disclosure', status: 'pending' },
  ]);

  // State managers
  const [selectedPreset, setSelectedPreset] = useState<string>('lucky_deer');
  const [ipType, setIpType] = useState<'brand' | 'personal'>('brand');
  const [ipName, setIpName] = useState('');
  const [cultureAsset, setCultureAsset] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [emotionalKernelText, setEmotionalKernelText] = useState('');
  const [mustHaveText, setMustHaveText] = useState('');
  const [mustNotText, setMustNotText] = useState('');
  const [brandTone, setBrandTone] = useState('');
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);

  // DTC Preset Database states
  const [dbCategory, setDbCategory] = useState<string>('cosmetics');
  const [dbMarket, setDbMarket] = useState<string>('north_america');
  const [dbAudience, setDbAudience] = useState<string>('female_consumers');
  const [isDbPanelOpen, setIsDbPanelOpen] = useState<boolean>(true);

  // Selected RAG active card
  const [ragList, setRagList] = useState<any[]>([]);
  const [activeRagId, setActiveRagId] = useState<string>('rag-001');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cultureos_rag_entries');
      if (saved) {
        setRagList(JSON.parse(saved));
      } else {
        setRagList(INITIAL_RAG_ENTRIES);
      }
    } catch (e) {
      setRagList(INITIAL_RAG_ENTRIES);
    }
  }, []);

  // --- Onboarding Journey Initializer and Handlers ---
  useEffect(() => {
    setConsultingChat([
      {
        sender: 'advisor',
        text: isZh 
          ? "你好！我是 CultureOS 首席出海智囊顾问 杰里。跨大区传播并非机械式的直译，而是『文化转译』与『合规红线安全防区』的精妙协同。为了量身匹配你的成长需求、规避地缘侵权，能告诉我你目前属于什么实体类型吗？"
          : "Hello! I am Jerry, Chief Outbound Advisor of CultureOS. Scale is more than translation; it is the synergy of 'cultural translation' and 'compliance safeguards'. To customize your setup, what is your outbound entity type?",
        options: [
          { label: isZh ? '🏢 公司品牌出海 (DTC Brand)' : '🏢 Company DTC Brand', value: 'brand' },
          { label: isZh ? '🎨 个人 IP 博主 (Influencer)' : '🎨 Personal Creator IP', value: 'personal' }
        ]
      }
    ]);
    setConsultationProgress(0);
    setConsultationState({ entityType: null, category: null, stage: null, painPoint: null });
    setShowDiagnosticResult(false);
  }, [lang]);

  const handleSelectOption = (value: string, label: string) => {
    const updatedChat = [
      ...consultingChat,
      { sender: 'user' as const, text: label }
    ];
    setConsultingChat(updatedChat);

    setTimeout(() => {
      if (consultationProgress === 0) {
        setConsultationState(prev => ({ ...prev, entityType: value as 'brand' | 'personal' }));
        setConsultationProgress(1);
        setConsultingChat(prev => [
          ...updatedChat,
          {
            sender: 'advisor',
            text: isZh 
              ? "明白！定位清晰。接下来，你目前的产品或内容处于哪一个品类赛道？我们将为你绑定对应的 Hofstede 先验图腾库与大区安全合规限制集。"
              : "Clear positioning! Next, what is your product or content category niche? We will bind corresponding Hofstede prior models and safety regulatory blacklists.",
            options: [
              { label: isZh ? '💄 美妆护肤与国潮美学' : '💄 Cosmetics & Skincare', value: 'cosmetics' },
              { label: isZh ? '🚴 绿色电动出行硬件' : '🚴 E-Bike Eco-mobility', value: 'ebike' },
              { label: isZh ? '🐕 智能宠物硬件与 IoT' : '🐕 Smart Pet IoT', value: 'pet_iot' },
              { label: isZh ? '🍵 东方本草养生茶饮' : '🍵 Wellness Tea', value: 'wellness_tea' },
              { label: isZh ? '💻 AI 效率与 SaaS 工具' : '💻 AI SaaS Tools', value: 'ai_tools' },
              { label: isZh ? '🎤 个人自媒体 / 音乐二创' : '🎤 Personal Vlog / C-Pop Covers', value: 'personal_ip' }
            ]
          }
        ]);
      } else if (consultationProgress === 1) {
        setConsultationState(prev => ({ ...prev, category: value }));
        setConsultationProgress(2);
        setConsultingChat(prev => [
          ...updatedChat,
          {
            sender: 'advisor',
            text: isZh 
              ? "很好，品类基因库关联成功。目前你的项目处于哪一个出海或者成长阶段？"
              : "Excellent, category library bound. What is your current overseas growth or launch stage?",
            options: [
              { label: isZh ? '🌱 种子用户冷启动与内容爆款起号' : '🌱 Cold Launch & Organic Content Seeding', value: 'cold_launch' },
              { label: isZh ? '📈 大区订阅转化与海外独立站沉淀' : '📈 Regional Subscription & High Retention', value: 'saas_expansion' },
              { label: isZh ? '🔥 矩阵式中小红人创作者联盟分发' : '🔥 Creator Alliance Syndicate & Distribution', value: 'matrix_viral' }
            ]
          }
        ]);
      } else if (consultationProgress === 2) {
        setConsultationState(prev => ({ ...prev, stage: value }));
        setConsultationProgress(3);
        setConsultingChat(prev => [
          ...updatedChat,
          {
            sender: 'advisor',
            text: isZh 
              ? "收到。在跨大区本土化的全周期中，你目前最担忧的痛点是？"
              : "Got it. Throughout your local scaling cycle, what is your biggest concern or pain point?",
            options: [
              { label: isZh ? '❌ 地缘合规禁令和版权法规红牌' : '❌ Strict Regulatory Bans & Copyright Claims', value: 'compliance' },
              { label: isZh ? '❌ 中式直译、毫无当地文化情感共鸣' : '❌ Semantic Clichés & Boring Direct Translations', value: 'cliche' },
              { label: isZh ? '❌ 自媒体推荐算法不推荐、冷启动低迷' : '❌ Low Organic Reach & Cold-Launch Failures', value: 'viral_flow' }
            ]
          }
        ]);
      } else if (consultationProgress === 3) {
        setConsultationState(prev => ({ ...prev, painPoint: value }));
        setConsultationProgress(4);
        setConsultingChat(prev => [
          ...updatedChat,
          {
            sender: 'advisor',
            text: isZh 
              ? "咨询完成！顾问诊断已就绪。请点击下方『生成智能诊断书』按钮，我将为你量身定制专属的诊断建议与一条由浅入深的功能路径引导，准备好帮你的创意扬帆出海了！"
              : "Consultation finished! Diagnostic insights are ready. Click 'Generate Growth Diagnosis' below to unlock your custom strategic report and progressive experience path!"
          }
        ]);
      }
    }, 600);
  };

  const runDiagnosticProcess = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticProgress(10);
    
    const statusMsgs = [
      isZh ? "📡 正在拉取 target_markets.csv 与 categories.csv 推荐对齐..." : "📡 Syncing categories.csv and target_markets.csv metrics...",
      isZh ? "🧬 正在执行 9维 文化相关性 Hofstede 映射计算与雷达拟合..." : "🧬 Compiling Hofstede 9-dimensional social radar coordinates...",
      isZh ? "🛡️ 正在进行 FTC / FDA 广告地缘安全版权黑名单防线筛查..." : "🛡️ Scanning FTC / FDA local risk rules guidelines databases...",
      isZh ? "✅ 诊断书与专属分层路径生成完毕！" : "✅ Diagnostics and adaptive path synthesized!"
    ];

    let i = 0;
    setDiagnosticMessage(statusMsgs[0]);

    const interval = setInterval(() => {
      setDiagnosticProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDiagnosticRunning(false);
            setShowDiagnosticResult(true);
            
            // AUTOMATICALLY load the correct preset and bind correct RAG constraints based on chosen category!
            const cat = consultationState.category || 'cosmetics';
            if (cat === 'cosmetics') {
              loadPreset('lucky_deer');
              setSelectedPreset('lucky_deer');
              setActiveRagId('rag-001');
            } else if (cat === 'personal_ip') {
              loadPreset('aqi_isme');
              setSelectedPreset('aqi_isme');
              setActiveRagId('rag-005');
            } else if (cat === 'ebike') {
              loadPreset('green_ebike');
              setSelectedPreset('green_ebike');
              setActiveRagId('rag-007');
            } else if (cat === 'pet_iot') {
              loadPreset('smart_pet');
              setSelectedPreset('smart_pet');
              setActiveRagId('rag-006');
            } else if (cat === 'wellness_tea') {
              loadPreset('wellness_tea');
              setSelectedPreset('wellness_tea');
              setActiveRagId('rag-008');
            } else if (cat === 'ai_tools') {
              // Custom build or ai_tools preset
              setSelectedPreset('custom');
              setDbCategory('ai_tools');
              setIpType('brand');
              setIpName('FlowEdit AI');
              setCultureAsset('多媒体AI自动混音与智能微剪切');
              setBusinessGoal('赋能全球自媒体人一键视觉爆款创作');
              setEmotionalKernelText('flow context, instant release, smart audio');
              setBrandTone('high-energy, futuristic, modern tech');
              setTargetRegions(['North America']);
              setTargetPlatforms(['TikTok', 'Instagram Reels']);
              setActiveRagId('rag-003');
              setMustHaveText('flow context; instant release; smart audio');
              setMustNotText('Copyright infringement; illegal music scrap; auto earn cash claim');
            }
            
            // Preload Simple Adaptor input text
            const simpleText = SIMPLE_TEMPLATES[cat]?.zh || SIMPLE_TEMPLATES.cosmetics.zh;
            setSimpleInputText(simpleText);
            setSimpleDirectTranslation('');
            setSimpleOutputText('');
            setSimpleAnalysisText('');

          }, 400);
          return 100;
        }
        i++;
        if (statusMsgs[i]) setDiagnosticMessage(statusMsgs[i]);
        return prev + 25;
      });
    }, 600);
  };

  const executeSimpleTranslation = () => {
    setIsTranslatingSimple(true);
    setTimeout(() => {
      const cat = consultationState.category || 'cosmetics';
      const template = SIMPLE_TEMPLATES[cat] || SIMPLE_TEMPLATES.cosmetics;
      setSimpleDirectTranslation(isZh ? template.directEn : template.directEs);
      setSimpleOutputText(isZh ? template.eqEn : template.eqEs);
      setSimpleAnalysisText(isZh ? template.explanationZh : template.explanationEn);
      setIsTranslatingSimple(false);
    }, 1200);
  };

  const playHealingMelody = () => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Pentatonic scale (C4, D4, E4, G4, A4, C5)
      let time = ctx.currentTime;
      
      for (let i = 0; i < 8; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.frequency.setValueAtTime(freq, time);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.12, time + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.9);
        time += 0.45;
      }
      setTimeout(() => {
        setIsAudioPlaying(false);
        ctx.close();
      }, 4500);
    } catch (e) {
      console.warn("Audio Context blocked or not supported", e);
      setIsAudioPlaying(false);
    }
  };

  const purifyRule = (id: string) => {
    setPurifiedRules(prev => prev.map(r => r.id === id ? { ...r, status: 'purifying' as const } : r));
    setTimeout(() => {
      setPurifiedRules(prev => prev.map(r => r.id === id ? { ...r, status: 'purified' as const } : r));
    }, 1000);
  };

  const handleSelectRag = (id: string) => {
    setActiveRagId(id);
    const matched = (ragList.length > 0 ? ragList : INITIAL_RAG_ENTRIES).find(r => r.id === id);
    if (matched && matched.regionalGuidelines) {
      const r1 = matched.regionalGuidelines[0];
      const r2 = matched.regionalGuidelines[1];
      
      const mustHaves = [
        ...(r1 ? r1.mustHaves : []),
        ...(r2 ? r2.mustHaves : [])
      ];
      const mustNots = [
        ...(r1 ? r1.mustNots : []),
        ...(r2 ? r2.mustNots : [])
      ];

      setMustHaveText(mustHaves.join('; '));
      setMustNotText(mustNots.join('; '));
    }
  };

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

  // Inject Custom Brief from the preloaded relational CSV database
  const injectDatabasePreset = () => {
    // If they selected 'personal_ip', let's load 'aqi_isme' preset directly to make it super high fidelity!
    if (dbCategory === 'personal_ip') {
      loadPreset('aqi_isme');
      setSelectedPreset('aqi_isme');
      setActiveRagId('rag-005');
      return;
    }
    // If they selected 'cosmetics', let's load 'lucky_deer' preset directly!
    if (dbCategory === 'cosmetics') {
      loadPreset('lucky_deer');
      setSelectedPreset('lucky_deer');
      setActiveRagId('rag-001');
      return;
    }

    // Otherwise, generate a super polished customized brief on-the-fly!
    const catObj = CATEGORIES_PRESETS.find(c => c.id === dbCategory);
    const marObj = TARGET_MARKETS_PRESETS.find(m => m.id === dbMarket);
    const audObj = AUDIENCES_PRESETS.find(a => a.id === dbAudience);

    const narrativeId = CATEGORY_NARRATIVE_MAPS.find(m => m.categoryId === dbCategory)?.narrativeId || 'oriental_aesthetics';
    const narrative = CULTURE_NARRATIVES_PRESETS.find(n => n.id === narrativeId);

    const platformId = CATEGORY_PLATFORM_MAPS.find(m => m.categoryId === dbCategory)?.platformId || 'tiktok';
    const platform = PLATFORMS_PRESETS.find(p => p.id === platformId);

    const activeRisk = RISK_RULES_PRESETS.find(r => 
      (dbCategory === 'cosmetics' && r.id === 'risk_medical') ||
      (dbCategory === 'ai_tools' && r.id === 'risk_copyright') ||
      (dbMarket === 'europe' && r.id === 'risk_privacy') ||
      r.id === 'risk_copyright'
    );

    setIpName(isZh ? `${catObj?.nameZh || '出海品牌'}·出海${marObj?.nameZh || '项目'}` : `${catObj?.nameEn || 'Brand'} - ${marObj?.nameEn || 'Outbound'}`);
    setCultureAsset(isZh ? `「${narrative?.nameZh || '东方意境'}」跨文化视觉元素及生活方式代言` : `"${narrative?.nameEn || 'Oriental Aesthetics'}" localized cultural motif`);
    setBusinessGoal(isZh ? `在${marObj?.nameZh || '海外'}市场确立品类心智并打通转化漏斗` : `Establish category mindshare and hit outbound conversion KPIs`);
    setEmotionalKernelText(`${narrativeId}, ${dbAudience}, mindfulness, companionship`);

    setMustHaveText(isZh 
      ? `结合 [${platform?.nameZh || 'TikTok'}] 卡点，融入 [${narrative?.nameZh || '东方意境'}] 独特视觉符号; 保持低姿态平视交流` 
      : `Sync with [${platform?.nameEn || 'TikTok'}] audio pacing, embed [${narrative?.nameEn || 'Oriental Aesthetics'}] symbolic markers; maintain direct peer tone`
    );

    setMustNotText(isZh
      ? `严禁触碰 [${activeRisk?.categoryZh || '版权'}] 规则（规避代码: ${activeRisk?.ruleCode || 'DMCA'}）; 严禁进行任何夸大药理功效宣称`
      : `Strictly avoid [${activeRisk?.categoryEn || 'Copyright'}] violations (Code: ${activeRisk?.ruleCode || 'DMCA'}); no medical drug claims`
    );

    setBrandTone(isZh ? `${narrative?.nameZh || '怀旧'}、舒缓、富有匠心温度` : `${narrative?.nameEn || 'Nostalgic'}, soothing, highly tactile`);
    
    // Map dbMarket to UI regions
    if (dbMarket === 'latin_america') {
      setTargetRegions(['Latin America']);
    } else {
      setTargetRegions(['North America']);
    }

    setTargetPlatforms([platform?.nameEn || 'TikTok']);
    setSelectedPreset('custom');

    // Dynamically auto-bind correct RAG constraint card based on injected database category
    let targetRagId = 'rag-002';
    if (dbCategory === 'pet_iot') targetRagId = 'rag-006';
    else if (dbCategory === 'ebike') targetRagId = 'rag-007';
    else if (dbCategory === 'wellness_tea') targetRagId = 'rag-008';
    else if (dbCategory === 'ai_tools') targetRagId = 'rag-003';
    setActiveRagId(targetRagId);
  };

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
    if (presetId === 'aqi_isme') {
      setIpType('personal');
      setActiveRagId('rag-005');
    } else if (presetId === 'green_ebike') {
      setIpType('brand');
      setActiveRagId('rag-007');
    } else if (presetId === 'smart_pet') {
      setIpType('brand');
      setActiveRagId('rag-006');
    } else if (presetId === 'wellness_tea') {
      setIpType('brand');
      setActiveRagId('rag-008');
    } else {
      setIpType('brand');
      setActiveRagId('rag-001');
    }
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
  const startSimulation = async () => {
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
      targetRegions: targetRegions.length > 0 ? targetRegions : ['North America'],
      targetPlatforms: targetPlatforms.length > 0 ? targetPlatforms : ['TikTok']
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

    const logsToFeed: TraceLog[] = [];

    // Custom logger append function
    const pushLog = (agent: string, event: string, msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const log = { timestamp: new Date().toLocaleTimeString(), agent, event, message: msg, type };
      logsToFeed.push(log);
      setSimulationLogs([...logsToFeed]);
    };

    pushLog('System', 'Initialization', isZh ? '正在启动 CultureOS 本地化智算引擎... 初始化端点链路。' : 'Booting CultureOS engine... Setting session namespace workspace.', 'info');
    if (hasEvolvedRag) {
      pushLog('System', 'RAG Autolink', isZh ? `[RAG 知识库关联就绪]: 成功读取已完成自主演化的文化边界安全原则(V${evolvedVersion})，高风险审查红线已自动对齐。` : `[RAG Autolink Success]: Loaded evolved guidelines (V${evolvedVersion}) directly into the localization context limits!`, 'success');
    }
    pushLog('OrchestratorAgent', 'Active', isZh ? '正在反编译原 brief 品类，锁定大区语义红线。' : 'Applying campaign boundaries... parsing target markets.', 'info');

    // Visual step sequence loop running in background while fetching
    let stepCount = 0;
    const visualInterval = setInterval(() => {
      if (stepCount < 6) {
        setCurrentStepIndex(stepCount);
        setLocalAgents(prev => prev.map((a, i) => i === stepCount ? { ...a, status: 'running' as const } : i < stepCount ? { ...a, status: 'done' as const } : a));
        
        const agentName = defaultAgents[stepCount]?.name || 'Agent';
        pushLog(agentName, 'Cognitive Process', isZh ? `正在对大区 [${targetRegions.join(', ')}] 进行多节点适配推导...` : `Running cross-cultural semantic alignment target: [${targetRegions.join(', ')}]`, 'info');
        stepCount++;
      }
    }, 700);

    try {
      const savedCredentials = localStorage.getItem('cultureos_credentials') || '{}';
      let parsedCreds = { customApiKey: '', customApiBase: '' };
      try { parsedCreds = JSON.parse(savedCredentials); } catch (e) {}

      // Call Express server-side Gemini/Model integration route
      const response = await fetch("/api/campaign/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: currentBrief,
          ipType,
          customApiKey: parsedCreds.customApiKey,
          customApiBase: parsedCreds.customApiBase
        })
      });

      const data = await response.json();
      clearInterval(visualInterval);

      if (data.success && data.culturePack) {
        // Complete the pipeline visually
        setLocalAgents(prev => prev.map(a => ({ ...a, status: 'done' as const })));
        
        // Append actual dynamic outputs
        const finalLogs = data.logs || logsToFeed;
        setSimulationLogs(finalLogs);
        
        setIsRunning(false);
        setCurrentStepIndex(-1);

        // Invoke callback to feed data dynamically back to Presentation and other views
        onWorkflowComplete(data.culturePack, finalLogs, currentBrief);

        // Add to history list
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

      } else {
        throw new Error(data.error || "Campaign generation payload is invalid.");
      }
    } catch (err: any) {
      clearInterval(visualInterval);
      pushLog('System', 'Heuristic Recovery', isZh ? `发生接口偏离 (${err.message})，正在启用高可信局部启发式本地化引擎兜底适配！` : `Network loop interrupted (${err.message}). Activating cognitive heuristics...`, 'warning');
      
      // Local Heuristic Fallback using the static PRESET matching to guarantee 100% stable demo behavior
      setTimeout(() => {
        const activePresetData = PRESETS[selectedPreset] || PRESETS.lucky_deer;
        const fallbackPack = activePresetData.culturePack;
        const fallbackLogs = activePresetData.logs;

        setLocalAgents(prev => prev.map(a => ({ ...a, status: 'done' as const })));
        pushLog('System', 'Fallback Complete', isZh ? '应急本地启发式规则匹配完毕。本地化资产成功收敛渲染。' : 'Fallback pipeline finished. Saved closest localized outcomes.', 'success');
        
        setIsRunning(false);
        setCurrentStepIndex(-1);
        onWorkflowComplete(fallbackPack, fallbackLogs, currentBrief);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8">
      {/* 出海定位与渐进体验旅程导航轨道 (Enterprise Outbound Journey Navigation Rail) */}
      <div className="bg-[#0b101c]/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">CultureOS User Journey</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-sans tracking-tight">
              <span>{isZh ? '全球出海定位诊断与自适应体验旅程' : 'Global Positioning Diagnosis & Progressive Journey'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isZh 
                ? '我们已将数据库与 AI 译配功能按难易度分层，帮助你在出海征程中由浅入深、规避地缘侵权红线。' 
                : 'Interactive learning roadmap layering complex tools into easy-to-use discovery steps.'}
            </p>
          </div>
          
          {/* Skip Bypass / Toggle Mode Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSkipToAdvanced(!skipToAdvanced);
                if (!skipToAdvanced) setActiveJourneyStep('advanced');
                else setActiveJourneyStep('consulting');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                skipToAdvanced || activeJourneyStep === 'advanced'
                  ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-300 hover:bg-indigo-500/20'
                  : 'bg-amber-400 text-slate-950 font-extrabold border-amber-350 hover:bg-amber-350 shadow-lg shadow-amber-400/10'
              }`}
            >
              <span>{skipToAdvanced || activeJourneyStep === 'advanced' 
                ? (isZh ? '🛡️ 切换回新手引导 / Back to Guide' : '🛡️ Guided Assistant')
                : (isZh ? '⚡ 直接体验 7-Agent 高端终端 / Skip to Advanced' : '⚡ Skip to Advanced Mode')
              }</span>
            </button>
          </div>
        </div>

        {/* 4 Steps Timeline Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <button
            onClick={() => {
              if (!skipToAdvanced) setActiveJourneyStep('consulting');
            }}
            disabled={skipToAdvanced}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-[82px] cursor-pointer ${
              activeJourneyStep === 'consulting' && !skipToAdvanced
                ? 'bg-amber-400/5 border-amber-400/80 shadow-md'
                : 'bg-slate-950/40 border-slate-900/80 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono font-bold text-slate-500">STEP 01</span>
              {consultationProgress === 4 ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full font-mono font-bold">100%</span>
              ) : (
                <span className="text-slate-600 font-mono text-[9px]">{isZh ? '未完成' : 'Pending'}</span>
              )}
            </div>
            <div>
              <h4 className={`text-xs font-bold tracking-tight ${activeJourneyStep === 'consulting' && !skipToAdvanced ? 'text-amber-350' : 'text-slate-300'}`}>
                {isZh ? '🌐 智脑出海咨询顾问' : '🌐 Outbound AI Advisor'}
              </h4>
              <p className="text-[10px] text-slate-500 font-sans truncate w-full mt-0.5">
                {isZh ? '出海定位与雷达诊断' : 'Global Diagnostic chat'}
              </p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => {
              if (!skipToAdvanced) {
                if (consultationProgress < 4) {
                  alert(isZh ? "请先完成 Step 1 的智脑咨询诊断哦！" : "Please complete Step 1 AI Consultation first!");
                  return;
                }
                setActiveJourneyStep('simple_edit');
              }
            }}
            disabled={skipToAdvanced}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-[82px] cursor-pointer ${
              activeJourneyStep === 'simple_edit' && !skipToAdvanced
                ? 'bg-amber-400/5 border-amber-400/80 shadow-md'
                : 'bg-slate-950/40 border-slate-900/80 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono font-bold text-slate-500">STEP 02</span>
              {simpleOutputText ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full font-mono font-bold">Done</span>
              ) : (
                <span className="text-slate-600 font-mono text-[9px]">{isZh ? '未解锁' : 'Locked'}</span>
              )}
            </div>
            <div>
              <h4 className={`text-xs font-bold tracking-tight ${activeJourneyStep === 'simple_edit' && !skipToAdvanced ? 'text-amber-350' : 'text-slate-300'}`}>
                {isZh ? '✍️ 极简内容译配尝试' : '✍️ Content Adaptation'}
              </h4>
              <p className="text-[10px] text-slate-500 font-sans truncate w-full mt-0.5">
                {isZh ? '中式直译 vs 情感代偿' : 'Direct vs Cultural adaptation'}
              </p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => {
              if (!skipToAdvanced) {
                if (consultationProgress < 4) {
                  alert(isZh ? "请先完成 Step 1 的智脑咨询诊断哦！" : "Please complete Step 1 AI Consultation first!");
                  return;
                }
                setActiveJourneyStep('purification');
              }
            }}
            disabled={skipToAdvanced}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-[82px] cursor-pointer ${
              activeJourneyStep === 'purification' && !skipToAdvanced
                ? 'bg-amber-400/5 border-amber-400/80 shadow-md'
                : 'bg-slate-950/40 border-slate-900/80 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono font-bold text-slate-500">STEP 03</span>
              {purifiedRules.every(r => r.status === 'purified') ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full font-mono font-bold">Done</span>
              ) : (
                <span className="text-slate-600 font-mono text-[9px]">{isZh ? '待自进化' : 'Evolving'}</span>
              )}
            </div>
            <div>
              <h4 className={`text-xs font-bold tracking-tight ${activeJourneyStep === 'purification' && !skipToAdvanced ? 'text-amber-350' : 'text-slate-300'}`}>
                {isZh ? '🧹 自进化库合规净化' : '🧹 Database Purification'}
              </h4>
              <p className="text-[10px] text-slate-500 font-sans truncate w-full mt-0.5">
                {isZh ? 'RAG 规约扫描与边界安全' : 'Sanitize RAG regulatory bounds'}
              </p>
            </div>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => {
              if (!skipToAdvanced) {
                if (consultationProgress < 4) {
                  alert(isZh ? "请先完成 Step 1 的智脑咨询诊断哦！" : "Please complete Step 1 AI Consultation first!");
                  return;
                }
                setActiveJourneyStep('advanced');
              }
            }}
            disabled={skipToAdvanced}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-[82px] cursor-pointer ${
              activeJourneyStep === 'advanced' && !skipToAdvanced
                ? 'bg-amber-400/5 border-amber-400/80 shadow-md'
                : 'bg-slate-950/40 border-slate-900/80 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono font-bold text-slate-500">STEP 04</span>
              <span className="text-slate-600 font-mono text-[9px]">{isZh ? '高级' : 'Advanced'}</span>
            </div>
            <div>
              <h4 className={`text-xs font-bold tracking-tight ${activeJourneyStep === 'advanced' && !skipToAdvanced ? 'text-amber-350' : 'text-slate-300'}`}>
                {isZh ? '⚙️ 7-Agent 全案协同' : '⚙️ 7-Agent Workstation'}
              </h4>
              <p className="text-[10px] text-slate-500 font-sans truncate w-full mt-0.5">
                {isZh ? '千万推流大案对抗演练' : 'Simulate mass brand launches'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* --- Step 1: AI Chat Consulting Wizard Layout --- */}
      {activeJourneyStep === 'consulting' && !skipToAdvanced && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Chat Panel (7 cols) */}
          <div className="lg:col-span-7 border border-slate-800 rounded-2xl bg-[#090d16]/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/25">
                <Compass className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{isZh ? 'CultureOS 首席出海智脑顾问 (Jerry)' : 'CultureOS Chief Advisor Jerry'}</h4>
                <p className="text-[10px] text-slate-500 font-mono">Status: Online | Specialized in Hofstede Social & FTC/FDA Safety Bounds</p>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
              {consultingChat.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'advisor' && (
                    <div className="h-7 w-7 rounded-lg bg-amber-400/10 flex items-center justify-center border border-amber-400/20 text-xs font-black text-amber-400 flex-shrink-0">
                      J
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-400 text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Buttons for current question */}
            {consultingChat[consultingChat.length - 1]?.options && (
              <div className="border-t border-slate-800/50 pt-4 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">{isZh ? '请选择顾问咨询提议：' : 'Select your answer:'}</span>
                <div className="flex flex-wrap gap-2">
                  {consultingChat[consultingChat.length - 1].options?.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(opt.value, opt.label)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic trigger when finished */}
            {consultationProgress === 4 && !showDiagnosticResult && !isDiagnosticRunning && (
              <div className="border-t border-slate-800/50 pt-4 text-center space-y-3 animate-bounce">
                <p className="text-xs text-amber-400 font-semibold">{isZh ? '🎉 咨询已完成！顾问已为你调配完对应的 Hofstede 及法规限制模型。' : '🎉 Consultation Done! Strategic variables aligned.'}</p>
                <button
                  onClick={runDiagnosticProcess}
                  className="px-6 py-3 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-350 shadow-lg shadow-amber-400/10 cursor-pointer transition flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>{isZh ? '✨ 立即生成专属出海定位诊断书' : '✨ Generate Strategic Diagnostics'}</span>
                </button>
              </div>
            )}

            {/* Loader animation */}
            {isDiagnosticRunning && (
              <div className="border-t border-slate-800/50 pt-6 text-center space-y-4">
                <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-850 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${diagnosticProgress}%` }} />
                </div>
                <p className="text-xs font-mono text-slate-400 animate-pulse">{diagnosticMessage}</p>
              </div>
            )}
          </div>

          {/* Diagnostic Report Panel (5 cols) */}
          <div className="lg:col-span-5 border border-slate-800 rounded-2xl bg-[#090d16]/90 p-6 space-y-6 shadow-xl min-h-[460px] flex flex-col justify-between">
            {!showDiagnosticResult ? (
              <div className="flex flex-col items-center justify-center text-center my-auto space-y-3">
                <Compass className="w-12 h-12 text-slate-700 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-400">{isZh ? '出海诊断与适配路径报告' : 'Diagnostics & Adaptive Roadmap'}</h4>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  {isZh 
                    ? '在左侧完成咨询问答，顾问即可拉取目标大区先验文化因子，生成高度适配你产品发展阶段的系统功能建议路径。' 
                    : 'Complete advisor chat to analyze Hofstede data & target regulatory constraints.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-black text-slate-100">{isZh ? '🏢 全球化先验定位与诊断结论' : '🏢 Global Positioning & Diagnostics'}</h4>
                  </div>
                  
                  {/* Customized Content Based on Chosen Category */}
                  {consultationState.category === 'cosmetics' && (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                        <strong className="text-green-400 font-bold block mb-1">{isZh ? '【定位诊断：大有可为！】' : '【Verdict: Highly Viable!】'}</strong>
                        <span className="text-slate-300">
                          {isZh 
                            ? '主攻北美中产素食自愈主义。前台打造「草本东方美学」减压概念，后台启动 FDA 药词红线硬防护。' 
                            : 'Targeting NA middle-class vegan self-care lifestyle. Frontstage builds high-end botanical aesthetics; backend binds strict FDA anti-claim limits.'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-slate-400"><strong className="text-slate-200">Pros:</strong> {isZh ? '北美具有极高的高情绪价值付费红利，素食无残忍(Cruelty-free)在北美Z世代中拥有高达82%的推流权重。' : 'High willingness to pay for emotional self-care products. Cruelty-free elements get massive push on TikTok and Reels algorithms.'}</p>
                        <p className="text-slate-400"><strong className="text-slate-200">Risks:</strong> {isZh ? '美国食品药监局(FDA)严禁非药品食品直接宣称『消除黑色素』等临床疗效。' : 'FDA forbids non-medical beauty items from claiming literal clinical actions.'}</p>
                      </div>
                    </div>
                  )}

                  {consultationState.category === 'personal_ip' && (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <strong className="text-purple-400 font-bold block mb-1">{isZh ? '【定位诊断：共鸣心流显著！】' : '【Verdict: Strong Resonance Flow】'}</strong>
                        <span className="text-slate-300">
                          {isZh 
                            ? '主攻海外华人与亚裔二代的情感自愈。前台打造「阿琪是我」深夜暖心弹唱，后台核准地缘原版翻唱版权。' 
                            : 'Focusing on Diaspora communities seeking emotional connection. Frontstage centers late-night slow music covers; backend monitors copyright risk flags.'}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-slate-400"><strong className="text-slate-200">Pros:</strong> {isZh ? '华语经典二创、老街树风等东方慢美学对华人圈层具备高黏性、低转化壁垒优势。' : 'C-Pop nostalgia elements trigger extreme high retention among diaspora demographics.'}</p>
                        <p className="text-slate-400"><strong className="text-slate-200">Risks:</strong> {isZh ? '版权保护在欧美是绝对红牌，必须通过 RAG 原版授权过滤，防范 DMCA 下架封号。' : 'DMCA copyright claims are strict in NA/EU. Requires complete RAG copyright sanitizing.'}</p>
                      </div>
                    </div>
                  )}

                  {/* Fallback details for other categories */}
                  {['ebike', 'pet_iot', 'wellness_tea', 'ai_tools'].includes(consultationState.category || '') && (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                        <strong className="text-cyan-400 font-bold block mb-1">{isZh ? '【定位诊断：定位精细，红线明确】' : '【Verdict: Focused Niche, Clear Boundaries】'}</strong>
                        <span className="text-slate-300">
                          {isZh 
                            ? `主攻垂直出海。前台打造「绿色减压/智能陪伴」情感体验，后台对齐大区 ESG 及地缘法律规约。` 
                            : `Focusing on high-growth niche. Frontstage centers eco-living/mindful connection; backend binds regional ESG/FTC disclosures.`}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-slate-400"><strong className="text-slate-200">Pros:</strong> {isZh ? '地缘情绪痛点明确，大区中产阶级愿意为碳中和绿色认证与宠物福利支付溢价。' : 'High willingness to pay a premium for carbon-neutral certifications or strict pet wellness compliance.'}</p>
                        <p className="text-slate-400"><strong className="text-slate-200">Risks:</strong> {isZh ? '欧盟 GDPR 数据合规、交通速度限制以及 FTC 利益关系主动披露是不容触碰的规则。' : 'EU GDPR data limits, E-Bike speed laws, and FTC affiliate disclosures are strictly monitored.'}</p>
                      </div>
                    </div>
                  )}

                  {/* Roadmap details inside report */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <strong className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-extrabold">{isZh ? '🛠️ 推荐自适应体验路径 (Recommended Path)' : '🛠️ Recommended Experience Path'}</strong>
                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <p>1. <strong className="text-amber-400">{isZh ? '极简译配' : 'Adaptor'}</strong>: {isZh ? '体验如何将中文宣传词敏捷过滤、转译为情感代偿。' : 'Experience filtering and translating raw concepts.'}</p>
                      <p>2. <strong className="text-amber-400">{isZh ? '合规安全净化' : 'Purifier'}</strong>: {isZh ? '扫描并净化你的 RAG 约束库，消除违法地缘侵权漏洞。' : 'Sanitize RAG boundaries for legal compliance.'}</p>
                      <p>3. <strong className="text-amber-400">{isZh ? '7-Agent 推演' : 'Advanced'}</strong>: {isZh ? '启动终极协同终端，多角色智能体自主合流产出全案。' : 'Unlock multi-agent workflow to construct mass campaigns.'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveJourneyStep('simple_edit')}
                  className="w-full mt-4 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-350 cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  <span>{isZh ? '🔓 去解锁 Step 2：体验极简智能译配' : '🔓 Unlock Step 2: Content Adaptation'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Step 2: Content Localization Adaptor Layout --- */}
      {activeJourneyStep === 'simple_edit' && !skipToAdvanced && (
        <div className="border border-slate-800 rounded-2xl bg-[#090d16]/90 p-6 space-y-6 shadow-xl animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{isZh ? 'Step 2: 极简智能译配与去陈词滥调尝试' : 'Step 2: Lightweight Content Adaptation Playground'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isZh 
                  ? '在此阶段体验 CultureOS 如何过滤中文带货词，并以符合 Hofstede 文化偏好的本土化“情感代偿”形式转译。' 
                  : 'Experience how CultureOS filters semantic clichés and translates them into high-engagement local narratives.'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={playHealingMelody}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  isAudioPlaying 
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 animate-pulse' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isAudioPlaying ? (isZh ? '🎵 正在演奏中...' : '🎵 Playing Synth...') : (isZh ? '🎵 试听大区温情背景配乐' : '🎵 Audition Healing Synth')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Box (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-extrabold">
                {isZh ? '原始中文创意广告文案 (Original Chinese Copy)' : 'Original Chinese Copy'}
              </label>
              <textarea
                value={simpleInputText}
                onChange={(e) => setSimpleInputText(e.target.value)}
                className="w-full h-[180px] bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-3 text-xs font-semibold text-slate-300 leading-relaxed focus:border-amber-400 outline-none"
              />
              <button
                onClick={executeSimpleTranslation}
                disabled={isTranslatingSimple}
                className="w-full py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-350 cursor-pointer flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-400/5 disabled:opacity-60"
              >
                {isTranslatingSimple ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isZh ? '正在执行去陈词转译中...' : 'Translating & Filtering Clichés...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isZh ? '✨ 执行智能转译 & 地缘合规净化' : '✨ Translate & Purify Semantic Clichés'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Cards (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-[260px] space-y-4">
              {!simpleOutputText ? (
                <div className="border border-dashed border-slate-850 rounded-xl flex flex-col items-center justify-center text-center p-8 my-auto space-y-2">
                  <Terminal className="w-8 h-8 text-slate-800 animate-pulse" />
                  <h5 className="text-xs font-bold text-slate-400">{isZh ? '等待智能转译结果' : 'Awaiting translation output'}</h5>
                  <p className="text-[10px] text-slate-600 max-w-xs">{isZh ? '点击左侧按钮，即可对比中式直译与符合合规审美的 CultureOS 情绪代偿转译结果。' : 'Click Translate to see direct vs compliant results.'}</p>
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Direct Translation (Boring/Risky) */}
                    <div className="border border-red-900/20 bg-red-950/5 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-red-400 text-[10px] font-bold font-mono">{isZh ? '⚠️ 常见中式直译 (Risky Direct Translation)' : '⚠️ Risky Direct Translation'}</strong>
                        <span className="text-[8px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">{isZh ? '高危/生硬' : 'Cliché/Noisy'}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium italic">
                        "{simpleDirectTranslation}"
                      </p>
                    </div>

                    {/* CultureOS Translation (Compliant/Aesthetic) */}
                    <div className="border border-green-500/20 bg-green-950/5 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-green-400 text-[10px] font-bold font-mono">{isZh ? '✅ CultureOS 情绪代偿 (Compliant Outbound Copy)' : '✅ Compliant Outbound Copy'}</strong>
                        <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">{isZh ? '安全/共鸣' : 'Aesthetic'}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans font-bold">
                        "{simpleOutputText}"
                      </p>
                    </div>
                  </div>

                  {/* Hofstede Context Box */}
                  <div className="p-4 bg-slate-950/90 border border-slate-850 rounded-xl space-y-1.5">
                    <strong className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-extrabold">{isZh ? '📊 HOFSTEDE 跨大区文化转译深度解析 (Translation Analytics)' : '📊 Cultural Translation Analysis'}</strong>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {simpleAnalysisText}
                    </p>
                  </div>

                  {/* Next Step Navigation */}
                  <div className="text-right">
                    <button
                      onClick={() => setActiveJourneyStep('purification')}
                      className="px-5 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-350 cursor-pointer flex items-center gap-1.5 ml-auto transition"
                    >
                      <span>{isZh ? '🔓 去解锁 Step 3：净化自进化安全库' : '🔓 Unlock Step 3: Database Purification'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Step 3: Database Purification Sandbox Layout --- */}
      {activeJourneyStep === 'purification' && !skipToAdvanced && (
        <div className="border border-slate-800 rounded-2xl bg-[#090d16]/90 p-6 space-y-6 shadow-xl animate-fade-in">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>{isZh ? 'Step 3: 知识库 RAG 自动自净化扫描' : 'Step 3: RAG Knowledge Base Purification'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isZh 
                ? '在 7-Agent 开始自主工作前，必须执行边界规约净化。这确保智能体生成的视频和文章百分之百不侵权、对齐 FDA/FTC 法规红线。' 
                : 'Sanitize global marketing limits. Purifying these rules prevents multi-agent pipelines from crossing legal trademarks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {purifiedRules.map(rule => (
              <div key={rule.id} className="border border-slate-850 rounded-xl p-4 flex flex-col justify-between h-[150px] bg-slate-950/60 relative overflow-hidden">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400 rounded-full">
                      {rule.type.toUpperCase()}
                    </span>
                    {rule.status === 'purified' ? (
                      <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isZh ? '已核准 V1.1' : 'Purified'}</span>
                      </span>
                    ) : rule.status === 'purifying' ? (
                      <span className="text-[10px] text-amber-400 font-bold animate-pulse">{isZh ? '正在扫描...' : 'Scanning...'}</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold">{isZh ? '待核准' : 'Pending'}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 pt-1 leading-snug">{rule.name}</h4>
                </div>

                <div className="pt-2">
                  {rule.status === 'pending' && (
                    <button
                      onClick={() => purifyRule(rule.id)}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-[10px] font-black rounded-lg transition cursor-pointer"
                    >
                      {isZh ? '🧼 执行净化 & 授权' : '🧼 Purify & Authorize'}
                    </button>
                  )}
                  {rule.status === 'purifying' && (
                    <div className="w-full py-1.5 text-center text-slate-500 text-[10px] font-mono animate-pulse">
                      {isZh ? '正在校验大区法案规约...' : 'Scanning regulatory bounds...'}
                    </div>
                  )}
                  {rule.status === 'purified' && (
                    <div className="w-full py-1.5 text-center text-green-400 text-[10px] font-mono bg-green-500/5 rounded-lg border border-green-500/10 font-bold">
                      {isZh ? '✓ 安全授权就绪' : '✓ Safe & Confirmed'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Success Banner and Next Step Button */}
          {purifiedRules.every(r => r.status === 'purified') ? (
            <div className="p-4 border border-green-500/15 bg-green-500/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-green-300">{isZh ? '🎉 知识库自进化合规净化 100% 达成！' : '🎉 100% Database Purified & Verified!'}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">{isZh ? '地缘侵权红线已闭合安全防区，智能体具备完全合规全案对抗推演条件。' : 'Regulatory constraints are compiled successfully and locked inside RAG buffers.'}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveJourneyStep('advanced')}
                className="px-5 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-350 cursor-pointer flex items-center gap-1.5 transition whitespace-nowrap shadow-lg shadow-amber-400/10"
              >
                <span>{isZh ? '🔓 踏上终极旅程：进入 7-Agent 全案终端' : '🔓 Unlock Step 4: Run Advanced Terminal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 border border-slate-850 rounded-xl bg-slate-950/40 text-center">
              <p className="text-xs text-slate-500">{isZh ? '💡 请点击上方的卡片对三个合规规章执行“净化授权”，以解锁最后的 7-Agent 极速全案终端。' : '💡 Clean all three compliance rules above to unlock Step 4 Advanced Mission Control.'}</p>
            </div>
          )}
        </div>
      )}

      {/* --- Step 4: Advanced 7-Agent Workstation --- */}
      {(activeJourneyStep === 'advanced' || skipToAdvanced) && (
        <>
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
          {/* DTC Category Relational Database Panel */}
          <div className="border border-indigo-500/20 rounded-2xl bg-[#0d1527]/90 p-5 space-y-4 shadow-lg shadow-indigo-950/10">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDbPanelOpen(!isDbPanelOpen)}>
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/25">
                  <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{isZh ? 'DTC 出海预设关系型数据库' : 'DTC Outbound Tag Database'}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full font-mono border border-indigo-500/20 font-extrabold">14 CSV Loaded</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans leading-none mt-0.5">
                    {isZh ? '产品行业分类 ➔ 目标大区 ➔ 自动推荐文化叙事及投放平台' : 'Select category and target market to dynamically match custom narratives and platforms.'}
                  </p>
                </div>
              </div>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-bold">
                {isDbPanelOpen ? (isZh ? '[-] 收起数据库' : '[-] Collapse DB') : (isZh ? '[+] 展开数据库' : '[+] Expand DB')}
              </button>
            </div>

            {isDbPanelOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2 border-t border-slate-800/60"
              >
                {/* selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isZh ? '行业分类 (categories.csv)' : 'Category'}</label>
                    <select
                      value={dbCategory}
                      onChange={(e) => setDbCategory(e.target.value)}
                      className="w-full bg-slate-950/95 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 px-3 py-2 rounded-lg cursor-pointer outline-none focus:border-indigo-500"
                    >
                      {CATEGORIES_PRESETS.map(c => (
                        <option key={c.id} value={c.id}>{c.nameZh} ({c.nameEn})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isZh ? '目标市场 (target_markets.csv)' : 'Target Market'}</label>
                    <select
                      value={dbMarket}
                      onChange={(e) => setDbMarket(e.target.value)}
                      className="w-full bg-slate-950/95 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 px-3 py-2 rounded-lg cursor-pointer outline-none focus:border-indigo-500"
                    >
                      {TARGET_MARKETS_PRESETS.map(m => (
                        <option key={m.id} value={m.id}>{m.nameZh} ({m.nameEn})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isZh ? '目标人群 (audiences.csv)' : 'Audience'}</label>
                    <select
                      value={dbAudience}
                      onChange={(e) => setDbAudience(e.target.value)}
                      className="w-full bg-slate-950/95 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 px-3 py-2 rounded-lg cursor-pointer outline-none focus:border-indigo-500"
                    >
                      {AUDIENCES_PRESETS.map(a => (
                        <option key={a.id} value={a.id}>{a.nameZh} ({a.nameEn})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recommended Dynamic Matching Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Recommended Narrative Card */}
                  {(() => {
                    const matchedNarrativeId = CATEGORY_NARRATIVE_MAPS.find(m => m.categoryId === dbCategory)?.narrativeId;
                    const fitScore = CATEGORY_NARRATIVE_MAPS.find(m => m.categoryId === dbCategory)?.fitScore || 95;
                    const narrative = CULTURE_NARRATIVES_PRESETS.find(n => n.id === matchedNarrativeId);
                    if (!narrative) return null;
                    return (
                      <div className="bg-indigo-950/15 border border-indigo-500/10 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">{isZh ? '推荐叙事 (culture_narratives.csv)' : 'Narrative Recommendation'}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full font-black border border-green-500/15">{fitScore}% Fit</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-200 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isZh ? narrative.nameZh : narrative.nameEn}</span>
                          </h5>
                          <p className="text-[10px] text-slate-450 font-medium leading-relaxed font-sans">
                            {isZh ? narrative.descriptionZh : narrative.descriptionEn}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Recommended Platform Card */}
                  {(() => {
                    const matchedPlatformId = CATEGORY_PLATFORM_MAPS.find(m => m.categoryId === dbCategory)?.platformId;
                    const fitScore = CATEGORY_PLATFORM_MAPS.find(m => m.categoryId === dbCategory)?.fitScore || 95;
                    const platform = PLATFORMS_PRESETS.find(p => p.id === matchedPlatformId);
                    if (!platform) return null;
                    return (
                      <div className="bg-indigo-950/15 border border-indigo-500/10 p-3 rounded-xl flex flex-col justify-between space-y-1.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">{isZh ? '推荐渠道 (platforms.csv)' : 'Platform Recommendation'}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded-full font-black border border-green-500/15">{fitScore}% Fit</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-200 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>{platform.nameEn}</span>
                          </h5>
                          <p className="text-[10px] text-slate-450 font-medium leading-relaxed font-sans">
                            {isZh ? platform.formatZh : platform.formatEn}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* KPI goals and Rules */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="space-y-1">
                    <span className="text-[9px] text-indigo-400 font-extrabold uppercase block">🎯 {isZh ? '度量指标 (kpi_presets.csv)' : 'Target Outbound KPIs'}</span>
                    <ul className="list-disc list-inside text-slate-450 font-sans space-y-0.5 leading-snug">
                      {KPI_PRESETS.map(k => (
                        <li key={k.id} className="truncate">
                          <span className="font-bold text-slate-300">[{isZh ? k.nameZh : k.nameEn}]:</span> {k.targetValue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-rose-400 font-extrabold uppercase block">🛡️ 合规审查红线 (risk_rules.csv)</span>
                    <ul className="list-disc list-inside text-slate-450 font-sans space-y-0.5 leading-snug">
                      {RISK_RULES_PRESETS.filter(r => 
                        r.id === 'risk_copyright' || 
                        (dbCategory === 'cosmetics' && r.id === 'risk_medical') ||
                        (dbMarket === 'europe' && r.id === 'risk_privacy')
                      ).map(r => (
                        <li key={r.id} className="truncate text-rose-300/90 font-medium">
                          <span className="font-bold text-rose-400">[{r.ruleCode}]:</span> {isZh ? r.categoryZh : r.categoryEn}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Inject Action Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                  <span className="text-[10px] font-sans font-medium text-slate-400 leading-normal">
                    {isZh 
                      ? '💡 一键注入后，系统将加载 categories、target_markets 推荐映射，自动填入名称、文化资产、商业目标、必须与禁止等表单配置。如果选择个人IP（阿琪是我）或美妆（一鹿繁花）案例，将自动读取 pre-baked 完美大包。' 
                      : 'Load chosen matching matrix to overwrite Campaign Brief forms. If personal IP or cosmetics is selected, full preset package loads automatically.'}
                  </span>
                  <button
                    type="button"
                    onClick={injectDatabasePreset}
                    className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10 shrink-0 w-full sm:w-auto justify-center"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{isZh ? '一键注入品类数据库' : 'Inject Selected Preset'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              <span>{isZh ? '配置出海 Brief' : 'Configure Campaign Brief'}</span>
            </h3>

            {/* IP Type Selection Toggle */}
            <div className="border border-slate-800/60 p-4 rounded-xl bg-slate-950/40 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                {isZh ? '🔍 IP 诊断分类与适配维度' : 'IP Diagnosis Classification'}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  id="ip-type-brand"
                  disabled={isRunning}
                  onClick={() => setIpType('brand')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black border transition-all duration-150 flex flex-col items-start gap-1 cursor-pointer text-left ${
                    ipType === 'brand'
                      ? 'bg-gradient-to-r from-blue-950 to-indigo-950/80 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-850 text-slate-450 hover:text-slate-300 hover:bg-slate-900/40'
                  }`}
                >
                  <span className={`text-xs font-extrabold flex items-center gap-1.5 ${ipType === 'brand' ? 'text-cyan-400' : 'text-slate-400'}`}>🏢 {isZh ? '公司品牌 IP (Company Brand)' : 'Company Brand IP'}</span>
                  <span className="text-[10px] font-medium text-slate-400 line-normal leading-normal">
                    {isZh ? '开展企业级合规校验（关注FDA药用宣称防线、商标专利与法律诉讼保护）' : 'For corporate-level compliance (regulatory claims, trademarking, class-actions)'}
                  </span>
                </button>
                <button
                  type="button"
                  id="ip-type-personal"
                  disabled={isRunning}
                  onClick={() => setIpType('personal')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black border transition-all duration-150 flex flex-col items-start gap-1 cursor-pointer text-left ${
                    ipType === 'personal'
                      ? 'bg-gradient-to-r from-amber-950/80 to-orange-950/80 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-850 text-slate-450 hover:text-slate-300 hover:bg-slate-900/40'
                  }`}
                >
                  <span className={`text-xs font-extrabold flex items-center gap-1.5 ${ipType === 'personal' ? 'text-amber-400' : 'text-slate-400'}`}>🎨 {isZh ? '个人 IP (Personal IP / Influencer)' : 'Personal IP / Influencer'}</span>
                  <span className="text-[10px] font-medium text-slate-400 line-normal leading-normal">
                    {isZh ? '开展博主真实性体验校验（关注FTC利益披露条例、女性手艺、Vlog心流温度）' : 'For individual creator authenticity (FTC endorsement guides, personal story, vlog ASMR)'}
                  </span>
                </button>
              </div>
            </div>

            {/* RAG tag / card selection panel */}
            <div className="border border-cyan-500/15 rounded-xl bg-cyan-950/20 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
                  <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{isZh ? '约束对齐：RAG 基因规章选择绑合' : 'Context Alignment: Direct RAG Tag Card Binding'}</span>
                </div>
                {activeRagId && (
                  <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-mono text-cyan-300">
                    Active binding: {activeRagId}
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5">
                <select
                  value={activeRagId}
                  onChange={(e) => handleSelectRag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 px-3 py-2.5 rounded-lg text-slate-205 text-xs font-bold font-sans outline-none cursor-pointer transition text-slate-300"
                >
                  <option value="" disabled>{isZh ? '-- 请选择约束卡片 --' : '-- Choose active RAG card --'}</option>
                  {(ragList.length > 0 ? ragList : INITIAL_RAG_ENTRIES).map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-950 text-slate-200">
                      [{r.category.toUpperCase()}] {r.name} (Ver {r.version})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-sans">
                  {isZh 
                    ? '💡 切换规章卡片将直接变更绑定的规则集，自动装载元特征，并在出海智拟与合规反校验阶段发挥强效过滤作用。'
                    : '💡 Switching cards automatically binds a fresh ontological criteria system and feeds specific must-have/must-not rules into generation.'}
                </p>
              </div>

              {/* Show description of the currently selected dynamic card */}
              {(() => {
                const selectedItem = (ragList.length > 0 ? ragList : INITIAL_RAG_ENTRIES).find(r => r.id === activeRagId);
                if (!selectedItem) return null;
                return (
                  <div className="text-[11px] text-slate-400 leading-normal bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">{selectedItem.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">Ver {selectedItem.version} | {selectedItem.lastUpdated?.split(' ')[0]}</span>
                    </div>
                    <p className="text-slate-400 leading-snug">
                      {isZh ? selectedItem.descriptionZh : selectedItem.descriptionEn}
                    </p>
                    {selectedItem.regionalGuidelines && selectedItem.regionalGuidelines[0] && (
                      <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-900/60 text-[9px] font-mono">
                        <div className="flex gap-1 text-green-400 truncate">
                          <span className="font-black">✔ Must:</span>
                          <span className="text-slate-300 truncate font-semibold">{selectedItem.regionalGuidelines[0].mustHaves?.slice(0, 2).join('; ') || 'None'}</span>
                        </div>
                        <div className="flex gap-1 text-rose-400 truncate">
                          <span className="font-black">✘ Not:</span>
                          <span className="text-slate-300 truncate font-semibold">{selectedItem.regionalGuidelines[0].mustNots?.slice(0, 2).join('; ') || 'None'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

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
      </>
      )}
    </div>
  );
}
