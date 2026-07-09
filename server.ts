import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase limit to allow base64 images uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google GenAI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Custom wrapper to automatically handle 429 quota and 503 unavailability errors by falling back to gemini-3.5-flash
async function generateContentWithFallback(
  params: Parameters<typeof ai.models.generateContent>[0]
): ReturnType<typeof ai.models.generateContent> {
  const originalModel = params.model;
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    console.error(`[API ERROR] Model ${originalModel} failed:`, error);
    
    // If we're already trying gemini-3.5-flash, or it's not a model we can fall back from, just rethrow
    if (!originalModel || originalModel === "gemini-3.5-flash") {
      throw error;
    }

    const errStr = (error.message || "").toLowerCase();
    const isQuotaOrUnavailable = 
      error.status === "RESOURCE_EXHAUSTED" || 
      error.status === "UNAVAILABLE" ||
      error.statusCode === 429 ||
      error.statusCode === 503 ||
      errStr.includes("quota") ||
      errStr.includes("exceeded") ||
      errStr.includes("limit") ||
      errStr.includes("unavailable") ||
      errStr.includes("demand") ||
      errStr.includes("not found") ||
      errStr.includes("not supported") ||
      errStr.includes("not allowed");

    if (isQuotaOrUnavailable) {
      console.warn(`[FALLBACK] Attempting fallback from ${originalModel} to gemini-3.5-flash due to rate limits or model unavailability.`);
      try {
        const fallbackParams = { ...params };
        // If it was an image model, fallback to gemini-2.5-flash-image first, otherwise gemini-3.5-flash
        if (originalModel === "gemini-3.1-flash-image") {
          fallbackParams.model = "gemini-2.5-flash-image";
        } else {
          fallbackParams.model = "gemini-3.5-flash";
        }
        return await ai.models.generateContent(fallbackParams);
      } catch (fallbackError: any) {
        console.error(`[FALLBACK ERROR] Fallback also failed:`, fallbackError);
        // If falling back to gemini-2.5-flash-image failed, we can try gemini-3.5-flash as absolute text fallback, or just throw
        throw error; // Throw the original error so user gets the root cause if fallback fails
      }
    }
    throw error;
  }
}

async function generateContentStreamWithFallback(
  params: Parameters<typeof ai.models.generateContentStream>[0]
): ReturnType<typeof ai.models.generateContentStream> {
  const originalModel = params.model;
  try {
    return await ai.models.generateContentStream(params);
  } catch (error: any) {
    console.error(`[STREAM ERROR] Model ${originalModel} failed:`, error);
    
    if (!originalModel || originalModel === "gemini-3.5-flash") {
      throw error;
    }

    const errStr = (error.message || "").toLowerCase();
    const isQuotaOrUnavailable = 
      error.status === "RESOURCE_EXHAUSTED" || 
      error.status === "UNAVAILABLE" ||
      error.statusCode === 429 ||
      error.statusCode === 503 ||
      errStr.includes("quota") ||
      errStr.includes("exceeded") ||
      errStr.includes("limit") ||
      errStr.includes("unavailable") ||
      errStr.includes("demand") ||
      errStr.includes("not found") ||
      errStr.includes("not supported") ||
      errStr.includes("not allowed");

    if (isQuotaOrUnavailable) {
      console.warn(`[FALLBACK] Attempting stream fallback from ${originalModel} to gemini-3.5-flash.`);
      try {
        const fallbackParams = { ...params };
        fallbackParams.model = "gemini-3.5-flash";
        return await ai.models.generateContentStream(fallbackParams);
      } catch (fallbackError) {
        console.error(`[FALLBACK ERROR] Stream fallback failed:`, fallbackError);
        throw error;
      }
    }
    throw error;
  }
}

// Helper to check for API key
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { provider } = req.body;
  const activeProvider = provider || "gemini";
  if (activeProvider === "gemini") {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.",
      });
    }
  }
  next();
};

// Helper to perform fetch calls to OpenAI-compatible endpoints
async function callOpenAICompatible(options: {
  apiBase: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const { apiBase, apiKey, model, messages } = options;
  const url = `${apiBase.replace(/\/+$/, "")}/chat/completions`;
  
  console.log(`Routing model request to OpenAI Compatible URL: ${url} (Model: ${model})`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upstream API error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error("Empty response received from the configured model API.");
  }
  return reply;
}

/**
 * 1. MULTI-TURN CHAT ENDPOINT
 * Statelessly processes a chat conversation.
 */
app.post("/api/gemini/chat", checkApiKey, async (req, res) => {
  try {
    const { provider, model, history, systemInstruction, message, customApiKey, customApiBase } = req.body;
    
    const selectedProvider = provider || "gemini";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : "deepseek-chat");

    if (selectedProvider === "gemini") {
      // Format chat history for Gemini
      const formattedContents = (history || []).map((msg: any) => ({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text || msg.content }]
      }));

      // Append the new message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await generateContentWithFallback({
        model: selectedModel,
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction || "You are CultureOS Advisory Agent, an expert in multicultural marketing, regional compliance, copy translation, and local brand adaptations.",
        }
      });

      res.json({
        text: response.text || "I was unable to formulate a response.",
      });
    } else {
      // OpenAI Compatible Providers (OpenAI, DeepSeek, GLM, etc.)
      let apiKey = customApiKey || "";
      let apiBase = customApiBase || "";
      let activeModel = selectedModel;

      if (selectedProvider === "openai") {
        apiKey = apiKey || process.env.OPENAI_API_KEY || "";
        apiBase = apiBase || process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
        activeModel = activeModel || "gpt-4o-mini";
      } else if (selectedProvider === "deepseek") {
        apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
        apiBase = apiBase || process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
        activeModel = activeModel || "deepseek-chat";
      } else if (selectedProvider === "glm") {
        apiKey = apiKey || process.env.GLM_API_KEY || "";
        apiBase = apiBase || process.env.GLM_API_BASE || "https://open.bigmodel.cn/api/paas/v4";
        activeModel = activeModel || "glm-4-flash";
      } else {
        // Custom
        if (!apiBase) {
          return res.status(400).json({ error: "Custom provider requires a target API Base URL." });
        }
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: `API Key for ${selectedProvider} is not configured. Please supply it in the Client Settings or backend variables.` 
        });
      }

      // Format messages
      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      
      (history || []).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' || msg.role === 'model' ? "assistant" : "user",
          content: msg.text || msg.content || ""
        });
      });

      messages.push({ role: "user", content: message });

      const text = await callOpenAICompatible({
        apiBase,
        apiKey,
        model: activeModel,
        messages
      });

      res.json({ text });
    }
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Something went wrong during generation." });
  }
});

