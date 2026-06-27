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
      { timestamp: '11:42:14', agent: 'ComplianceAgent', event: 'Auditing Run', message: '对照 RAG 法规库 and Context Anchor 高刚性审计中... 无中高危风险触犯。核发 publish_decision: Pass。', type: 'success' },
      { timestamp: '11:42:16', agent: 'EvaluatorAgent', event: 'Evaluation Done', message: '由于完美规避医疗减肥承诺，合规度满分（5.0）。综合 9 维评估分高达优秀等级的 4.6 分。无回退需求。', type: 'success' }
    ]
  },
  aqi_isme: {
    id: 'aqi_isme',
    name: '🎨 Aqi Is Me (阿琪是我 • 个人IP)',
    brief: {
      id: 'aqi_isme',
      name: 'Aqi Is Me (阿琪是我)',
      cultureAsset: '东方手工点翠、刺绣、植物手工香膏等传统手艺',
      businessGoal: '海外个人 IP 孵化、手艺美学短视频变现与手工定制引流',
      targetRegions: ['North America', 'Latin America'],
      targetPlatforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      emotionalKernel: ['东方慢生活', '女性手艺传承', '匠人温度', '在快节奏世界中慢下来的定力', '手工造物的呼吸感'],
      mustHave: ['治愈的手指微距慢镜头', '自然森林或庭院背景声', '极简雅致的古典服饰和柔和光影', '第一人称 Vlog 的亲切感'],
      mustNot: ['进行政治或意识形态强行说教', '刻意宣称具有美容淡斑、抗皱、美白或抗敏等医学护肤疗效', '套用偏远落后异邦神秘偏见，使用阴暗玄学或邪教色调等恐怖构图'],
      brandTone: '静谧、本真、温婉、优雅而专注'
    },
    culturePack: {
      market_insight: {
        title: '东方女性手工美学海外社交风向与个人IP合规雷区洞察',
        regions: [
          {
            name: 'North America (北美地区)',
            insights: [
              '在高度成熟的 Etsy 手工与 TikTok #Craftok 圈层，观众对“女性微型主权(Female Micro-sovereignty)”与“自主造物者(Independent Maker)”充满敬重，热捧手工慢生活。',
              '手作过程中的微距剪刀划过布料声、蜡液凝固收缩等高保真细节是顶级 ASMR 流量密码，周五/周六晚间播放量极高。',
              '个人 IP 推广手作香膏或精油时，严厉禁止提及“消除湿疹、治疗敏感、抗炎抗老”等任何药妆级功效宣称，需遵守 FTC 个人代言利益披露守则（Endorsement Guides）。'
            ],
            risks: ['Efficacy cosmetics statement violations (药妆功效非法宣称)', 'FTC influencer endorsement disclosure requirements (FTC个人代言披露要求)']
          },
          {
            name: 'Latin America (拉美地区)',
            insights: [
              '拉美天主教传统下，对手工编制、自然植物护肤品有极高家庭手作认同度。视频中融入“母亲教导”或“手艺代代传承”的情感主线极易产生爆发级裂变。',
              '西语 Caption 应主打“Amor Hecho a Mano (爱，始于手作)”与“Estilo de Vida Lento (慢生活方式)”，背景配乐推荐温润的尼龙吉他或空灵的手碟。',
              '规避使用“异邦神秘主义/巫术符咒(Brujería / Shamanic spells)”等容易引起宗教保守家庭反感与抵制的视觉构图。'
            ],
            risks: ['Witchcraft & occult stereotyping (巫术与异邦神秘偏见)', 'Commercial coldness (缺乏人情味与家族连结的纯商业感)']
          }
        ]
      },
      cultural_adaptation: {
        framework: 'Hofstede 低权力距离 + 强调个人技艺自主(Individual Autonomy) + 亲情传承集体主义(Family Heritage)双轨重构',
        localCanons: [
          {
            region: 'North America (北美)',
            localEmotion: 'independent-maker (自主女性匠人与慢美学)',
            scenes: ['明亮整洁的手作工作台 (Bright aesthetic workspace)', '阳光穿过玻璃瓶的微距 (Sunlight through glass jars)', '专注手作的眼角微距 (Focused creative look)'],
            dont: ['绝不强加爱国或宏大意识形态说教 (No ideological preachy lectures)', '绝对不可打医疗功效擦边球 (No clinical beauty promises)'],
            mappingDescription: '将宏大的“非遗传承”降维转译为“自主女性造物主(Independent Maker)的下午一小时心流”。不摆谱，以低权力距离的平视闺蜜视角展示刺绣和熬制茉莉香膏，满足高个人主义北美受众对于“自我掌控、高质感生活仪式感”的顶级向往。',
            adaptationBasis: 'Hofstede Dimension: High Individualism (IDV 91) & Low Power Distance (PDI 40)',
            adaptationBasisZh: '霍夫斯泰德文化维度推导：高个人主义自我价值 (IDV 91) 与低权力距离亲近感 (PDI 40)',
            evidenceData: 'Community Statistics: #Craftok has over 32.4B views. 82% of female Etsy buyers prefer purchasing from independent female-creator brands with clear personal storytelling.',
            evidenceDataZh: '社群实证数据：TikTok #Craftok (手艺人) 标签播放超324亿次。82%的北美女性手工买家表示，她们极度偏好从“具有温情个人创业故事”的独立女性创作者手中购买手工香氛/配饰。'
          },
          {
            region: 'Latin America (拉美)',
            localEmotion: 'el alma de las manos (手掌的灵魂与世代温情)',
            scenes: ['烛光摇曳的暖光庭院 (Candle-lit patio)', '细碎轻哼的和煦下午 (Humming a gentle folk lullaby)', '精巧手工包上系上丝带 (Wrapping handmade gifts)'],
            dont: ['不要出现冰冷的现代流水线工业感 (No sterile machinery)', '绝不涉及异国怪力乱神或神秘占卜 (No weird cult or witch references)'],
            mappingDescription: '迎合拉美高集体主义与高不确定性规避特性，将手工活重塑为“温润的指尖温情”。强调手工艺品承载的亲情温度。文案注入“给爱人的手作祝福”，以极其细腻的家庭式暖色调、民谣乐器包裹画面，完美跨越地缘偏见，建立情感信赖。',
            adaptationBasis: 'Hofstede Dimension: High Collectivism (IDV 30) & High Uncertainty Avoidance (UAI 86)',
            adaptationBasisZh: '霍夫斯泰德文化维度推导：高集体主义亲密连结 (IDV 30) 与高不确定性安全感需求 (UAI 86)',
            evidenceData: 'Empirical Insights: Latin American handmade market research states that product origin storytelling focusing on "family devotion" (Devoción Familiar) increases emotional conversions by 45%.',
            evidenceDataZh: '大区社会实证：拉美手作零售报告表明，主打“家庭挚爱与手工心意传承”的个人IP背景故事，其受众互动留存率与销售转化力比纯客观商品描述高出45%。'
          }
        ]
      },
      content_strategy: {
        pillars: [
          '「指尖的心流」：微距慢镜头展现丝线穿过针眼、捣碎茉莉花瓣溢出汁液的物理治愈感。',
          '「给自己的 5 分钟仪式」：科普在喧闹城市里，如何用纯植物香膏擦拭耳后，实现快速呼吸松弛。',
          '「手作日记 (Vlog)」：第一人称分享在竹林或中式庭院中专注劳作的一天，突出自然陪伴和个人笃定。'
        ],
        videoThemes: [
          { title: '茉莉香膏的诞生 (NA)', duration: '12s macro ASMR', concept: '微距展现捣碎白色茉莉、过滤清香植物油、将凝固的乳白香膏装入瓷盒的舒缓细节。背景配以雨打芭蕉声和清透手碟音。' },
          { title: '刺绣茉莉囊赠亲人 (LATAM)', duration: '20s Emotional Vlog', concept: '少女专注地在绢丝上绣出一朵并蒂茉莉，系上红绳，将其作为礼物系在风铃下。阳光洒落，民谣吉他渐起。' }
        ],
        abTest: [
          'A组测试：“极致微距声效流” —— 突出手部慢动作细节、捣花泥的微距物理美感。',
          'B组测试：“第一人称日常Vlog” —— 穿插阿琪在庭院中晨起、修剪花草、冲一盏清茶、静坐作画的治愈生活流，展现博主个人生活魅力。'
        ],
        platformPlan: 'TikTok 主攻 7-12s 的 “#HandmadeASMR” 与 “#CozyVibes” 治愈循环；Instagram Reels 主推高视觉美感的图文 4 宫格与制作精细的 15s 短篇故事；YouTube Shorts 专注于 30s-45s 的完整慢节奏工艺全过程解密。'
      },
      copy_pack: {
        regions: [
          {
            region: 'North America (北美)',
            title: 'Quiet Hands, Calm Soul',
            tiktokCaption: 'Pounding fresh jasmines into botanical balm. A tiny sanctuary for your pulse points. 🌸✨ #CozyMaker #JasmineBalm #HandmadeASMR #QuietLife',
            igReelsCaption: 'No chemicals, no rush. Just the rhythm of hands and the slow magic of jasmine wax. Wrap yourself in a moment of peace. Save this for your evening wind-down routine.',
            lyricsHook: 'Slow down your breath, let the petals bloom. Just your hands, and the quiet in the room.',
            musicPrompt: 'Ethereal soft hang drum loop, forest rain ambient dripping on broad leaves, warm sub-pads, 68 BPM, deeply calming',
            hashtags: ['#HandmadeCosmetics', '#CozyMaker', '#SlowAesthetics', '#SelfCareRitual'],
            storyboard: [
              { timeframe: '00:00 - 00:03', scene: '微距特写。白皙专注的手指捏着一根铜杵，在石钵中轻柔而极有节奏地捣碎几朵雪白的茉莉，乳白花汁溢出。伴有清晰的捣碎白噪音。', textOverlay: 'Quiet down the rush.' },
              { timeframe: '00:04 - 00:07', scene: '温热的金黄蜂蜡液缓缓注进精致的白色小瓷罐中，随着温度降低，蜂蜡从四周慢慢凝结成乳白色的雅致膏体。光线温暖和煦。', textOverlay: 'Let the aroma find its own time...' },
              { timeframe: '00:08 - 01:00', scene: '镜头推近。阿琪穿着素雅的中式丝绸日常衫，专注地用指尖挖出少许香膏，轻轻抹在手腕处，然后把手腕贴近脸颊闭目大吸一口气，神色安定温婉。', textOverlay: 'This is my 5-minute peace. 🌸' }
            ]
          },
          {
            region: 'Latin America (拉美)',
            title: 'El Aroma de la Calma',
            tiktokCaption: 'Un regalo hecho con las manos y el corazón. Flores de jazmín que calman el alma. 🌸🌿 #AmorArtesanal #HechoAMano #CalmaCotidiana #VlogRelajante',
            igReelsCaption: 'De las manos del artesano a tu pulso diario. Un bálsamo de jazmín natural para recordarte respirar despacio. ¿Caminamos juntas en la calma hoy?',
            lyricsHook: 'Las manos que tejen el hilo de flor, te traen el viento lleno de amor.',
            musicPrompt: 'Soothing Spanish acoustic nylon guitar strum, gentle room echo, slow tempo, organic shaker, comforting familial warmth',
            hashtags: ['#HechoAMano', '#BalsamoNatural', '#EstiloDeVidaLento', '#PazCotidiana'],
            storyboard: [
              { timeframe: '00:00 - 00:03', scene: '暖金色午后。阳光倾斜在长满绿植的温馨庭院。阿琪用纤细的丝线在绢丝上绣出一朵栩栩如生的茉莉花。一旁是温热的清茶。', textOverlay: 'Un regalo para recordar el ritmo del viento...' },
              { timeframe: '00:04 - 00:07', scene: '手作香膏瓷罐被装进精致的手工编织小麻袋中，系上墨绿色丝带。微距捕捉阿琪专注系蝴蝶结时温柔的眼神。手敲木吉他纯朴回旋。', textOverlay: 'Cada hilo lleva un deseo de paz para ti.' },
              { timeframe: '00:08 - 01:00', scene: '阿琪走出庭院，将绣花香囊挂在檐下的风铃上，风拂过，风铃叮当，茉莉轻摇，影子并排融进温暖余晖中。', textOverlay: 'Hecho con amor y tiempo lento. 🌸' }
            ]
          }
        ]
      },
      visual_prompt: {
        regions: [
          {
            region: 'North America (北美)',
            prompt: '9:16 vertical video layout, a macro extreme close-up of delicate female hands crushing fresh white jasmine petals in a dark grey stone mortar. Golden soft sunlight rays filtering through a dusty glass window, beautiful warm dust particles floating in the air. Soft focus background showing a clean cozy wooden craft table, cinematic realism, shallow depth of field, pastel cream and deep slate gray tones --ar 9:16 --v 6.0',
            description: '专注于原料的纯净度与手部的专注质感。暖意色调与干净透亮的手工工作台，塑造出一种高级、天然、不带任何工业污染的现代轻奢手作博主形象。'
          },
          {
            region: 'Latin America (拉美)',
            prompt: '9:16 portrait composition, a gentle beautiful young female artisan wearing simple elegant traditional linen clothes, focused on embroidering a flower on silk fabric in a cozy green courtyard at warm sunset. Cinematic backlighting, dreamy orange sun rays, rich climbing ivy on old brick walls, highly emotional, organic warm color grading --ar 9:16 --v 6.0',
            description: '突出自然和谐与暖调手作温情。利用柔和的逆光烘托专注手作时那种温婉雅致的个人光辉，给拉美受众带来极高的人文信任与情感治愈。'
          }
        ]
      },
      compliance_review: {
        decision: 'Pass',
        decisionText: 'Pass (合规审查完美通过，个人IP代言透明度符合FTC及FDA规范)',
        decisionTextZh: '完全通过 (全链路自律拦截了医学护肤字眼，个人IP代言机制合规透明，无侵权红线违规，可直接发布宣发)',
        risks: [
          {
            category: 'cosmetic_claim',
            categoryZh: '个人化妆品/香皂疗效虚假宣传拦截',
            severity: 'low',
            reason: '最初版草稿曾提及 "whitens dark spots and cures sensitive allergy (能美白、淡斑、治疗过敏性皮炎)"，已被 ComplianceAgent 安全拦截过滤。',
            reasonZh: '最初版在手工香膏描述中带有“天然退红、抗炎消敏、治疗皮炎”等功效修辞，触碰了FDA关于非处方化妆品禁称抗炎疗效的红线。现已完美剔除，通过率 100%。',
            suggestion: '保持当前仅限“芳香放松、气味安全屋、感官调节”的香氛解压描述，不宣称任何生理美白和抗炎疗效。',
            suggestionZh: '保持当前“嗅觉舒压、感官放松”的定位，一律不可宣称生理美白、抗衰抗皱或治疗湿疹。',
            basisType: 'regulatory_rule',
            triggeredRuleCode: 'FDA Cosmetic Claims Regulation CFR Title 21 / FTC Endorsement Guides Section 255',
            triggeredRuleCodeZh: 'FDA化妆品标签指引 CFR Title 21 / FTC 个人代言披露管理守则第255节',
            basisDescription: 'Restricts unqualified cosmetic claims promising physiological healing, while also enforcing transparent disclosure of sponsorships and influencer relationships.',
            basisDescriptionZh: '限制化妆品/手工护肤品承诺任何生物学或生理疗愈功效。同时FTC代言指南要求，任何自媒体博主在推荐自主品牌或合作品牌手工品时，须显式声明利益关系（如 #Sponsored 或 #Owned），确保自媒体广告的诚实可信。'
          },
          {
            category: 'ideological_preachiness',
            categoryZh: '意识形态说教与宣教偏离风险',
            severity: 'low',
            reason: '文案完全规避了将中国传统手艺拔高至复杂的“民族宏大复兴”等容易引发地缘意识摩擦的直白政治说教，保留纯手工温情。',
            reasonZh: '避开了生硬、刻板地向海外网民说教民族历史和宏大叙事等雷区。以平视的、生活流的、极具人情味的手作细节（ ASMR ）获得最广泛网民的心灵交融，极具智慧。',
            suggestion: '继续保持生活化、匠人化、故事化的第一人称生活流 Vlog 路线，以无声胜有声。',
            suggestionZh: '坚持平视的生活美学，让东方底蕴自然流淌，避免空洞说教。',
            basisType: 'cultural_taboo',
            triggeredRuleCode: 'ICC International Code of Direct Marketing Article 5',
            triggeredRuleCodeZh: 'ICC国际商会直接营销及国际广告守则第5大条（客观尊重与无国界共鸣标准）',
            basisDescription: 'Promotes culturally unbiased, non-preachy, authentic product origin narration to foster global community-building without friction.',
            basisDescriptionZh: '国际商会广告守则极力要求出海营销去说教化、去地缘偏激化，主张以纯粹的造物之美、匠心之重来构筑跨国友谊，减少客观碰撞。'
          }
        ]
      },
      evaluation_score: {
        overall: 4.8,
        scores: [
          { key: 'culture_fit', labelZh: '文化适配度', labelEn: 'Culture Fit', score: 4.9, feedbackZh: '成功将宏大的非遗重塑为海外网民偏爱的“Independent Maker 心流时分”和“手作温情传递”，适配度极高。', feedbackEn: 'Expertly converted heavy heritage into individual "Independent Maker Flow" and "Heart-crafted family love", yielding gold marks.' },
          { key: 'brand_consistency', labelZh: '品牌一致性', labelEn: 'Brand Consistency', score: 4.8, feedbackZh: '阿琪静谧专注的个人腔调、中式丝绸和庭院光影在双语版本和场景中贯彻得天衣无缝，IP质感牢靠。', feedbackEn: 'The quiet focused vlogger persona, linen aesthetics, and peaceful garden layouts are beautifully protected across all regions.' },
          { key: 'originality', labelZh: '原创度', labelEn: 'Originality', score: 4.7, feedbackZh: '茉莉香膏蜂蜡凝固、丝线穿针等微距分镜设计极具触觉美感，在主流短视频流中有强烈差异化。', feedbackEn: 'Wax solidification and needle macro frames create unparalleled tactile beauty, outstanding in the current fast feeds.' },
          { key: 'music_usability', labelZh: '音乐可用性', labelEn: 'Music Usability', score: 4.6, feedbackZh: '给出了带有雨打芭蕉、风铃、木吉他拨弦、手碟的极具触觉画面音感，配乐方向高度明确可行。', feedbackEn: 'High usability audio prompts incorporating hang drum, wind chimes, rain and nylon guitars. Ready for AI music generation.' },
          { key: 'video_feasibility', labelZh: '视频可行性', labelEn: 'Video Feasibility', score: 4.9, feedbackZh: '均是博主个人利用微单/手机、三脚架和自然光即可在家庭庭院/工作室中拍摄的治愈片段，制作成本极低，极具敏捷性。', feedbackEn: 'Ultra-high feasibility. Highly agile and captures raw authenticity using personal DSLRs and natural light inside any home studio.' },
          { key: 'hook_strength', labelZh: 'Hook 纯境吸睛力', labelEn: 'Hook Strength', score: 4.7, feedbackZh: '“手指轻捏铜杵，在石钵中极具律动地捣烂雪白茉莉”之物理微距与雨声白噪音在首2秒具有毒性留人率。', feedbackEn: 'Hands crushing white jasmine in macro stone mortar has insane retention rates, establishing instant sensory anchors.' },
          { key: 'platform_fit', labelZh: '平台适配度', labelEn: 'Platform Fit', score: 4.8, feedbackZh: '#Craftok 标签直切圈层，9:16 安全留白、高停留的 ASMR 极为契合社交推荐算法。', feedbackEn: '#Craftok niche alignment is flawless. Pure ASMR video loops keep screen time high, pleasing platform algorithms.' },
          { key: 'safety', labelZh: '法律合规及文化安全', labelEn: 'Safety', score: 4.9, feedbackZh: '规避了所有的非法药理宣誓。FTC代言守则声明充分，视觉不染怪力乱神，堪称博主出海安全模范。', feedbackEn: '100% immune to FDA medical claim audits. High level of safety with clean, comforting local community guidelines.' },
          { key: 'viral_potential', labelZh: '自发裂变传播力', labelEn: 'Viral Potential', score: 4.8, feedbackZh: '治愈系手工艺 Vlog 在海外正处于极高红利期。拉美“Amor Hecho a Mano”的情感线和北美的正念自愈极易引发用户在评论区温情分享故事。', feedbackEn: 'Handmade cozy vlogs are highly shareable. The LATAM family devotion line and NA self-care anchors guarantee organic UGC reposts.' }
        ]
      }
    },
    logs: [
      { timestamp: '14:20:01', agent: 'OrchestratorAgent', event: 'Brief Loaded', message: '解析阿琪是我个人 IP 资产数据。设定元约束：手工、女性博主、慢生活心流。识别到为【个人 IP】类型。', type: 'info' },
      { timestamp: '14:20:03', agent: 'OrchestratorAgent', event: 'Anchors Set', message: '锁定 Context Anchor: 保护手作温暖与治愈微距；刚性熔断意识形态政治说教，严禁涉及护肤抗敏抗衰等 FDA/FTC 药理宣称。', type: 'success' },
      { timestamp: '14:20:05', agent: 'MarketResearchAgent', event: 'Platform Audited', message: '检索 TikTok #Craftok 与 Etsy。识别到高价值流量洼地。个人IP须强化 FTC Endorsement Guides 利益披露规范（#owned/sponsored）。', type: 'info' },
      { timestamp: '14:20:08', agent: 'CultureAdapterAgent', event: 'Translating Core', message: '运用文化维度推导。北美高 IDV 适配为“Independent Maker（自主造物仪式）”；拉美高 UAI 与低 IDV 适配为“Amor Hecho a Mano（手作之爱与世代温情）”。', type: 'info' },
      { timestamp: '14:20:11', agent: 'ContentStrategistAgent', event: 'Pillars Anchored', message: '制定三大创意支柱：“指尖心流 ASMR”、“5分钟舒压呼吸仪式”、“手作博主自然生活 Vlog 日记”。', type: 'success' },
      { timestamp: '14:20:13', agent: 'CopyAgent', event: 'Pack Drafted', message: '生成 TikTok 慢美学贴片、IG 心情文案、BPM 配乐提示词与微距 Vlogger 分剪脚本，融入个人代言规范（#CozyMaker）。', type: 'info' },
      { timestamp: '14:20:15', agent: 'ComplianceAgent', event: 'Adversarial Audit', message: '合规网拦截红线中... ⚠️ 警告：初版草稿宣称茉莉花精具有“治愈湿疹、神奇退红脱敏”等药妆级疗效，触犯 FDA 限制。', type: 'warning' },
      { timestamp: '14:20:16', agent: 'System', event: 'Redux Loop Triggered', message: '⚠️ ComplianceAgent 阻断发布！指令回退至 CopyAgent：强制擦除药用疗效字词，修改为“香氛嗅觉放松与脉搏点舒压”。', type: 'error' },
      { timestamp: '14:20:18', agent: 'CopyAgent', event: 'Pack Regenerated', message: '文案重塑完毕。剔除任何生理治疗和抗敏等药妆声称，柔化为“感官安全屋(sensory sanctuary)”和“嗅觉小憩”。重新送审。', type: 'success' },
      { timestamp: '14:20:19', agent: 'ComplianceAgent', event: 'Audit Pass', message: '复审通过！违法美白抗敏词已 100% 抹净，代言透明度合规。发布判定：Pass。', type: 'success' },
      { timestamp: '14:20:21', agent: 'EvaluatorAgent', event: 'Evaluation Complete', message: '由于完美规避政治偏向及 FDA 药物理化宣称，安全合规分高居 4.9 分。手工艺 ASMR 的前屏停留力打出 4.8 高评。CulturePack 制作完成，发往出海自媒体前线！', type: 'success' }
    ]
  }
};
