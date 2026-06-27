export interface CategoryPreset {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  active: boolean;
}

export interface TargetMarketPreset {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  hofstedeIdv: number;
  active: boolean;
}

export interface AudiencePreset {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  active: boolean;
}

export interface CultureNarrativePreset {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  active: boolean;
}

export interface PlatformPreset {
  id: string;
  nameZh: string;
  nameEn: string;
  formatZh: string;
  formatEn: string;
  active: boolean;
}

export interface RiskRulePreset {
  id: string;
  categoryZh: string;
  categoryEn: string;
  ruleCode: string;
  descriptionZh: string;
  descriptionEn: string;
  severity: 'high' | 'medium' | 'low';
  active: boolean;
}

export interface ContentTemplatePreset {
  id: string;
  nameZh: string;
  nameEn: string;
  formatZh: string;
  formatEn: string;
  templateBodyZh: string;
  templateBodyEn: string;
  active: boolean;
}

export interface CasePreset {
  id: string;
  nameZh: string;
  nameEn: string;
  categoryId: string;
  briefJson: string;
  active: boolean;
}

export interface KpiPreset {
  id: string;
  nameZh: string;
  nameEn: string;
  metricZh: string;
  metricEn: string;
  targetValue: string;
  active: boolean;
}

export interface CulturePackPreset {
  id: string;
  caseId: string;
  culturePackJson: string;
  active: boolean;
}

export interface CategoryNarrativeMap {
  categoryId: string;
  narrativeId: string;
  fitScore: number;
  active: boolean;
}

export interface CategoryPlatformMap {
  categoryId: string;
  platformId: string;
  fitScore: number;
  active: boolean;
}

export interface MarketPlatformMap {
  marketId: string;
  platformId: string;
  fitScore: number;
  active: boolean;
}

export const CATEGORIES_PRESETS: CategoryPreset[] = [
  {
    id: 'personal_ip',
    nameZh: '个人 IP',
    nameEn: 'Personal IP / Influencer',
    descriptionZh: '聚焦主观真实、女性手作、慢生活 Vlog 场景。',
    descriptionEn: 'Focuses on authenticity, female craftsmanship, and slow lifestyle vlogs.',
    active: true
  },
  {
    id: 'cosmetics',
    nameZh: '美妆护肤',
    nameEn: 'Cosmetics / Skincare',
    descriptionZh: '精细草本植物美学、素食洁净美妆定位。',
    descriptionEn: 'Features botanical ingredients and certified vegan clean beauty.',
    active: true
  },
  {
    id: 'tourism',
    nameZh: '文旅文创',
    nameEn: 'Cultural Tourism / Creative Gifts',
    descriptionZh: '东方意境旅游、历史图腾体验、文化地标与民俗。',
    descriptionEn: 'Includes oriental travel, historical totems, landmarks, and folk cultures.',
    active: true
  },
  {
    id: 'ai_tools',
    nameZh: 'AI 创意工具',
    nameEn: 'AI Creative Tools',
    descriptionZh: '视频剪辑、智能抠图、多媒体创作出海加速器。',
    descriptionEn: 'Covers automated video editing, background removal, and creator accelerators.',
    active: true
  },
  {
    id: 'b2b_services',
    nameZh: 'B2B 跨境服务',
    nameEn: 'B2B Services / SaaS',
    descriptionZh: '提供出海跨境合规、物流支付、供应链智能决策服务。',
    descriptionEn: 'Provides global compliance, logistics, payments, and supply chain intelligence.',
    active: true
  }
];