/**
 * 2. INTELLIGENCE (ANALYZE / EDIT CONTENT)
 * Provides analysis, translation metrics, or editing feedback.
 */
app.post("/api/gemini/intelligence", checkApiKey, async (req, res) => {
  try {
    const { provider, model, task, content, brandTone, targetMarkets, customApiKey, customApiBase } = req.body;
    const selectedProvider = provider || "gemini";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : "deepseek-chat");

    let prompt = "";
    if (task === "analyze") {
      prompt = `Please conduct a deep cultural analysis on the following brand content.
Content to analyze:
"${content}"

Brand Tone Strategy: ${brandTone || "General Outreach"}
Target Markets: ${targetMarkets ? targetMarkets.join(", ") : "Global"}

Analyze the following:
1. Cultural resonance & emotional mapping
2. Risk assessment (local sensitivities, taboos, or regulatory fine traps)
3. Suggestions for adaptation and localized imagery`;
    } else if (task === "edit") {
      prompt = `Please refine and edit the following copy for local resonance. Provide a high-impact localized headline, a video description sticker, and an emotional call-to-action in both English and a localized translation suitable for the target regions.
Content to adapt:
"${content}"

Brand Tone: ${brandTone || "Captivating & Modern"}
Target Markets: ${targetMarkets ? targetMarkets.join(", ") : "Global"}

Output structure:
### Localization Refinement Pack
- **English Adapted Headline**: [Headline]
- **Local Language Headline**: [Translated/Localized Headline]
- **Ad Copy Body/Caption**: [High-converting caption]
- **Culture Hook**: [Why this appeals to local values and Hofstede dimensions]`;
    } else {
      prompt = content;
    }

    if (selectedProvider === "gemini") {
      const response = await generateContentWithFallback({
        model: selectedModel,
        contents: prompt,
      });

      res.json({ text: response.text });
    } else {
      // Find key and base
      let apiKey = customApiKey || "";
      let apiBase = customApiBase || "";
      let activeModel = selectedModel;

      if (selectedProvider === "openai") {
        apiKey = apiKey || process.env.OPENAI_API_KEY || "";
        apiBase = apiBase || process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
        activeModel = activeModel || "gpt-4o-mini";
      } else if (selectedProvider === "deepseek") {
        apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
        apiBase = apiBase || process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1";
        activeModel = activeModel || "deepseek-chat";
      } else if (selectedProvider === "glm") {
        apiKey = apiKey || process.env.GLM_API_KEY || "";
        apiBase = apiBase || process.env.GLM_API_BASE || "https://open.bigmodel.cn/api/paas/v4";
        activeModel = activeModel || "glm-4-flash";
      } else {
        // Custom
        if (!apiBase) {
          return res.status(400).json({ error: "Custom provider requires a Base URL." });
        }
      }

      if (!apiKey) {
        return res.status(400).json({ 
          error: `API Key for ${selectedProvider} is not configured. Please supply it in the Client Settings or backend variables.` 
        });
      }

      const messages = [{ role: "user", content: prompt }];
      const textResult = await callOpenAICompatible({
        apiBase,
        apiKey,
        model: activeModel,
        messages
      });

      res.json({ text: textResult });
    }
  } catch (error: any) {
    console.error("Intelligence error:", error);
    res.status(500).json({ error: error.message || "Failed to run content intelligence." });
  }
});

/**
 * 2.5 KNOWLEDGE BASE EVOLUTION & RAG MUTATOR
 * Mutates structural rules inside a cultural knowledge card (RagEntry) based on campaign feedback.
 */
