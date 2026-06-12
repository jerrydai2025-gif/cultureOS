export const prdMarkdown = `# 💼 CultureOS 产品需求文档 (PRD)

## 1. 产品概述与愿景
CultureOS 是一个**面向文化出海这一垂直细分场景的 AI Agent 多角色协同工作流系统**。
它旨在帮助自媒体出海团队、跨境电商DTC品牌、跨文化IP公司，将国内优秀的产品IP / 品牌资产，以极其契合当地核心情感与文化禁忌的形式（而非生硬的直译），转化为目标市场的短视频行销创意交付包（称之为 **CulturePack**）。

### 1.1 核心价值主张
> **文化适配 ≠ 语言翻译。** 
> 传统的本地化停留在文本层面的语言“换皮”，而 CultureOS 致力于实现情绪核在当地社会维度的“重新映射”。
> 让东方文化微光在不同的大洋彼岸，生发出具有本土情绪共振的传播声浪。

---

## 2. 用户痛点分析
1. **情感及意义错位**：国内的疗愈或好运意象在大众媒体上直译出海，容易被北美法务误读为 "spiritual healing claim"（违反广告合规风险），或在拉美引发宗教冲突。
2. **人工本地化服务高昂且低效**：寻找外籍顾问与本土MCN一轮评审通常需要 2 至 4 周。
3. **安全合规监控不力**：出海敏感政策、特定种族歧视红线密集，人工审查覆盖度往往不足 40%。
4. **生成式 AI 的“语义漂移”**：使用单一 Prompt 连续生成容易逐渐丢失核心 Brief 约束。

---

## 3. 核心功能规范 (MVP)

### 3.1 7-Agent 协作管线设计
系统通过定义明确的角色分工，串联形成单次运行流：
1. **OrchestratorAgent (编排器)**：解析用户 Campaign Brief，提取首要及负面元数据锚点 (**Context Anchor**)。
2. **MarketResearchAgent (调研专家)**：检索并编译目标市场的平台热点、竞争对手趋势。
3. **CultureAdapterAgent (文化映射核)**：进行基于霍夫斯泰德文化六维度（Hofstede Metrics）和知识库（KB）禁忌语意审查的三层情绪映射。
4. **ContentStrategistAgent (内容制片)**：根据适配结论编写短视频故事轴、A/B测试方向。
5. **CopyAgent (文案及分镜)**：生成具体双语 TikTok Captions、Lyrics Hooks 音乐提示词与视觉提示图本。
6. **ComplianceAgent (安全审查)**：对文本及构图主脑开展对抗性安全过滤（Pass / Revise / Block）。**若触犯 Block 红线（如宗教误指或疾病治疗保证），则强制触发局部工作流回退（Fallback）至内容层重新修改。**
7. **EvaluatorAgent (质量评价器)**：按照 9 维自媒体传播力学打分（1-5分制），生成推荐策略。

### 3.2 刚性约束元数据锚定机制 (Context Anchor)
为了防御 7-Agent 单向链路中的信息衰减：
- Orchestrator 锁闭 \`Must-Have\`（必须传递和保留的品牌基因）与 \`Must-Not\`（绝对断言禁用的意象）。
- 强制拼接到中间代理的临时上下文顶端。
- 保证 ComplianceAgent 以此为标尺进行靶向对抗审计。

---

## 4. 业务用例与部署上线计划
- **业务场景**：文化 IP 进军北美/拉美市场、国货美妆出海定制短视频创意、DTC出海品牌TikTok爆款素材策划。
- **部署规格**：本地 Docker化 + Cloud Run 容器部署，支持 RAG 离线检索。无任何明文 API Key 泄漏风险。
`;