export const TARGET_MARKETS_PRESETS: TargetMarketPreset[] = [
  {
    id: 'north_america',
    nameZh: '北美',
    nameEn: 'North America',
    descriptionZh: '高个人主义(IDV 91)和低权力距离，对自愈心流、FDA/FTC健康功效广告限制极度敏感。',
    descriptionEn: 'High individualism (91) & low power distance. Extremely sensitive to emotional self-care and strict FDA/FTC regulatory fine lines.',
    hofstedeIdv: 91,
    active: true
  },
  {
    id: 'latin_america',
    nameZh: '拉美',
    nameEn: 'Latin America',
    descriptionZh: '低个人主义(IDV 30)与亲切温情，热捧高饱和色彩、大家庭聚会、现场节奏感以及节日欢歌。',
    descriptionEn: 'Low individualism (30) & high warmth. Prefers high-saturation visuals, family unions, acoustic rhythms, and holiday festivities.',
    hofstedeIdv: 30,
    active: true
  },
  {
    id: 'europe',
    nameZh: '欧洲',
    nameEn: 'Europe',
    descriptionZh: '倡导可持续发展(ESG)、绿色低碳及严苛的GDPR个人隐私数据合规。',
    descriptionEn: 'Highly values sustainability (ESG), green carbon offset standards, and strict GDPR privacy regulations.',
    hofstedeIdv: 67,
    active: true
  },
  {
    id: 'southeast_asia',
    nameZh: '东南亚',
    nameEn: 'Southeast Asia',
    descriptionZh: '多元文化共生、高度移动化社交及网红主导，对宗教清真、地缘俚语具有极多规约。',
    descriptionEn: 'Multicultural co-existence with mobile-first influencer drive. Requires high compliance around Halal and religious sensitivities.',
    hofstedeIdv: 25,
    active: true
  },
  {
    id: 'japan_korea',
    nameZh: '日韩',
    nameEn: 'East Asia',
    descriptionZh: '极致细节控、强调集体社会认同与低调含蓄的极简视觉，偏好极其精美的手作伴手礼包装。',
    descriptionEn: 'Exquisite detail focus. Emphasizes social validation and subtle aesthetics. Prefers highly refined packaging design.',
    hofstedeIdv: 46,
    active: true
  }
];

export const AUDIENCES_PRESETS: AudiencePreset[] = [
  {
    id: 'gen_z',
    nameZh: 'Z 世代',
    nameEn: 'Gen Z',
    descriptionZh: '追求独立生活态度、注重视觉节奏卡点和Lo-Fi陪伴氛围。',
    descriptionEn: 'Demands self-expressive lifestyles, visual short-clip synched pacing, and late-night Lo-Fi companionship.',
    active: true
  },
  {
    id: 'female_consumers',
    nameZh: '女性消费人群',
    nameEn: 'Female Consumers',
    descriptionZh: '热烈追随自主造物感、素食零残忍以及极高美学底蕴的自愈好物。',
    descriptionEn: 'Passionate about craft autonomy, certified vegan cosmetics, and highly therapeutic aesthetic elements.',
    active: true
  },
  {
    id: 'diaspora',
    nameZh: '海外华人圈',
    nameEn: 'Diaspora Communities',
    descriptionZh: '具有深层的东方文化寻根热切、华语青春回忆与故乡亲情羁绊。',
    descriptionEn: 'Desires oriental roots reconnection, Chinese nostalgia memories, and warm hometown family links.',
    active: true
  },
  {
    id: 'professionals',
    nameZh: '职场白领',
    nameEn: 'Working Professionals',
    descriptionZh: '日常工作负荷大、严重匮乏自愈空间、亟需深夜安神和睡眠辅助产品。',
    descriptionEn: 'Subject to high workloads. Highly lacks personal space and requests soothing background aids.',
    active: true
  }
];

export const CULTURE_NARRATIVES_PRESETS: CultureNarrativePreset[] = [
  {
    id: 'youth_memories',
    nameZh: '青春记忆',
    nameEn: 'Youth Memories',
    descriptionZh: '唤起年少纯真、老街树梢微风、华语金曲吉他弹唱与不褪色的往日旧照。',
    descriptionEn: 'Evokes youth memories, nostalgic street trees, soft guitar strumming, and warm retro polaroids.',
    active: true
  },
  {
    id: 'oriental_aesthetics',
    nameZh: '东方审美',
    nameEn: 'Oriental Aesthetics',
    descriptionZh: '松烟黛墨、微雕印章艺术、历史神兽神格等效、寂静清凉、无声守护之灵。',
    descriptionEn: 'Brings pine soot black, micro-engraved seal craftsmanship, elegant myth totems, and silent protective spirits.',
    active: true
  },
  {
    id: 'maker_story',
    nameZh: '普通人成长',
    nameEn: 'Maker Story / Autonomy',
    descriptionZh: '展现造物心流、天然蜂蜡熬制、微距剪刀声，平视温润的闺蜜心意交流。',
    descriptionEn: 'Showcases handcrafted flow, beeswax boiling, macro-ASMR sounds, and peer-to-peer authentic care.',
    active: true
  },
  {
    id: 'heritage_family',
    nameZh: '指尖温度与家庭传承',
    nameEn: 'Family Heritage & Touch',
    descriptionZh: '老一辈的耐心叮咛、双手代代传承的技艺温度、邻里相望的黄昏欢笑。',
    descriptionEn: 'Focuses on generational hand skills, grandparent lessons, and sunset neighborhood laughter.',
    active: true
  },
  {
    id: 'ai_co_creation',
    nameZh: 'AI 新世代智创',
    nameEn: 'AI Generative Aesthetics',
    descriptionZh: '人机智能合声、音视频卡点模板、未来派数字微观图景。',
    descriptionEn: 'Blends AI generative audios, visual rhythm templates, and futuristic digital micro-realms.',
    active: true
  }
];

