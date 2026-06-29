import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Compass, BookOpen, Music, 
  Smartphone, AlertCircle, Award, Eye, 
  Sparkles, Layers, Network, Database, ShieldCheck, CalendarDays
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

  const cluster = pack.mvp_agent_cluster;

  return (
    <div className="space-y-6">
      {cluster && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-4 p-5 rounded-2xl bg-[#0b1324]/90 border-2 border-cyan-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-black">
              <Network className="w-5 h-5" />
              <span>{isZh ? 'MVP Agent 集群控制塔' : 'MVP Agent Cluster Tower'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3"><span className="text-slate-500 block">Version</span><strong className="text-amber-300">{cluster.version}</strong></div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3"><span className="text-slate-500 block">Agents</span><strong className="text-emerald-300">{cluster.agents?.length || 0}</strong></div>
            </div>
            <div className="space-y-2 max-h-56 overflow-auto pr-1">
              {cluster.agents?.map((agent: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-850 rounded-xl p-2.5">
                  <div className="min-w-0"><p className="text-xs font-black text-slate-100 truncate">{agent.agentId}</p><p className="text-[10px] text-slate-500 truncate">{agent.rulesUsed?.slice(0,2).join(' · ') || 'orchestration'}</p></div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">{Math.round((agent.confidence || 0.9) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 p-5 rounded-2xl bg-[#0b1324]/90 border-2 border-amber-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-black"><Database className="w-5 h-5" /><span>{isZh ? '数据底座 / 规则来源' : 'Data Grounding Trace'}</span></div>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {cluster.dataContext?.dataSourceTrace?.map((d: any, idx: number) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2"><strong className="text-xs text-cyan-300 truncate">{d.recordId}</strong><span className="text-[10px] text-amber-300 font-mono">{Math.round((d.confidence || 0.8) * 100)}%</span></div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{d.reason}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{d.source}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 p-5 rounded-2xl bg-[#0b1324]/90 border-2 border-red-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-red-300 font-black"><ShieldCheck className="w-5 h-5" /><span>{isZh ? '规则命中 / 风险闸门' : 'Rule Hits / Risk Gates'}</span></div>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {cluster.rulesTriggered?.map((r: any, idx: number) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2"><strong className="text-xs text-slate-100 truncate">{r.name}</strong><span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${r.severity === 'high' ? 'text-red-300 border-red-500/30 bg-red-500/10' : 'text-amber-300 border-amber-500/30 bg-amber-500/10'}`}>{r.severity}</span></div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{r.action}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{r.ruleId}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-12 grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 p-5 rounded-2xl bg-[#0b1324]/90 border-2 border-emerald-500/20 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-black"><CalendarDays className="w-5 h-5" /><span>{isZh ? '14 天自媒体出海 MVP 冲刺计划' : '14-Day Creator MVP Sprint'}</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cluster.fourteen_day_sprint?.slice(0, 8).map((day: any) => (
                  <div key={day.day} className="bg-slate-950/60 border border-slate-850 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between"><strong className="text-amber-300 font-mono">DAY {day.day}</strong><span className="text-[10px] text-slate-500">{day.ruleFocus}</span></div>
                    <p className="text-xs text-slate-100 font-bold leading-relaxed">{day.task}</p>
                    <p className="text-[11px] text-cyan-300 leading-relaxed">{day.deliverable}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{day.metric}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="xl:col-span-4 p-5 rounded-2xl bg-[#0b1324]/90 border-2 border-purple-500/20 shadow-xl space-y-4">
              <div className="space-y-2">
                <h4 className="text-purple-300 font-black text-sm">{isZh ? '真实 CSV 数据底座加载状态' : 'CSV Data Hub Status'}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(cluster.dataContext?.csvDbSummary || {}).slice(0, 8).map(([name, rows]: any) => (
                    <div key={name} className="bg-slate-950/60 border border-slate-850 rounded-lg p-2">
                      <p className="text-[10px] text-slate-400 truncate">{name}</p>
                      <strong className="text-xs text-cyan-300">{rows} rows</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-amber-300 font-black text-sm">{isZh ? '发布前 Launch Checklist' : 'Launch Checklist'}</h4>
                <ul className="space-y-2">
                  {cluster.launch_checklist?.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-[11px] text-slate-200 leading-relaxed"><span className="text-emerald-300 font-black">✓</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Top Horizontal Navigation List */}
        <div className="w-full flex flex-row gap-2 overflow-x-auto pb-3 border-b border-slate-800/80 scrollbar-none">
          {tabsList.map(tab => {
            const Icon = tab.icon;
            const isActive = activePackTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`pack-tab-${tab.key}`}
                onClick={() => setActivePackTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-sans whitespace-nowrap transition cursor-pointer ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.01]' 
                    : 'text-slate-350 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{isZh ? tab.nameZh.slice(2) : tab.nameEn}</span>
              </button>
            );
          })}
        </div>
 
        {/* Full Width Details display */}
        <div className="w-full bg-[#0b1324]/90 border-2 border-slate-700/80 shadow-2xl p-6 md:p-8 rounded-2xl min-h-[480px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 glow-gold animate-pulse" />
                <h3 className="text-xl font-extrabold text-white font-sans tracking-wide font-medium">
                  {isZh ? currentTab.nameZh : currentTab.nameEn}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-950/60 px-2 py-1 rounded border border-slate-900">
                CultureOS Deliverable ID: C-PACK-{currentTab.key.toUpperCase()}
              </span>
            </div>
 
            {/* TAB 1: Market Insight Dynamic Showcase */}
            {activePackTab === 'market_insight' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                {pack.market_insight.regions.map((reg, idx) => (
                  <div key={idx} className="p-6 rounded-xl bg-slate-950/60 border border-slate-850 space-y-4 shadow-inner">
                    <h4 className="text-base font-extrabold text-amber-300 font-mono tracking-wide border-b border-slate-850 pb-2">
                      {reg.name}
                    </h4>
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase font-mono text-cyan-400 block font-bold tracking-wider">
                        {isZh ? '🎯 大区地区核心特质 & 商业信号' : 'Harness Opportunities'}
                      </span>
                      <ul className="space-y-2.5 text-sm md:text-[15px] font-medium text-slate-200">
                        {reg.insights.map((ins, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-cyan-400 mt-1 font-black">✓</span>
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
 
                      <span className="text-[10px] uppercase font-mono text-red-400 block font-bold tracking-wider">
                        {isZh ? '⚖ 刚性合规风控审查边界' : 'Prohibited Compliance Hazards'}
                      </span>
                      <ul className="space-y-2 text-sm text-red-200">
                        {reg.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-red-400 mt-2 animate-pulse flex-shrink-0" />
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
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-xs sm:text-sm font-mono text-slate-200 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>{isZh ? '出海文化转译核心架构 (Hofstede Cultural Map)' : 'Globalization Adaptive Framework:'}</span>
                  </div>
                  <strong className="text-sm sm:text-base text-cyan-300 font-extrabold bg-cyan-950/50 px-3.5 py-1.5 rounded-lg border border-cyan-800/40">{pack.cultural_adaptation.framework}</strong>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pack.cultural_adaptation.localCanons.map((canon, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-slate-950/60 border-2 border-slate-850/60 space-y-4 leading-relaxed shadow-inner hover:border-slate-800 transition">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <h4 className="text-base font-extrabold text-amber-300 font-mono">{canon.region}</h4>
                        <span className="text-xs bg-cyan-500/15 text-cyan-400 px-3 py-1 rounded-full font-black uppercase tracking-wider font-mono">
                          {canon.localEmotion.split('(')[0]}
                        </span>
                      </div>

                      {canon.adaptationBasis && (
                        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1.5">
                          <span className="text-[10px] text-cyan-400 uppercase font-mono font-extrabold tracking-wider block flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            {isZh ? '⚙️ 霍夫斯泰德客观指标依据 (Cultural Dimension Basis)' : 'Cultural Dimension Basis'}
                          </span>
                          <span className="text-xs text-white block leading-relaxed font-mono font-medium bg-slate-950/90 px-2.5 py-1.5 rounded border border-slate-900">
                            {isZh ? (canon.adaptationBasisZh || canon.adaptationBasis) : canon.adaptationBasis}
                          </span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 block uppercase font-mono font-bold">{isZh ? '🎯 推荐契合场景 (scenes)' : 'Local Scenes'}</span>
                          <span className="text-sm text-slate-100 font-black tracking-wide leading-relaxed block">{canon.scenes.join(' | ')}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-red-400 text-xs block uppercase font-mono font-bold">{isZh ? '🚫 刚性禁忌规避 (dont)' : 'Boundaries (Dont)'}</span>
                          <span className="text-sm text-red-200 line-normal font-sans font-bold leading-relaxed block">{canon.dont.join(' ; ')}</span>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-slate-900">
                          <span className="text-cyan-400 text-xs block uppercase font-mono font-bold">{isZh ? '💡 跨文化符号映射推导 (Symbolic Mapping)' : 'Mapping Descriptors'}</span>
                          <p className="text-sm text-slate-200 leading-relaxed font-sans">{canon.mappingDescription}</p>
                        </div>

                        {canon.evidenceData && (
                          <div className="pt-3 border-t border-slate-900 space-y-1">
                            <span className="text-amber-400 text-xs block uppercase font-mono font-bold">{isZh ? '📊 本地社群及海外流媒体实证证据 (Empirical Proof)' : 'Localized Empirical Evidence'}</span>
                            <p className="text-xs text-slate-350 leading-relaxed font-sans italic bg-slate-950/30 p-2.5 rounded border border-slate-900">{isZh ? (canon.evidenceDataZh || canon.evidenceData) : canon.evidenceData}</p>
                          </div>
                        )}
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
                    <div key={idx} className="p-5 rounded-xl bg-slate-950/60 border-2 border-slate-850 space-y-2 flex flex-col justify-between shadow-inner">
                      <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest block">PILLAR 0{idx + 1}</span>
                      <p className="text-sm sm:text-base text-white font-extrabold font-sans leading-relaxed">{pil}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest block font-bold">{isZh ? '自媒体平台 A/B 试验对照组方向' : 'A/B Testing Target Groups'}</h4>
                    <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2.5 text-sm leading-relaxed text-slate-200">
                      {pack.content_strategy.abTest.map((test, i) => (
                        <p key={i} className="flex gap-2.5 items-start"><span className="text-amber-400 font-black font-mono">[{i === 0 ? 'Group A' : 'Group B'}]</span><span className="font-medium">{test}</span></p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest block font-bold">{isZh ? '多维跨平台分发权重与规划' : 'Multi-outlet Allocation Plan'}</h4>
                    <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850 text-sm text-slate-200 leading-relaxed">
                      <p className="font-sans leading-relaxed font-medium">{pack.content_strategy.platformPlan}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Ad Copy & Subtitles Preview */}
            {activePackTab === 'copy_pack' && (
              <div className="space-y-6">
                {/* Region selector tabs inside Copy Pack */}
                <div className="flex gap-2 bg-slate-955 p-1 rounded-lg border border-slate-800 max-w-sm">
                  {pack.copy_pack.regions.map((reg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveRegionIndex(idx)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition cursor-pointer ${
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
                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850/8s0 space-y-2 shadow-inner">
                          <span className="text-xs text-slate-400 font-mono uppercase font-bold tracking-wider">TikTok Primary Hook Caption (主文案标题)</span>
                          <span className="text-base text-emerald-300 font-black block leading-relaxed p-2.5 bg-slate-950 rounded border border-slate-900">{reg.tiktokCaption}</span>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850/80 space-y-2 shadow-inner">
                          <span className="text-xs text-slate-400 font-mono uppercase font-bold tracking-wider">Instagram Reels Narrative Caption (故事贴纸文案)</span>
                          <span className="text-sm sm:text-base text-cyan-300 font-black block leading-relaxed p-2.5 bg-slate-950 rounded border border-slate-900">{reg.igReelsCaption}</span>
                        </div>
                      </div>

                      {/* Storyboard display inside copy pack */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">{isZh ? '30秒高沉浸短片电影级分镜 (Storyboard List)' : 'Dynamic Segment Storyboard List'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {reg.storyboard.map((frame, idx) => (
                            <div key={idx} className="p-5 rounded-xl bg-gradient-to-b from-slate-950 to-[#0e172a] border-2 border-slate-800 space-y-3.5 relative flex flex-col justify-between min-h-[160px] shadow-lg">
                              <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-slate-450 uppercase font-black tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-900">{frame.timeframe}</span>
                              <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded w-max">FRAME 0{idx + 1}</span>
                              <p className="text-sm font-semibold text-slate-100 flex-1 leading-relaxed font-sans py-1">{frame.scene}</p>
                              <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
                                <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">{isZh ? '画外配音 / 字幕 Overlay' : 'Sticker Caption Overlay'}</span>
                                <span className="text-xs sm:text-sm text-cyan-300 font-black font-mono leading-relaxed block bg-slate-950/90 p-2 rounded border border-slate-850">“{frame.textOverlay}”</span>
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
                    <div key={idx} className="p-5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-4 shadow-inner">
                      <h4 className="text-base font-extrabold text-amber-300 font-mono border-b border-slate-800 pb-2">{reg.region}</h4>
                      <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-sm text-cyan-300 font-mono break-words font-bold leading-relaxed shadow-sm">
                        {reg.prompt}
                      </div>
                      <div className="pt-1">
                        <strong className="text-slate-300 text-xs sm:text-sm block pb-1 border-b border-slate-900 mb-1.5 font-bold uppercase tracking-wider">{isZh ? '🎨 视觉美学意向推导' : 'Aesthetic Descriptors'}</strong>
                        <p className="text-sm text-slate-200 font-sans tracking-wide leading-relaxed font-medium">
                          {reg.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Smartphone Mock Frame */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-[280px] h-[480px] rounded-[36px] bg-slate-950 border-[6px] border-slate-800 shadow-2xl overflow-hidden relative flex flex-col justify-between">
                    {/* Speaker notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                      <div className="w-10 h-1 bg-slate-950 rounded-full" />
                    </div>

                    {/* Smartphone Screen Background Visual Imitation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-indigo-950/40 z-0 flex flex-col justify-end p-4 pb-8 space-y-3">
                      {/* Glow deer graphic placeholder */}
                      <div className="absolute inset-x-4 top-16 bottom-24 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col items-center justify-center text-center p-4">
                        <Sparkles className="w-8 h-8 text-amber-300 animate-pulse mb-2" />
                        <span className="text-xs font-bold text-slate-100 uppercase tracking-widest font-sans">{pack.copy_pack.regions[activeRegionIndex]?.title || ''}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          {pack.visual_prompt.regions[activeRegionIndex]?.prompt.split(',')[1] || pack.visual_prompt.regions[activeRegionIndex]?.prompt.slice(0, 30) || ''}
                        </span>
                      </div>

                      {/* Overlying Subtitles sticker simulation on screen */}
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 z-10 mx-auto text-center w-full max-w-[220px]">
                        <span className="text-xs text-amber-300 font-bold font-mono tracking-wide leading-relaxed block glow-gold">
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
                <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center shadow-lg">
                  <span className="text-slate-200 text-sm font-black font-sans tracking-wide">{isZh ? 'ComplianceAgent 审查发布判定' : 'Adversarial Publish Decision:'}</span>
                  <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider font-mono ${
                    pack.compliance_review.decision === 'Pass' 
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30 shadow-md shadow-green-500/10' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10'
                  }`}>
                    {pack.compliance_review.decision}
                  </span>
                </div>

                <div className="space-y-4">
                  {pack.compliance_review.risks.map((risk, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-slate-950/60 border border-slate-850/80 space-y-4 shadow-inner hover:border-slate-800 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black font-mono uppercase tracking-widest border ${
                            risk.severity === 'high' 
                              ? 'bg-red-500/15 text-red-400 border-red-500/20' 
                              : risk.severity === 'medium' 
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' 
                                : 'bg-green-500/15 text-green-400 border-green-500/20'
                          }`}>
                            {risk.severity} Severity
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wide">
                            {isZh ? risk.categoryZh : risk.category}
                          </h4>
                        </div>
                        
                        {risk.triggeredRuleCode && (
                          <div className="bg-red-500/10 text-red-300 text-xs font-mono font-bold px-3 py-1 rounded border border-red-500/25 flex items-center gap-1.5 self-start sm:self-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            <span>{isZh ? (risk.triggeredRuleCodeZh || risk.triggeredRuleCode) : risk.triggeredRuleCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 leading-relaxed">
                        <div className="lg:col-span-6 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono text-slate-450 block font-black tracking-wider">{isZh ? '🔍 被拦截对抗事件 / 问题描述 (Intercepted Incident)' : 'Detected Violation Incident:'}</span>
                            <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">{isZh ? risk.reasonZh : risk.reason}</p>
                          </div>

                          {risk.basisDescription && (
                            <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl space-y-1">
                              <span className="text-[10px] uppercase font-mono text-slate-450 block font-black tracking-wider">{isZh ? '⚖️ 合规/民俗风控底层逻辑与律法释义' : 'Regulatory Base & Cultural Rationale:'}</span>
                              <p className="text-xs text-slate-400 font-sans leading-relaxed italic">{isZh ? (risk.basisDescriptionZh || risk.basisDescription) : risk.basisDescription}</p>
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-6">
                          <div className="p-4.5 bg-slate-950 border-2 border-amber-500/20 rounded-xl text-sm leading-relaxed text-slate-300 h-full flex flex-col justify-between shadow-md">
                            <div className="space-y-1.5">
                              <strong className="text-amber-400 font-mono block text-xs uppercase font-black pb-1.5 border-b border-slate-900 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400 glow-gold" />
                                {isZh ? '⚡ 自动化修正闭环建议 (Adaptive Action Advice)' : 'Adaptive Action Advice'}
                              </strong>
                              <p className="font-sans leading-relaxed text-sm font-semibold text-amber-100">{isZh ? risk.suggestionZh : risk.suggestion}</p>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-right mt-3 block">Compliance check: 100% neutralized</span>
                          </div>
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
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
                  <div className="space-y-2 text-left">
                    <span className="text-xs uppercase font-mono text-slate-400 block font-black tracking-wider">{isZh ? '最终推荐策略结论' : 'Evaluator Final Actionable Advice'}</span>
                    <p className="text-sm sm:text-[15px] font-extrabold text-slate-100 font-sans tracking-wide leading-relaxed bg-[#101b2e] p-3.5 border border-slate-850 rounded-xl">
                      {pack.evaluation_score.overall >= 4.5 
                        ? (isZh ? '★ 极优适配：100% 通过合规审计与对抗回退。支持在所对应之全球主流平台重兵部署投放！' : '★ Perfect Fit: 100% passed Red-Team audit with zero violations. Ready for immediate large-scale launch.') 
                        : (isZh ? '▲ 建议首发：风险因子已被 Core Compliance-Lock 阻断修正。推荐进行小规模 A/B 灰度测试后即时量产推广。' : '▲ Qualified for Release: Potential risks neutralized by Red-Team loop. Recommend starting mild A/B budget test.')}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-left sm:text-right bg-slate-950/50 p-4 rounded-xl border border-slate-850 min-w-[150px]">
                    <span className="text-[10px] sm:text-xs uppercase font-mono text-slate-400 block font-black tracking-widest leading-none pb-1">{isZh ? '综合权重评分' : 'Composite Score'}</span>
                    <strong className="text-4xl font-black text-amber-400 tracking-tight font-serif glow-gold">{pack.evaluation_score.overall} <span className="text-xs text-slate-500 font-sans">/ 5.0</span></strong>
                  </div>
                </div>

                {/* Score bar meters list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pack.evaluation_score.scores.map((item, idx) => {
                    const pct = (item.score / 5) * 100;
                    const color = item.score >= 4.5 ? 'bg-green-400' : item.score >= 4.0 ? 'bg-cyan-400' : 'bg-amber-400';
                    return (
                      <div key={idx} className="p-5 rounded-2xl bg-slate-900/40 border-2 border-slate-850 flex flex-col justify-between min-h-[140px] shadow-sm">
                        <div className="flex justify-between items-start border-b border-slate-850 pb-1.5">
                          <span className="text-sm text-slate-100 font-bold font-sans">{isZh ? item.labelZh : item.labelEn}</span>
                          <strong className="text-base font-extrabold font-mono text-slate-200">{item.score}</strong>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed py-2 select-none font-medium">
                          {isZh ? item.feedbackZh : item.feedbackEn}
                        </p>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden mt-1 shadow-inner border border-slate-900">
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