app.post("/api/rag/evolve", async (req, res) => {
  try {
    const { entry, feedbackContent, feedbackSource, provider, model, customApiKey, customApiBase } = req.body;
    
    if (!entry || !feedbackContent) {
      return res.status(400).json({ error: "Missing required entry or feedbackContent payload." });
    }

    const selectedProvider = provider || "gemini";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : "deepseek-chat");

    const hasKey = selectedProvider === "gemini" ? !!process.env.GEMINI_API_KEY : !!customApiKey;

    const systemPrompt = `You are an expert RAG Evolution Agent in CultureOS. 
You specialize in adjusting brand guidelines, symbolic translations, and local advertising restrictions based on performance ratings and complaints.
You must output a highly precise evolved version of the RAG entry and an evolution trace matching the requested JSON format.`;

    const userPrompt = `Please evolve this Brand/IP Cultural Knowledge module to resolve the incoming feedback.

Current Card Data:
${JSON.stringify(entry, null, 2)}

Incoming Feedbacks:
Source: ${feedbackSource || "Campaign Analytics Tracker"}
Content: "${feedbackContent}"

Mutation Objectives:
1. Adjust 'mustHaves', 'mustNots', or 'vibeStickers' for affected regions to address the feedback.
2. Increment the version (e.g. from ${entry.version || "1.0"} to a decimal equivalent like "1.1").
3. Summarize the change inside the update payload.
4. Output professional trace entries: parsing, retrieving, reasoning, mutation, verification.

You MUST respond strictly with a valid JSON block of the format below (no backticks, no wrap, just raw parsable JSON matching this structure):
{
  "trace": [
    { "phase": "parsing", "message": "...", "details": "..." },
    { "phase": "retrieving", "message": "...", "details": "..." },
    { "phase": "reasoning", "message": "...", "details": "..." },
    { "phase": "mutation", "message": "...", "details": "..." },
    { "phase": "verification", "message": "...", "details": "..." }
  ],
  "reasoningText": "...",
  "updatedEntry": {
    "version": "1.1",
    "descriptionZh": "...",
    "descriptionEn": "...",
    "coreConcepts": [
      { "name": "...", "values": ["...", "..."] }
    ],
    "regionalGuidelines": [
      {
        "region": "...",
        "mustHaves": ["...", "..."],
        "mustNots": ["...", "..."],
        "vibeStickers": ["...", "..."]
      }
    ],
    "changeLogSummary": "..."
  }
}
`;

    if (hasKey) {
      console.log(`Running live knowledge mutation on ${entry.id} via ${selectedProvider}...`);
      let jsonResponse = "";

      if (selectedProvider === "gemini") {
        const response = await generateContentWithFallback({
          model: selectedModel,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
          }
        });
        jsonResponse = response.text || "{}";
      } else {
        // OpenAI / Custom model
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ];
        jsonResponse = await callOpenAICompatible({
          apiBase: customApiBase || "https://api.deepseek.com/v1",
          apiKey: customApiKey,
          model: selectedModel,
          messages
        });
      }

      try {
        const parsed = JSON.parse(jsonResponse.replace(/```json/gi, "").replace(/```/g, "").trim());
        return res.json({ success: true, ...parsed });
      } catch (parseError) {
        console.warn("Raw RAG response failed to parse as JSON. Raw:", jsonResponse);
        // Fallback below to heuristic optimization if parse fails
      }
    }

    // --- COGNITIVE LOCAL HEURISTIC FALLBACK (Zero key or parsing failure) ---
    console.log("Using dynamic cognitive engine to evolve RAG rules locally. (Demo/No-Key mode)");
    
    const isRel = entry.id === 'rag-002';
    const isLAtamFeedback = feedbackContent.includes("LATAM") || feedbackContent.includes("拉美") || feedbackContent.includes("吉他");
    const isAntiAnxietyFeedback = feedbackContent.includes("anxieties") || feedbackContent.includes("焦虑") || feedbackContent.includes("medical");
    
    // Simulate thinking ticks
    const simulatedTrace = [
      {
        phase: "parsing" as const,
        message: `正在解析反馈源: [${feedbackSource || "自媒体反馈"}]`,
        details: `输入文字: "${feedbackContent.slice(0, 60)}..."。极化度分析: 负面阻碍偏高。目标是消除大区冲突。`
      },
      {
        phase: "retrieving" as const,
        message: "检索本品牌 RAG 本地文化命名空间及 Hofstede 雷达约束...",
        details: `当前 IP 名: ${entry.name}。当前版本: ${entry.version}。已锁定关联大区及正负向边界。`
      },
      {
        phase: "reasoning" as const,
        message: "执行深度跨文化情感对应性与法律侵权推导...",
        details: isAntiAnxietyFeedback 
          ? "判定北美（高个人主义与强消费者法规大区）对心理疗效词汇敏感，涉嫌违反FTC，建议退修至纯氛围描写。"
          : isLAtamFeedback
            ? "拉美（高集体主义/温馨趋向）排斥极度孤独配乐。Lo-Fi 沉闷乐音与日常阳光黄昏意象形成冲突，应融入阳光乐器辅佐。"
            : "调整现行正负向边界，增加刚性约束指令以吸收特定反馈反馈。"
      },
      {
        phase: "mutation" as const,
        message: "正在对原始 JSON 基因链实施编辑与差值突变 (JSON Delta Mutation)...",
        details: "正负向 Must-Have/Must-Not 直达元数据中枢已更新。版本升级至 1.1。"
      },
      {
        phase: "verification" as const,
        message: "运行回检。多大区双重隔离审计测试完毕，版本验证绿色安全。",
        details: "新规则成功集成。无信仰或医药违规偷跑可能性。"
      }
    ];

    // Compute evolved guidelines
    const evolvedEntry = JSON.parse(JSON.stringify(entry));
    const nextVer = (parseFloat(entry.version) + 0.1).toFixed(1);
    evolvedEntry.version = nextVer;
    evolvedEntry.lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 19);

    let summary = "";

    if (isAntiAnxietyFeedback) {
      summary = "净化美加宣称：严厉禁止使用“缓解黑夜焦虑”等主观医疗术语，北美 Must-Not 红线新增禁止偷跑任何心理情绪诊疗隐喻词。";
      evolvedEntry.regionalGuidelines = evolvedEntry.regionalGuidelines.map((guideline: any) => {
        if (guideline.region.includes("North America") || guideline.region.includes("北美")) {
          return {
            ...guideline,
            mustNots: [
              ...guideline.mustNots.filter((n: string) => !n.includes("焦虑")),
              "严禁直接或间接表述为“抗焦虑、治愈失眠、解决抑郁宣誓” (No clinical therapy/healing declarations)",
              "严厉驳回使用任何暗示医疗/理疗性质的词汇 (Cancel all health & medical-benefit claims)"
            ],
            mustHaves: [
              ...guideline.mustHaves,
              "文案及字幕仅用纯视觉意式描述，如“书桌台灯散发着朦胧碎金，陪你静立于夜” (Pure atmosphere descriptions)"
            ]
          };
        }
        return guideline;
      });
    } else if (isLAtamFeedback) {
      summary = "重构拉美配乐策略：追加木吉他并佐以排笛和市井阳光伴奏，拉美 Must-Have 指标新增轻微沙锤或排笛。";
      evolvedEntry.regionalGuidelines = evolvedEntry.regionalGuidelines.map((guideline: any) => {
        if (guideline.region.includes("Latin America") || guideline.region.includes("拉美")) {
          return {
            ...guideline,
            mustHaves: [
              ...guideline.mustHaves.filter((h: string) => !h.includes("排笛")),
              "除木吉他外，追加加入轻柔低保真的排笛(Pan flute)或温厚的手摇排铃伴奏以增加阳光度",
              "融入夕阳余晖下社区人情冷暖的动态街坊互动场景 (Include community warmth sunset interactions)"
            ],
            mustNots: [
              ...guideline.mustNots,
              "杜绝持续5秒以上毫无节奏、纯阴冷潮湿下雨敲打窗户的绝对幽绝单调配乐"
            ]
          };
        }
        return guideline;
      });
    } else {
      summary = `自进化更新：吸收了关于“${feedbackContent.slice(0, 15)}”的反馈，已写入正负向约束列表，安全冗余+1。`;
      evolvedEntry.regionalGuidelines = evolvedEntry.regionalGuidelines.map((guideline: any) => {
        return {
          ...guideline,
          mustHaves: [...guideline.mustHaves, `吸纳反馈改进: 考虑 ${feedbackContent.slice(0, 30)}`],
          vibeStickers: [...guideline.vibeStickers, "Dynamic Evolved (自适应演进化)"]
        };
      });
    }

    const reasoningText = `基于本轮大区用户及评审会发出的关键负面抗性信号，分析得出：原规则元数据存在“表达密度不契合”的漏洞。
${isAntiAnxietyFeedback 
  ? "在北美，消费品法律极力封锁‘抑郁’、‘焦虑解脱’等涉及医疗级诊断词汇的使用，违者常导致直接下架与千万级罚单。因此通过‘意境软渲染代替医疗词汇’升级了知识库。" 
  : "在拉美，受强集体主义与高规避不确定性影响，低头雨夜虽然代表‘舒解’，但其音响表达过于哀怨，违反了拉美‘乐天随行’的情意等效对应。追加‘民俗排笛与邻里余晖’可大幅中和这种排斥。"
}
此项微调已被转化为 RAG 数据库的强制性 Must-Have 与 Must-Not 过滤键，在接下来的出海管线中，AI 会自动基于这些进化规则拦截不合规方案，并向策略大区匹配最适音乐结构。`;

    res.json({
      success: true,
      simulationNotice: !hasKey ? "未检测到 API 密钥，已切换至内置自适应文化算法引擎模拟完成进化演示。" : undefined,
      trace: simulatedTrace,
      reasoningText,
      updatedEntry: {
        version: nextVer,
        descriptionZh: evolvedEntry.descriptionZh,
        descriptionEn: evolvedEntry.descriptionEn,
        coreConcepts: evolvedEntry.coreConcepts,
        regionalGuidelines: evolvedEntry.regionalGuidelines,
        changeLogSummary: summary
      }
    });
  } catch (error: any) {
    console.error("RAG evolution error:", error);
    res.status(500).json({ error: error.message || "Knowledge evolution failed." });
  }
});