export const PLATFORMS_PRESETS: PlatformPreset[] = [
  {
    id: 'tiktok',
    nameZh: 'TikTok',
    nameEn: 'TikTok',
    formatZh: '竖屏短视频、前3秒节奏卡点、高黏性潮流声效、挑战标签挑战赛。',
    formatEn: 'Vertical short clips, first 3-second hook, trending ambient audios, and viral hashtag trends.',
    active: true
  },
  {
    id: 'instagram',
    nameZh: 'Instagram',
    nameEn: 'Instagram',
    formatZh: '高清美学大片图集、Reels精致滤镜视频、精致的生活格调标贴。',
    formatEn: 'High-definition lifestyle galleries, Reels filtered clips, and high-end aesthetic storytelling.',
    active: true
  },
  {
    id: 'youtube',
    nameZh: 'YouTube',
    nameEn: 'YouTube',
    formatZh: '深度开箱解说、长视频或Shorts卡点短视频、严苛商用授权背景乐。',
    formatEn: 'Unboxing reviews, long vlogs, horizontal/vertical shorts, and strict DMCA cleared audios.',
    active: true
  },
  {
    id: 'reddit',
    nameZh: 'Reddit',
    nameEn: 'Reddit',
    formatZh: '深度Q&A发帖、极客社区图文、去中心化讨论、抵触生硬商业硬广。',
    formatEn: 'Deep Q&A posts, niche communities, text discussions, and strict avoidance of blunt commercials.',
    active: true
  },
  {
    id: 'xiaohongshu',
    nameZh: '小红书',
    nameEn: 'Xiaohongshu (Red)',
    formatZh: '闺蜜亲密精细图文种草、多图滑页、极速自愈桌搭指南。',
    formatEn: 'Cozy sisterhood seedings, scrollable micro-catalogs, and self-care desk setups.',
    active: true
  }
];

export const RISK_RULES_PRESETS: RiskRulePreset[] = [
  {
    id: 'risk_copyright',
    categoryZh: '版权风险',
    categoryEn: 'Copyright Compliance',
    ruleCode: 'DMCA-1998',
    descriptionZh: '严厉拦截并熔断一切未经出海商用买断授权、有潜在被诉风险的自媒体背景音频。',
    descriptionEn: 'Detects and blocks background audio that is not fully cleared or licensed for global commercial use.',
    severity: 'high',
    active: true
  },
  {
    id: 'risk_medical',
    categoryZh: '医疗及功效宣称',
    categoryEn: 'Medical / Therapeutic Claims',
    ruleCode: 'FTC-16-CFR-255',
    descriptionZh: '严厉拦截护肤/香薰中出现“抗抑郁、根治失眠、抗焦虑”等医疗诊疗性质的越界功效暗示词。',
    descriptionEn: 'Blocks therapeutic claims like "anti-anxiety" or "curing insomnia" to prevent regulatory FTC fines.',
    severity: 'high',
    active: true
  },
  {
    id: 'risk_religion',
    categoryZh: '宗教与文化误读',
    categoryEn: 'Religious sensitivity',
    ruleCode: 'REL-CATHOLIC-01',
    descriptionZh: '规避将任何暖金光环做成类似于天主教圣人画像的环形后置光，以防止保守地区消费者反感。',
    descriptionEn: 'Avoids using perfect glowing halos directly behind figures to prevent religious saint caricature concerns.',
    severity: 'medium',
    active: true
  },
  {
    id: 'risk_gambling',
    categoryZh: '盲盒博彩红线',
    categoryEn: 'Gambling Risk',
    ruleCode: 'GMB-BOX-02',
    descriptionZh: '严格清理任何带投机、抽签暴富、极低中签率的博彩式诱导词，包装必须偏重设计师艺术价值。',
    descriptionEn: 'Purges speculative gambling terms in blind boxes. Marketing must highlight original designer artistic value.',
    severity: 'high',
    active: true
  },
  {
    id: 'risk_privacy',
    categoryZh: '数据隐私合规',
    categoryEn: 'Privacy GDPR',
    ruleCode: 'GDPR-EU-2016',
    descriptionZh: '欧洲地区严厉拦截在未获得用户授权同意的前提下，提取、发布带有肖像和具体地理定位的信息。',
    descriptionEn: 'Restricts capturing or publishing personal portraits and GPS coordinates without explicit consent in Europe.',
    severity: 'high',
    active: true
  }
];

