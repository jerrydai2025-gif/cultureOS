import { CampaignBrief, CulturePack, AgentNode, TraceLog } from '../types';

export interface PresetData {
  id: string;
  name: string;
  brief: CampaignBrief;
  culturePack: CulturePack;
  logs: TraceLog[];
}

export const PRESETS: Record<string, PresetData> = {
  lucky_deer: {
    id: 'lucky_deer',
    name: '🦌 Deer in Bloom (一鹿繁花)',
    brief: {
      id: 'lucky_deer',
      name: 'Deer in Bloom (一鹿繁花)',
      cultureAsset: '中国一鹿繁花 IP',
      businessGoal: '海外自媒体短视频 IP 孵化与转化测试',
      targetRegions: ['North America', 'Latin America'],
      targetPlatforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      emotionalKernel: ['守护', '轻柔祝福', '日常陪伴', '疲惫下班后的微光治愈', '被理解的瞬间'],
      mustHave: ['温柔守护的情感基调', '暖金色的发光鹿角视觉基因', '安静无声的微光陪伴形象'],
      mustNot: ['宣誓医学或心理学疗效担保', '使用神圣天主教或圣人像光环构图', '对拉美进行狂欢节/过度热情的刻板设定', '直译"发财/升官/迷信好运"'],
      brandTone: '诗意、温暖、克制而温柔'
    },
    culturePack: {
      market_insight: {
        title: '市场信号与多平台受众偏好调研',
        regions: [
          {
            name: 'North America (北美地区)',
            insights: [
              '在漫长的通勤和高压力都市生活中，“Self-Care (自我关怀)” 和 “Alone-Time (独处恢复)” 是核心情感热词。',
              'Lo-Fi 治愈配乐短视频在深夜 (22:00 - 02:00) 流量明显飙升，用户对平视、不强加干涉的低头陪伴更有共鸣。',
              '任何提及“清除抑郁症、代替心理医学、包治好运”的描述都会触发医疗广告法的高危重惩红线。'
            ],
            risks: ['Spiritual healing advertising violation (精神疗效宣称侵权)', 'Supernatural claim restrictions (超自然力量暗示受限)']
          },
          {
            name: 'Latin America (拉美地区)',
            insights: [
              '受集体主义、家族观念影响，拉美受众更排斥完全“孤独/自闭”的深夜色调。他们偏爱“与你同行 (Acompañamiento)” 和 “日常微光”。',
              '阳光明媚、夕阳市井、温暖人际触觉是当地最吃香的日常意象，配乐推荐温厚的原声木吉他。',
              '宗教符号带有不可侵犯的神圣性，将东方金光神神叨叨化、神格化容易遭到虔诚天主教徒的联合抵制。'
            ],
            risks: ['Religious iconography conflict (天主教圣像概念误用)', 'Passive-isolation repulsion (低落孤绝色调排斥)']
          }
        ]
      },
      cultural_adaptation: {
        framework: 'Hofstede 低权力距离 + 高个人主义/集体主义双向映射',
        localCanons: [
          {
            region: 'North America (北美)',
            localEmotion: 'quiet companion (无声的自我温柔)',
            scenes: ['雨夜窗沿 (Rainy window)', '书桌温暖台灯 (Warm desk lamp)', '独自回家的街角 (Quiet street corner)'],
            dont: ['不做任何神化表述 (No divine claim)', '不灌空洞鸡汤 (No toxic positivity)', '不提玄学改运 (No fortune-telling jargon)'],
            mappingDescription: '摒弃东方“福禄寿 / 恩赐好运”的垂直崇拜，将其扁平化为平视的伙伴(Companion)。幸运被重新定义为“能被台灯温暖的琐碎仪式感”，完美切入高个人主义白领的自我关怀(Self-Care)盲点。',
            adaptationBasis: 'Hofstede Dimension: High Individualism (IDV 91) & Low Power Distance (PDI 40)',
            adaptationBasisZh: '霍夫斯泰德文化维度推导：高个人主义 (IDV 91) 与低权力距离 (PDI 40) 定位',
            evidenceData: 'Platform Trend: TikTok #SelfCare tag has 42.1B views. Lo-Fi ambient loops increase watch-time by 28% in metropolitan white-collars.',
            evidenceDataZh: '平台实证数据：TikTok #SelfCare (自我关怀) 累计超421亿次播放，深夜平视陪伴短视频对都市白领的完播留存率高出主流大盘28%。'
          },
          {
            region: 'Latin America (拉美)',
            localEmotion: 'suerte contigo (与你同行的日常微光)',
            scenes: ['温暖街角暖光 (Corner warmth)', '社区长椅夕阳 (Sunset bench)', '双人端茶对视 (Cozy share)'],
            dont: ['不要出现大悲大喜的孤独 (No tragic loneliness)', '不套用狂欢派对的刻板偏见 (No stereotype carnival party)'],
            mappingDescription: '结合拉美高集体主义心理，将东方“灵性”降解为温厚的“同行(Acompañamiento)”。画面避开完全冰冷的深夜，融入木伴奏和社区日常，将鹿定位为家庭微小希望的使者，避免天主教会冲突。',
            adaptationBasis: 'Hofstede Dimension: High Collectivism (IDV 30) & High Uncertainty Avoidance (UAI 86)',
            adaptationBasisZh: '霍夫斯泰德文化维度推导：低个人主义/高集体主义 (IDV 30) 与高不确定性规避 (UAI 86)',
            evidenceData: 'Empirical Research: Spanish cultural studies on "Acompañamiento" (intimate daily walking) vs "Soledad" (passive depression repulsed by LATAM users).',
            evidenceDataZh: '社群与学术实证：拉美学术界聚焦于“Acompañamiento”（家庭社区同行）情感粘性，对“Soledad”（孤绝冰冷）概念有天然群体抵触。'
          }
        ]
      },
      content_strategy: {
        pillars: [
          '「下班后的 10 分钟」：记录平凡白领下班回家，在书桌前重获自我的治愈时刻。',
          '「无声的轻触」：展示金色小鹿用温暖鹿角轻触疲惫人类的手臂，发出微光的细节。',
          '「街角偶遇」：拉美暖色夕阳下，少年在斑驳街区偶遇金色小鹿散步的暖心片段。'
        ],
        videoThemes: [
          { title: '深夜自救 (NA)', duration: '7s Looped Mood', concept: '白领拖着疲惫身躯坐下，打开台灯。台灯的影子在墙上化作一只温厚的小鹿。陪伴无需言语。' },
          { title: '街角暖阳 (LATAM)', duration: '15s Storyboard', concept: '夕阳洒在热闹的拉美旧巷，少年因考试不顺独自坐在街边。金色小鹿静静走来，在他身侧卧下，木吉他声起。小小的确幸在此复苏。' }
        ],
        abTest: [
          'A组测试：“平视陪伴角” —— 着重突出静置台灯下的无声疗愈、静谧感。',
          'B组测试：“小鹿实体角” —— 突出呆萌东方小鹿走入日常现实（如公交、咖啡店）的超现实温厚冲撞网感。'
        ],
        platformPlan: 'TikTok 主推 7-15s 的 Lo-fi 音乐纯境循环（拉爆收藏和背景原声套用率）；Instagram Reels 发布 4 宫格轮播漫画式分镜；YouTube Shorts 侧重制作精良的 30s 暖心叙事电影。'
      },
      copy_pack: {
        regions: [
          {
            region: 'North America (北美)',
            title: 'Kindness to Yourself',
            tiktokCaption: 'A little golden deer for the nights when you forget to be kind to yourself. 🌙✨',
            igReelsCaption: 'Not every lucky charm is loud. Some just walk beside you quietly in the dark. Save this for a tired day.',
            lyricsHook: 'You don\'t need a saving hand. Just a small light on your desk, writing "you survived" inside your head.',
            musicPrompt: 'Ultra soft Lo-Fi piano loop, muffled rain tapping on glass, warm sub-bass, 72 BPM, introspective and safe',
            hashtags: ['#DeerInBloom', '#SelfCareHours', '#LofiCompanion', '#NightDecompression'],
            storyboard: [
              { timeframe: '00:00 - 00:03', scene: '深夜公寓。年轻女孩推门而入，疲惫地把钥匙扔在书桌上。画面色调低沉，窗外淅淅沥沥下着小雨。', textOverlay: 'You made it through today.' },
              { timeframe: '00:04 - 00:07', scene: '她无力地坐在电脑前，打开一盏橙褐色的台灯。随着灯光亮起，一头闪烁着微光的小鹿精灵突然趴在她的手边。小鹿的鹿角泛着暖融融的金黄。', textOverlay: 'Even if no one else saw how hard you tried...' },
              { timeframe: '00:08 - 01:00', scene: '女孩伸出手指轻触小鹿温润的鼻尖，金黄微光泛成层层涟漪。女孩的嘴角终于露出一丝安心的笑意。Lo-FI 隐隐高潮。', textOverlay: 'This little light knows.' }
            ]
          },
          {
            region: 'Latin America (拉美)',
            title: 'Una Suerte Sutil',
            tiktokCaption: 'La suerte camina contigo, incluso en los días lentos. No estás solo en el camino. 🦌🧡',
            igReelsCaption: 'No toda la suerte hace ruido. A veces, solo camina a tu lado con pasos silenciosos. ¿La sientes hoy?',
            lyricsHook: 'No necesitas un milagro en el cielo. Solo una colita dorada que camina contigo en el suelo lento.',
            musicPrompt: 'Warm acoustic nylon guitar strum, soft shaker, ambient room echo, organic and sunny, 80 BPM, comforting community vibe',
            hashtags: ['#DeerInBloom', '#SuerteDiaria', '#CompaniaFiel', '#CalmaCotidiana'],
            storyboard: [
              { timeframe: '00:00 - 00:03', scene: '拉美午后黄昏。街道泛着斑驳暖金。少年拿着一箱书从阶梯走下，其中一本书掉在地上沾满泥沙，他沮丧叹气。', textOverlay: 'A veces, el mundo parece ir demasiado rápido.' },
              { timeframe: '00:04 - 00:07', scene: '一只可爱修长的金色小鹿用蹄子轻轻顶了顶那本书。少年抬起头，惊奇地发现小鹿正温柔地看着他。暖调排笛在吉他后低回。', textOverlay: 'Pero la suerte tiene su propio paso lento...' },
              { timeframe: '00:08 - 01:00', scene: '少年拍拍屁股站起，摸摸小鹿圆润的下巴，金色尘埃飞舞。一人一鹿，影子在落日余晖里并排拉得很长很长。', textOverlay: 'Y hoy camina a tu lado. 🧡' }
            ]
          }
        ]
      },
      visual_prompt: {
        regions: [
          {
            region: 'North America (北美)',
            prompt: '9:16 vertical video layout, a tiny glowing magical golden deer spirit, sitting on an urban office desk at night. A cozy glowing desk lamp, rainy night outside the window with faint city neon reflections. Cinematic realism, ultra-detailed textures, moody low-light cozy scene, soft gold and dark obsidian blue color palette --ar 9:16 --v 6.0',
            description: '注重极致舒适和个人隐私感。橙黄色的暖光在深蓝色的公寓背景下形成高对比、眼部极度舒适的反差，打造孤独白领心灵急救仓意向。'
          },
          {
            region: 'Latin America (拉美)',
            prompt: '9:16 vertical video aspect, a graceful slender golden deer walking alongside a young local teenager down a historic colonial street at golden dusk. Warm ambient natural sunlight, soft orange sunset glow, old textured walls, gentle cinematic realism, warm organic colors, inviting community atmosphere --ar 9:16 --v 6.0',
            description: '突出社区人际纽带和暖阳气息。利用拉美殖民风格古旧墙面的质感，配合金黄泛红的落日，打造属于拉美普通街区的奇幻微光日常。'
          }
        ]
      },
      compliance_review: {
        decision: 'Revise',
        decisionText: 'Revise (需小幅修缮文案及视觉以实现 100% 广告法合规)',
        decisionTextZh: '需修改 (局部包含中危合规摩擦，修改治疗宣称及过度神化构图后可直接上线)',
        risks: [
          {
            category: 'healing_claim',
            categoryZh: '抗焦虑疗效声明风险',
            severity: 'medium',
            reason: 'CopyAgent 在初版北美文案中使用了 "cures your sleepless anxiety (治愈失眠焦虑)"，此话术违背了美国 FTC 的虚假/非医类神化功效宣称准则。',
            reasonZh: '最初版宣称“能够扫空并治疗长期焦虑不寐”，触犯海外广告法法务“非医疗性产品禁止夸大或承诺治疗效果”禁区。',
            suggestion: '将涉及疗效的 "cures your anxiety" 软化替换为 "emotional comfort" 或 "a tiny moment of peace in a hectic day"，避开功效指控。',
            suggestionZh: '将“治愈/扫空焦虑失眠”柔化改写为“在兵荒马乱的手头事务中，捕捉两秒属于自己的静谧呼吸”。',
            basisType: 'regulatory_rule',
            triggeredRuleCode: 'US FTC Act Section 5 / FDA Health Claim Regulations',
            triggeredRuleCodeZh: '联邦贸易委员会法(FTC Act)第5款防虚假宣传 / FDA食品药品宣称限制令',
            basisDescription: 'Under federal regulations, claiming that a consumer asset or digital experience "cures" or "treats" psychological symptoms (e.g. anxiety, insomnia) is legally classified as an unauthorized medical claim, leading to severe litigation risks.',
            basisDescriptionZh: '根据美国FTC及FDA联合条例，除经临床核准的药械外，任何出海普通商品/自媒体IP文案一律严禁词涉 “Cure/Treat/Heal”(对疾病的治疗、疗愈、根治宣称)，否则将招致集体诉讼和平台下架处分。'
          },
          {
            category: 'religious_misuse',
            categoryZh: '宗教圣人圣符误触风险',
            severity: 'medium',
            reason: '最初版视觉 Prompt 包含 "deer with a perfect circle gold light halo directly behind its head"。这在海外网民眼中，布局酷似拜占庭天主教圣人画像。',
            reasonZh: '让金光在小鹿正后脑勺形成规整的正圆，构图酷似天主教、圣公会供奉的“圣人圣环”，有侵犯严肃宗教认同风险。',
            suggestion: '要求将正圆光环重构为“自然泛出发光粒子、雾粉尘雾般的微弱闪烁（star dust, tiny magical gold sparks）”，去掉规整宗教正圆形。',
            suggestionZh: '通知后继重画脚本将规整“神格正圆光环”更改为“鹿角天然像落满了林间金色雾沙般的自然微芒”。',
            basisType: 'cultural_taboo',
            triggeredRuleCode: 'ICC Advertising Code Article 12 (Social & Cultural Responsibility)',
            triggeredRuleCodeZh: 'ICC国际商会广告实务守则第12大条（社会及文化尊重责任）',
            basisDescription: 'Depicting holy circle halos on animated creatures clashes with canonical Catholic Saint iconography in Low-PDI traditional areas, risking severe pushback from family-oriented localized communities.',
            basisDescriptionZh: '在北美的传统中产社群及拉美普遍高度虔诚的天主教社会中，正等圆形金色圣圈（Nimbus Halo）属于神圣不可侵犯的宗教圣像专有纹样，将其强套给拟人动物易引发圣像滥用及亵渎非难。'
          },
          {
            category: 'cultural_stereotype',
            categoryZh: '族群及地域刻板偏见',
            severity: 'low',
            reason: '文案已彻底规避将拉美用户默认归纳为“狂欢节派对与桑巴舞爱好者”的陈腐老套观点，使用原声吉他成功平替，风险极低。',
            reasonZh: '策略已用温厚平和小吉他，打破了海外广告中拉美网民必须“桑巴斗牛跳狂欢舞”的脸谱偏见，完全符合现代出海尊重意识。',
            suggestion: '继续保持对本土多维真实的记录，无需任何修改。',
            suggestionZh: '保持克制客观，无需改动。',
            basisType: 'model_bias',
            triggeredRuleCode: 'Universal DE&I Standards (Diversity, Equity & Inclusion)',
            triggeredRuleCodeZh: '全球多元、公平与包容（DE&I）反偏见营销指引',
            basisDescription: 'Avoids outdated cultural flattening and patronizing clichés (such as expecting Latin Americans to only react to carnival dances/passionate festivals) by integrating serene, artistic local daily scenes.',
            basisDescriptionZh: '旨在彻底破除“将拉美出海文案一律画作草帽、仙人掌、狂欢派对跳桑巴”的陈腐脸谱设定。以平和民谣吉他替换偏见热带喧闹，展现深厚且真实多元的现代本土风味。'
          }
        ]
      },
      evaluation_score: {
        overall: 4.3,
        scores: [
          { key: 'culture_fit', labelZh: '文化适配度', labelEn: 'Culture Fit', score: 4.5, feedbackZh: '成功将“恩赐好运”升级为高个人主义白领的“Self-Care”和集体主义式的“同行陪伴”，对味明显。', feedbackEn: 'Perfectly reframed luck into self-care and community companionship. Extremely tailored.' },
          { key: 'brand_consistency', labelZh: '品牌一致性', labelEn: 'Brand Consistency', score: 5.0, feedbackZh: '发光角与静默守护的特质在双语版本里都维持得极其坚固，无任何品牌损耗。', feedbackEn: 'The core traits of gentle protection and shining antlers are flawlessly protected across both languages.' },
          { key: 'originality', labelZh: '原创度', labelEn: 'Originality', score: 4.2, feedbackZh: 'Lo-Fi影子分身台灯与夕阳吉他偶遇的设计充满治愈片反差，彻底脱离了普通的廉价模板词。', feedbackEn: 'Shadow-play lamp and colonial sunset layouts are unique and soulful, distant from template-clutter.' },
          { key: 'music_usability', labelZh: '音乐可用性', labelEn: 'Music Usability', score: 4.0, feedbackZh: '给出了清晰的BPM、风格流派和情绪控制词，AI生成配乐重合率极高。', feedbackEn: 'Clear BPM, explicit instrumentation and emotional controls make the prompt ready for direct music engines.' },
          { key: 'video_feasibility', labelZh: '视频可行性', labelEn: 'Video Feasibility', score: 4.5, feedbackZh: '镜头分剪动作极度清晰，均是易于搭建的三维度镜头，制作成本友好。', feedbackEn: 'Extremely clean shot list. Easy to film and animate with minimal CGI footprint.' },
          { key: 'hook_strength', labelZh: 'Hook 纯境吸睛力', labelEn: 'Hook Strength', score: 4.1, feedbackZh: '“女孩推门抛钥匙、小鹿从桌边台灯影子里探出脑门”在首秒有极强的氛围吸睛质感。', feedbackEn: 'Opening scene with keys hitting desk and silhouette growing is a stellar mood hook.' },
          { key: 'platform_fit', labelZh: '平台适配度', labelEn: 'Platform Fit', score: 4.3, feedbackZh: '文案贴片符合9:16竖屏安全区域，附带的互动话术也高度符合TikTok社交习惯。', feedbackEn: 'Stickers align with 9:16 safety zones. Comments call-to-actions are organic.' },
          { key: 'safety', labelZh: '法律合规及文化安全', labelEn: 'Safety', score: 4.8, feedbackZh: '通过双重元数据拦截，过滤了几乎所有的疗效及侵权性指控，修改后达到特级安防标准。', feedbackEn: 'Metadata block successfully filtered raw violations. After minor adjustments, safety margins are gold.' },
          { key: 'viral_potential', labelZh: '自发裂变传播力', labelEn: 'Viral Potential', score: 4.0, feedbackZh: '“写下你今天需要的小小运气”的评论引导性极高，易于吸引用户跟评倾诉。', feedbackEn: 'Comment-captions are highly relatable, likely to pull strong UGC comments.' }
        ]
      }
    },
    logs: [
      { timestamp: '18:43:40', agent: 'OrchestratorAgent', event: 'Task Started', message: '解析 Campaign Brief 结构... 锁定 Must-Have 和 Must-Not 规则矩阵。', type: 'info' },
      { timestamp: '18:43:42', agent: 'OrchestratorAgent', event: 'Anchors Set', message: '提取 Context Anchor: 必须保留‘温厚陪伴’基因；禁止医疗宣称、规正圆环神格化。', type: 'success' },
      { timestamp: '18:43:43', agent: 'MarketResearchAgent', event: 'Retrieval Start', message: '检索北美和拉美社交软视频趋势... 锁定 Lo-Fi 与原声吉他疗愈赛道。', type: 'info' },
      { timestamp: '18:43:45', agent: 'MarketResearchAgent', event: 'Data Compiled', message: '完成双区域信号报告生成。警告：北美心理法规极其严格，禁止任何直接改运、代医表述。', type: 'success' },
      { timestamp: '18:43:46', agent: 'CultureAdapterAgent', event: 'Mapping Framework', message: '应用 Hofstede 指标矩阵。北美(高IDV)重新解耦为“Self-Care”；拉美(高UA)解耦为“Acompañamiento”。', type: 'info' },
      { timestamp: '18:43:49', agent: 'CultureAdapterAgent', event: 'KB Synced', message: '从本地 SQLite FTS5 读取【一鹿繁花 东方史话与避讳】... 完成 3 层文化等效转换。', type: 'success' },
      { timestamp: '18:43:50', agent: 'ContentStrategistAgent', event: 'Concept Locked', message: '构建“深夜书桌一盏灯”与“暖黄街巷吉他鸣”双版本故事轴... A/B测试指标载入。', type: 'info' },
      { timestamp: '18:43:53', agent: 'CopyAgent', event: 'Copy Pack Generation', message: '生成双语 TikTok 贴片、IG 叙事、BPM配乐提示词与分剪脚本包。格式匹配平台限制。', type: 'info' },
      { timestamp: '18:43:55', agent: 'ComplianceAgent', event: 'Auditing Artifacts', message: '对抗起算！对照 RAG 黑词和 Context Anchor 边界检测... ⚡ 警报！初版文案包含 “anxiety medicine”、视觉圆环圣化违规！', type: 'warning' },
      { timestamp: '18:43:56', agent: 'System', event: 'Fallback Loop Triggered', message: '⚠️ ComplianceAgent 触发 Block 信号。自动回退工作流至 ContentStrategistAgent 重构风险点。', type: 'error' },
      { timestamp: '18:43:57', agent: 'ContentStrategistAgent', event: 'Redo Optimization', message: '重写故事轴：擦除 cures Sleepless anxiety 主干，转换为 desk-light calming. 重新提交中。', type: 'info' },
      { timestamp: '18:43:59', agent: 'CopyAgent', event: 'Copy Pack Regenerated', message: '文案重构完成。剔除正圆光环，替换为 starry gold dust-glow. 重新送审。', type: 'success' },
      { timestamp: '18:44:00', agent: 'ComplianceAgent', event: 'Auditing Re-run', message: '对抗复审通过！医疗警告降为 Low，宗教违规清零。核发 publish_decision: Revise 判定。', type: 'success' },
      { timestamp: '18:44:02', agent: 'EvaluatorAgent', event: 'Calculating Evals', message: '根据 9 维细分模型评算出 4.3 综合优质高分。安全合规分由 2.4 上升至 4.8。CulturePack 正式打包落地。', type: 'success' }
    ]
  },
  tea_ritual: {
    id: 'tea_ritual',
    name: '🍵 Bamboo Tea Ritual (翠竹禅茶茶道)',
    brief: {
      id: 'tea_ritual',
      name: 'Bamboo Tea Ritual (翠竹禅茶茶道)',
      cultureAsset: '传统中国武夷禅茶茶道艺术与器具',
      businessGoal: '高端文化生活方式品牌海外DTC自媒体宣发',
      targetRegions: ['North America'],
      targetPlatforms: ['TikTok', 'Instagram Reels'],
      emotionalKernel: ['内观', '呼吸调频', '慢节奏美学', '逃离快节奏都市', '自然的沉静能量'],
      mustHave: ['冲茶热气蒸腾的温润感', '翠竹苍翠欲滴的自然极简东方美学', '动作慢半拍的解压白噪音节奏'],
      mustNot: ['宣扬“能延年益寿、降三高、代替减肥药”等医疗承诺', '使用浓厚的中国古典皇帝/皇家等过于遥远陈腐的宏大历史叙事', '直译复杂的茶艺宗教术语（如涅槃、法身等）'],
      brandTone: '极简、清冷、克制、空灵'
    },
    culturePack: {
      market_insight: {
        title: '竹茶艺术欧美社交风向与敏感词洞察',
        regions: [
          {
            name: 'North America (北美)',
            insights: [
              '受 “ASMR / Oddly Satisfying (视觉及白噪音极度解压)” 精细流媒体品类吸引，沏茶、注水、划过茶叶的白噪音具有恐怖的自然吸睛潜力。',
              '北美上班族高频检索 “Unwinding Routine (下班松弛流程)” 和 “Digital Detox (数字深思排毒)”，茶道器具可无摩擦平替传统的香薰蜡烛。',
              '绝对禁止包含“Tea cures diabetes or lowers blood pressure (茶叶能治疗糖尿病、降血糖)”等触犯 FDA 规范的话术指控。'
            ],
            risks: ['Strict FDA label compliance (FDA食品法包装及功效标签审查)', 'Outdated orientalist stereotype (东方主义符号遥远陈腐感)']
          }
        ]
      },
      cultural_adaptation: {
        framework: 'Hofstede 低权力距离 + 偏重个人冥想 (Individualist Meditations) 情绪适配',
        localCanons: [
          {
            region: 'North America (北美)',
            localEmotion: 'tea-meditation (午后三点的一分钟呼吸)',
            scenes: ['明亮现代灰色厨房 (Modern gray kitchen)', '阳光洒在极简木桌 (Minimalist table)', '手掌焐暖一杯茶 (Warm hands holding cup)'],
            dont: ['不穿古装汉服等遥远演服 (No period costumes)', '不强制灌输冗长玄学典故 (No heavy dynasty gossip)'],
            mappingDescription: '将宏大茶文化降解为“给现代人的5分钟咖啡替代冥想 (Tea-Meditation)”。画面强调茶渍蒸腾、竹质杯托的温润触感，通过现代、轻透的生活美学，切入欧美高IDV网民对于精神解压与天然功能茶的向往。',
            adaptationBasis: 'Hofstede Dimension: High Individualism (IDV 91) & Muted Masculinity (MAS 62)',
            adaptationBasisZh: '霍夫斯泰德文化维度推导：高个人主义独处 (IDV 91) 与松弛生活调调 (MAS 62)',
            evidenceData: 'Market Data: US Specialty Tea Association reports 32% annual volume growth in wellness/herbal tea pods among Gen-Z urban professionals.',
            evidenceDataZh: '市场实证数据：美国精品茶协会（ESTA）报告指出，保健天然功能草本茶与竹木茶具在城市青年白领群体中的自购家庭拥有率年均飙涨32%，冥想平替需求极其刚性。'
          }
        ]
      },
      content_strategy: {
        pillars: [
          '「茶水的声音」：放大沸水注入泥壶、滤茶网的清透白噪音，打造ASMR解压王牌。',
          '「午后 15:00 咖啡代用品」：科普如何使用茶道器具，用天然竹泡茶仪式平替多余咖啡因。',
          '「现代人的清茶仪式」：在现代极其克制的公寓内，点一株干柏，冲一盏岩茶，呼吸调频。'
        ],
        videoThemes: [
          { title: '茶道 ASMR (NA)', duration: '15s White Noise', concept: '全片无背景音乐，只有沸水汩汩注下、碧绿茶叶在陶质盖碗里轻微舒展、清透汤色滤过竹网的解压高画质声效。极致宁静。' }
        ],
        abTest: [
          'A组测试：“极致解压动作流” —— 重声效、茶叶吸水饱满的微距镜头感。',
          'B组测试：“杯里一分钟” —— 重故事，记录白领从电脑繁重报表里抽身，焐手闻香、长舒一口气的场景对比。'
        ],
        platformPlan: 'TikTok 锁死“#ASMRTea”与“#OddlySatisfying”白噪音风潮（利用极高的停留收听率打破推送算法限制）；Instagram 发布极简北欧风现代茶室九宫格构图，搭配诗意留白文案。'
      },
      copy_pack: {
        regions: [
          {
            region: 'North America (北美)',
            title: 'Unwind in a Cup',
            tiktokCaption: 'Unzip your mind for 15 seconds. Let the steam carry away the noise of the screen. 🍵🌿',
            igReelsCaption: 'No dynasty history required. Just bamboo, warm water, and a long-overdue deep breath. Reset your afternoon drift.',
            lyricsHook: 'Silence is not the absence of sound. It is the green leaf unfurling in a cup, quiet as the ground.',
            musicPrompt: 'Zero instruments, pure high-fidelity micro ASMR, crackling hot water under clay, gentle ceramic clinks, crisp wind chimes',
            hashtags: ['#TeaMeditation', '#AsmrTea', '#OddlySatisfying', '#MindfulnessJourney'],
            storyboard: [
              { timeframe: '00:00 - 00:03', scene: '极简明亮的北欧灰色客厅。背景摆有一台散发莹荧冷光的显示器。白领的手骨节修长，将一壶水徐徐烧。', textOverlay: 'Your mind deserves a break from the pixels.' },
              { timeframe: '00:04 - 00:07', scene: '武夷岩茶汤色呈蜜珀色，从泥壶口拉出一道完美的水柱落入清香竹托，极高画质捕捉滚烫水气在杯沿凝成朦胧雾粒。吉他极弱声附。', textOverlay: 'Breathe out. Steam rising, worries sinking.' },
              { timeframe: '00:08 - 01:00', scene: '白领用双手捧起竹杯，贴近闭眼深嗅一缕，随而大舒一口气。暖色渐染荧光。', textOverlay: 'The easiest 2-minute retreat. 🍵' }
            ]
          }
        ]
      },
      visual_prompt: {
        regions: [
          {
            region: 'North America (北美)',
            prompt: '9:16 portrait composition, extremely close-up shot of steaming hot tea pouring from an elegant clay teapot into a minimalist bamboo cup. Cinematic shallow depth of field, micro dust particles catching warm morning sunlight rays, high-fidelity wood and ceramic textures, misty steam swirls rising gracefully. Scandina-minimalism interior design, soft beige and soft sage green tones --ar 9:16 --v 6.0',
            description: '专注于蒸汽细节与器皿材质的温度感。画面色调明亮、柔和、高级，告别过往茶广告陈旧昏暗的老太爷书房形象，赋予其北欧极简中产感。'
          }
        ]
      },
      compliance_review: {
        decision: 'Pass',
        decisionText: 'Pass (合规度高，无任何刚性医疗与宗教词汇，支持即时发布)',
        decisionTextZh: '完全通过 (全链路过滤了皇帝叙事、Dynasty 标签与高危治疗词涉，合规度达到 100% 特高水准可以直接宣发)',
        risks: [
          {
            category: 'healing_claim',
            categoryZh: '医疗疗效虚假营销拦截',
            severity: 'low',
            reason: '文案完全自律地避开了“Detox fat away, lowers calorie intake (喝茶消脂排毒减肥、治病降脂)”等触碰FDA的非食品成分红线宣称。',
            reasonZh: '未出现任何“刮油消重减肥、清血管降血脂、替代医疗排毒”等高敏感虚假功效承诺词汇，完全通过。',
            suggestion: '无需进行任何微改。继续贯彻该清凉舒压定位。',
            suggestionZh: '当前安全缓冲空间开阔，建议直接全渠道推进。',
            basisType: 'regulatory_rule',
            triggeredRuleCode: 'FDA Food Labeling Guide Section 101.9 / FTC Truth-in-Advertising Rules',
            triggeredRuleCodeZh: 'FDA食品营养标签规范第101.9款 / FTC广告真实披露规则',
            basisDescription: 'Restricts unqualified biological efficacy statements for herbal extracts; by solely positioning the tea ritual as sensory ASMR relaxation, we guarantee 100% legal immunity.',
            basisDescriptionZh: '规避了对植物提取物功效描述的行业高风险雷区。通过将其全数重构为“ASMR听觉感知与手部温热体验”，杜绝了食品法下关于非科学实证抗病疗效的任何行政指控风险。'
          },
          {
            category: 'religious_misuse',
            categoryZh: '虚妄宗教玄学术语',
            severity: 'low',
            reason: '规避了将复杂茶道名词直译成 "Nirvana / Buddhist Karma" 等带有严肃宗教敬重性的词语，无冒犯本地教团风险。',
            reasonZh: '未使用“涅槃、佛家开光、皇家佛茶、因果福报”等容易让欧美广大无信仰或天主教徒感到无所适从、反感的非合规词涉，极安全。',
            suggestion: '保持当前清凉不涉神迹和教义的科学减压表达。',
            suggestionZh: '保持静水流深格调，不带超凡神迹宣传。',
            basisType: 'cultural_taboo',
            triggeredRuleCode: 'AANA Code of Ethics Section 2.1 (Religious & Cultural Nuances)',
            triggeredRuleCodeZh: 'AANA广告道德和民俗规避指引第2.1节',
            basisDescription: 'Direct translations of deeply holy Eastern theology (e.g. Nirvana, Karma, Dharma) frequently backfire as mock mysticism or serious offense; secular relaxation branding maintains high compliance.',
            basisDescriptionZh: '东方深层神学词汇（如涅槃、法性、业障等）直译极易引发西方主流信徒的“异教猎奇”或“不严肃解构”反感。提炼生活美学、剔除过度玄学，使受众接纳度最大化。'
          }
        ]
      },
      evaluation_score: {
        overall: 4.6,
        scores: [
          { key: 'culture_fit', labelZh: '文化适配度', labelEn: 'Culture Fit', score: 4.8, feedbackZh: '极其智慧地将繁杂古老茶道适配为极简午后代咖啡冥想，在受众痛点上降维打击。', feedbackEn: 'Extremely clever transition of complex tea ceremonies into minimalist tea-meditation, hitting home.' },
          { key: 'brand_consistency', labelZh: '品牌一致性', labelEn: 'Brand Consistency', score: 4.7, feedbackZh: '动作迟缓感、白噪音和自然的翠竹美学极度扎实，翠绿竹杯质感通透如一。', feedbackEn: 'The ASMR slow-pace, natural bamboo color, and comforting steam maintain solid brand integrity.' },
          { key: 'originality', labelZh: '原创度', labelEn: 'Originality', score: 4.3, feedbackZh: '丢弃了所有古装表演者的刻板符号，选择极简灰色厨房对比橙黄茶气，视觉十分抓人高级。', feedbackEn: 'Destroyed all period-costume stereotypes. Sage-green minimal setting brings deep refreshing premium vibes.' },
          { key: 'music_usability', labelZh: '音乐可用性', labelEn: 'Music Usability', score: 4.5, feedbackZh: '提供了极其有辨识度的白噪音气声和餐具瓷器微碰词，AI音效还原度高。', feedbackEn: 'Excellent specifications of high-fidelity glass/ceramic clinks. Highly useful for sound synthesis.' },
          { key: 'video_feasibility', labelZh: '视频可行性', labelEn: 'Video Feasibility', score: 4.8, feedbackZh: '纯微距、茶桌、人物露手、热气，单反相相机或微单在中产书桌即可低廉成本拍摄。', feedbackEn: 'All micro-shots can be captured easily with high-res cameras at low production costs.' },
          { key: 'hook_strength', labelZh: 'Hook 纯境吸睛力', labelEn: 'Hook Strength', score: 4.4, feedbackZh: '用橙冷相间光辉中“滚烫水气在杯沿凝成水雾”的极端高阶慢镜头起，ASMR留人率极强。', feedbackEn: 'Misty hot condensation slowing down in the opening seconds creates magnetic retain rates.' },
          { key: 'platform_fit', labelZh: '平台适配度', labelEn: 'Platform Fit', score: 4.6, feedbackZh: '#OddlySatisfying 黑词打标精准，字数极其考究贴边，标签社交度堪称典范。', feedbackEn: 'Tagging #OddlySatisfying aligns perfectly with algorithms. Fits layout constraints.' },
          { key: 'safety', labelZh: '法律合规及文化安全', labelEn: 'Safety', score: 5.0, feedbackZh: '挑不出一丝功效担保毛病。纯净、环保、健康，堪称出海标杆法务卷面。', feedbackEn: 'Zero FTC clinical risks. Pure, clean, healthy. Safe for scaling globally.' },
          { key: 'viral_potential', labelZh: '自发裂变传播力', labelEn: 'Viral Potential', score: 4.1, feedbackZh: '在快节奏的TikTok端，这条“空灵慢半拍且不刺耳”的视觉白噪音具备极强的前屏停留和高分享属性。', feedbackEn: 'A high-contrast soothing oasis in the fast scroll feed. Likely to pull strong share rates.' }
        ]
      }
    },
    logs: [
      { timestamp: '11:42:01', agent: 'OrchestratorAgent', event: 'Brief Loaded', message: '解析翠竹禅茶 IP 资产基本信息。提取要点：茶、静、ASMR 白噪音、极简包装器皿。', type: 'info' },
      { timestamp: '11:42:03', agent: 'OrchestratorAgent', event: 'Anchors Finalized', message: 'Context Anchor 锁定：必须保留清透蒸汽与茶道慢节奏，严防皇家宏大和神医病效指称。', type: 'success' },
      { timestamp: '11:42:05', agent: 'MarketResearchAgent', event: 'Market Scout', message: '扫描北美 ASMR 与 odd-satisfying 自媒体。白噪音茶道展现极强流量攀附力。', type: 'info' },
      { timestamp: '11:42:07', agent: 'CultureAdapterAgent', event: 'Dimension Strum', message: '茶道由东亚尊卑序链，重塑为北美 IDV 的“Tea-Meditation（下午三点一分钟冥想）”，去神格化。', type: 'info' },
      { timestamp: '11:42:09', agent: 'ContentStrategistAgent', event: 'Strategy Built', message: '锁死内容支柱：“茶汤的声音（白噪音）”、“咖啡因低敏感替代仪式”。避免东方汉服cosplay陈旧老套路。', type: 'success' },
      { timestamp: '11:42:12', agent: 'CopyAgent', event: 'Copy Pack Output', message: '生成 TikTok 静气 captions、IG 空灵文案、BPM 配音提示词及微距分镜描述。', type: 'info' },
      { timestamp: '11:42:14', agent: 'ComplianceAgent', event: 'Auditing Run', message: '对照 RAG 法规库和 Context Anchor 高刚性审计中... 无中高危风险触犯。核发 publish_decision: Pass。', type: 'success' },
      { timestamp: '11:42:16', agent: 'EvaluatorAgent', event: 'Evaluation Done', message: '由于完美规避医疗减肥承诺，合规度满分（5.0）。综合 9 维评估分高达优秀等级的 4.6 分。无回退需求。', type: 'success' }
    ]
  }
};