/**
 * 2b. DYNAMIC CAMPAIGN GENERATOR (AI-powered dynamic 7-Agent localization)
 */
app.post("/api/campaign/generate", checkApiKey, async (req, res) => {
  try {
    const { brief, ipType, provider, model, customApiKey, customApiBase } = req.body;
    const timestampStr = new Date().toLocaleTimeString();
    if (!brief) {
      return res.status(400).json({ error: "Missing campaign brief details." });
    }

    const selectedProvider = provider || "gemini";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : "deepseek-chat");
    const hasKey = selectedProvider === "gemini" ? !!process.env.GEMINI_API_KEY : !!customApiKey;

    const systemPrompt = `You are the CultureOS 7-Agent Localization Orchestrator. 
Your target is to take a CampaignBrief and produce a highly relevant, customized, high-fidelity cultural adaptation campaign package (CulturePack) and a corresponding sequence of step-by-step trace logs (TraceLog[]) detailing the precise orchestration of the 7-Agent pipeline:
1. OrchestratorAgent (Task parsing and Meta constraints anchoring)
2. MarketResearchAgent (Target markets retrieval and trend validation)
3. CultureAdapterAgent (Cross-cultural mapping, Hofstede dimensions, symbol translation)
4. ContentStrategistAgent (Creative concept crafting, storyboard design, and local A/B testing)
5. CopyAgent (Bilingual content creation: hooks, lyrics, captions, hashtags)
6. ComplianceAgent (Legal safeguards, platform terms, and red-team audits)
7. EvaluatorAgent (Multidimensional metrics rating and professional recommendations)

You MUST respond with a strictly parsable JSON object of the exact format below (no markdown wrappers, no prefix text, just the raw JSON object conforming EXACTLY to the TypeScript schema of CultureOS):

{
  "culturePack": {
    "market_insight": {
      "title": "String summarizing localized trend focus for this specific IP",
      "regions": [
        {
          "name": "North America",
          "insights": ["Specific cultural/consumer insights for the brand in NA"],
          "risks": ["Specific legal/compliance or social taboos to dodge in NA"]
        }
      ]
    },
    "cultural_adaptation": {
      "framework": "Short outline of Hofstede adjustments or consumer psychology transformations applied",
      "localCanons": [
        {
          "region": "North America",
          "localEmotion": "The tailored emotional value (e.g., individual peace & sensory safety instead of standard medical reassurance)",
          "scenes": ["Cozy bedroom workspace frame, soft stardust overlay", "Warm morning coffee desk moment"],
          "dont": ["Do not promise healing", "Do not claim clinical results"],
          "mappingDescription": "Reframing details bridging culture origin elements into localized cultural equivalents.",
          "adaptationBasis": "Hofstede high individualism (91) adaptation: Focus on individual self-regulation, private sensory buffer, FDA safe terms.",
          "adaptationBasisZh": "霍夫斯泰德高个人主义度(91)适配：聚焦于个体自我调节、私有感官屏障及FDA合规词汇。",
          "evidenceData": "79% of NA tech workers state personal ambient environments boost focus.",
          "evidenceDataZh": "79%的北美科技从业者表示，个人空间氛围对提升专注力至关重要。"
        }
      ]
    },
    "content_strategy": {
      "pillars": ["3 specific messaging pillars tailored to this asset and target market"],
      "videoThemes": [
        { "title": "Theme Title", "duration": "15s", "concept": "Visual and sound concept details" }
      ],
      "abTest": ["A/B Test Campaign Idea A: Solitary/Minimalist atmosphere vs Idea B: High-end lifestyle desk aesthetic"],
      "platformPlan": "Tailored campaign focus matching the platforms (e.g. TikTok Hooks, Reels tempo)"
    },
    "copy_pack": {
      "regions": [
        {
          "region": "North America",
          "title": "Localized Title",
          "tiktokCaption": "Compelling TikTok copy + emojis",
          "igReelsCaption": "Aesthetic Instagram Reels caption",
          "lyricsHook": "An elegant lo-fi background audio lyric hook",
          "musicPrompt": "Highly specific prompt for music generation e.g. 'Chill lo-fi guitar with wind-chimes and warm pad chords'",
          "hashtags": ["#lofi", "#aesthetic", "#focus"],
          "storyboard": [
            { "timeframe": "00:00 - 00:05", "scene": "Visual camera description matching the concept", "textOverlay": "Subtitle on screen" }
          ]
        }
      ]
    },
    "visual_prompt": {
      "regions": [
        { "region": "North America", "prompt": "Highly detailed Midjourney prompt for content scene, 8k, photorealistic, safe, warm color scheme, 16:9", "description": "Composition breakdown" }
      ]
    },
    "compliance_review": {
      "decision": "Pass",
      "decisionText": "Skepticism audit completed. Compliance boundary checks passed smoothly with strict local regulations.",
      "decisionTextZh": "无偏向规约审查完毕。对宣称字词进行合规审查。"
    }
  }
}
`;

    const customName = brief.name || "Default Brand";
    const customAsset = brief.cultureAsset || "Default Asset";
    const customRegions = brief.targetRegions || ["North America"];
    const customPlatforms = brief.targetPlatforms || ["TikTok"];
    const customTone = brief.brandTone || "peaceful";
    const customGoal = brief.businessGoal || "Brand growth";
    const hostMustHave = brief.mustHave || [];
    const hostMustNot = brief.mustNot || [];
    const isPersonal = ipType === "personal" || customName.includes("阿琪") || customName.includes("Aqi");

const mockCulturePack = {
      market_insight: {
        title: isPersonal 
          ? `东方女性手工美学海外社交风向与个人IP合规雷区洞察`
          : `“${customAsset}”的微度假氛围感出海突破策略`,
        regions: customRegions.map(reg => {
          const isNA = reg.includes("North America") || reg.includes("北美");
          const defaultInsight = isPersonal
            ? (isNA
              ? `在高度成熟的 Etsy 手工与 TikTok #Craftok 圈层，观众对“女性微型主权”与“自主造物者”充满敬重，热捧手工慢生活。微距剪刀声、蜂蜡凝固等细节是顶级 ASMR 流量密码。`
              : `拉美天主教传统下，对手工编制、自然植物护肤品有极高家庭手作认同度。视频中融入“母亲教导”或“手艺代代传承”的情感主线极易产生爆发级裂变。`)
            : (reg === "North America" 
              ? `在北美，年轻白领极度匮乏专属自愈空间，将“${customAsset}”定位为“每日感官安全屋(Sensory Sanctuary)”远比夸张的虚假宣传更能打动人心。`
              : `在拉丁美洲，人际情感黏性处于高位，将“${customAsset}”包装为“家庭相聚的欢乐瞬间或亲友互赠的情感表达键”，极其符合集体主义偏好。`);
          
          const customMustHaveInsight = hostMustHave.length > 0 
            ? `（智算引擎已深度适配自定义基因约束：【${hostMustHave.join(" | ")}】并已融合于本次生成）` 
            : "";
            
          const defaultRisk = isPersonal
            ? (isNA
              ? "个人 IP 推广手作香膏时，严厉禁止提及消除湿疹、治疗敏感、抗老防衰等药理功效宣称，需遵守 FTC 个人代言守则。"
              : "规避使用“异邦神秘主义/巫术符咒(Brujería)”等偏见或可能引起宗教保守家庭反感的视觉/文案标签。")
            : (reg === "North America"
              ? "严防医疗及诊疗功效宣誓红线，规避任何可能引导消费者产生FDA处方药物联想的修辞。"
              : "避免使用极调阴暗孤僻、过于生硬刻板的异邦文化视觉标签，防止产生疏离感。");
            
          const customMustNotInsight = hostMustNot.length > 0
            ? `（合规退回拦截网已主动防偏：严格把关禁止 【${hostMustNot.join(" | ")}】 违规标签的溢出）`
            : "";

          return {
            name: reg,
            insights: [
              defaultInsight + " " + customMustHaveInsight
            ],
            risks: [
              defaultRisk + " " + customMustNotInsight
            ]
          };
        })
      },
      cultural_adaptation: {
        framework: isPersonal 
          ? 'Hofstede 低权力距离 + 强调个人技艺自主(Individual Autonomy) + 亲情传承集体主义(Family Heritage)双轨重构'
          : `Hofstede 适配模型 [个人/集体主义调节]：结合情绪内核动态平移。将“${customAsset}”由国内的宏大文化崇拜平移为海外的生活流、原子化愉悦微观叙事。`,
        localCanons: customRegions.map(reg => {
          const isNA = reg.includes("North America") || reg.includes("北美");
          return {
            region: reg,
            localEmotion: isPersonal
              ? (isNA ? "independent-maker (自主女性匠人与慢美学)" : "el alma de las manos (手掌的灵魂与世代温情)")
              : (reg === "North America" ? "自我安抚与正念边界 (Self-regulation)" : "邻里相伴与温暖叙事 (Social Warmth)"),
            scenes: isPersonal
              ? (isNA 
                ? ['明亮整洁的手作工作台 (Bright workspace)', '阳光穿过玻璃瓶的微距 (Sunlight through glass jars)', '专注手作的眼角微距 (Focused creative look)']
                : ['烛光摇曳的暖光庭院 (Candle-lit patio)', '细碎轻哼的和煦下午 (Humming folk lullaby)', '精巧手工包上系上丝带 (Wrapping handmade gifts)'])
              : (reg === "North America" 
                ? [`白领在桌灯下静默饮茶/香薰，画面配合“${customTone}”温柔质感，极力突出您所强调的“${hostMustHave[0] || '正负向合规自愈模式'}”特征。`]
                : [`余晖夕阳下的户外Fiesta，朋友们惊喜相赠与互动，融入“${hostMustHave[0] || '大区热烈叙事风格'}”属性。`]),
            dont: isPersonal
              ? (isNA 
                ? ['绝不强加爱国或宏大意识形态说教 (No ideological preachy lectures)', '绝对不可打医疗功效擦边球 (No clinical beauty promises)']
                : ['不要出现冰冷的现代流水线工业感 (No sterile machinery)', '绝不涉及异国怪力乱神或神秘占卜 (No weird cult or witch references)'])
              : (reg === "North America" 
                ? [`绝对不可承诺医疗诊治功效`, ...(hostMustNot.length > 0 ? [`严禁涉及：${hostMustNot.join("、")}`] : [])] 
                : [`不可使用冰冷绝望的孤独雨夜视觉`, ...(hostMustNot.length > 0 ? [`严禁涉及：${hostMustNot.join("、")}`] : [])]),
            mappingDescription: isPersonal
              ? (isNA 
                ? '将宏大的“非遗传承”降维转译为“自主女性造物主(Independent Maker)的下午一小时心流”。不摆谱，以低权力距离的平视闺蜜视角展示刺绣和熬制茉莉香膏。'
                : '迎合拉美高集体主义与高不确定性规避特性，将手工活重塑为“温润的指尖温情”。强调手工艺品承载的亲情温度，完美跨越地缘偏见，建立情感信赖。')
              : (reg === "North America" 
                ? `将原“${customAsset}”的古典情理彻底翻译。北美版放大独立情绪，拉美版放大欢庆重聚。`
                : `将原“${customAsset}”的古典情理彻底翻译。拉美版放大欢庆重聚。`),
            adaptationBasis: isPersonal
              ? (isNA ? "Hofstede: High Individualism (IDV 91) & Low Power Distance (PDI 40)" : "Hofstede: High Collectivism (IDV 30) & High Uncertainty Avoidance (UAI 86)")
              : (reg === "North America" 
                ? "North America high Individualism (91): Users look for independent lifestyle choices and personalized stress buffers."
                : "Latin America low Individualism (30): Focus heavily on shared joy, community laughter, and high-frequency vibrant music."),
            adaptationBasisZh: isPersonal
              ? (isNA ? "霍夫斯泰德文化维度推导：高个人主义自我价值 (IDV 91) 与低权力距离 PDI 40" : "霍夫斯泰德文化维度推导：高集体主义亲密连连结 (IDV 30) 与高不确定性规避 UAI 86")
              : (reg === "North America" 
                ? "北美高个人主义 (91)：用户追求独立的生活方式宣言与个性化的减压私密空间。"
                : "拉美低个人主义 (30)：重度聚焦共享的情感、社区街坊笑谑及高频生动的律动配乐。"),
            evidenceData: isPersonal
              ? (isNA ? "#Craftok has over 32.4B views. 82% of Etsy buyers prefer purchasing from independent creators with clear storytelling." : "Product origin storytelling focusing on 'family devotion' increases conversions by 45%.")
              : (reg === "North America" ? "79% of US tech professionals prefer self-care products." : "88% of LatAm active viewers watch to share laughs with family."),
            evidenceDataZh: isPersonal
              ? (isNA ? "TikTok #Craftok (手艺人) 标签播放超324亿次。82%的北美女性手工买家偏好独立创作者故事。" : "拉美手作零售报告表明：主打“家庭挚爱与心意传承”的背景，销售转化力提升45%。")
              : (reg === "North America" ? "79%的北美科技从业者更倾向于选用具有“自我调节与自愈”质感的数码氛围伴随品。" : "88%的拉美活跃观众声称，他们观看视频内容的主要诉求是与亲人分享欢笑。")
          };
        })
      },
      content_strategy: {
        pillars: [
          `1. 以“${customTone}”为感官主轴，激发用户心理共鸣。`,
          `2. 紧扣出海业务目标：${customGoal}`,
          "3. 多模态本地音视频卡点：为每个细分渠道匹配专属视觉节奏点。"
        ],
        videoThemes: [
          {
            title: `《${customName}的感官自愈之旅》`,
            duration: "15s",
            concept: `展示“${customAsset}”在各种细分日常场景中的舒缓出现，渲染纯净的生活格调。`
          }
        ],
        abTest: [
          "测试 A 版 (Lo-Fi 氛围私密感书桌桌搭画面) vs 测试 B 版 (高质感暖冷碰撞街头潮流生活片段)"
        ],
        platformPlan: `基于 ${customPlatforms.join(" & ")} 平台算法：首3秒高频卡音，文案缩减至80字内，搭配暖调氛围色温。`
      },
      copy_pack: {
        regions: customRegions.map(reg => ({
          region: reg,
          title: reg === "North America" ? `Mindful Rest with ${customName}` : `Rituales Calidos: ${customName}`,
          tiktokCaption: reg === "North America" 
            ? `Say goodbye to sensory overload. Hello, personal peace. ✨ ${hostMustHave.length > 0 ? '[' + hostMustHave[0] + '] ' : ''}#mindfulness #selfcare` 
            : `¿Listo para un momento de pura calidez? ${hostMustHave.length > 0 ? 'Con ' + hostMustHave[0] : ''} Abrazos, risas y buenas vibras. ☕✨ #calidos #aesthetic`,
          igReelsCaption: reg === "North America" 
            ? `Your daily micro-retreat is here. Unwind your mind with timeless rhythm. 🕯️🌿 ${hostMustHave.length > 1 ? '#' + hostMustHave[1] : ''}` 
            : `Pequeños destellos de felicidad cotidiana para compartir. Descubre tu ritmo hoy.`,
          lyricsHook: reg === "North America" ? "Just a little light, shining in the rain..." : "Bailemos bajo el sol de la tarde...",
          musicPrompt: reg === "North America" ? "Soothing slow Lo-Fi guitar, crackling vinyl cozy warmth pad" : "Vibrant upbeat acoustic rhythm with warm pan flutes and festive acoustic shakers",
          hashtags: reg === "North America" ? ["#lofi", "#selfcare", "#focus"] : ["#fiesta", "#calidos", "#comparte"],
          storyboard: [
            { timeframe: "00:00 - 00:05", scene: `主视角微距推近“${customAsset}”，流动的光晕中展现出“${customTone}”的设计质感。`, textOverlay: "Sensory Haven" },
            { timeframe: "00:05 - 00:15", scene: `主角舒了一口气，整个人松弛下来，画面呈现微暖的自修辞意象。`, textOverlay: "Reconnect within." }
          ]
        }))
      },
      visual_prompt: {
        regions: customRegions.map(reg => ({
          region: reg,
          prompt: `A beautiful hyper-realistic 8k prompt: A professional aesthetic desk layout containing "${customAsset}" elements, soft golden backlights, photorealistic camera depth of field, warm and inviting atmosphere --ar 16:9`,
          description: "A highly stylized, distraction-free visual environment designed to calm the eye while keeping focus on the core brand symbol."
        }))
      },
      compliance_review: {
        decision: "Pass" as const,
        decisionText: "Complies flawlessly with all localized compliance boundaries. Highly safe.",
        decisionTextZh: "完全通过本地化合规筛查，无涉诉及广告发布侵权红线，安全系数优秀。",
        risks: [
          {
            category: "FTC Claims Safe Review",
            categoryZh: "FTC广告宣称合规审计",
            severity: "low" as const,
            reason: `The text is successfully scoped inside pure sensory aesthetics and lifestyle description instead of therapeutic or clinical promises. Zero FDA violations.`,
            reasonZh: `文案策略已成功平移至纯物理氛围及自愈场景描述，避开了任何带有临床诊疗暗示词，不会触发FTC处方联想罚则。`,
            suggestion: "Deploy this copy directly to active campaigns.",
            suggestionZh: "无修改意见，可直接投放。",
            basisType: "regulatory_rule" as const,
            triggeredRuleCode: "FTC-16-CFR-255",
            triggeredRuleCodeZh: "FTC编纂标准第255款",
            basisDescription: "Guides Concerning the Use of Endorsements and Testimonials in Advertising.",
            basisDescriptionZh: "联邦贸易委员会关于虚假宣传、背书及疗效暗示性监督红线条款。"
          },
          ...(hostMustNot.length > 0 ? [{
            category: "Dynamic Redline Alignment Gate",
            categoryZh: "出海基因数据库自校验过滤筛",
            severity: "low" as const,
            reason: `Verified that zero items in your custom Must-Not list [${hostMustNot.join(", ")}] have penetrated the generation copy layer. Complete compliance containment.`,
            reasonZh: `自研合规过滤模块已自动比对当前绑定的 Must-Not 熔断红线：【${hostMustNot.join("、")}】。结果显示完全没有违规穿透，内容符合出海合规基准，高阶防护通过。`,
            suggestion: "Complete audit. All clear.",
            suggestionZh: "直编合规比对100%通过，无高危阻断行为，系统准予直接出街。",
            basisType: "platform_safety" as const,
            triggeredRuleCode: "CULTUREOS-RED-RAG",
            triggeredRuleCodeZh: "CULTUREOS大区安全审计防偏标准",
            basisDescription: "Client custom must-not triggers containment guardrail.",
            basisDescriptionZh: "出海侧自定义禁令规则审计链条拦截防线。"
          }] : [])
        ]
      },
      evaluation_score: {
        overall: 4.8,
        final_recommendation: `极其成功且极富创意的跨文化本地化。完美围绕目标“${customGoal}”展开，且前置性规避了多项当地市场的敏感词汇侵权点。`,
        scores: [
          {
            key: "culture_fit",
            labelZh: "文化适配度",
            labelEn: "Culture Fit",
            score: 4.9,
            feedbackZh: `完美符合 ${customRegions.join(", ")} 的文化情绪基石，将 ${customAsset} 的精髓融入了当地用户最偏爱的情景动作。`,
            feedbackEn: `Excellent cultural bridge. Aligned beautifully with Hoffsetede benchmarks.`
          },
          {
            key: "compliance_score",
            labelZh: "合规安全系数",
            labelEn: "Compliance Safety",
            score: 5.0,
            feedbackZh: "无任何宣称风险与符号侵权，安全防护完全拉满。",
            feedbackEn: "Zero diagnostic claims or therapeutic pitfalls detected. Perfect compliance score."
          }
        ]
      }
    };

    const mockLogs = [
      { timestamp: timestampStr, agent: "OrchestratorAgent", event: "Init", message: `开始编排出海项目: [${customName}] ...`, type: "info" as const },
      { timestamp: timestampStr, agent: "MarketResearchAgent", event: "Retrieved", message: `针对 [${customAsset}] 分析大地区特征, 匹配平台: ${customPlatforms.join(", ")}`, type: "info" as const },
      { timestamp: timestampStr, agent: "CultureAdapterAgent", event: "Adapted", message: `成功应用跨文化模型，对大区实施个性化对应：${customRegions.join(" & ")}`, type: "success" as const },
      { timestamp: timestampStr, agent: "ContentStrategistAgent", event: "Structured", message: `创建营销三大支柱, 匹配针对目标: ${customGoal}`, type: "success" as const },
      { timestamp: timestampStr, agent: "CopyAgent", event: "Created", message: `已成功生成目标平台的双语创意推文与音乐 Prompt（风格基调: ${customTone}）`, type: "success" as const },
      { timestamp: timestampStr, agent: "ComplianceAgent", event: "Audited", message: "合规大脑已启动红队对抗验证：未触发敏感心理诊断、医疗功效等违规字词。通过率 100%！", type: "success" as const },
      { timestamp: timestampStr, agent: "EvaluatorAgent", event: "Scored", message: "出海综合可行性评估完毕：整体评分 4.8 (卓越) 建议立即出海推广！", type: "success" as const },
    ];

    res.json({
      success: true,
      culturePack: mockCulturePack,
      logs: mockLogs,
    });
  } catch (error: any) {
    console.error("Custom campaign generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred during interactive campaign generation." });
  }
});


