export interface CampaignBrief {
  id: string;
  name: string;
  cultureAsset: string;
  businessGoal: string;
  targetRegions: string[];
  targetPlatforms: string[];
  emotionalKernel: string[];
  mustHave: string[];
  mustNot: string[];
  brandTone: string;
}

export interface AgentNode {
  id: string;
  name: string;
  icon: string;
  color: 'cyan' | 'gold' | 'purple' | 'red' | 'green';
  role: string;
  roleZh: string;
  input: string;
  inputZh: string;
  output: string;
  outputZh: string;
  status: 'waiting' | 'running' | 'done' | 'failed';
  risk: string;
  riskDesc: string;
}

export interface TraceLog {
  timestamp: string;
  agent: string;
  event: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type CulturePackKey = 
  | 'market_insight' 
  | 'cultural_adaptation' 
  | 'content_strategy' 
  | 'copy_pack' 
  | 'visual_prompt' 
  | 'compliance_review' 
  | 'evaluation_score';

export interface CulturePack {
  market_insight: {
    title: string;
    regions: {
      name: string;
      insights: string[];
      risks: string[];
    }[];
  };
  cultural_adaptation: {
    framework: string;
    localCanons: {
      region: string;
      localEmotion: string;
      scenes: string[];
      dont: string[];
      mappingDescription: string;
    }[];
  };
  content_strategy: {
    pillars: string[];
    videoThemes: {
      title: string;
      duration: string;
      concept: string;
    }[];
    abTest: string[];
    platformPlan: string;
  };
  copy_pack: {
    regions: {
      region: string;
      title: string;
      tiktokCaption: string;
      igReelsCaption: string;
      lyricsHook: string;
      musicPrompt: string;
      hashtags: string[];
      storyboard: {
        timeframe: string;
        scene: string;
        textOverlay: string;
      }[];
    }[];
  };
  visual_prompt: {
    regions: {
      region: string;
      prompt: string;
      description: string;
    }[];
  };
  compliance_review: {
    decision: 'Pass' | 'Revise' | 'Block';
    decisionText: string;
    decisionTextZh: string;
    risks: {
      category: string;
      categoryZh: string;
      severity: 'low' | 'medium' | 'high';
      reason: string;
      reasonZh: string;
      suggestion: string;
      suggestionZh: string;
    }[];
  };
  evaluation_score: {
    overall: number;
    final_recommendation?: string;
    scores: {
      key: string;
      labelZh: string;
      labelEn: string;
      score: number;
      feedbackZh: string;
      feedbackEn: string;
    }[];
  };
}

export interface RagFeedback {
  id: string;
  timestamp: string;
  source: string; // e.g. "Platform Audience", "Red-Team Audit", "Agent Simulation", "Market Conversion"
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactMetrics?: string; // e.g., "CTR dropped 12%", "Compliance warning", "Audience highly engaged"
}

export interface RagEntry {
  id: string;
  name: string;
  category: 'symbol' | 'regulatory' | 'music_visual' | 'audience';
  version: string;
  lastUpdated: string;
  descriptionZh: string;
  descriptionEn: string;
  coreConcepts: {
    name: string;
    values: string[];
  }[];
  regionalGuidelines: {
    region: string;
    mustHaves: string[];
    mustNots: string[];
    vibeStickers: string[];
  }[];
  feedbacks: RagFeedback[];
  changeLogs: {
    version: string;
    timestamp: string;
    triggerFeedbackId: string;
    changeSummary: string;
  }[];
}

export interface EvolutionTrace {
  timestamp: string;
  phase: 'parsing' | 'retrieving' | 'reasoning' | 'mutation' | 'verification' | 'completed';
  message: string;
  details?: string;
}

