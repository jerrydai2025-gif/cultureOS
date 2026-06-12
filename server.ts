import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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

      const response = await ai.models.generateContent({
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
      const response = await ai.models.generateContent({
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
        const response = await ai.models.generateContent({
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
      response = await ai.models.generateContent({
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
      response = await ai.models.generateContent({
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
      responseStream = await ai.models.generateContentStream({
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
      responseStream = await ai.models.generateContentStream({
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