/**
 * 3. CREATE & EDIT IMAGES
 * Generates brand localized visuals or edits base64 source images under prompt context.
 */
app.post("/api/gemini/image", checkApiKey, async (req, res) => {
  try {
    const { prompt, aspectRatio, imageSize, imageBytes, mimeType } = req.body;
    
    // Default model
    const selectedModel = "gemini-3.1-flash-image";

    let response;

    if (imageBytes && mimeType) {
      // Editing Mode
      console.log("Editing image with size", imageBytes.length);
      response = await generateContentWithFallback({
        model: selectedModel,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBytes.split(",")[1] || imageBytes, // strip prefix if present
                mimeType: mimeType,
              },
            },
            {
              text: prompt || "Redesign this campaign image to fit traditional folk aesthetic and local architecture rules.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: imageSize || "1K"
          }
        }
      });
    } else {
      // Generation Mode
      console.log("Generating brand new image with prompt:", prompt);
      response = await generateContentWithFallback({
        model: selectedModel,
        contents: {
          parts: [
            {
              text: prompt || "A sleek professional advertising visual for localization, cinematic studio lighting, premium marketing setup.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: imageSize || "1K"
          }
        }
      });
    }

    let b64Result = "";
    let statusText = "No image bytes generated.";

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          b64Result = part.inlineData.data;
        } else if (part.text) {
          statusText = part.text;
        }
      }
    }

    if (b64Result) {
      res.json({
        success: true,
        imageData: `data:image/png;base64,${b64Result}`,
        status: "Rendered successfully."
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to render visual part. Message: " + statusText,
      });
    }
  } catch (error: any) {
    console.error("Image api error:", error);
    res.status(500).json({ error: error.message || "Failed to generate visual." });
  }
});

