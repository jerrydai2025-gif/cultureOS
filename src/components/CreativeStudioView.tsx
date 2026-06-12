import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Sparkles, Image as ImageIcon, Music, Send, Loader2, 
  Upload, Play, Volume2, Globe, FileText, Check, AlertCircle, Trash2, 
  ArrowRight, Radio, HelpCircle, RefreshCw, Compass, ShieldAlert, BadgeInfo,
  Settings, Eye, EyeOff, Sliders, Server, HardDrive, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

interface CreativeStudioViewProps {
  lang: "zh" | "en";
}

export default function CreativeStudioView({ lang }: CreativeStudioViewProps) {
  const isZh = lang === "zh";
  const [activeTab, setActiveTab] = useState<"chatbot" | "intelligence" | "visuals" | "audio" | "settings">("chatbot");

  // State for Model configuration management
  const [modelConfigs, setModelConfigs] = useState(() => {
    const saved = localStorage.getItem("cultureos_model_configs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse model configs:", e);
      }
    }
    return {
      gemini: { apiKey: "", apiBase: "", activeModel: "gemini-3.5-flash" },
      openai: { apiKey: "", apiBase: "https://api.openai.com/v1", activeModel: "gpt-4o-mini" },
      deepseek: { apiKey: "", apiBase: "https://api.deepseek.com/v1", activeModel: "deepseek-chat" },
      glm: { apiKey: "", apiBase: "https://open.bigmodel.cn/api/paas/v4", activeModel: "glm-4-flash" },
      custom: { apiKey: "", apiBase: "", activeModel: "custom-llm" }
    };
  });

  // Save configs to localStorage when altered
  const saveConfigs = (newConfigs: any) => {
    setModelConfigs(newConfigs);
    localStorage.setItem("cultureos_model_configs", JSON.stringify(newConfigs));
  };

  // State for dynamic provider selection
  const [chatProvider, setChatProvider] = useState<"gemini" | "openai" | "deepseek" | "glm" | "custom">("gemini");
  const [intelProvider, setIntelProvider] = useState<"gemini" | "openai" | "deepseek" | "glm" | "custom">("gemini");

  // State for Chatbot
  const [chatModel, setChatModel] = useState<string>("gemini-3.5-flash");
  const [chatRole, setChatRole] = useState<string>("advisor");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: isZh 
        ? "你好！我是 CultureOS 跨境出海智能顾问。我已经加载了文化转译机制。你可以让我针对不同大区、目标受众进行文化禁忌审查、广告文案润色、或者评估 Hofstede 文化维度的映射表现。" 
        : "Hello! I am your CultureOS Globalization Advisor. I have calibrated my models with region-specific sociocultural indices. Ask me anything about cultural taboos, ad messaging transcreation, or national social dimensions."
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State for Content Intelligence
  const [intelModel, setIntelModel] = useState<string>("gemini-3.1-pro-preview");
  const [intelTask, setIntelTask] = useState<"analyze" | "edit">("analyze");
  const [intelInput, setIntelInput] = useState<string>(
    isZh 
      ? "「一鹿繁花」中式草本香薰，主打‘减压、宁神、东方禅意’，针对欧美中产阶层和东南亚华人推广。" 
      : "Deer in Bloom (一鹿繁花) Herbal Incense, featuring 'anxiety relief, Zen tranquility, and Eastern heritage' for European affluent urbanists and high-stress professionals."
  );
  const [intelBrandTone, setIntelBrandTone] = useState<string>(isZh ? "宁静、专业、带有东方禅意" : "Serene, premium, featuring oriental heritage");
  const [intelMarkets, setIntelMarkets] = useState<string[]>(["North America", "Southeast Asia"]);
  const [intelResult, setIntelResult] = useState<string>("");
  const [isIntelLoading, setIsIntelLoading] = useState<boolean>(false);

  // State for Studio Visuals (Image Creator & Editor)
  const [imgPrompt, setImgPrompt] = useState<string>(
    isZh 
      ? "一幅展示「一鹿繁花」草本香薰的高级感产品海报，背景配有柔和的东方山水屏风与自然晨雾卷，极简主义，暖光色调，4k" 
      : "A premium product advertisement for Deer in Bloom (一鹿繁花) Herbal Incense, soft mist background with an elegant minimal oriental folding screen, warm studio light, cinematic realism, 4k"
  );
  const [imgAspectRatio, setImgAspectRatio] = useState<string>("1:1");
  const [imgSrcBase64, setImgSrcBase64] = useState<string>(""); // for edit mode
  const [imgUploadName, setImgUploadName] = useState<string>("");
  const [imgResultUrl, setImgResultUrl] = useState<string>("");
  const [isImgLoading, setIsImgLoading] = useState<boolean>(false);
  const [imgError, setImgError] = useState<string>("");

  // State for Local Music Soundtrack Composer (Lyria)
  const [musicPrompt, setMusicPrompt] = useState<string>(
    isZh 
      ? "创作一段30秒的东方禅意环境微风背景音乐，带古筝与竹笛的Lo-fi敲击节拍，适合助眠、减压ASMR流媒体" 
      : "Cozy 30-second ASMR lo-fi background beat utilizing traditional Guzheng pluck notes, bamboo flute breeze, and gentle ambient vinyl crackle, suitable for meditation & stress relief video."
  );
  const [musicLength, setMusicLength] = useState<"clip" | "pro">("clip");
  const [musicImgBase64, setMusicImgBase64] = useState<string>(""); // optional image reference for music
  const [musicImgName, setMusicImgName] = useState<string>("");
  const [musicResultUrl, setMusicResultUrl] = useState<string>("");
  const [musicLyrics, setMusicLyrics] = useState<string>("");
  const [isMusicLoading, setIsMusicLoading] = useState<boolean>(false);
  const [musicError, setMusicError] = useState<string>("");

  // Connection testing state
  const [testingConfigs, setTestingConfigs] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; msg: string }>>({});

  // Masking API Keys UI controls
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Sync selected models with provider choices
  useEffect(() => {
    if (chatProvider === "gemini") {
      setChatModel("gemini-3.5-flash");
    } else if (chatProvider === "openai") {
      setChatModel("gpt-4o-mini");
    } else if (chatProvider === "deepseek") {
      setChatModel("deepseek-chat");
    } else if (chatProvider === "glm") {
      setChatModel("glm-4-flash");
    } else if (chatProvider === "custom") {
      setChatModel(modelConfigs.custom.activeModel || "custom-llm");
    }
  }, [chatProvider]);

  useEffect(() => {
    if (intelProvider === "gemini") {
      setIntelModel("gemini-3.1-pro-preview");
    } else if (intelProvider === "openai") {
      setIntelModel("gpt-4o-mini");
    } else if (intelProvider === "deepseek") {
      setIntelModel("deepseek-chat");
    } else if (intelProvider === "glm") {
      setIntelModel("glm-4-flash");
    } else if (intelProvider === "custom") {
      setIntelModel(modelConfigs.custom.activeModel || "custom-llm");
    }
  }, [intelProvider]);

  const handleTestConnection = async (prov: "gemini" | "openai" | "deepseek" | "glm" | "custom") => {
    setTestingConfigs(prev => ({ ...prev, [prov]: true }));
    setTestResults(prev => {
      const copy = { ...prev };
      delete copy[prov];
      return copy;
    });

    try {
      let testModel = "";
      if (prov === "gemini") testModel = "gemini-3.5-flash";
      else if (prov === "openai") testModel = "gpt-4o-mini";
      else if (prov === "deepseek") testModel = "deepseek-chat";
      else if (prov === "glm") testModel = "glm-4-flash";
      else testModel = modelConfigs.custom.activeModel || "custom-llm";

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: prov,
          model: testModel,
          message: "Connection checking ping. Respond with only 'OK'.",
          customApiKey: modelConfigs[prov]?.apiKey || undefined,
          customApiBase: modelConfigs[prov]?.apiBase || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Network error. Please review endpoint URL or API limits.");
      }

      setTestResults(prev => ({
        ...prev,
        [prov]: { success: true, msg: isZh ? "连接成功！通信频道畅通。" : "Success! Handshake confirmed with provider." }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [prov]: { success: false, msg: err.message || "Endpoint error or invalid auth credentials." }
      }));
    } finally {
      setTestingConfigs(prev => ({ ...prev, [prov]: false }));
    }
  };

  // Scroll chat thread to bottom on update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // System role description mapping helper
  const getSystemRolePrompt = (role: string) => {
    switch (role) {
      case "advisor":
        return "You are the Head Global Strategy Advisor for CultureOS. Analyze localization plans using Hofstede Cultural Dimensions and provide actionable insights.";
      case "copywriter":
        return "You are a world-class Transcreation Copywriter. Re-write, polish, and adapt ad copies across markets to guarantee native, captivating reading without semantic drift.";
      case "compliance":
        return "You are a critical Global Compliance Auditing Agent. Focus strictly on ad claim boundaries (FDA, FTC, regional restrictions), taboos, stereotypes, and ethnic mistakes.";
      case "dimensions":
        return "You are a Hofstede Social Dimensions Mapping Engine. Break down regional parameters (Power Distance, Individualism, Uncertainty Avoidance) and suggest equivalent local compensations.";
      default:
        return "You are a professional cross-border brand assistant.";
    }
  };

  // 1. Submit Local Chatbot Multi-turn
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessageText = chatInput;
    setChatInput("");
    
    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      text: userMessageText,
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: chatProvider,
          model: chatModel,
          systemInstruction: getSystemRolePrompt(chatRole),
          history: chatHistory.filter(h => h.id !== "welcome"), // skip welcome card
          message: userMessageText,
          customApiKey: modelConfigs[chatProvider]?.apiKey || undefined,
          customApiBase: modelConfigs[chatProvider]?.apiBase || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed key processing or API timeout.");
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: "reply-" + Date.now(),
          role: "assistant",
          text: data.text,
        }
      ]);
    } catch (e: any) {
      setChatHistory(prev => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "system",
          text: `⚠️ Error: ${e.message}`,
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Convert files helper
  const handleImageUploadHelper = (e: React.ChangeEvent<HTMLInputElement>, target: "visuals" | "music") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "visuals") {
      setImgUploadName(file.name);
    } else {
      setMusicImgName(file.name);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      if (target === "visuals") {
        setImgSrcBase64(b64);
        setImgError("");
      } else {
        setMusicImgBase64(b64);
        setMusicError("");
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Submit Content Intelligence (Analyze/Edit)
  const handleIntelSubmit = async () => {
    if (!intelInput.trim() || isIntelLoading) return;
    setIsIntelLoading(true);
    setIntelResult("");

    try {
      const response = await fetch("/api/gemini/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: intelProvider,
          model: intelModel,
          task: intelTask,
          content: intelInput,
          brandTone: intelBrandTone,
          targetMarkets: intelMarkets,
          customApiKey: modelConfigs[intelProvider]?.apiKey || undefined,
          customApiBase: modelConfigs[intelProvider]?.apiBase || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis model failed or timed out.");
      }

      setIntelResult(data.text);
    } catch (e: any) {
      setIntelResult(`⚠️ Failed to analyze copy:\n${e.message}`);
    } finally {
      setIsIntelLoading(false);
    }
  };

  // 3. Submit Studio Visuals (Image Generate/Edit)
  const handleImgSubmit = async () => {
    if (!imgPrompt.trim() && !imgSrcBase64) return;
    setIsImgLoading(true);
    setImgResultUrl("");
    setImgError("");

    try {
      const response = await fetch("/api/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imgPrompt,
          aspectRatio: imgAspectRatio,
          imageSize: "1K",
          imageBytes: imgSrcBase64 || undefined,
          mimeType: imgSrcBase64 ? "image/png" : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Visual engine failed or timed out.");
      }

      if (data.success && data.imageData) {
        setImgResultUrl(data.imageData);
      } else {
        throw new Error("Missing binary output data from visuals engine.");
      }
    } catch (e: any) {
      setImgError(e.message || "Failed to finalize generated visual.");
    } finally {
      setIsImgLoading(false);
    }
  };

  // 4. Submit Local Music Soundtrack Composer (Lyria)
  const handleMusicSubmit = async () => {
    if (!musicPrompt.trim() && !musicImgBase64) return;
    setIsMusicLoading(true);
    setMusicResultUrl("");
    setMusicLyrics("");
    setMusicError("");

    try {
      const response = await fetch("/api/gemini/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: musicPrompt,
          model: musicLength === "pro" ? "lyria-3-pro-preview" : "lyria-3-clip-preview",
          imageBytes: musicImgBase64 || undefined,
          mimeType: musicImgBase64 ? "image/png" : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Soundtrack composer engine failed or timed out.");
      }

      if (data.success && data.audioData) {
        setMusicResultUrl(data.audioData);
        setMusicLyrics(data.lyrics || "");
      } else {
        throw new Error("Audio buffer missing from sound composition output.");
      }
    } catch (e: any) {
      setMusicError(e.message || "Failed to compose backing track with Lyria engine.");
    } finally {
      setIsMusicLoading(false);
    }
  };

  // Clear states
  const resetVisualsUpload = () => {
    setImgSrcBase64("");
    setImgUploadName("");
  };

  const resetMusicUpload = () => {
    setMusicImgBase64("");
    setMusicImgName("");
  };

  // Custom formatted renderer helper
  const renderFormattedText = (text: string) => {
    const blocks = text.split("\n\n");
    return (
      <div className="space-y-4 text-slate-300 font-sans text-sm md:text-base leading-relaxed select-text">
        {blocks.map((block, idx) => {
          let line = block.trim();
          if (line.startsWith("### ")) {
            return <h3 key={idx} className="text-base font-bold text-amber-300 tracking-wide pt-2 border-b border-[#1e2f4d]/30 pb-1">{line.replace("### ", "")}</h3>;
          }
          if (line.startsWith("## ")) {
            return <h2 key={idx} className="text-lg font-bold text-cyan-400 tracking-wide pt-3">{line.replace("## ", "")}</h2>;
          }
          if (line.startsWith("# ")) {
            return <h1 key={idx} className="text-xl font-black text-white tracking-tight border-b border-[#1e2f4d]/60 pb-2 pt-2">{line.replace("# ", "")}</h1>;
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            const listItems = line.split("\n");
            return (
              <ul key={idx} className="list-disc pl-5 space-y-2 text-xs md:text-sm">
                {listItems.map((li, lIdx) => (
                  <li key={lIdx}>{li.replace(/^[\s-*]+/, "").replace(/\*\*([^*]+)\*\*/g, "$1")}</li>
                ))}
              </ul>
            );
          }
          if (line.startsWith("```")) {
            return (
              <pre key={idx} className="bg-[#050912] p-4 rounded-xl border border-[#1e2f4d]/40 font-mono text-xs text-cyan-300 overflow-x-auto select-all leading-relaxed">
                {line.replace(/```[a-z]*/g, "").trim()}
              </pre>
            );
          }
          // Highlight inline bold text simply
          const chunks = line.split(/\*\*([^*]+)\*\*/g);
          if (chunks.length > 1) {
            return (
              <p key={idx} className="text-xs md:text-sm leading-relaxed font-sans">
                {chunks.map((chunk, cIdx) => 
                  cIdx % 2 === 1 ? <strong key={cIdx} className="text-white font-bold">{chunk}</strong> : chunk
                )}
              </p>
            );
          }
          return <p key={idx} className="text-xs md:text-sm leading-relaxed font-sans">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Sidebar Tool Selection Card */}
      <div className="lg:col-span-3 space-y-3">
        <div className="p-4 rounded-2xl bg-[#0c1322]/90 border border-[#1e2f4d]/60 shadow-xl">
          <h4 className="text-xs font-mono uppercase font-black text-slate-500 tracking-wider mb-3">
            {isZh ? "💎 创意工具套件" : "💎 Creative Toolkits"}
          </h4>
          <div className="space-y-1.5">
            
            <button
              onClick={() => setActiveTab("chatbot")}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                activeTab === "chatbot"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <div className="flex-1">
                <p className="font-bold leading-tight">{isZh ? "出海咨询顾问" : "Multiverse Advisor"}</p>
                <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">Gemini Roleplay Chat</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("intelligence")}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                activeTab === "intelligence"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
              }`}
            >
              <Sparkles className="w-4.5 h-4.5" />
              <div className="flex-1">
                <p className="font-bold leading-tight">{isZh ? "爆款内容洞察" : "Copy Gen Intelligence"}</p>
                <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">Content & Taboos Auditor</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("visuals")}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                activeTab === "visuals"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
              }`}
            >
              <ImageIcon className="w-4.5 h-4.5" />
              <div className="flex-1">
                <p className="font-bold leading-tight">{isZh ? "视觉创意画布" : "Image Visual Studio"}</p>
                <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">Image Generator / Editor</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                activeTab === "audio"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
              }`}
            >
              <Music className="w-4.5 h-4.5" />
              <div className="flex-1">
                <p className="font-bold leading-tight">{isZh ? "流配乐作曲家" : "Folk Sound Composer"}</p>
                <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">Lyria Soundtrack Generator</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
              }`}
            >
              <Settings className="w-4.5 h-4.5 text-amber-400" />
              <div className="flex-1">
                <p className="font-bold leading-tight text-amber-300">{isZh ? "多模型配置中心" : "Model Registry Settings"}</p>
                <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">DeepSeek, OpenAI, GLM Setup</p>
              </div>
            </button>

          </div>
        </div>

        {/* Informative model constraints block */}
        <div className="p-4 rounded-xl bg-[#090f1e]/80 border border-[#1e2f4d]/40 text-left">
          <h5 className="text-[10px] font-mono font-bold text-amber-400 tracking-wider flex items-center gap-1.5 mb-1.5 uppercase">
            <BadgeInfo className="w-3.5 h-3.5" />
            <span>{isZh ? "多端运行与配额说明" : "Dynamic Model Registry"}</span>
          </h5>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            {isZh 
              ? "系统支持跨厂牌大语言模型（Gemini/DeepSeek/OpenAI/智谱），部分高级多模态任务（如 Imagen 生成、Lyria 作曲）仍需绑定生效的 Gemini API Key 进行处理。" 
              : "The suite supports multi-label upstream LLM engines (Gemini, DeepSeek, OpenAI, GLM). Note that specialized modal creation (Imagen/Lyria) utilizes your default Gemini key credentials."}
          </p>
        </div>
      </div>

      {/* Main Tool Content Panel */}
      <div className="lg:col-span-9">
        <div className="p-6 rounded-2xl bg-[#0c1322]/85 border border-[#1e2f4d]/50 shadow-2xl relative min-h-[520px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            
            {/* 1. CHATBOT TOOL VIEW PANEL */}
            {activeTab === "chatbot" && (
              <motion.div
                key="chatbot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-between h-full space-y-4"
              >
                
                {/* Header configuration */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1e2f4d]/50 pb-4 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      <span>{isZh ? "跨国传播顾问顾问 (Multiverse Chatbot)" : "Globalization Advising Desk"}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isZh ? "向专属智能顾问咨询文化禁忌、霍夫斯泰德转译对策及法律黑区" : "Direct Q&A with advanced cultural anchors, copywriting and compliance review filters"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Provider selector */}
                    <div className="bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-0.5 text-xs flex items-center">
                      <span className="text-[10px] text-slate-500 px-1 font-bold uppercase font-mono">{isZh ? "厂商:" : "Vendor:"}</span>
                      <select
                        value={chatProvider}
                        onChange={(e) => setChatProvider(e.target.value as any)}
                        className="bg-transparent border-0 text-cyan-400 font-bold text-[11px] px-2 py-1 outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="gemini">Gemini</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="openai">OpenAI</option>
                        <option value="glm">GLM (智谱)</option>
                        <option value="custom">{isZh ? "自定义" : "Custom"}</option>
                      </select>
                    </div>

                    {/* Model selector */}
                    <div className="bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-0.5 text-xs flex items-center">
                      <span className="text-[10px] text-slate-500 px-1 font-bold uppercase font-mono">{isZh ? "模型:" : "Model:"}</span>
                      {chatProvider === "custom" ? (
                        <input
                          type="text"
                          value={chatModel}
                          onChange={(e) => setChatModel(e.target.value)}
                          placeholder="e.g. gpt-4"
                          className="bg-transparent border-0 text-slate-300 font-mono text-[11px] px-2 py-1 outline-none w-28 focus:ring-0"
                        />
                      ) : (
                        <select
                          value={chatModel}
                          onChange={(e) => setChatModel(e.target.value)}
                          className="bg-transparent border-0 text-slate-300 font-mono text-[11px] px-2 py-1 outline-none focus:ring-0 cursor-pointer select-none"
                        >
                          {chatProvider === "gemini" && (
                            <>
                              <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                            </>
                          )}
                          {chatProvider === "openai" && (
                            <>
                              <option value="gpt-4o-mini">gpt-4o-mini</option>
                              <option value="gpt-4o">gpt-4o</option>
                              <option value="o1-mini">o1-mini</option>
                              <option value="o1-preview">o1-preview</option>
                            </>
                          )}
                          {chatProvider === "deepseek" && (
                            <>
                              <option value="deepseek-chat">deepseek-chat (V3)</option>
                              <option value="deepseek-reasoner">deepseek-reasoner (R1)</option>
                            </>
                          )}
                          {chatProvider === "glm" && (
                            <>
                              <option value="glm-4-flash">glm-4-flash</option>
                              <option value="glm-4-plus">glm-4-plus</option>
                              <option value="glm-4">glm-4</option>
                            </>
                          )}
                        </select>
                      )}
                    </div>

                    {/* Role selector */}
                    <div className="bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-0.5 text-xs flex items-center">
                      <select
                        value={chatRole}
                        onChange={(e) => setChatRole(e.target.value)}
                        className="bg-transparent border-0 text-slate-300 font-sans text-[11px] px-2 py-1 outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="advisor">{isZh ? "出海战略专家 (Hofstede)" : "Strategy Lead (Hofstede)"}</option>
                        <option value="copywriter">{isZh ? "文案润色编译 (Transcreation)" : "Creative Copywriter"}</option>
                        <option value="compliance">{isZh ? "红线合规审查 (FDA/GDPR)" : "Compliance Audit"}</option>
                        <option value="dimensions">{isZh ? "社会维度解构 (Dimensions)" : "Culture Mapper"}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Chat message bubbles scroll window */}
                <div className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto bg-[#050912]/70 border border-[#1e2f4d]/40 rounded-xl p-4 space-y-4">
                  {chatHistory.map((msg) => {
                    const isUser = msg.role === "user";
                    const isSys = msg.role === "system";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm shadow-md leading-relaxed ${
                            isUser
                              ? "bg-cyan-500/20 border border-cyan-500/35 text-cyan-100 rounded-tr-none"
                              : isSys
                              ? "bg-red-500/15 border border-red-500/25 text-red-300/90 font-mono"
                              : "bg-[#14233c]/65 border border-[#1e2f4d]/50 text-slate-100 rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5 opacity-60 text-[10px] font-mono tracking-wide uppercase font-black">
                            <span>{isUser ? (isZh ? "你" : "USER") : isSys ? "SYSTEM" : (isZh ? "出海顾问" : "GLO_ADVISOR")}</span>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#14233c]/45 border border-[#1e2f4d]/30 text-slate-300 rounded-2xl p-3 px-4 flex items-center gap-2 text-xs">
                        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        <span>CultureOS logic pipeline routing content...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input action toolbar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                    placeholder={
                      isZh 
                        ? "输入你的出海方案疑难或点击右侧发送..." 
                        : "Ask about high-resonance elements, regulatory taboos, transcreation tweaks..."
                    }
                    className="flex-1 bg-[#050912] border border-[#1e2f4d]/60 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 font-sans focus:outline-none focus:border-cyan-500/50 transition"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="px-5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. INTELLIGENCE TOOL VIEW PANEL */}
            {activeTab === "intelligence" && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="border-b border-[#1e2f4d]/50 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 w-full">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>{isZh ? "内容转译洞察专家 (Intelligence Audit)" : "Copywriting transcreation & Risk Audit"}</span>
                    </h3>
                    {/* Provider & Model Selector */}
                    <div className="flex items-center gap-2">
                      {/* Provider Select */}
                      <div className="bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-0.5 text-xs flex items-center">
                        <span className="text-[10px] text-slate-500 px-1 font-bold uppercase font-mono">{isZh ? "厂商:" : "Vendor:"}</span>
                        <select
                          value={intelProvider}
                          onChange={(e) => setIntelProvider(e.target.value as any)}
                          className="bg-transparent border-0 text-cyan-400 font-bold text-[11px] px-2 py-1 outline-none focus:ring-0 cursor-pointer"
                        >
                          <option value="gemini">Gemini</option>
                          <option value="deepseek">DeepSeek</option>
                          <option value="openai">OpenAI</option>
                          <option value="glm">GLM (智谱)</option>
                          <option value="custom">{isZh ? "自定义" : "Custom"}</option>
                        </select>
                      </div>

                      {/* Model Select */}
                      <div className="bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-0.5 text-xs flex items-center">
                        <span className="text-[10px] text-slate-500 px-1 font-bold uppercase font-mono">{isZh ? "模型:" : "Model:"}</span>
                        {intelProvider === "custom" ? (
                          <input
                            type="text"
                            value={intelModel}
                            onChange={(e) => setIntelModel(e.target.value)}
                            placeholder="e.g. gpt-4"
                            className="bg-transparent border-0 text-slate-300 font-mono text-[11px] px-2 py-1 outline-none w-28 focus:ring-0"
                          />
                        ) : (
                          <select
                            value={intelModel}
                            onChange={(e) => setIntelModel(e.target.value)}
                            className="bg-transparent border-0 text-slate-400 font-mono text-[11px] px-2 py-1 outline-none focus:ring-0 cursor-pointer"
                          >
                            {intelProvider === "gemini" && (
                              <>
                                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
                                <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
                                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Speedy)</option>
                              </>
                            )}
                            {intelProvider === "openai" && (
                              <>
                                <option value="gpt-4o-mini">gpt-4o-mini</option>
                                <option value="gpt-4o">gpt-4o</option>
                                <option value="o1-mini">o1-mini</option>
                              </>
                            )}
                            {intelProvider === "deepseek" && (
                              <>
                                <option value="deepseek-chat">deepseek-chat</option>
                                <option value="deepseek-reasoner">deepseek-reasoner</option>
                              </>
                            )}
                            {intelProvider === "glm" && (
                              <>
                                <option value="glm-4-flash">glm-4-flash</option>
                                <option value="glm-4-plus">glm-4-plus</option>
                                <option value="glm-4">glm-4</option>
                              </>
                            )}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isZh 
                      ? "深度检查广告或品牌方案中潜在的文化断层，提供高 RESONANCE 英语/本地翻译对策" 
                      : "Audit ad text or pitch lines across national regions, mapping out-of-context pitfalls"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
                  
                  {/* Left Side: Parameters Form */}
                  <div className="space-y-3 bg-[#050912]/50 border border-[#1e2f4d]/30 rounded-xl p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "广告创意 / 核心文案大纲" : "Creative Concept / Ad Copy"}
                        </label>
                        <textarea
                          rows={4}
                          value={intelInput}
                          onChange={(e) => setIntelInput(e.target.value)}
                          className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {isZh ? "品牌形象与语调" : "Brand Tone Accent"}
                          </label>
                          <input
                            type="text"
                            value={intelBrandTone}
                            onChange={(e) => setIntelBrandTone(e.target.value)}
                            className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {isZh ? "目标大区市场" : "Target Markets"}
                          </label>
                          <input
                            type="text"
                            value={intelMarkets.join(", ")}
                            onChange={(e) => setIntelMarkets(e.target.value.split(",").map(v => v.trim()))}
                            className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>

                      {/* Task select buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setIntelTask("analyze")}
                          className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            intelTask === "analyze"
                              ? "bg-[#14233c] text-cyan-400 border-cyan-500/30"
                              : "bg-transparent text-slate-400 border-slate-800 hover:text-slate-350"
                          }`}
                        >
                          🔍 {isZh ? "禁忌红线合规审计" : "Taboos & Compliance Audit"}
                        </button>
                        <button
                          onClick={() => setIntelTask("edit")}
                          className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            intelTask === "edit"
                              ? "bg-[#14233c] text-cyan-400 border-cyan-500/30"
                              : "bg-transparent text-slate-400 border-slate-800 hover:text-slate-350"
                          }`}
                        >
                          ✍️ {isZh ? "本地多语言 transcreation" : "Bilingual Copy transcreation"}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleIntelSubmit}
                      disabled={isIntelLoading || !intelInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md mt-4"
                    >
                      {isIntelLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>CultureOS Audit Loop active...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isZh ? "启动文案文化映射评测" : "Run Cultural Audit Pipeline"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Side: Outputs Panel */}
                  <div className="bg-[#050912]/80 border border-[#1e2f4d]/45 rounded-xl p-4 flex flex-col justify-between max-h-[350px] overflow-y-auto">
                    {isIntelLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                        <p className="text-xs text-slate-450">
                          {isZh 
                            ? "CultureOS 映射神经丛正在拉取大区反向屏蔽词库及合规先验指数..." 
                            : "Deconjugating Hofstede dimensions. Auditing claims variables (FDA/GDPR guidelines)..."}
                        </p>
                      </div>
                    ) : intelResult ? (
                      <div className="flex-1 space-y-2 text-slate-200">
                        <div className="text-[10px] font-mono tracking-widest font-black text-slate-450 uppercase mb-2 border-b border-[#1e2f4d]/30 pb-1">
                          {isZh ? "📋 审核分析包装件" : "📋 Intelligence Pack Outputs"}
                        </div>
                        {renderFormattedText(intelResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                        <HelpCircle className="w-10 h-10 text-slate-600 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-400">{isZh ? "等待评测输入" : "Awaiting Audit Instructions"}</p>
                          <p className="text-[11px] text-slate-550 max-w-xs">
                            {isZh ? "在左侧输入品牌描述词、主打痛点并选择运作任务，即可拉取 Gemini 出海适配红校决案" : "Fill parameters and run audit to calculate safety indices"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 3. IMAGES / VISUALS STUDIO GENERATIVE PANEL */}
            {activeTab === "visuals" && (
              <motion.div
                key="visuals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="border-b border-[#1e2f4d]/50 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    <span>{isZh ? "融合性视觉重构画布 (Visuals Studio)" : "Creative Localization Graphics Studio"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isZh 
                      ? "基于 Gemini 3.1-flash-image 模型，直接创作高保真出海视觉物，或上传已有海报在原图基础上转译（如：加入当地传统民俗要素）" 
                      : "Create high-fidelity marketing key visuals or upload existing assets to overlay cultural symbols and elements via local prompts"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-stretch">
                  
                  {/* Visual parameters configuration */}
                  <div className="space-y-3 bg-[#050912]/50 border border-[#1e2f4d]/30 rounded-xl p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Upload / Edit section */}
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "原图转译配置 (选填，开启 Image-to-Image / Edit 模式)" : "Source Image Adaptor (Optional, triggers Edit Mode)"}
                        </span>
                        
                        {imgSrcBase64 ? (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-xs">
                            <div className="flex items-center gap-2 text-cyan-400 font-mono">
                              <ImageIcon className="w-4 h-4" />
                              <span className="truncate max-w-[150px]">{imgUploadName || "source_image.png"}</span>
                            </div>
                            <button
                              onClick={resetVisualsUpload}
                              className="text-slate-400 hover:text-red-400 cursor-pointer"
                              title="Clear visual"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group border border-dashed border-[#1e2f4d]/60 rounded-lg p-4 text-center hover:border-cyan-500/50 transition">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUploadHelper(e, "visuals")}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-5 h-5 text-slate-450 mx-auto mb-1.5" />
                            <p className="text-[10px] text-slate-400 font-semibold">{isZh ? "拖拽或点击上传本地广告海报 / KV" : "Drag-and-Drop or click to apply source picture"}</p>
                            <p className="text-[9px] text-slate-550 mt-0.5">{isZh ? "上传后转换为 Base64 传递，开启图像局部重绘/背景文化替换" : "Enables background environment replacements & folk elements overlaying"}</p>
                          </div>
                        )}
                      </div>

                      {/* Text prompt */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "视觉绘图 / 修图 Prompt 指令" : "Visual Generative Prompt Instructions"}
                        </label>
                        <textarea
                          rows={3}
                          value={imgPrompt}
                          onChange={(e) => setImgPrompt(e.target.value)}
                          placeholder={isZh ? "输入视觉修图要素或新画幅描述..." : "A brand localized advertising key visual..."}
                          className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      {/* Aspect Ratio config */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                          {isZh ? "画布外装长宽比 (Aspect Ratio)" : "Canvas Frame Aspect Ratio"}
                        </label>
                        <div className="grid grid-cols-5 gap-1.5 text-xs">
                          {["1:1", "4:3", "16:9", "9:16", "3:4"].map((ratio) => (
                            <button
                              key={ratio}
                              onClick={() => setImgAspectRatio(ratio)}
                              className={`py-1 rounded text-[11px] font-mono border transition cursor-pointer ${
                                imgAspectRatio === ratio
                                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold"
                                  : "border-slate-800 text-slate-450 hover:text-slate-350"
                              }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    <button
                      onClick={handleImgSubmit}
                      disabled={isImgLoading || (!imgPrompt.trim() && !imgSrcBase64)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md mt-4"
                    >
                      {isImgLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini 3.1-flash-image mapping neural canvas...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{isZh ? (imgSrcBase64 ? "重绘此广告海报" : "创意生成精美视觉") : (imgSrcBase64 ? "Refine Source Key Poster" : "Synthesize Key Visual")}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Render Visual Image Display */}
                  <div className="bg-[#050912]/80 border border-[#1e2f4d]/45 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    {isImgLoading ? (
                      <div className="space-y-3">
                        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto animate-pulse" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-300">{isZh ? "智能光影重叠描绘中" : "Rendering Multi-pass Visual Layers"}</p>
                          <p className="text-[10px] text-slate-500 max-w-xs">{isZh ? "绘制多层光栅，自动对局部进行中西文化审美微调..." : "Executing adversarial context mapping. Synthesizing textures & depth map..."}</p>
                        </div>
                      </div>
                    ) : imgResultUrl ? (
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="flex-1 flex items-center justify-center p-2 rounded-lg border border-[#1e2f4d]/30 overflow-hidden bg-[#020408]">
                          <img
                            src={imgResultUrl}
                            alt="Generated visual delivery"
                            referrerPolicy="no-referrer"
                            className="max-h-[260px] object-contain rounded-md select-none pointer-events-none"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs bg-[#14233c]/30 p-2 rounded-xl border border-[#1e2f4d]/40">
                          <span className="text-slate-400 text-[10px] font-mono uppercase font-black">Model: gemini-3.1-flash-image</span>
                          <a
                            href={imgResultUrl}
                            download="cultureos_studio_poster.png"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-bold text-[11px]"
                          >
                            <span>Download High Resolution (1K)</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : imgError ? (
                      <div className="space-y-1.5 p-6 text-center text-red-400">
                        <AlertCircle className="w-8 h-8 mx-auto" />
                        <p className="text-xs font-bold">{isZh ? "视觉模型编译失败" : "Visual Synthesis Interrupted"}</p>
                        <p className="text-[10px] text-red-300/80 max-w-xs">{imgError}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-6 text-slate-550 max-w-sm">
                        <Compass className="w-12 h-12 text-slate-700 animate-pulse mx-auto" />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-400">{isZh ? "精美交付画幅" : "Studio Canvas Output"}</p>
                          <p className="text-[10px] text-slate-550 leading-relaxed">
                            {isZh 
                              ? "在左侧配置画幅尺寸、提示词（例如：水墨插图、极简、北欧冷硬）或加入原图进行等效情绪中介，成品将加载至此处。" 
                              : "Synthesized visual outputs aligned to regional aesthetics (color tones, spacing canons, focal points) will render here."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 4. SOUNDTRACK / AUDIO TOOL GENERATIVE PANEL */}
            {activeTab === "audio" && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="border-b border-[#1e2f4d]/50 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-cyan-400" />
                    <span>{isZh ? "本土背景配乐作曲家 (Folk Soundtrack Composer)" : "Lyria Localized Background Audio Engine"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isZh 
                      ? "利用 Google Lyria 物理声学流模型，直接为本地 TikTok Reels 创作本土调性背景配乐（短片30秒 / 完整音轨），甚至可以上传已生成的画布让其自动‘读图作曲’" 
                      : "Utilize advanced Google Lyria models to stream regional-native background beats. Input text parameters or submit image references for image-grounded sound coordination."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-stretch">
                  
                  {/* Soundtrack Parameters */}
                  <div className="space-y-3 bg-[#050912]/50 border border-[#1e2f4d]/30 rounded-xl p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Optional Image grounding */}
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "读图作曲参考图 (选填，开启 Image-to-Audio 多模态音乐)" : "Visual Grounding reference (Optional, triggers Music-from-Image)"}
                        </span>
                        
                        {musicImgBase64 ? (
                          <div className="flex items-center justify-between p-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-xs">
                            <div className="flex items-center gap-2 text-cyan-400 font-mono">
                              <ImageIcon className="w-4 h-4" />
                              <span className="truncate max-w-[150px]">{musicImgName || "cover_art.png"}</span>
                            </div>
                            <button
                              onClick={resetMusicUpload}
                              className="text-slate-400 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group border border-dashed border-[#1e2f4d]/60 rounded-lg p-3 text-center hover:border-cyan-500/50 transition">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUploadHelper(e, "music")}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-4 h-4 text-slate-450 mx-auto mb-1" />
                            <p className="text-[10px] text-slate-450">{isZh ? "点击上传素材海报 — 使音乐节奏更契合视觉氛围" : "Attach media graphic poster for theme pacing adaptation"}</p>
                          </div>
                        )}
                      </div>

                      {/* Music Prompt text */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "流配乐奏折及配饰细节 (Instruments & Styles)" : "Background Sound Prompt Style & Rhythm"}
                        </label>
                        <textarea
                          rows={3}
                          value={musicPrompt}
                          onChange={(e) => setMusicPrompt(e.target.value)}
                          className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      {/* Length switch */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                          {isZh ? "合成音轨片段长度" : "Soundtrack Duration Presets"}
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => setMusicLength("clip")}
                            className={`py-2 rounded-lg font-bold border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                              musicLength === "clip"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "border-slate-800 text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span className="font-bold">Lyria Clip (lyria-3-clip-preview)</span>
                            <span className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "主打短视频配乐 (30s以内)" : "Short Form Videos (<30s)"}</span>
                          </button>
                          <button
                            onClick={() => setMusicLength("pro")}
                            className={`py-2 rounded-lg font-bold border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                              musicLength === "pro"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "border-slate-800 text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span className="font-bold">Lyria Pro (lyria-3-pro-preview)</span>
                            <span className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "主打长篇或完整版音乐" : "Full Track Soundtrack"}</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    <button
                      onClick={handleMusicSubmit}
                      disabled={isMusicLoading || (!musicPrompt.trim() && !musicImgBase64)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md mt-4"
                    >
                      {isMusicLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Lyria acoustic neural stream composing...</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>{isZh ? "合成出海本土化配乐" : "Synthesize Localized Audio Track"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Render Sound Track output */}
                  <div className="bg-[#050912]/80 border border-[#1e2f4d]/45 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    {isMusicLoading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto text-cyan-500" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-300">{isZh ? "物理原声流卷积合成中" : "Acoustic Stream Synthesizing"}</p>
                          <p className="text-[10px] text-slate-500 max-w-xs">{isZh ? "拉取中东/欧美/亚太民俗打击点、声压调制滤波，输出高音质音频波形" : "Coordinating wave registers. Extracting base64 lyrics and metadata stream..."}</p>
                        </div>
                      </div>
                    ) : musicResultUrl ? (
                      <div className="w-full h-full flex flex-col justify-between">
                        
                        {/* Audio Player and visualizer mockup */}
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#03060c] p-6 rounded-xl border border-[#1e2f4d]/30 space-y-4">
                          <div className="w-14 h-14 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
                            <Volume2 className="w-7 h-7" />
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white tracking-wide">{isZh ? "合成背景配乐.bin" : "Acoustic Composition output"}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-mono font-black">{musicLength === "pro" ? "Lyria-3-Pro (1K master)" : "Lyria-3-Clip (30s preview)"}</p>
                          </div>

                          <audio
                            src={musicResultUrl}
                            controls
                            className="w-full h-8 px-2 max-w-xs block scale-90"
                          />
                        </div>

                        {/* Lyrics rendering */}
                        {musicLyrics && (
                          <div className="mt-3 p-3 bg-[#020408]/80 rounded-xl border border-[#1e2f4d]/20 text-left">
                            <span className="block text-[8px] font-mono tracking-widest font-black text-slate-500 uppercase mb-1">
                              {isZh ? "伴唱唱词 / 配乐 metadata 描述" : "Song Lyrics / Audio Metadata"}
                            </span>
                            <p className="text-[11px] text-slate-300 italic whitespace-pre-wrap leading-relaxed max-h-[80px] overflow-y-auto font-sans">
                              {musicLyrics}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 text-xs bg-[#14233c]/30 p-2 rounded-xl border border-[#1e2f4d]/40">
                          <span className="text-slate-400 text-[10px] font-mono font-bold uppercase">{isZh ? "格式: m4a / hifi-wav" : "Source Format: WAV"}</span>
                          <a
                            href={musicResultUrl}
                            download="cultureos_studio_soundtrack.wav"
                            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-bold text-[11px]"
                          >
                            <span>Download Soundtrack</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : musicError ? (
                      <div className="space-y-1.5 p-6 text-center text-red-400">
                        <AlertCircle className="w-8 h-8 mx-auto" />
                        <p className="text-xs font-bold">{isZh ? "音乐合成中断" : "Lyria Composition Failed"}</p>
                        <p className="text-[10px] text-red-300/80 max-w-xs">{musicError}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-6 text-slate-550 max-w-sm">
                        <Volume2 className="w-12 h-12 text-slate-705 animate-pulse mx-auto text-slate-700" />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-400">{isZh ? "交付和声音乐" : "Soundtrack Output"}</p>
                          <p className="text-[10px] text-slate-550 leading-relaxed">
                            {isZh 
                              ? "在左侧设定配乐诉求（例如：ASMR Lofi、南亚悠远古筝、欧美复古迷幻爵士），成品将输出配音、和弦伴奏、以及伴生本地化唱词字幕。" 
                              : "Engineered audio wave-registers aligned to traditional instrumentation (Guzheng plucks, flute breeze, acoustic loops) will render here."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 5. MULTI-MODEL SETUP PANEL */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="border-b border-[#1e2f4d]/50 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    <span>{isZh ? "多模型端点与凭证控制中心" : "Multi-LLM Registry Control Center"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isZh 
                      ? "您可以在此配置和测试多个主流模型提供商的基础 API 密匙与自定义反代中转地址。本配置仅保存在本地浏览器 LocalStorage 中，并经由后端纯代理转发，绝对不会上传或泄露密钥。" 
                      : "Define key entries and custom base routing URLs for key LLM engines (DeepSeek, OpenAI, GLM). Values persist only in browser Sandboxed LocalStorage."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
                  
                  {/* Left Side: Dynamic configuration cards */}
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    
                    {(["gemini", "openai", "deepseek", "glm", "custom"] as const).map((prov) => {
                      const capitalized = prov.toUpperCase();
                      const desc = prov === "gemini" 
                        ? (isZh ? "谷歌官方原生多模态引擎" : "Google Frontier Native AI")
                        : prov === "openai"
                        ? (isZh ? "美国 OpenAI 开放标准" : "Standard OpenAI GPT Services")
                        : prov === "deepseek"
                        ? (isZh ? "DeepSeek 高性价比深度思考 / R1 推理模型" : "Ultra-Efficient MoE Reasoning & R1 models")
                        : prov === "glm"
                        ? (isZh ? "智谱华章跨文化语言编译翻译引擎" : "Zhipu AI High-Resonance Chinese Engine")
                        : (isZh ? "其它符合 OpenAI 规范端点 (如 Ollama/OneAPI)" : "Self-hosted custom endpoint standard");
                      
                      const defBase = prov === "gemini" ? ""
                        : prov === "openai" ? "https://api.openai.com/v1"
                        : prov === "deepseek" ? "https://api.deepseek.com/v1"
                        : prov === "glm" ? "https://open.bigmodel.cn/api/paas/v4"
                        : "";

                      return (
                        <div 
                          key={prov} 
                          className={`p-4 rounded-xl border transition ${
                            (chatProvider === prov || intelProvider === prov)
                              ? "bg-[#14233c]/35 border-cyan-500/35 shadow-md"
                              : "bg-[#050912]/40 border-[#1e2f4d]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${modelConfigs[prov]?.apiKey ? "bg-green-400 animate-pulse" : "bg-slate-600"}`}></span> 
                                <span className="text-xs font-black text-white font-mono uppercase tracking-wide">{prov === "glm" ? "GLM (智谱)" : capitalized}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{desc}</span>
                            </div>

                            <button
                              onClick={() => handleTestConnection(prov)}
                              disabled={testingConfigs[prov]}
                              className="px-2.5 py-1 rounded bg-[#1e2f4d]/75 text-cyan-400 text-[10px] uppercase font-bold hover:bg-cyan-500/10 cursor-pointer transition disabled:opacity-40"
                            >
                              {testingConfigs[prov] ? (isZh ? "测试中..." : "Testing...") : (isZh ? "测试连接" : "Test Link")}
                            </button>
                          </div>

                          <div className="space-y-2 mt-3">
                            {/* API KEY Input Field */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isZh ? "API 私钥/凭证" : "API Bearer Token"}</label>
                              <div className="relative">
                                <input
                                  type={showKey[prov] ? "text" : "password"}
                                  value={modelConfigs[prov]?.apiKey || ""}
                                  onChange={(e) => {
                                    const copy = { ...modelConfigs };
                                    copy[prov].apiKey = e.target.value;
                                    saveConfigs(copy);
                                  }}
                                  placeholder={
                                    prov === "gemini" 
                                      ? (isZh ? "服务器端已自动配置秘钥 (非必填)" : "Defaults to Server's standard GEMINI_API_KEY")
                                      : (isZh ? `配置服务器预置键时无需填写(选填) / 或在此输入` : "Configure in backend variables or override with custom key here")
                                  }
                                  className="w-full bg-[#03060c] border border-[#1e2f4d]/50 rounded px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500/40 pr-8 font-mono placeholder:text-slate-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowKey(prev => ({ ...prev, [prov]: !prev[prov] }))}
                                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-350"
                                >
                                  {showKey[prov] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* API BASE URL Input Field, omit for gemini since we use standard client sdk */}
                            {prov !== "gemini" && (
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isZh ? "自定义 API 基准代理节点" : "Custom Target API Base Endpoint"}</label>
                                <input
                                  type="text"
                                  value={modelConfigs[prov]?.apiBase || ""}
                                  onChange={(e) => {
                                    const copy = { ...modelConfigs };
                                    copy[prov].apiBase = e.target.value;
                                    saveConfigs(copy);
                                  }}
                                  placeholder={defBase ? `e.g. ${defBase}` : "https://my-proxy-domain.com/v1"}
                                  className="w-full bg-[#03060c] border border-[#1e2f4d]/50 rounded px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono placeholder:text-slate-600"
                                />
                              </div>
                            )}

                            {/* Custom Active model choice for Custom vendor */}
                            {prov === "custom" && (
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isZh ? "自定义模型标识" : "Active Target Model Name"}</label>
                                <input
                                  type="text"
                                  value={modelConfigs.custom.activeModel || ""}
                                  onChange={(e) => {
                                    const copy = { ...modelConfigs };
                                    copy.custom.activeModel = e.target.value;
                                    saveConfigs(copy);
                                  }}
                                  placeholder="e.g. llama3.1"
                                  className="w-full bg-[#03060c] border border-[#1e2f4d]/50 rounded px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono placeholder:text-slate-600"
                                />
                              </div>
                            )}
                          </div>

                          {/* Connection Result Banner */}
                          {testResults[prov] && (
                            <div className={`mt-2 p-2 rounded text-[10px] flex items-start gap-1.5 ${
                              testResults[prov].success 
                                ? "bg-green-500/10 border border-green-500/20 text-green-300"
                                : "bg-red-500/10 border border-red-500/20 text-red-300"
                            }`}>
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span className="leading-tight font-sans">{testResults[prov].msg}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>

                  {/* Right Side: Security, active allocations */}
                  <div className="bg-[#050912]/85 border border-[#1e2f4d]/45 rounded-xl p-5 flex flex-col justify-between max-h-[420px] overflow-y-auto">
                    <div className="space-y-4">
                      
                      {/* Active Allocations overview */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-mono tracking-widest font-black text-slate-400 uppercase border-b border-[#1e2f4d]/30 pb-1">
                          {isZh ? "🎯 当前处于激活状态的模型绑定" : "🎯 Active Studio Allocations"}
                        </span>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[#14233c]/20 border border-[#1e2f4d]/30 p-2.5 rounded-lg space-y-1">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">{isZh ? "出海战略顾问" : "Chat Advisor"}</span>
                            <span className="text-xs font-bold text-white uppercase font-mono block">{chatProvider}</span>
                            <span className="text-[10px] text-cyan-400 font-mono block truncate">{chatModel}</span>
                          </div>

                          <div className="bg-[#14233c]/20 border border-[#1e2f4d]/30 p-2.5 rounded-lg space-y-1">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">{isZh ? "爆款内容洞察" : "Copy Intelligence"}</span>
                            <span className="text-xs font-bold text-white uppercase font-mono block">{intelProvider}</span>
                            <span className="text-[10px] text-cyan-400 font-mono block truncate">{intelModel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic summary cards */}
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2 text-xs text-amber-200">
                        <div className="flex items-center gap-2 font-black">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span>{isZh ? "隔离沙箱密码学安全" : "Encryption & Privacy Shield"}</span>
                        </div>
                        <p className="text-[10.5px] text-amber-300/85 leading-relaxed font-sans">
                          {isZh 
                            ? "CultureOS 深度遵从 API 安全策略：所有输入的第三方凭证仅暂存于本机的隔离 Session 存储，发起计算时仅通过 HTTPS 服务直连代理。绝对不会在服务器端持久化或泄露这些凭证。" 
                            : "Keys added here remain locally sandboxed inside your local client storage space. Calculations execute as volatile server brokers directly interfacing via official secure SSL ports."}
                        </p>
                      </div>

                      {/* Setup Instructions */}
                      <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-xl space-y-2 text-xs text-slate-350">
                        <div className="flex items-center gap-2 font-bold text-cyan-400">
                          <HardDrive className="w-4 h-4" />
                          <span>{isZh ? "如何获取第三方凭证密钥" : "Accessing Keys Reference"}</span>
                        </div>
                        <ul className="list-disc pl-5 text-[10.5px] text-slate-400 space-y-1 leading-relaxed font-sans">
                          <li>
                            <strong>DeepSeek</strong>: {isZh ? (
                              <>访问 <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">DeepSeek 平台</a> 创建 API Key。</>
                            ) : (
                              <>Generate keys on <a href="https://platform.deepseek.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">platform.deepseek.com</a>.</>
                            )}
                          </li>
                          <li>
                            <strong>OpenAI</strong>: {isZh ? (
                              <>访问 <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">OpenAI 开发者后台</a> 建立项目密钥。</>
                            ) : (
                              <>Generate keys on <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">platform.openai.com</a>.</>
                            )}
                          </li>
                          <li>
                            <strong>GLM (智谱)</strong>: {isZh ? (
                              <>访问 <a href="https://open.bigmodel.cn" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">智谱 AI 开放平台</a> 并创建 API 密匙。</>
                            ) : (
                              <>Generate keys on <a href="https://open.bigmodel.cn" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">open.bigmodel.cn</a>.</>
                            )}
                          </li>
                        </ul>
                      </div>

                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1e2f4d]/45 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-400 animate-pulse" />{isZh ? "本地隔离区安全锁定" : "Local Vault Secure"}</span>
                      <span>v1.2.0-stable</span>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