export const CONTENT_TEMPLATES_PRESETS: ContentTemplatePreset[] = [
  {
    id: 'title_matrix',
    nameZh: '标题矩阵',
    nameEn: 'Headline Matrix',
    formatZh: '双排中英文裂变短字数',
    formatEn: 'Short highly punchy bilingual formats',
    templateBodyZh: '### 适配版高点击标题:\n- **English Translated**: [英译点击标题]\n- **Localized / Regional**: [针对性大区文案]',
    templateBodyEn: '### Adapted Headlines:\n- **English Translated**: [Punchy English headline]\n- **Localized / Regional**: [Targeted regional text]',
    active: true
  },
  {
    id: 'video_script',
    nameZh: '短视频脚本',
    nameEn: 'Video Script',
    formatZh: '15秒多帧卡点画面对齐',
    formatEn: '15s multi-frame sync with audio',
    templateBodyZh: '- **00:00 - 00:03**: 资产微距放大 + ASMR声效\n- **00:03 - 00:10**: 人物慢动作心流制作场景\n- **00:10 - 00:15**: 情感升华，静谧暖光烘托。',
    templateBodyEn: '- **00:00 - 00:03**: Core asset close-up + ASMR sound effects\n- **00:03 - 00:10**: Focused handcrafting scene in slow motion\n- **00:10 - 00:15**: Emotional branding climax with glowing backlights.',
    active: true
  },
  {
    id: 'visual_prompt',
    nameZh: '视觉提示词',
    nameEn: 'Visual Prompt',
    formatZh: 'Midjourney 8k 相机格式',
    formatEn: 'Midjourney photorealistic formats',
    templateBodyZh: 'A high-fidelity hyper-realistic photography: [核心资产描述], soft gold backlights, photorealistic camera depth of field, 8k, warm cozy lighting, aspect ratio --ar 16:9',
    templateBodyEn: 'A high-fidelity hyper-realistic photography: [Core asset], soft gold backlights, photorealistic camera depth of field, 8k, warm cozy lighting, aspect ratio --ar 16:9',
    active: true
  },
  {
    id: 'bilingual_sub',
    nameZh: '双语字幕',
    nameEn: 'Bilingual Subtitles',
    formatZh: '母语配音+英语字幕对齐',
    formatEn: 'Bilingual subtitles over screen',
    templateBodyZh: '[中文原声旁白]\n[对照出海翻译英语字幕]',
    templateBodyEn: '[Original localized vocal track]\n[Aligned translated English overlay]',
    active: true
  }
];

export const KPI_PRESETS: KpiPreset[] = [
  {
    id: 'kpi_exposure',
    nameZh: '曝光深度',
    nameEn: 'Exposure',
    metricZh: '大区千次展现成本与曝光量',
    metricEn: 'Video Views & CPM',
    targetValue: '播放量 > 500,000 | CPM 保持低位平稳',
    active: true
  },
  {
    id: 'kpi_engagement',
    nameZh: '互动黏性',
    nameEn: 'Engagement',
    metricZh: '赞评转及停留时长率',
    metricEn: 'Like / Comment / Share & Watch-time Ratio',
    targetValue: '总体互动率 (Engagement Rate) > 6.5%',
    active: true
  },
  {
    id: 'kpi_conversion',
    nameZh: '业务转化',
    nameEn: 'Conversion',
    metricZh: '加购跳转及转化漏斗率',
    metricEn: 'Add-to-cart & Funnel Conversion Rate',
    targetValue: '外部加购率 (Add-to-Cart Rate) > 2.1%',
    active: true
  },
  {
    id: 'kpi_safety',
    nameZh: '合规安全',
    nameEn: 'Safety',
    metricZh: '零侵权立案及起诉零驳回',
    metricEn: 'Compliance Litigation & Rejection Rate',
    targetValue: '广告驳回率及监管起诉率 = 0%',
    active: true
  }
];

