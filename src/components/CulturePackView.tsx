import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Compass, BookOpen, Music, 
  Smartphone, AlertCircle, Award, Eye, 
  Sparkles, Layers
} from 'lucide-react';
import { CulturePack, CulturePackKey } from '../types';

interface CulturePackViewProps {
  lang: 'zh' | 'en';
  pack: CulturePack;
}

export default function CulturePackView({ lang, pack }: CulturePackViewProps) {
  const isZh = lang === 'zh';
  const [activePackTab, setActivePackTab] = useState<CulturePackKey>('market_insight');
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);

  // Sub tabs config
  const tabsList: { key: CulturePackKey; nameZh: string; nameEn: string; icon: any }[] = [
    { key: 'market_insight', nameZh: '🔍 市场信号', nameEn: 'Market Insight', icon: TrendingUp },
    { key: 'cultural_adaptation', nameZh: '🧠 三层映射', nameEn: 'Culture Adaptation', icon: Compass },
    { key: 'content_strategy', nameZh: '▣ 内容策略', nameEn: 'Content Strategy', icon: BookOpen },
    { key: 'copy_pack', nameZh: '✎ 多语文案', nameEn: 'Ad Copy Pack', icon: Music },
    { key: 'visual_prompt', nameZh: '🖼 视觉提示', nameEn: 'Visual Prompt', icon: Eye },
    { key: 'compliance_review', nameZh: '⚑ 合规审查', nameEn: 'Compliance Audit', icon: AlertCircle },
    { key: 'evaluation_score', nameZh: '✓ 9 维评估', nameEn: '9-Dim Scores', icon: Award }
  ];

  const currentTab = tabsList.find(t => t.key === activePackTab) || tabsList[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">
        
        {/* Left Column Navigation List */}
        <div className="xl:w-60 flex-shrink-0 flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-x-visible pb-2 xl:pb-0 border-b xl:border-b-0 xl:border-r border-slate-800/80 pr-0 xl:pr-4">
          {tabsList.map(tab => {
            const Icon = tab.icon;
            const isActive = activePackTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`pack-tab-${tab.key}`}
                onClick={() => setActivePackTab(tab.key)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-xs font-bold font-sans whitespace-nowrap transition cursor-pointer ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{isZh ? tab.nameZh.slice(2) : tab.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column Details display */}
        <div className="flex-1 bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 min-h-[480px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 glow-gold" />
                <h3 className="text-lg font-bold text-slate-100 font-sans tracking-wide">
                  {isZh ? currentTab.nameZh : currentTab.nameEn}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                CultureOS Deliverable ID: C-PACK-{currentTab.key.toUpperCase()}
              </span>
            </div>

            {/* TAB 1: Market Insight Dynamic Showcase */}
            {activePackTab === 'market_insight' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                {pack.market_insight.regions.map((reg, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-950/40 border border-slate-850/80 space-y-4">
                    <h4 className="text-sm font-bold text-amber-300 font-mono tracking-wide border-b border-slate-900 pb-2">
                      {reg.name}
                    </h4>
                    <div className="space-y-3.5">
                      <span className="text-[10px] uppercase font-mono text-cyan-400 block font-bold">
                        {isZh ? '大区核心洞察' : 'Harness Opportunities'}
                      </span>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {reg.insights.map((ins, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-cyan-400 mt-1 font-bold">✓</span>
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>

                      <span className="text-[10px] uppercase font-mono text-red-400 block font-bold">
                        {isZh ? '法务合规风险' : 'Prohibited Compliance Hazards'}
                      </span>
                      <ul className="space-y-1.5 text-xs text-red-300">
                        {reg.risks.map((risk, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Cultural Adaptation Framework */}
            {activePackTab === 'cultural_adaptation' && (
              <div className="space-y-6 text-sm">
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>{isZh ? '转译模型核心框架' : 'Globalization Framework:'}</span>
                  <strong className="text-cyan-300 font-bold">{pack.cultural_adaptation.framework}</strong>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pack.cultural_adaptation.localCanons.map((canon, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-950/60 border border-slate-850/40 space-y-4 leading-relaxed">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <h4 className="text-sm font-bold text-amber-300 font-mono">{canon.region}</h4>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                          {canon.localEmotion.split('(')[0]}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">{isZh ? '适应场景 (scenes)' : 'Local Scenes'}</span>
                          <span className="text-xs text-slate-300 font-bold">{canon.scenes.join(' | ')}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-red-400 text-[10px] block uppercase font-mono">{isZh ? '禁止规则 (dont)' : 'Boundaries (Dont)'}</span>
                          <span className="text-xs text-red-200 line-normal font-sans">{canon.dont.join(' ; ')}</span>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-900/60">
                          <span className="text-cyan-400 text-[10px] block uppercase font-mono">{isZh ? '适配映射学说描述' : 'Mapping Descriptors'}</span>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">{canon.mappingDescription}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Content Storyboard Strategy */}
            {activePackTab === 'content_strategy' && (
              <div className="space-y-6">
                {/* Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pack.content_strategy.pillars.map((pil, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 space-y-1.5 flex flex-col justify-between">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">PILLAR 0{idx + 1}</span>
                      <p className="text-xs text-slate-200 font-semibold font-sans leading-relaxed">{pil}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest block font-bold">{isZh ? '自媒体 A/B 试验方向' : 'A/B Testing Target Groups'}</h4>
                    <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-905 space-y-2 text-xs leading-relaxed text-slate-300">
                      {pack.content_strategy.abTest.map((test, i) => (
                        <p key={i} className="flex gap-2 items-start"><span className="text-amber-400 font-black font-mono">[{i === 0 ? 'A' : 'B'}]</span><span>{test}</span></p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest block font-bold">{isZh ? '跨平台分发权重' : 'Multi-outlet Allocation Plan'}</h4>
                    <div className="p-4 rounded-xl bg-slate-950/20 border border-slate-905 text-xs text-slate-300 leading-relaxed">
                      <p className="font-sans leading-relaxed">{pack.content_strategy.platformPlan}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Ad Copy & Subtitles Preview */}
            {activePackTab === 'copy_pack' && (
              <div className="space-y-6">
                {/* Region selector tabs inside Copy Pack */}
                <div className="flex gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-900 max-w-xs">
                  {pack.copy_pack.regions.map((reg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveRegionIndex(idx)}
                      className={`flex-1 py-1 rounded text-xs font-bold font-sans transition cursor-pointer ${
                        activeRegionIndex === idx ? 'bg-amber-400 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {reg.region.split('(')[0]}
                    </button>
                  ))}
                </div>

                {/* Display active regions ad copy details */}
                {(() => {
                  const reg = pack.copy_pack.regions[activeRegionIndex];
                  if (!reg) return null;
                  return (
                    <div className="space-y-6 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850/60 space-y-1">
                          <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">TikTok Primary Hook Caption</span>
                          <span className="text-emerald-300 font-bold block">{reg.tiktokCaption}</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850/60 space-y-1">
                          <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Instagram Reels Narrative Caption</span>
                          <span className="text-cyan-300 font-bold block text-xs">{reg.igReelsCaption}</span>
                        </div>
                      </div>

                      {/* Storyboard display inside copy pack */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
                          {isZh ? '30秒高沉浸短片动画分镜 (Storyboard)' : 'Dynamic Segment Storyboard List'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {reg.storyboard.map((frame, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-b from-slate-950/60 to-slate-950 border border-slate-900 space-y-2 relative flex flex-col justify-between min-h-[140px]">
                              <span className="absolute top-2 right-2 text-[10px] font-mono text-slate-600 uppercase font-black tracking-widest">{frame.timeframe}</span>
                              <span className="text-[10px] font-mono font-bold text-amber-400">FRAME 0{idx + 1}</span>
                              <p className="text-xs text-slate-300 flex-1 leading-normal font-sans py-1">{frame.scene}</p>
                              <div className="border-t border-slate-905 pt-2">
                                <span className="text-[9px] uppercase font-mono text-slate-600 block">{isZh ? '字幕叠加Overlay' : 'Sticker Caption Overlay'}</span>
                                <span className="text-[11px] text-cyan-300 font-bold font-mono truncate block">“{frame.textOverlay}”</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 5: Visual Prompt with phone simulator preview */}
            {activePackTab === 'visual_prompt' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visual Prompts list */}
                <div className="lg:col-span-7 space-y-4">
                  {pack.visual_prompt.regions.map((reg, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-850/80 space-y-3 leading-relaxed">
                      <h4 className="text-sm font-bold text-amber-300 font-mono border-b border-slate-900 pb-1.5">{reg.region}</h4>
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-xs text-cyan-400 font-mono break-all font-bold">
                        {reg.prompt}
                      </div>
                      <p className="text-xs text-slate-400 font-sans tracking-wide leading-relaxed">
                        <strong className="text-slate-300">{isZh ? '美学意向设计：' : 'Aesthetic Descriptors: '}</strong>
                        {reg.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Smartphone Mock Frame */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-[280px] h-[480px] rounded-[36px] bg-slate-950 border-[6px] border-slate-800 shadow-xl overflow-hidden relative flex flex-col justify-between">
                    {/* Speaker notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-slate-950 rounded-full" />
                    </div>

                    {/* Smartphone Screen Background Visual Imitation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-indigo-950/40 z-0 flex flex-col justify-end p-4 pb-8 space-y-3">
                      {/* Glow deer graphic placeholder */}
                      <div className="absolute inset-x-4 top-16 bottom-24 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col items-center justify-center text-center p-4">
                        <Sparkles className="w-8 h-8 text-amber-300 animate-pulse mb-2" />
                        <span className="text-[11px] font-bold text-slate-100 uppercase tracking-widest font-sans">{pack.copy_pack.regions[activeRegionIndex]?.title || ''}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          {pack.visual_prompt.regions[activeRegionIndex]?.prompt.split(',')[1] || pack.visual_prompt.regions[activeRegionIndex]?.prompt.slice(0, 30) || ''}
                        </span>
                      </div>

                      {/* Overlying Subtitles sticker simulation on screen */}
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 z-10 mx-auto text-center w-full max-w-[220px]">
                        <span className="text-[11px] text-amber-300 font-bold font-mono tracking-wide leading-relaxed block glow-gold">
                          &quot;{pack.copy_pack.regions[activeRegionIndex].storyboard[1].textOverlay}&quot;
                        </span>
                      </div>

                      {/* Simulated Interactive Likes list on side */}
                      <div className="absolute right-3.5 bottom-28 flex flex-col items-center gap-4 z-10 text-[9px] font-mono text-slate-400">
                        <div className="flex flex-col items-center"><span className="text-lg">❤️</span><span>12.4k</span></div>
                        <div className="flex flex-col items-center"><span className="text-lg">💬</span><span>821</span></div>
                        <div className="flex flex-col items-center"><span className="text-lg">⭐</span><span>4.1k</span></div>
                      </div>

                      {/* Video Descriptions at bottom */}
                      <div className="space-y-1.5 z-10 text-left">
                        <strong className="text-xs text-white">@CultureOS_IP</strong>
                        <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                          {pack.copy_pack.regions[activeRegionIndex].tiktokCaption}
                        </p>
                        <span className="text-[9px] text-cyan-400 font-mono block">
                          🎵 {pack.copy_pack.regions[activeRegionIndex].musicPrompt.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Prohibited Risk audit lists */}
            {activePackTab === 'compliance_review' && (
              <div className="space-y-6 text-sm">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold font-sans">{isZh ? 'ComplianceAgent 审查发布判定' : 'Adversarial Publish Decision:'}</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider font-mono ${
                    pack.compliance_review.decision === 'Pass' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/25 shadow-md shadow-green-500/5' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-md shadow-amber-500/5'
                  }`}>
                    {pack.compliance_review.decision}
                  </span>
                </div>

                <div className="space-y-4">
                  {pack.compliance_review.risks.map((risk, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-slate-950/40 border border-slate-850/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-3 space-y-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black font-mono uppercase ${
                          risk.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : risk.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {risk.severity} Severity
                        </span>
                        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase truncate">
                          {isZh ? risk.categoryZh : risk.category}
                        </h4>
                      </div>

                      <div className="md:col-span-9 space-y-2.5">
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">{isZh ? risk.reasonZh : risk.reason}</p>
                        <div className="p-3 bg-slate-950 border border-slate-905 rounded-lg text-xs leading-relaxed text-slate-400">
                          <strong className="text-cyan-400 font-mono block text-[10px] uppercase font-bold pb-1">{isZh ? '💡 修正建议' : 'Actionable Revision Advice:'}</strong>
                          <p className="font-sans leading-relaxed text-[11px]">{isZh ? risk.suggestionZh : risk.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: 9D Evaluation Scores representation */}
            {activePackTab === 'evaluation_score' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">{isZh ? '最终推荐策略结论' : 'Evaluator Final Actionable Advice'}</span>
                    <p className="text-sm font-bold text-slate-200 font-sans tracking-wide leading-relaxed">
                      {pack.evaluation_score.overall >= 4.5 
                        ? (isZh ? '★ 极优适配：100% 通过合规审计与对抗回退。支持在所对应之全球主流平台重兵部署投放！' : '★ Perfect Fit: 100% passed Red-Team audit with zero violations. Ready for immediate large-scale launch.') 
                        : (isZh ? '▲ 建议首发：风险因子已被 Core Compliance-Lock 阻断修正。推荐进行小规模 A/B 灰度测试后即时量产推广。' : '▲ Qualified for Release: Potential risks neutralized by Red-Team loop. Recommend starting mild A/B budget test.')}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-left sm:text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">{isZh ? '综合权重评分' : 'Composite Score'}</span>
                    <strong className="text-3xl font-black text-amber-400 tracking-tight font-serif glow-gold">{pack.evaluation_score.overall} <span className="text-xs text-slate-500 font-sans">/ 5.0</span></strong>
                  </div>
                </div>

                {/* Score bar meters list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pack.evaluation_score.scores.map((item, idx) => {
                    const pct = (item.score / 5) * 100;
                    const color = item.score >= 4.5 ? 'bg-green-400' : item.score >= 4.0 ? 'bg-cyan-400' : 'bg-amber-400';
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/30 border border-slate-905 flex flex-col justify-between min-h-[110px]">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-300 font-semibold font-sans">{isZh ? item.labelZh : item.labelEn}</span>
                          <strong className="text-sm font-bold font-mono text-slate-200">{item.score}</strong>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal py-1 select-none">
                          {isZh ? item.feedbackZh : item.feedbackEn}
                        </p>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-1.5">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
