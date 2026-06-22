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
        content: '希望在案例库里增加安克对比花西子的国内外定位差异，帮起步阶段的跨境电商公司理清主张。',
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
  }
];