export const CATEGORY_NARRATIVE_MAPS: CategoryNarrativeMap[] = [
  { categoryId: 'personal_ip', narrativeId: 'youth_memories', fitScore: 95, active: true },
  { categoryId: 'personal_ip', narrativeId: 'maker_story', fitScore: 98, active: true },
  { categoryId: 'cosmetics', narrativeId: 'oriental_aesthetics', fitScore: 95, active: true },
  { categoryId: 'cosmetics', narrativeId: 'maker_story', fitScore: 88, active: true },
  { categoryId: 'tourism', narrativeId: 'oriental_aesthetics', fitScore: 98, active: true },
  { categoryId: 'tourism', narrativeId: 'heritage_family', fitScore: 90, active: true },
  { categoryId: 'ai_tools', narrativeId: 'ai_co_creation', fitScore: 99, active: true },
  { categoryId: 'b2b_services', narrativeId: 'maker_story', fitScore: 85, active: true }
];

export const CATEGORY_PLATFORM_MAPS: CategoryPlatformMap[] = [
  { categoryId: 'personal_ip', platformId: 'tiktok', fitScore: 98, active: true },
  { categoryId: 'personal_ip', platformId: 'instagram', fitScore: 92, active: true },
  { categoryId: 'personal_ip', platformId: 'xiaohongshu', fitScore: 85, active: true },
  { categoryId: 'cosmetics', platformId: 'instagram', fitScore: 95, active: true },
  { categoryId: 'cosmetics', platformId: 'tiktok', fitScore: 90, active: true },
  { categoryId: 'tourism', platformId: 'youtube', fitScore: 94, active: true },
  { categoryId: 'ai_tools', platformId: 'tiktok', fitScore: 92, active: true },
  { categoryId: 'b2b_services', platformId: 'reddit', fitScore: 90, active: true }
];

export const MARKET_PLATFORM_MAPS: MarketPlatformMap[] = [
  { marketId: 'north_america', platformId: 'tiktok', fitScore: 95, active: true },
  { marketId: 'north_america', platformId: 'instagram', fitScore: 92, active: true },
  { marketId: 'north_america', platformId: 'reddit', fitScore: 85, active: true },
  { marketId: 'latin_america', platformId: 'tiktok', fitScore: 98, active: true },
  { marketId: 'latin_america', platformId: 'instagram', fitScore: 90, active: true },
  { marketId: 'europe', platformId: 'instagram', fitScore: 88, active: true },
  { marketId: 'southeast_asia', platformId: 'tiktok', fitScore: 96, active: true },
  { marketId: 'japan_korea', platformId: 'instagram', fitScore: 86, active: true }
];

export const CASES_PRESETS: CasePreset[] = [
  {
    id: 'aqi_isme',
    nameZh: '阿琪是我',
    nameEn: 'Aqi Is Me (华语青春记忆)',
    categoryId: 'personal_ip',
    briefJson: JSON.stringify({
      name: '阿琪是我',
      cultureAsset: '华语青春记忆/手工香膏',
      businessGoal: '增加海外自媒体粉丝与慢生活共鸣',
      emotionalKernel: ['youth memories', 'cozy hands', 'nostalgia'],
      mustHave: ['木吉他旋律', '闺蜜般低姿态叙事', '微距制作ASMR'],
      mustNot: ['任何强硬爱国说教', '虚假医疗功效宣称', '冰冷工业机械背景'],
      brandTone: '温润、怀旧、平静的自然慢生活',
      targetRegions: ['North America', 'Latin America'],
      targetPlatforms: ['TikTok', 'Instagram']
    }),
    active: true
  },
  {
    id: 'lucky_deer',
    nameZh: '一鹿繁花',
    nameEn: 'Lucky Deer (东方灵性神鹿)',
    categoryId: 'cosmetics',
    briefJson: JSON.stringify({
      name: '一鹿繁花',
      cultureAsset: '东方灵性神鹿图腾与草本香薰',
      businessGoal: '提升跨境DTC销量并确立微度假定位',
      emotionalKernel: ['peaceful mind', 'stardust glow', 'self-care'],
      mustHave: ['清凉的夜景台灯', '微光鹿角森林雾金', '平视安静弱互动'],
      mustNot: ['吹嘘治疗焦虑失眠功效', '宗教神圣正圆金光环', '直接翻译发财词汇'],
      brandTone: '空灵、静谧、治愈感官的安全屋',
      targetRegions: ['North America', 'Latin America'],
      targetPlatforms: ['TikTok', 'YouTube']
    }),
    active: true
  }
];