export const designMarkdown = `# 📐 CultureOS 系统架构设计文件 (DESIGN)

## 1. 系统拓扑图与运行机制
CultureOS 建立在“以数据血缘为核心，以刚性锚点为盾牌”的架构哲学之上。

\`\`\`
[Campaign Brief JSON]
       │
       ▼
┌────────────────────────┐
│  OrchestratorAgent     │ ──► 提取 [Context Anchor] (Must-Have & Must-Not)
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  MarketResearchAgent   │ ──► 输出目标市场热点与微小趋势洞察
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  CultureAdapterAgent   │ ──► RAG知识库检索 + 三层意象映射法则
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  ContentStrategistAgent│ ──◄─┐ (高强度违规时回退回炉重造)
└──────────┬─────────────┘     │
           │                   │
           ▼                   │ [Block Fallback Loop]
┌────────────────────────┐     │
│  CopyAgent / Visual    │     │
└──────────┬─────────────┘     │
           │                   │
           ▼                   │
┌────────────────────────┐     │
│  ComplianceAgent       │ ────┘ (判定：Pass / Revise / Block)
└──────────┬─────────────┘
           │
           ├─► [Pass / Revise]
           ▼
┌────────────────────────┐
│  EvaluatorAgent        │ ──► 9 维指标评估 (1-5 整数分值)
└──────────┬─────────────┘
           │
           ▼
[Traceable CulturePack Markdown + JSON]
\`\`\`

---

## 2. 数据库表架构定义 (SQLite Schema)
为保证工作流的可审计性与本地化知识库热插拔，采用 SQLite 规范定义持久化结构：

### 2.1 runs (工作流主运行表)
- \`id\`: TEXT, 复合唯一主键 \`YYYYMMDD-HHMMSS-slug\`
- \`status\`: TEXT, 当前态 \`running | completed | needs_review | failed\`
- \`started_at\`: TEXT, ISO 8601 时间戳
- \`completed_at\`: TEXT, 终结时间戳

### 2.2 agent_runs (代理子节点行为记录)
- \`id\`: TEXT, 主键 \`agent_run_xxxx\`
- \`run_id\`: TEXT, 级联外键
- \`agent_name\`: TEXT, 执行节点 (如 \`CultureAdapterAgent\`)
- \`input_json\`: TEXT, 送审或送算上下文
- \`output_json\`: TEXT, 生成的结构化产物
- \`status\`: TEXT, 校验状态
- \`latency_ms\`: INTEGER, 单代理耗时

### 2.3 knowledge_chunks (RAG本地知识管理)
- \`id\`: TEXT, 主键
- \`tags_json\`: TEXT, 分类标签 (\`"safety", "blacklist", "hofstede"\`)
- \`region\`: TEXT, 用于多市场并发检索时的“隔离命名空间” (\`"North America" | "Latin America"\`)
- \`content\`: TEXT, 全文库

---

## 3. 防幻觉与语义衰减实现
在长期串行代理管线中，单纯增加 Context 极易引发 LLM “Near-Loss” 注意力涣散。我们通过 **刚性元数据拦截（Context Anchor Injection）** 实现。所有后继的 Agent 在其输入报文头部，均被强行预处理注入：
\`\`\`
=================== ANCHOR BOUNDARIES (FORCE ENFORCED) ===================
[MUST-HAVE]: Keep gentle companionship; preserve glowing antler imagery.
[MUST-NOT]: Absolute zero healing claims; never utilize Catholic halo representations.
==========================================================================
\`\`\`
这一拦截是在代码逻辑层纯硬编码实现的，有效阻止了长文本传递带来的指令飘逸现象。
`;

export const adapterMarkdown = `# 🧠 CultureAdapter 三层文化转译算法逻辑

很多本地化工具仅仅是“高级翻译（Advanced Translation）”。
**CultureOS** 的核心差异化优势，在于其 **CultureAdapterAgent** 所承载的三层文化映射算法。

---

## 1. 第一层：基于霍夫斯泰德维度（Hofstede Metrics）的边界约束
系统建立了多国文化维度先验矩阵库。不同的文化雷达指标直接转换为生成约束。

| Hofstede 维度 | 源市场（如东亚） | 目标 A（北美） | 目标 B（拉美） | 转译决策引擎输出 |
| :--- | :--- | :--- | :--- | :--- |
| **个人主义 (IDV)** | **低 (20-30)** | **高 (91)** | **中 (30-40)** | 北美：推崇自我关怀 (*Self-Kindness / Alone Time*)；拉美：推崇人系温度 (*Community / Companionship*)。 |
| **权力距离 (PDI)** | **高 (80)** | **低 (40)** | **高 (70)** | 拒绝“俯视/训导/赐下”的好运叙事，北美转换为平视的朋友，拉美转换为温馨的祝福。 |
| **不确定性规避 (UAI)**| **中高 (30-60)**| **低 (46)** | **高 (82)** | 拉美地区需要极为强烈的传统温和安全感，不允许任何极端的实验性讽刺画面。 |

---

## 2. 第二层：Region 区块化 RAG 检索禁忌库
如果只是使用先验模型，生成仍可能干瘪。第二层映射通过检索大区独立隔离知识库（Region-Isolated KB）来实现。
- 检索时强加入 \`region\` tag 进行物理隔离，防止拉美资料污染北美内容上下文。
- 在本地数据库中自动拉去黑词、当地网络高敏感禁忌（如在北美：\`"Spiritual Healing Claim"\`, \`"Miracle Guarantee"\`；在拉美：\`"Catholic Visual Violation"\`）。

---

## 3. 第三层：原子级情绪核（Emotional Kernel）映射
这是一种**情感解耦与等效重构**算法：

\`\`\`
[源 IP 角色：一鹿繁花]
       │
   (情感解耦)
       ▼
原子情绪核：【日常陪伴、守护、轻柔祝福、下班治愈】
       │
   (结合第一层维度与第二层禁忌)
       ├─────────────────────────────────┐
       ▼ (北美重构路径)                  ▼ (拉美重构路径)
目标文化意象：安静舒缓自我重塑              目标文化意象：热情和缓同行温厚
- 场景：城市公寓、lo-fi书桌、细雨           - 场景：社区街角、黄昏余晖、木吉他
- 情绪：温柔善待遗忘了对自我温柔的个体    - 情绪：你非形单影只，好运正踱步随你
\`\`\`

通过这一层层映射，原始的“一鹿繁花”脱胎换骨。在保留 IP 视觉共性的同时，完美无缝地切入海外白领的午夜心灵盲区，在不触发宗教偏见和违规担保的前提下，高转化率拉爆流量。
`;