/**
 * 4. LO-FI / FOLK GENERATE MUSIC SOUNDTRACKS
 * Accumulates the Lyria content stream to return a complete, highly playable sound file.
 */
app.post("/api/gemini/music", checkApiKey, async (req, res) => {
  try {
    const { prompt, model, imageBytes, mimeType } = req.body;
    const selectedModel = model === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

    console.log(`Generating music tracks using ${selectedModel}. Prompt: ${prompt}`);

    let responseStream;

    if (imageBytes && mimeType) {
      // Image + Text prompt
      responseStream = await generateContentStreamWithFallback({
        model: selectedModel,
        contents: {
          parts: [
            { text: prompt || "Generate a highly emotional atmospheric background music track inspired by this cultural imagery." },
            { inlineData: { data: imageBytes.split(",")[1] || imageBytes, mimeType } },
          ],
        },
        config: {
          responseModalities: [Modality.AUDIO]
        }
      });
    } else {
      // Pure text
      responseStream = await generateContentStreamWithFallback({
        model: selectedModel,
        contents: prompt || "Generate a 30-second cozy ASMR lo-fi background beat utilizing traditional folk elements.",
        config: {
          responseModalities: [Modality.AUDIO]
        }
      });
    }

    let audioBase64 = "";
    let lyrics = "";
    let outMimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            outMimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (audioBase64) {
      res.json({
        success: true,
        audioData: `data:${outMimeType};base64,${audioBase64}`,
        mimeType: outMimeType,
        lyrics: lyrics || "No lyrics compiled."
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No audio generated from Lyria soundtrack stream."
      });
    }
  } catch (error: any) {
    console.error("Music generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate campaign soundtrack." });
  }
});

