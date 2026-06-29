import { RagEntry } from '../types';

export const INITIAL_RAG_ENTRIES: RagEntry[] = [
  {
    id: 'rag-001',
    name: '一鹿繁花 (Deer in Bloom) - Emotional Symbol IP',
    category: 'symbol',
    version: '1.0',
    lastUpdated: '2026-06-11 18:30:00',
    descriptionZh: '一鹿繁花的核心情感图腾与地区符号等效对应规则。在东方象征繁星簇拥、生机盎然的清凉希望；转译至欧美及拉美作为情绪抚慰和心安微光。',
    descriptionEn: 'Core emotional totem and localized symbolic equivalence rules for Deer in Bloom. Represents lush starlight and blooming hope in East Asia, re-mapped as mindful self-care in North America.',
    coreConcepts: [
      { name: '东方原始基因', values: ['月落松岗', '微光鹿角', '一鹿踏足万花齐放', '无声守护之灵性'] },
      { name: '精神内核解耦', values: ['陪伴 (Companionship)', '舒缓之光 (Soothing micro-glow)', '平视同理 (Non-toxic validation)'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: ['台灯、床头等独处小场景 (Alone-time setups)', '鹿角被画作森林雾金天然流萤 (Dust golden stardust on antlers)', '平视、安静陪伴的弱互动 (Minimal non-invasive companionship)'],
        mustNots: ['过度宣传医疗健康功效 (Claims of curing therapy)', '神圣正圆金光圆环 (Catholic saint-like holy gold halos)', '直译福禄寿迷信词汇 (Literal fortune-telling phrases)'],
        vibeStickers: ['Lo-Fi Cozy (温暖舒适)', 'Night Shift Recharging (午夜充电)', 'Self-Care Ritual (独处自愈仪式)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: ['阳光斑驳的夕阳小巷 (Sunset sun-dappled lanes)', '木吉他等有机声学伴奏 (Organic nylon guitar riffs)', '与人的温暖身体接触，如轻触手臂 (Gentle warm contact, touch arms)'],
        mustNots: ['绝对幽闭冰冷、压抑绝望的配色 (Extremely cold/depressive isolation tones)', '直译成狂欢节刻板欢快形象 (Carnival/overly loud ethnic clichés)', '圣像、发光的双足怪圈 (Saint-like divine standing silhouettes)'],
        vibeStickers: ['Acompañamiento Fiel (忠实相随)', 'Tarde Dorada (金色黄昏)', 'Paso Cultivado (缓慢成长的小幸)']
      }
    ],
    feedbacks: [
      {
        id: 'fb-101',
        timestamp: '2026-06-11 10:15:00',
        source: 'TikTok LATAM Audience Insights',
        content: '拉美观众反馈：木吉他氛围很温暖，但70BPM的Lo-fi敲击和雨声有点太致郁，感觉缺乏阳光市井气，希望加入稍微开朗一点的小排笛或手摇沙锤节拍。',
        sentiment: 'negative',
        impactMetrics: 'Ad engagement rate in Mexico dropped slightly on Day 3'
      },
      {
        id: 'fb-102',
        timestamp: '2026-06-11 14:22:00',
        source: 'Red-Team Advisory Council',
        content: '北美法律红线警示：在文案中用到的 "curb all your nighttime anxieties" (遏制你的黑夜焦虑) 原版，在美加地区有被起诉“涉嫌虚假医疗或无证心理治疗暗示”的风险！必须立即将治愈、疗效类宣称回退修改为纯氛围意境描述。',
        sentiment: 'negative',
        impactMetrics: 'Standard Compliance Risk: HIGH | FTC Advertising Law warning'
      },
      {
        id: 'fb-103',
        timestamp: '2026-06-11 16:45:00',
        source: 'TikTok NA User Comments',
        content: '北美网友留言："That little stardust antler glow on my screen made feel super warm after a 12-hour coding shift." 暖融融的落入微芒鹿角极受好评，呼吁增加这个鹿角手绘细节图。',
        sentiment: 'positive',
        impactMetrics: 'CTR raised by 18.4% on stardust-antler subsegments'
      }
    ],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-11 18:30:00',
        triggerFeedbackId: 'initial',
        changeSummary: '系统初始化「一鹿繁花」文化等效RAG映射元数据库，划分北美(自我陪伴)及拉美(温馨温暖一同行)双流。'
      }
    ]
  },
  {
    id: 'rag-002',
    name: '品牌全球安全红线库 (Global Advertising Safeguards)',
    category: 'regulatory',
    version: '1.0',
    lastUpdated: '2026-06-10 12:00:00',
    descriptionZh: '跨国自媒体投放安全合规约束，聚焦于医疗宣称、宗教元素误认、社会负面情绪煽动三大硬禁区。',
    descriptionEn: 'Rigid advertising boundaries covering medical claims, religious icon collision, and mental stress amplification restrictions across top channels.',
    coreConcepts: [
      { name: '医疗法案红线', values: ['FDA Mental Claims restriction', 'FTC anti-guarantee regulations'] },
      { name: '敏感宗教规避', values: ['Halo iconography (圣人光环禁区)', 'Strict separation of myth and deity (神祇解耦)'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: ['文案应多使用 "mindfulness moment" (正念瞬间), "peaceful background" (宁静背景)', '对产品功效表述为氛围铺垫而非内在药效'],
        mustNots: ['严禁使用 "clinical relief" (临床缓解), "anti-depression" (抗抑郁), "cure anxiety" (治疗焦虑) 等字眼'],
        vibeStickers: ['Soft Mindful (温柔正念)', 'Ambient Cozy (舒适烘托)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: ['展示小鹿与邻里的日常融洽陪伴', '尊重社区天主教文化，对发光做柔和处理'],
        mustNots: ['严禁将发光置于正脑勺正圆后 (No regulatory saint circle)', '避免使用暗示命运诅咒、天主降罚等词汇'],
        vibeStickers: ['Respetuoso (尊重虔诚)', 'Familiar (社区融洽)']
      }
    ],
    feedbacks: [],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-10 12:00:00',
        triggerFeedbackId: 'initial',
        changeSummary: '部署首个安全红线审查元数据，包含严谨医学术语熔断和天主教圣物轮廓合规审查判定。'
      }
    ]
  },
  {
    id: 'rag-003',
    name: '名企出海对标案例与定位库 (Successful Branding Comparison Cases)',
    category: 'case_study',
    version: '1.0',
    lastUpdated: '2026-06-22 09:00:00',
    descriptionZh: '精选中国头部潮玩（泡泡玛特）、3C配件（安克）、国风美妆（花西子）及创意工具（剪映）出海营销成功案例，对比国内外定位与营销话术差异。',
    descriptionEn: 'Selected success stories of Chinese Brand Globalization across Art Toys (Pop Mart), Power Chargers (Anker), Cosmetics (Florasis), and Creative Tools (CapCut). Compares domestic vs. overseas slogans.',
    coreConcepts: [
      { name: 'POP MART 泡泡玛特', values: ['中国：盲盒、收藏、确幸 [创造潮流，传递美好]', '出海：艺术桌搭精品、潮玩模型 [To Light Up Passion and Bring Joy]'] },
      { name: 'ANKER 安克创新', values: ['中国：硬核高能百瓦充电、性价比配件 [安克随行，充电智能]', '出海：生活态度伴侣、长寿命高安全性环保、极简美学 [Charge Fast, Live More]'] },
      { name: 'FLORASIS 花西子', values: ['中国：东方雕花彩妆、中草药养颜 [以花养妆，西子之美]', '出海：微雕馆藏艺术、100%纯素洁净美妆 [Oriental Artistry on Clean Canvas]'] },
      { name: 'CAPCUT 剪映海外版', values: ['中国：轻而易剪、抖音短视频卡点神剪 [让创作更简单]', '出海：赋能全球个体创作者、TikTok算法大流量加速器 [Unleash Your Creativity]'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: [
          'POP MART: 重点推介知名青年艺术家原创合作款 (Designer Artist Collaboration)，宣介高品质潮玩桌搭文化。',
          'ANKER: 宣介环保再生材料包装(Eco-friendly / Ocean-plastic Recycled)并强调UL Safety标准。',
          'FLORASIS: 必备 "Cruelty-Free / Vegan Certified" (零残忍/符合素食主义消费环保伦理) 明确认证标语。',
          'CAPCUT: 内嵌正版授权海外音乐库 (Licensed Commercial Audio Track List) 预防严苛版权侵权起诉。'
        ],
        mustNots: [
          'POP MART: 绝对杜绝刻意渲染类似抽卡成瘾、高赔率盲盒投机话术，规避博彩法案擦边起诉。',
          'ANKER: 营销首屏杜绝过多枯燥物理常数(如W功率，单晶物理阀)轰炸，应将其融入“快冲生活省时自救”的情态描写。',
          'FLORASIS: 严禁声称 “内含茯苓首乌可以根治暗沉暗疮” 等越界触犯美国FDA关于药物功效夸大指控的话术。',
          'CAPCUT: 严防照搬国内拼音网络黑笑料、陈旧网络梗，容易在YouTube及多语言上被打为无意义互联网垃圾。'
        ],
        vibeStickers: ['Aesthetic Value-Driven (高美学价值主张)', 'Regulatory Compliance (高合规防御)', 'Eco-Responsibility (生态环保意识)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: [
          'POP MART: 突出玩具伴侣拟人化的多家庭日常生活治愈感短片，融入温馨家庭桌头。',
          'ANKER: 侧重表现户外派对（Outdoor Party）、家庭烧烤（Fiesta Setup）与长途公路旅行的电量后盾。',
          'FLORASIS: 选取色系更张扬、持久耐汗抗汗、能在拉美热烈派对上完美维持高亮高饱和彩墨的展示。',
          'CAPCUT: 提供拉美拉丁欢聚风格卡点模板与舞步对齐，支持群体创作者欢快合影。'
        ],
        mustNots: [
          '各出海品牌：严忌使用过分孤清、绝望、性冷淡冷灰色调作为视觉底框，拉美公众极其缺乏心理认同。',
          '各出海品牌：忌用未经本土解耦的东方陈旧皇家帝制、高高在上的权威讲解式文案。'
        ],
        vibeStickers: ['Collective Inclusivity (集体融入)', 'High-Energy Contrast (高能量暖烘底)', 'Fiesta Integration (节庆场景融合)']
      }
    ],
    feedbacks: [
      {
        id: 'fb-301',
        timestamp: '2026-06-21 21:00:00',
        source: 'DTC Founder Circle',
        content: '希望在案例库里增加安克对比花西子的国内外定位差异，帮起步阶段的跨境电商 company 理清主张。',
        sentiment: 'neutral',
        impactMetrics: 'Strategic request from seed startups'
      }
    ],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-22 09:00:00',
        triggerFeedbackId: 'initial',
        changeSummary: '系统首发品类对标库，汇总头部中国出海品牌的品类定位及正反向合规熔断边界提示。'
      }
    ]
  },
  {
    id: 'rag-004',
    name: '北美与拉美年轻代社交防线及正念倾向细则 (Gen-Z Social Defenses & Mindfulness Persona)',
    category: 'audience',
    version: '1.0',
    lastUpdated: '2026-06-25 14:00:00',
    descriptionZh: '深入洞察欧美与拉美年轻代核心用户心理防线，指导品牌如何进行去数字疲劳、反过度消费、提倡身心自愈的正念包装。',
    descriptionEn: 'Deep insights into Gen-Z and Millennial consumer defenses in NA and LATAM. Outlines tactics to bypass ad fatigue and emphasize spiritual self-care.',
    coreConcepts: [
      { name: '数字疲劳防御', values: ['Anti-Overconsumption (反消费主义狂热)', 'Digital Detox Preference (数码排毒向往)', 'Aesthetic Authenticity (真实无滤镜美学)'] },
      { name: '身心正念共振', values: ['Somatic Mindfulness (身心合一正念)', 'Safe Space Boundaries (安全庇护所边界)', 'Cozy Solitude (享受温馨的独处)'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: [
          '多采用天然、温暖色调，营造静谧的微焦距画面',
          '强调“为你的一天按下暂停键” (Press pause on your day) 的呼吸舒缓时间',
          '文案倡导真实生活不完美美学 (Embrace the imperfect quiet moments)'
        ],
        mustNots: [
          '严禁使用“不买就亏、限时秒杀、高声推销”等刺激性消费催促话术',
          '严防过度完美的假面网红打卡式狂热滤镜，容易触发北美 Z 世代反感'
        ],
        vibeStickers: ['Calm Micro-escape (微缩逃离)', 'Digital Unwind (数字放松)', 'Imperfect Aesthetic (不完美真实美学)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: [
          '融入社区和亲友一同在大自然母亲怀抱里放松的温暖高互动场景',
          '表现身体的舒展、舞蹈和与土地天然生机（Tierra Orgánica）的连接',
          '倡导群体共担与快乐互助的正能量情绪'
        ],
        mustNots: [
          '切忌使用完全冷色调、极简性冷淡的“孤立单人喝茶/静坐”场景，在拉美会被认为代表悲伤抑郁',
          '避免过分严肃的专业说教口气，多采用热情的平辈朋友分享姿态'
        ],
        vibeStickers: ['Abrazo de Naturaleza (大自然拥抱)', 'Energía Colectiva (集体活力)', 'Calor Humano (人间温情)']
      }
    ],
    feedbacks: [],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-25 14:00:00',
        triggerFeedbackId: 'initial',
        changeSummary: '首次录入受众心理防线规章，针对欧美数字疲劳和拉美热情社区倾向进行正念情感等效映射。'
      }
    ]
  },
  {
    id: 'rag-005',
    name: 'DTC 出海短视频音画节拍卡点与声学授权边界 (AV Sync, Micro-ASMR & Acoustic Copyright Codes)',
    category: 'music_visual',
    version: '1.0',
    lastUpdated: '2026-06-26 11:30:00',
    descriptionZh: '规范 TikTok、Instagram Reels 投放视频的音视频卡点、背景乐选择与声学授权边界，避免高强度音乐引发焦虑及规避版权诉讼风险。',
    descriptionEn: 'Rules for audio-visual editing sync rhythms, cozy ASMR integration, and commercial music license policies on major global social platforms.',
    coreConcepts: [
      { name: '声学解压引擎', values: ['Lofi Chillhop beats (60-70 BPM)', 'Tactile Micro-ASMR (触觉微距白噪音)', 'Nylon String Acoustic (尼龙弦原声伴奏)'] },
      { name: '版权雷区合规', values: ['Commercial Audio Track validation (商用授权校验)', 'No unauthorized pop covers (严禁无授权翻唱)', 'AI sound synthesis safety (自研合成音乐合规)'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: [
          '视频声轨内录纯天然微距摩擦声、水沸腾声、竹叶摩擦等精致 ASMR（加分指数90%）',
          '背景乐首选节奏舒缓的 Lo-Fi 键盘或雨声打底，心率控制在 65 BPM 以下',
          '视频采用 1.5 秒到 2.5 秒的极平稳微调，顺滑淡入淡出过渡'
        ],
        mustNots: [
          '严禁使用重金属、极高分贝的夜店重鼓点（Hard EDM），这会直接增加北美受众在刷视频时的心脏生理和心理防范抗拒',
          '严禁在未获商用授权的情况下使用任何主流公告牌（Billboard）流行歌曲作为短视频背景乐'
        ],
        vibeStickers: ['Tactile Acoustic (触觉听觉双愈)', 'Slowing Rhythms (慢行拍)', 'Copyright Cleared (安全声授权)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: [
          '使用带有西班牙吉他（Spanish Guitar Riffs）或温润排箫的慢速弗拉门戈、Bossa Nova 抒情暖律动',
          '视频画面和音乐节拍保持同步，可以搭配大自然风声、海浪声或篝火柴火噼啪声'
        ],
        mustNots: [
          '避忌使用单调、尖锐、持续发出高频电子噪音（Synthesizer Noise）的赛博朋克音轨，极易引发本地反感'
        ],
        vibeStickers: ['Ritmo Cálido (温暖律动)', 'Acústico Orgánico (有机原声)', 'Viento y Fuego (风与火之诗)']
      }
    ],
    feedbacks: [],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-26 11:30:00',
        triggerFeedbackId: 'initial',
        changeSummary: '发布首个音视频卡点美学及版权指引，全面阻断无版权神曲滥用，提倡微距 ASMR 自愈听觉包装。'
      }
    ]
  },
  {
    id: 'rag-006',
    name: '智能宠物电器全球安全与 FTC 欺诈防范规则 (Smart Pet Care IoT Global Standards)',
    category: 'regulatory',
    version: '1.1',
    lastUpdated: '2026-06-27 10:00:00',
    descriptionZh: '聚焦智能宠物喂食器、温控猫砂盆等 IoT 出海电器，针对 FCC 电磁兼容、UL 漏电咬伤防护及 FTC 反焦虑夸大宣传的刚性审核红线。',
    descriptionEn: 'Rigid compliance and deceptive advertising standards for Smart Pet IoT products (feeders, companion robots) in Western markets.',
    coreConcepts: [
      { name: '电气物理防线', values: ['UL 1647/UL 1431 safety benchmarks', 'Bite-proof steel power cord cords', 'Anti-clog physical sensor redundancy'] },
      { name: '虚假宣传红线', values: ['No emotional cure guarantees', 'FTC Truth-in-Advertising compliance', 'FDA veterinary claim limits'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: [
          '强调食品级不含双酚A（FDA Food-Grade BPA-Free）材质认证',
          '突出 UL/FCC 电磁电工安全规范，配置重钢缠绕防宠咬漏电防线',
          '在文案中声明“本设备仅作日常照护和心理抚慰氛围加分，不能代替兽医临床行为学干预”'
        ],
        mustNots: [
          '严禁暗示产品可以通过 2K 摄像头和通话功能“彻底根治、阻断、治愈宠物的分离焦虑症 (Separation Anxiety)”',
          '严禁对放粮成功率给出 100% 的绝对免责担保，必须说明多层备份保护机制'
        ],
        vibeStickers: ['Veterinary Compliance (严谨兽医合规)', 'BPA-Free Pure (无毒纯净级)', 'UL-Guard Electric (重装电气安全)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: [
          '展示设备在宽幅电压变动、网络常态化断电下仍可由备用电池本地安全运作 15 天的硬核指标',
          '展示其在家庭多只宠物、大家庭热闹共养场景下的极佳高强度抗摔耐咬磨损性能'
        ],
        mustNots: [
          '严防对拉美用户宣讲其智能防雷系统时，直译具有特定原住民祭祀图腾的神秘天象和雷电符号'
        ],
        vibeStickers: ['Resistente Multi-Mascota (高耐磨多宠级)', 'Batería de Respaldo (断电长续航)', 'Seguridad Absoluta (绝对安心)']
      }
    ],
    feedbacks: [],
    changeLogs: [
      {
        version: '1.1',
        timestamp: '2026-06-27 10:00:00',
        triggerFeedbackId: 'initial',
        changeSummary: '发布针对智能宠物伴侣出海的专属 RAG 约束规则，打通 FTC 诚实广告及北美 FDA 动物行为诊断雷区防范。'
      }
    ]
  },
  {
    id: 'rag-007',
    name: '绿色低碳智能电单车 (E-Bike) 欧美法规与低熵通勤规范 (Eco E-Bike Regulatory & Commute Guidelines)',
    category: 'regulatory',
    version: '1.0',
    lastUpdated: '2026-06-27 10:15:00',
    descriptionZh: '保障 E-Bike 类目出海的最高法规安全，包含欧洲 EN15194 认证限制、美国限速 20mph (Class 1/2) 法案、欧盟反倾销税规避及减排计算真实性。',
    descriptionEn: 'Regulatory benchmarks and zero-emission narrative guidelines for E-Bike marketing under US Class-1/2 limits and European EPAC laws.',
    coreConcepts: [
      { name: '路面骑行安全', values: ['US Class-1 speed limits (20mph max assist)', 'EN 15194 EPAC standards (250W power limit)', 'UL 2849 lithium battery certification'] },
      { name: '中产低熵表达', values: ['Carbon-neutral offsets (碳补偿科学声明)', 'Mindful commuting (正念低噪出行)', 'Non-aggressive active sports (非狂暴轻运动态度)'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: [
          '全量通过 UL 2849 锂电池系统安全认证，并配以大图标展示，防范家庭自燃起诉',
          '明确标注符合美规 Class 1/Class 2 标准（最高电助时速 20mph，具备踏板感应和静音断电断开）',
          '视频及物料中所有骑行人员必须佩戴美标 DOT 规范认证头盔，双手握车把，在合法车道行驶'
        ],
        mustNots: [
          '严禁在城市通勤物料中宣扬时速超过 28mph (Class 3/4) 等带有超速危险、严重违反本地保险条款的狂飙山极限动作',
          '杜绝出现任何人踩踏和侵越自然保护区、越野破坏公共林草等反环保红线画面'
        ],
        vibeStickers: ['UL-2849 Safe Certified (电池火安全认证)', 'US Class-1 Compliant (规整行车级)', 'Eco Commute Quiet (静音绿出行)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: [
          '针对拉美丘陵起伏、破碎街道的硬条件，着重宣介其超大扭矩爬坡和高弹越坑液压防震性能',
          '展示其在家庭代步、周末全家老少公园欢聚、短途郊外野餐时，强大的大承重后车座扩展功能'
        ],
        mustNots: [
          '严禁在物料中以高傲或冷冰冰的中产权威口吻嘲笑和排斥当地传统人力车或公交车出行群落'
        ],
        vibeStickers: ['Súper Amortiguación (高滤震高通过)', 'Fuerza de Carga (大承重多功能)', 'Aventura de Fin de Semana (周末全家游行)']
      }
    ],
    feedbacks: [],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-27 10:15:00',
        triggerFeedbackId: 'initial',
        changeSummary: '建立 E-Bike 绿色通勤安全红线规章，完美融合欧盟 EPAC 电阻安全法与北美 Class 1 静音行车法。'
      }
    ]
  },
  {
    id: 'rag-008',
    name: '东方草本古汉冷泡茶 FDA 纯素无添加与禅意美学替代规约 (Wellness Tea FDA & Zen Aesthetic Rules)',
    category: 'symbol',
    version: '1.0',
    lastUpdated: '2026-06-27 10:20:00',
    descriptionZh: '彻底纠偏东方草本茶、中草药出海时的药效吹嘘重灾区，规避 FDA 严重的行政召回与起诉，将其转译为高端精品咖啡代用品、ASMR 视觉冥想。',
    descriptionEn: 'Decouples medical claim risks (FTC/FDA diet supplement rules) for wellness botanical teas. Reconstructs content as premium, ASMR visual Zen moments.',
    coreConcepts: [
      { name: '去药理高感包装', values: ['ASMR Steam expansion (ASMR热汽禅意)', 'Premium Coffee Alternative (咖啡因正能量降维)', 'Visual Mindfulness Meditation (眼球正念茶泡)'] },
      { name: '纯素洁净认证', values: ['USDA Organic & Non-GMO labels', 'Zero-sugar caffeine-free pure tea', 'Cruelty-free botanical sourcing'] }
    ],
    regionalGuidelines: [
      {
        region: 'North America (北美)',
        mustHaves: [
          '必备 USDA Organic（美国农业部有机认证）和 Non-GMO 非转基因大图标，放在首屏最显眼位置',
          '强调“工作日下午三点电脑前，通过热茶浸润、香气微距，给紧绷大脑两分钟的感官松弛 moments”',
          '使用可降解植物纤维金字塔茶包（Biodegradable PLA tea bag）等崇高环保伦理环保声明'
        ],
        mustNots: [
          '绝对应对 FDA 重罪控告！严禁出现“清肝明目、排毒解酒、降血压消水肿、利尿刮油、彻底消灭黑眼圈、根治神经失眠”等不实理疗功效暗示',
          '严禁宣称自己具有神秘宗教开光法力、治病草药秘方等可能引发严苛清教徒文化抵制的陈词'
        ],
        vibeStickers: ['USDA Organic (美原产有机认证)', '3PM Digital Pause (午后电脑暂停键)', 'Pure ASMR Unwind (纯粹禅境微ASMR)']
      },
      {
        region: 'Latin America (拉美)',
        mustHaves: [
          '融入拉美“尊重地球母亲的天然泥土恩赐（Pachamama Vibe）”的朴素原生态自然神学理念',
          '着重展现100%纯天然无人工色素添加、无糖、极高爽口解渴度，是一家人烧烤畅快消暑、谈天说地的最佳圣品'
        ],
        mustNots: [
          '避忌将茶叶饮用仪式拍成带有封建阴深巫术做法、招魂或与天主教正统发生强烈宗教对抗色彩的神秘民俗'
        ],
        vibeStickers: ['Fórmula Ancestral (祖辈纯正原风)', 'Refrescante Natural (纯天然大消暑)', 'Compartido con Familia (大家庭同乐享)']
      }
    ],
    feedbacks: [],
    changeLogs: [
      {
        version: '1.0',
        timestamp: '2026-06-27T10:20:00',
        triggerFeedbackId: 'initial',
        changeSummary: '首次确立东方岩茶及草本冷泡茶的出海安全映射标准，无缝绕开 FDA Dietary Supplement 严酷法案。'
      }
    ]
  }
];