export const evalMarkdown = `# 📈 Evaluator 9 维评估与对抗式合规审查标准

## 1. 对抗式合规审查逻辑 (Compliance Matrix)
**ComplianceAgent** 扮演对抗性红队审计角色，并不是一个只给“风险警告高/中/低”的花瓶。它是工作流运行状态（\`status\`）的守门人。

### 1.1 风险监控的 5 大物理维度
1. **Healing Claims (疗愈疗效担保)**：在海外严格禁止在玩具/非医用品类出现类似“能够净化情绪焦虑、解决抑郁情绪”的声明。
2. **Religious Misuse (宗教等号污染)**：如金色光圈与鹿角的重合极易引发天主教圣人像的圣神误读，在部分国家甚至有被判定为亵渎的风险。
3. **Cultural Stereotype (刻板偏见)**：拒绝把拉美简化为只知道唱歌跳舞的热情桑巴，拒绝将北美简化为孤独而神圣的荒原。
4. **Brand Inconsistency (品牌偏差)**：检查文案故事包是否偏离了母案原始的“温柔陪伴”情感基调。
5. **Platform Risk (平台审查约束)**：针对不同端（TikTok、Shorts、IG Reels）的敏感字和社区规定进行专项筛查。

### 1.2 回退执行回路机制 (Recurrent Redo Loop)
- ComplianceAgent 一旦评出 **"Block"** 判定。
- 工作流引擎会强行拦截后续的 Evaluator 组装。
- **自动将冲突报告反向喂回 ContentStrategistAgent。**
- 附带回炉反馈指令，例如：\`"Risk Alert: Instagram Lyrics contain healing guarantee on line 3. Rewrite to soften tone."\`
- 自动迭代重生成。重置重试配额（最大 3 轮），第 3 轮如仍存在刚性阻碍，则正式停机，挂载 \`needs_review\` 水印报备。

---

## 2. Evaluator 9 维精细传播度评分机制
由 EvaluatorAgent 提供多维 1 至 5 分制的结构化矩阵评估（禁用 100 分制非标分数值）：

| 考核坐标 (Coordinates) | 1分 (极差) | 3分 (合格) | 5分 (极佳) |
| :--- | :--- | :--- | :--- |
| **Culture Fit (适配契合度)**| 直译痕迹极其刺耳 | 意思传达对位，但无惊艳感 | 融入海外网民文化习惯语 |
| **Brand Consistency** | 品牌内核崩塌，情绪魔改 | 核心温柔陪伴感保留完整 | 完美地融合了 IP 情感与当地语汇 |
| **Originality (创意原创性)**| 套用无趣而冰冷的模版 | 具备小趣味，平平无奇 | 具备独特的故事反差张力 |
| **Music Usability** | 提示词无法让 AI 生成配乐 | 包含节奏感和大众流派命名 | 包含准确乐器、声场、BPM控制词 |
| **Video Feasibility** | 视觉画面极其紊乱、超限 | 短视频切片制作低成本可行 | 完美的可分镜脚本与明确视觉词 |
| **Hook Strength (首屏吸引力)**| 废话连篇，首 3s 缺少引角 | 有基础情绪锚点吸引 | 极高情绪共鸣的黄金首秒极速吸睛 |
| **Platform Fit (平台适配度)**| 违反字数或无Tag设置 | 字数合规，包含可用标签组 | 附带对应平台的裂变引导话术 |
| **Safety (文化安全合规性)** | 刚性触犯宗教、疗效负面 | 通过基础黑词，无严重踩线 | 实证极其安全、避开所有潜在争端 |
| **Viral Potential (传播潜力)** | 纯说教，用户留存极差 | 具备互动点，常规表现 | 极易引发 UGC 模仿、翻唱或共创 |

每一项评分必须包含中英文对应细微反馈，引导开发、文案与设计团队在出海战线各就各位。
`;