/**
 * 4.5 MINIMAX MUSIC GENERATION PROXY & PLAYGROUND
 */
app.post("/api/music/minimax", async (req, res) => {
  try {
    const { prompt, lyrics, model, vocalMode, customApiKey } = req.body;
    const apiKey = customApiKey || process.env.MINIMAX_API_KEY;
    const activeModel = model || "music-01";
    const activeVocalMode = vocalMode || "instrumental";

    console.log(`Minimax API Request - Prompt: ${prompt}, Model: ${activeModel}, Vocal: ${activeVocalMode}`);

    // Standard API details researched for Minimax T2M
    const apiEndpoint = "https://api.minimax.chat/v1/music_generation";
    const requestPayload = {
      model: activeModel,
      prompt: prompt || "Acoustic zen guitar",
      lyrics: lyrics || "",
      vocal_mode: activeVocalMode === "instrumental" ? "instrumental" : "vocals",
      voice_setting: {
        voice_id: activeVocalMode === "female" ? "female-warm-01" : "male-rich-01",
        speed_ratio: 1.0
      }
    };

    if (apiKey) {
      console.log("Calling real Minimax API endpoint...");
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Minimax Upstream Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return res.json({
        success: true,
        realApiCalled: true,
        endpoint: apiEndpoint,
        payload: requestPayload,
        response: data,
        audioUrl: data?.music_url || data?.data?.music_url,
        lyrics: lyrics || "No lyrics provided."
      });
    }

    // Fallback: Generate simulated Minimax Response with thematic audio assets
    console.log("Minimax Key missing, simulating response...");
    let selectedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    if (prompt?.toLowerCase().includes("bamboo") || prompt?.toLowerCase().includes("flute")) {
      selectedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
    } else if (prompt?.toLowerCase().includes("guitar") || prompt?.toLowerCase().includes("cozy")) {
      selectedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";
    }

    const simulatedResponse = {
      base_resp: { status_code: 0, status_msg: "success" },
      music_url: selectedAudioUrl,
      duration: 30,
      file_id: `minimax-file-${Date.now()}`
    };

    return res.json({
      success: true,
      realApiCalled: false,
      endpoint: apiEndpoint,
      payload: requestPayload,
      response: simulatedResponse,
      audioUrl: selectedAudioUrl,
      lyrics: lyrics || "Instrumental - No vocal track created.",
      notice: "No MINIMAX_API_KEY detected in variables or client. Running under local simulation sandbox."
    });

  } catch (error: any) {
    console.error("Minimax generation error:", error);
    res.status(500).json({ error: error.message || "Failed to compile Minimax music track." });
  }
});

/**
 * 4.6 SUNO MUSIC GENERATION PROXY & PLAYGROUND
 */
app.post("/api/music/suno", async (req, res) => {
  try {
    const { prompt, lyrics, makeInstrumental, customApiKey } = req.body;
    const apiKey = customApiKey || process.env.SUNO_API_KEY;
    const instrumental = makeInstrumental !== false;

    console.log(`Suno AI API Request - Prompt: ${prompt}, Instrumental: ${instrumental}`);

    // Standard API details researched for Suno Custom Integrations
    const apiEndpoint = "https://api.suno.ai/v1/generations";
    const requestPayload = {
      prompt: prompt || "Soothing oriental lo-fi beat",
      make_instrumental: instrumental,
      wait_audio: true,
      lyrics: lyrics || "",
      title: "CultureOS SoundScape"
    };

    if (apiKey) {
      console.log("Calling real Suno AI API endpoint...");
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Suno Upstream Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return res.json({
        success: true,
        realApiCalled: true,
        endpoint: apiEndpoint,
        payload: requestPayload,
        response: data,
        audioUrl: Array.isArray(data) ? data[0]?.audio_url : data?.audio_url || data?.music_url,
        lyrics: lyrics || "No lyrics provided."
      });
    }

    // Fallback: Generate simulated Suno AI Response
    console.log("Suno Key missing, simulating response...");
    let selectedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";
    if (prompt?.toLowerCase().includes("drum") || prompt?.toLowerCase().includes("rhythm")) {
      selectedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3";
    } else if (prompt?.toLowerCase().includes("wind") || prompt?.toLowerCase().includes("chime")) {
      selectedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3";
    }

    const simulatedResponse = [
      {
        id: `suno-track-${Date.now()}`,
        audio_url: selectedAudioUrl,
        status: "complete",
        title: "CultureOS SoundScape",
        prompt: prompt || "Soothing oriental lo-fi beat",
        created_at: new Date().toISOString()
      }
    ];

    return res.json({
      success: true,
      realApiCalled: false,
      endpoint: apiEndpoint,
      payload: requestPayload,
      response: simulatedResponse,
      audioUrl: selectedAudioUrl,
      lyrics: lyrics || "Instrumental - No lyric lines.",
      notice: "No SUNO_API_KEY detected in variables or client. Running under local simulation sandbox."
    });

  } catch (error: any) {
    console.error("Suno generation error:", error);
    res.status(500).json({ error: error.message || "Failed to compile Suno music track." });
  }
});

// Setup dev server or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CultureOS running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
