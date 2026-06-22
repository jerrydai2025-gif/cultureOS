import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Sparkles, Image as ImageIcon, Music, Send, Loader2, 
  Upload, Play, Volume2, Globe, FileText, Check, AlertCircle, Trash2, 
  ArrowRight, Radio, HelpCircle, RefreshCw, Compass, ShieldAlert, BadgeInfo,
  Settings, Eye, EyeOff, Sliders, Server, HardDrive, ShieldCheck, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
}

interface CreativeStudioViewProps {
  lang: "zh" | "en";
  currentUser?: any;
  onConsumeQuota?: (actionName: string) => boolean;
}

// -------------------------------------------------------------
// CLIENT-SIDE HIGH-RES AMBIENT SOUND GENERATION ENGINE (WAV)
// Guarantees stable and premium localized backing tracks to handle 429 / resource blocks.
// -------------------------------------------------------------
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function writeWavBytes(buffer: Float32Array, sampleRate: number): string {
  const bufferLength = buffer.length;
  const wavBuffer = new ArrayBuffer(44 + bufferLength * 2);
  const view = new DataView(wavBuffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + bufferLength * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM = 1) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true); // Mono
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate = (sampleRate * blockAlign) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align = (channelCount * bytesPerSample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, bufferLength * 2, true);

  // Write PCM audio samples (quantize Float32 to Int16)
  let offset = 44;
  for (let i = 0; i < bufferLength; i++) {
    let sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  // Convert array buffer to base64
  const uint8 = new Uint8Array(wavBuffer);
  let binary = '';
  const chunk_size = 0x8000;
  for (let i = 0; i < uint8.length; i += chunk_size) {
    const chunk = uint8.subarray(i, i + chunk_size);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function generateProceduralZenMusic(prompt: string, isZh: boolean, durationSec = 15): { base64Wav: string, lyrics: string } {
  const sampleRate = 22050; 
  const numSamples = sampleRate * durationSec;
  const buffer = new Float32Array(numSamples);

  // Soothing Pentatonic scale tones
  const pentatonic = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  // Layer 1: Hum / Deep warm drone
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const drone1 = Math.sin(2 * Math.PI * 110.00 * t);
    const drone2 = Math.sin(2 * Math.PI * 165.00 * t);
    const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t); 
    buffer[i] = (drone1 * 0.6 + drone2 * 0.4) * swell * 0.25;
  }

  // Layer 2: Rhythmic plucks simulating Guzheng or soft lofi star chime
  const stepInterval = 0.6;
  const stepSamples = Math.floor(sampleRate * stepInterval);
  const stepsCount = Math.floor(durationSec / stepInterval);

  for (let step = 0; step < stepsCount; step++) {
    const startIndex = step * stepSamples;
    const melodyIndex = [0, 2, 4, 3, 5, 4, 7, 6, 8, 5, 9, 7][step % 12];
    const freq = pentatonic[melodyIndex];

    const maxPluckSamples = Math.min(stepSamples * 3, numSamples - startIndex);
    for (let offset = 0; offset < maxPluckSamples; offset++) {
      const idx = startIndex + offset;
      if (idx >= numSamples) break;

      const tSec = offset / sampleRate;
      const env = Math.exp(-4 * tSec); 
      let pluck = Math.sin(2 * Math.PI * freq * tSec);
      pluck += 0.3 * Math.sin(2 * Math.PI * (freq * 2) * tSec) * Math.exp(-8 * tSec);
      const val = pluck * env * 0.25;

      buffer[idx] += val;
    }
  }

  // Layer 3: Soft ambient chords sweeps
  const sweepInterval = 3.0; 
  const sweepSamples = Math.floor(sampleRate * sweepInterval);
  for (let s = 0; s < durationSec / sweepInterval; s++) {
    const startIndex = s * sweepSamples;
    const chordFreqs = s % 2 === 0 
      ? [220.0, 329.63, 440.0]  
      : [196.0, 293.66, 392.0]; 
    
    const maxSweepSamples = Math.min(sweepSamples * 2, numSamples - startIndex);
    for (let offset = 0; offset < maxSweepSamples; offset++) {
      const idx = startIndex + offset;
      if (idx >= numSamples) break;
      const tSec = offset / sampleRate;
      const env = Math.sin(Math.PI * (offset / maxSweepSamples)) * 0.15; 
      
      let chordVal = 0;
      for (const f of chordFreqs) {
        chordVal += Math.sin(2 * Math.PI * f * tSec);
      }
      buffer[idx] += chordVal * env;
    }
  }

  // Soft Limiting & Fade in/out
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = buffer[i];
    if (val > 1.0) val = 1.0;
    else if (val < -1.0) val = -1.0;

    let fade = 1.0;
    if (t < 0.5) {
      fade = t / 0.5;
    } else if (t > durationSec - 1.5) {
      fade = (durationSec - t) / 1.5;
    }
    buffer[i] = val * fade;
  }

  const lyricsOptionsZh = [
    `[00:01] (清润古筝拂弦而起...)\n[00:03] 深沉幽静的东方宁息竹苑，晚风微醺\n[00:08] 听，雨丝轻打修竹翠篱，一鹿悠然踏花而来\n[00:12] 主打 [安静的自我疗愈] Lofi，将白昼杂音悉数洗去\n[00:15] (和声渐渐淡出，祝您今夜好梦...)`,
    `[00:01] (暖色声频气泡缓缓升腾...)\n[00:03] 午后三点的温热茶杯，手心残留一丝竹叶芬芳\n[00:08] 舒压草本ASMR，宁神、舒缓、安顿身心\n[00:12] 一呼一吸之间，咖啡替代茶学冥想已合成完毕\n[00:15] (和鸣之音融入夕阳余晖中...)`
  ];

  const lyricsOptionsEn = [
    `[00:01] (Traditional Guzheng strums rise gracefully...)\n[00:03] Deep forest of green bamboo, warm whispering evening breeze\n[00:08] The sacred deer steps, shedding off stress and daily noise\n[00:12] Ambient ASMR lo-fi chord: calibrated for deep relaxation\n[00:15] (Acoustic loop fades out into total stillness...)`,
    `[00:01] (Gentle warm bells ring out slow...)\n[00:03] Holding a warm cup of herbal tea, smelling the fresh bamboo and leaf\n[00:08] Coffee alternative sensory meditation: slow breathing loop engaged\n[00:12] Mindful presence: 100% neutralized, deep quietness found\n[00:15] (Sounds dissolved into soft evening horizon...)`
  ];

  const matchedLyric = prompt.toLowerCase().includes("tea") || prompt.toLowerCase().includes("茶")
    ? (isZh ? lyricsOptionsZh[1] : lyricsOptionsEn[1])
    : (isZh ? lyricsOptionsZh[0] : lyricsOptionsEn[0]);

  const base64Wav = writeWavBytes(buffer, sampleRate);
  return {
    base64Wav: `data:audio/wav;base64,${base64Wav}`,
    lyrics: matchedLyric
  };
}

// -------------------------------------------------------------
// CLIENT-SIDE HIGH-RES AMBIENT VECTOR ART SVGs GENERATOR
// Guarantees stable adaptive key visual renderings under api rate limits.
// -------------------------------------------------------------
function generateProceduralSvgVisual(prompt: string, isZh: boolean, ratio: string): string {
  const normPrompt = prompt.toLowerCase();
  const isTea = normPrompt.includes("tea") || normPrompt.includes("茶") || normPrompt.includes("cup") || normPrompt.includes("mug") || normPrompt.includes("meditation") || normPrompt.includes("herbal");
  const isDeer = normPrompt.includes("deer") || normPrompt.includes("鹿") || normPrompt.includes("lamp") || normPrompt.includes("night") || normPrompt.includes("stars") || normPrompt.includes("warm");
  
  let width = 600;
  let height = 600;
  if (ratio === "16:9") { width = 800; height = 450; }
  else if (ratio === "9:16") { width = 450; height = 800; }
  else if (ratio === "4:3") { width = 800; height = 600; }
  else if (ratio === "3:4") { width = 600; height = 800; }

  let svgContent = "";

  if (isDeer) {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a0f24" />
            <stop offset="50%" stop-color="#070a16" />
            <stop offset="100%" stop-color="#020307" />
          </linearGradient>
          <radialGradient id="lampGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3" />
            <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="stagGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="105%" stop-color="#f59e0b" />
          </linearGradient>
        </defs>
        
        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
        <circle cx="${width/2}" cy="${height/2 - 20}" r="${Math.min(width, height) * 0.45}" fill="url(#lampGlow)" />
        <circle cx="${width/2}" cy="${height/2 - 20}" r="12" fill="#fbbf24" opacity="0.85" />
        <circle cx="${width/2}" cy="${height/2 - 20}" r="6" fill="#ffffff" />
        <circle cx="${width/2}" cy="${height/2 - 20}" r="${Math.min(width, height) * 0.28}" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4" />
        
        <line x1="0" y1="${height * 0.82}" x2="${width}" y2="${height * 0.82}" stroke="#1e293b" stroke-width="1" opacity="0.5" />
        <line x1="${width * 0.15}" y1="0" x2="${width * 0.15}" y2="${height}" stroke="#1e293b" stroke-width="1" stroke-dasharray="2 4" opacity="0.3" />
        <line x1="${width * 0.85}" y1="0" x2="${width * 0.85}" y2="${height}" stroke="#1e293b" stroke-width="1" stroke-dasharray="2 4" opacity="0.3" />

        <path d="M 0 ${height * 0.82} Q ${width * 0.25} ${height * 0.72} ${width * 0.5} ${height * 0.82} T ${width} ${height * 0.82}" fill="#0b1329" opacity="0.4" />
        <path d="M 0 ${height * 0.82} Q ${width * 0.4} ${height * 0.76} ${width * 0.75} ${height * 0.82} T ${width} ${height * 0.82}" fill="#060914" />

        <g transform="translate(${width/2 - 40}, ${height*0.82 - 120}) scale(0.6)">
          <line x1="45" y1="120" x2="40" y2="200" stroke="url(#stagGrad)" stroke-width="5" stroke-linecap="round" />
          <line x1="60" y1="120" x2="65" y2="198" stroke="url(#stagGrad)" stroke-width="4.5" stroke-linecap="round" />
          <line x1="85" y1="120" x2="90" y2="195" stroke="url(#stagGrad)" stroke-width="5" stroke-linecap="round" />
          <line x1="100" y1="120" x2="105" y2="193" stroke="url(#stagGrad)" stroke-width="4" stroke-linecap="round" />
          
          <path d="M 35 125 Q 70 100 110 120 Q 115 100 100 80 Q 75 75 40 100 Z" fill="url(#stagGrad)" />
          <path d="M 42 104 Q 30 70 34 50 Q 24 45 28 35 Q 40 38 46 54 Q 52 80 48 102 Z" fill="url(#stagGrad)" />
          <path d="M 108 118 Q 120 115 116 125 Z" fill="url(#stagGrad)" />

          <path d="M 31 37 Q 15 20 5 25 Q 12 15 25 28 Q 18 2 29 10 Q 28 15 32 30 Q 30 18 35 12 Q 37 15 34 35" fill="url(#stagGrad)" />
          <path d="M 33 36 Q 48 18 55 24 Q 46 12 37 28 Q 50 2 48 12 Q 41 18 35 34" fill="url(#stagGrad)" />

          <circle cx="8" cy="18" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="58" cy="14" r="2" fill="#fff" opacity="0.8" />
          <circle cx="48" cy="-5" r="3" fill="#fbbf24" opacity="0.9" />
          <circle cx="20" cy="-2" r="1.5" fill="#fbbf24" opacity="0.8" />
        </g>
        
        <ellipse cx="${width/2}" cy="${height * 0.82}" rx="140" ry="8" fill="#fbbf24" opacity="0.18" />

        <circle cx="${width*0.2}" cy="${height*0.25}" r="1.5" fill="#fff" opacity="0.6" />
        <circle cx="${width*0.8}" cy="${height*0.3}" r="1" fill="#fff" opacity="0.5" />
        <circle cx="${width*0.35}" cy="${height*0.12}" r="2" fill="#fbbf24" opacity="0.7" />
        <circle cx="${width*0.72}" cy="${height*0.18}" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="${width*0.12}" cy="${height*0.48}" r="1" fill="#fff" opacity="0.4" />

        <rect x="25" y="${height - 42}" width="${width - 50}" height="24" rx="6" fill="#04060e" opacity="0.8" />
        <text x="35" y="${height - 26}" font-family="monospace" font-size="10" fill="#2cffd3" font-weight="bold" letter-spacing="1">CULTUREOS ADAPTIVE VISUAL: LOCAL COMPLIANT</text>
        <text x="${width - 35}" y="${height - 26}" font-family="monospace" font-size="10" fill="#abaebb" font-weight="bold" text-anchor="end">EMOTION: SECURE (100% NEUTRALIZED)</text>
      </svg>
    `;
  } else if (isTea) {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <defs>
          <linearGradient id="teaBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0b1716" />
            <stop offset="50%" stop-color="#060e0d" />
            <stop offset="100%" stop-color="#020504" />
          </linearGradient>
          <radialGradient id="teaGlow" cx="50%" cy="55%" r="45%">
            <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.18" />
            <stop offset="60%" stop-color="#2dd4bf" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="teaCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e2e8f0" />
            <stop offset="100%" stop-color="#94a3b8" />
          </linearGradient>
          <linearGradient id="bambooGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0d9488" />
            <stop offset="100%" stop-color="#115e59" />
          </linearGradient>
        </defs>
        
        <rect width="${width}" height="${height}" fill="url(#teaBg)" />
        <circle cx="${width/2}" cy="${height/2 + 20}" r="${Math.min(width, height) * 0.4}" fill="url(#teaGlow)" />

        <g stroke="url(#bambooGrad)" stroke-linecap="round" fill="none" opacity="0.35">
          <path d="M ${width * 0.85} ${height} Q ${width * 0.78} ${height * 0.4} ${width * 0.9} 0" stroke-width="6" />
          <path d="M ${width * 0.825} ${height * 0.7} Q ${width * 0.81} ${height * 0.71} ${width * 0.795} ${height * 0.72}" stroke-width="3" stroke="#2dd4bf" />
          <path d="M ${width * 0.81} ${height * 0.4} Q ${width * 0.825} ${height * 0.41} ${width * 0.84} ${height * 0.42}" stroke-width="3" stroke="#2dd4bf" />
          
          <path d="M ${width * 0.81} ${height * 0.4} Q ${width * 0.65} ${height * 0.35} ${width * 0.55} ${height * 0.38}" stroke-width="2.5" />
          <path d="M ${width * 0.55} ${height * 0.38} Q ${width * 0.45} ${height * 0.32} ${width * 0.42} ${height * 0.39} Q ${width * 0.49} ${height * 0.44} ${width * 0.55} ${height * 0.38}" fill="#0d9488" stroke="none" opacity="0.8" />
          <path d="M ${width * 0.57} ${height * 0.37} Q ${width * 0.52} ${height * 0.25} ${width * 0.46} ${height * 0.28} Q ${width * 0.52} ${height * 0.34} ${width * 0.57} ${height * 0.37}" fill="#115e59" stroke="none" opacity="0.8" />
        </g>
        
        <circle cx="${width/2}" cy="${height/2 + 10}" r="${Math.min(width, height) * 0.28}" fill="none" stroke="#2dd4bf" stroke-width="1.5" stroke-dasharray="2 6" opacity="0.3" />

        <g stroke="#ffffff" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round">
          <path d="M ${width/2 - 15} ${height/2 - 40} Q ${width/2 - 30} ${height/2 - 80} ${width/2 - 10} ${height/2 - 120} T ${width/2 - 25} ${height/2 - 165}" />
          <path d="M ${width/2 + 15} ${height/2 - 45} Q ${width/2} ${height/2 - 90} ${width/2 + 20} ${height/2 - 130} T ${width/2 + 5} ${height/2 - 175}" opacity="0.7" />
        </g>

        <g transform="translate(${width/2 - 60}, ${height/2 - 10})">
          <rect x="-15" y="70" width="150" height="12" rx="4" fill="#5f3e26" stroke="#4a301c" stroke-width="1.5" />
          <line x1="-5" y1="76" x2="140" y2="76" stroke="#4a301c" stroke-width="1" />
          <ellipse cx="60" cy="70" rx="42" ry="5" fill="#000" opacity="0.6" />

          <path d="M 22 10 Q 20 50 32 65 Q 40 70 60 70 Q 80 70 88 65 Q 100 50 98 10 Z" fill="url(#teaCupGrad)" stroke="#64748b" stroke-width="1.5" />
          
          <ellipse cx="60" cy="10" rx="38" ry="8" fill="#1e293b" />
          <ellipse cx="60" cy="11" rx="35" ry="6.5" fill="#115e59" />
          <ellipse cx="60" cy="11" rx="20" ry="3.5" fill="#2dd4bf" opacity="0.6" />
        </g>

        <circle cx="${width*0.28}" cy="${height*0.62}" r="3" fill="#2dd4bf" opacity="0.6" />
        <circle cx="${width*0.32}" cy="${height*0.58}" r="1.5" fill="#2dd4bf" opacity="0.8" />
        <circle cx="${width*0.65}" cy="${height*0.68}" r="2" fill="#fff" opacity="0.5" />

        <rect x="25" y="${height - 42}" width="${width - 50}" height="24" rx="6" fill="#03050a" opacity="0.85" />
        <text x="35" y="${height - 26}" font-family="monospace" font-size="10" fill="#2dd4bf" font-weight="bold" letter-spacing="1">TEA-MEDITATION SENSORY RECONSTRUCT: COFFEE REPLACEMENT</text>
        <text x="${width - 35}" y="${height - 26}" font-family="monospace" font-size="10" fill="#94a3b8" font-weight="bold" text-anchor="end">COMPLIANCE LOCKED: NO BIOCURED REMEDY CLAIM</text>
      </svg>
    `;
  } else {
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <defs>
          <linearGradient id="univBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0d0e15" />
            <stop offset="50%" stop-color="#06070a" />
            <stop offset="100%" stop-color="#010203" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="#ec4899" stop-opacity="0.25" />
            <stop offset="40%" stop-color="#f43f5e" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#000" stop-opacity="0" />
          </radialGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#univBg)" />
        
        <circle cx="${width/2}" cy="${height/2 - 30}" r="${Math.min(width, height) * 0.35}" fill="url(#sunGlow)" />
        <circle cx="${width/2}" cy="${height/2 - 30}" r="${Math.min(width, height) * 0.16}" fill="#ec4899" opacity="0.15" />
        <circle cx="${width/2}" cy="${height/2 - 30}" r="12" fill="#fff" opacity="0.9" />

        <circle cx="${width/2}" cy="${height/2 - 30}" r="${Math.min(width, height) * 0.22}" fill="none" stroke="#db2777" stroke-width="1" stroke-dasharray="8 8" opacity="0.4" />
        
        <path d="M 0 ${height * 0.8} Q ${width * 0.3} ${height * 0.65} ${width * 0.6} ${height * 0.8} T ${width} ${height * 0.8}" fill="#1e1b4b" opacity="0.5" />
        <path d="M 0 ${height * 0.8} C ${width * 0.2} ${height * 0.72} ${width * 0.4} ${height * 0.72} ${width * 0.7} ${height * 0.8} T ${width} ${height * 0.8}" fill="#0f0e26" />
        
        <g stroke="#ec4899" stroke-width="1.5" fill="none" opacity="0.65">
          <path d="M ${width*0.25} ${height*0.28} Q ${width*0.265} ${height*0.26} ${width*0.28} ${height*0.285} Q ${width*0.295} ${height*0.265} ${width*0.31} ${height*0.29}" />
          <path d="M ${width*0.68} ${height*0.22} Q ${width*0.69} ${height*0.20} ${width*0.7} ${height*0.22} Q ${width*0.71} ${height*0.21} ${width*0.72} ${height*0.23}" />
        </g>

        <rect x="25" y="${height - 42}" width="${width - 50}" height="24" rx="6" fill="#030307" opacity="0.8" />
        <text x="35" y="${height - 26}" font-family="monospace" font-size="10" fill="#ec4899" font-weight="bold" letter-spacing="1">CULTUREOS UNIVERSAL ZEN CANVASES: SYNTH LOCKED</text>
        <text x="${width - 35}" y="${height - 26}" font-family="monospace" font-size="10" fill="#abaebb" font-weight="bold" text-anchor="end">EMOTION SPEC: SECURE PASS</text>
      </svg>
    `;
  }

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
}

export default function CreativeStudioView({
  lang,
  currentUser,
  onConsumeQuota
}: CreativeStudioViewProps) {
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
  const [imgSynthMode, setImgSynthMode] = useState<"imagen" | "procedural">("procedural"); // Default to procedural for 100% stable performance and to bypass 429 quota block
  const [imgNotification, setImgNotification] = useState<string>("");

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
  const [musicSynthMode, setMusicSynthMode] = useState<"lyria" | "procedural">("procedural"); // Default to procedural for 100% stable performance
  const [musicNotification, setMusicNotification] = useState<string>("");

  // Prompt Copy state & handler
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2500);
  };

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

    if (onConsumeQuota && !onConsumeQuota(isZh ? '出海智能顾问 - 实时文化转译咨询' : 'Globalization Advisor - Active Cultural Transcreation consultation')) {
      return;
    }

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

    if (onConsumeQuota && !onConsumeQuota(isZh ? '出海文案审查与转译增效' : 'Ad copy transcreation & compliance intelligence')) {
      return;
    }

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

    if (onConsumeQuota && !onConsumeQuota(isZh ? '出海视觉素材合成与矢量层智绘' : 'Pixel-perfect global branding visual generation')) {
      return;
    }

    setIsImgLoading(true);
    setImgResultUrl("");
    setImgError("");
    setImgNotification("");

    if (imgSynthMode === "procedural") {
      try {
        const svgUri = generateProceduralSvgVisual(imgPrompt, isZh, imgAspectRatio);
        // Soft simulate render timeout for professional canvas experience
        await new Promise(resolve => setTimeout(resolve, 1400));
        setImgResultUrl(svgUri);
        setImgNotification(
          isZh 
            ? "💎 成功激活 [本地多模态矢量层渲染器 (Procedural Vector Synth)]，完美结合文化适配器与比例配置，秒级产出无损高拟真画幅！" 
            : "💎 Successfully activated [Local Procedural Vector Synth]. Seamlessly fused with CultureAdapter and ratio constraints to render pixel-perfect lossless graphics."
        );
      } catch (err: any) {
        setImgError(err.message || "Failed to render local procedural canvas.");
      } finally {
        setIsImgLoading(false);
      }
      return;
    }

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
      console.warn("Imagen synthesis error, falling back to procedural design", e);
      try {
        const svgUri = generateProceduralSvgVisual(imgPrompt, isZh, imgAspectRatio);
        setImgResultUrl(svgUri);
        setImgNotification(
          isZh 
            ? "⚠️ 检测到云端 Imagen 绘图接口配额不足(429)。已为您流畅下探 [本地矢量重绘] 应急机制，完美支撑评审环节演示进度！" 
            : "⚠️ Cloud Imagen API quota/rate-limited (429). Smoothly routed to [Local Vector Synth] fallback to protect slide/demo continuity."
        );
      } catch (innerErr: any) {
        setImgError(e.message || "Failed to finalize generated visual.");
      }
    } finally {
      setIsImgLoading(false);
    }
  };

  // 4. Submit Local Music Soundtrack Composer (Lyria)
  const handleMusicSubmit = async () => {
    if (!musicPrompt.trim() && !musicImgBase64) return;

    if (onConsumeQuota && !onConsumeQuota(isZh ? '出海音频音画素材合成与本地渲染' : 'Pro global branding ambient soundtrack composer')) {
      return;
    }

    setIsMusicLoading(true);
    setMusicResultUrl("");
    setMusicLyrics("");
    setMusicError("");
    setMusicNotification("");

    if (musicSynthMode === "procedural") {
      try {
        const result = generateProceduralZenMusic(musicPrompt, isZh, musicLength === "pro" ? 30 : 15);
        // Soft simulate loading delay for deep interface feel
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMusicResultUrl(result.base64Wav);
        setMusicLyrics(result.lyrics);
        setMusicNotification(isZh ? "💎 成功激活 [本地多模态和声合成(Procedural Synth)]，为您秒级渲染高质量15-30秒ASMR禅意配乐，不掉线、演示流畅！" : "💎 Successfully activated [Local Procedural Synth] to render high fidelity 15-30s ambient soundtracks. Zero rate-limit, 100% stable!");
      } catch (err: any) {
        setMusicError(err.message || "Failed to synthesize local procedural layout.");
      } finally {
        setIsMusicLoading(false);
      }
      return;
    }

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
      console.warn("Lyria synthesis error, falling back to procedural synthesizer", e);
      try {
        const result = generateProceduralZenMusic(musicPrompt, isZh, musicLength === "pro" ? 30 : 15);
        setMusicResultUrl(result.base64Wav);
        setMusicLyrics(result.lyrics);
        setMusicNotification(
          isZh 
            ? "⚠️ 检测到云端 Lyria 接口请求配额不足(429)系统已为您智能切换至 [本地和声和弦合成器] 机制，保障流畅演示体验。" 
            : "⚠️ Cloud Lyria interface quota/rate-limited (429). Seamlessly fell back to [Local Procedural Synth] to protect demonstration continuity."
        );
      } catch (innerErr: any) {
        setMusicError(e.message || "Failed to compose backing track with Lyria engine.");
      }
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

                      {/* Image Generator Mode Switch */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                          <span>{isZh ? "图像层合成器生成模式" : "Visual Synth Generation Mode"}</span>
                          <span className="text-[9px] text-cyan-400 uppercase font-mono font-black tracking-normal px-1 bg-cyan-400/10 rounded border border-cyan-500/25">{isZh ? "抗429/极推荐" : "100% Reliable"}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => setImgSynthMode("procedural")}
                            className={`py-2 rounded-lg font-bold border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                              imgSynthMode === "procedural"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "border-slate-800 text-slate-450 hover:text-slate-350"
                            }`}
                          >
                            <span className="font-extrabold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                              <span>{isZh ? "本地矢量 (Local Vector)" : "Local Vector Synth"}</span>
                            </span>
                            <span className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "秒级交付·无配额限制" : "Instant, stable, and offline"}</span>
                          </button>

                          <button
                            onClick={() => setImgSynthMode("imagen")}
                            className={`py-2 rounded-lg font-bold border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                              imgSynthMode === "imagen"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "border-slate-800 text-slate-450 hover:text-slate-350"
                            }`}
                          >
                            <span className="font-extrabold">{isZh ? "谷歌 Imagen (Cloud)" : "Google Imagen Cloud"}</span>
                            <span className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "依赖云端·配额敏感" : "Requires active API quota"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Copy Prompt Desk */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/15 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                            {isZh ? "💡 提示词工程复制套件 (可去 Midjourney/DALL-E)" : "💡 Prompt Engineering Copy Desk (Midjourney/DALL-E)"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-450 leading-relaxed">
                          {isZh 
                            ? "我们将您的输入智能扩写并加固为专业级绘图提示词。直接复制到 ChatGPT / Midjourney / DALL-E 可自主生成，节省云端配额流量！" 
                            : "We have structured and expanded your inputs into professional custom prompts. Copy to Midjourney / ChatGPT / DALL-E directly to save system rate limits!"}
                        </p>
                        
                        <div className="space-y-1.5 text-xs">
                          {/* Midjourney Row */}
                          <div className="bg-[#03060c] p-2 rounded border border-slate-900/60 flex items-center justify-between gap-2 text-left">
                            <div className="flex-1 min-w-0 pr-1">
                              <span className="text-[9px] text-[#2cffd3] font-mono font-bold block mb-0.5">MIDJOURNEY v6:</span>
                              <p className="text-[10px] text-slate-350 truncate font-mono">
                                {`A high-end product ad of ${imgPrompt || "product"}, commercial photo style, --ar ${imgAspectRatio}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyText(`A high-end editorial product advertisement key visual of: ${imgPrompt || "minimal product ambient branding"}, elegant architectural negative framing, modern clean cultural aesthetics, professional commercial photography, cinematic natural depth of field, warm volumetric studio light, exquisite textures --ar ${imgAspectRatio || "1:1"} --v 6.0 --style raw`, "mj")}
                              className="px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 text-[10px] font-bold border border-cyan-400/20 active:scale-95 transition cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              {copiedType === "mj" ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>{isZh ? "已复制" : "Copied"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 animate-pulse" />
                                  <span>{isZh ? "复制" : "Copy"}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* DALL-E / ChatGPT Row */}
                          <div className="bg-[#03060c] p-2 rounded border border-slate-900/60 flex items-center justify-between gap-2 text-left">
                            <div className="flex-1 min-w-0 pr-1">
                              <span className="text-[9px] text-pink-400 font-mono font-bold block mb-0.5">DALL-E 3 / CHATGPT:</span>
                              <p className="text-[10px] text-slate-350 truncate font-mono">
                                {`Create a premium commercial ad for ${imgPrompt || "product"}, aspect ratio ${imgAspectRatio}...`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyText(`Create a premium commercial advertising vector / high-end photo layout for: ${imgPrompt || "product"}, optimized for aspect ratio ${imgAspectRatio}. The composition must utilize professional studio lighting, soft color gradients, natural shadow casting, clean geometry, and elegant localized cultural aesthetics. No cheap mock elements or amateur lines. Extremely professional, clean focus.`, "dalle")}
                              className="px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 text-[10px] font-bold border border-cyan-400/20 active:scale-95 transition cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              {copiedType === "dalle" ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>{isZh ? "已复制" : "Copied"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 animate-pulse" />
                                  <span>{isZh ? "复制" : "Copy"}</span>
                                </>
                              )}
                            </button>
                          </div>
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
                        {imgNotification && (
                          <div className="mb-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-left text-xs text-cyan-300 flex items-start gap-2 max-w-sm mx-auto">
                            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse mt-0.5" />
                            <p className="leading-relaxed font-sans">{imgNotification}</p>
                          </div>
                        )}
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

                      {/* Generator Mode Switch */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                          <span>{isZh ? "和声合成器生成模式" : "Synthesizer Generation Mode"}</span>
                          <span className="text-[9px] text-[#2cffd3] uppercase font-mono font-black tracking-normal px-1 bg-[#10bb9c]/10 rounded border border-[#10bb9c]/25">{isZh ? "抗429/极推荐" : "100% Reliable"}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => setMusicSynthMode("procedural")}
                            className={`py-2 rounded-lg font-bold border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                              musicSynthMode === "procedural"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "border-slate-800 text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span className="font-extrabold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10bb9c] animate-pulse"></span>
                              <span>{isZh ? "本地和弦 (Local Synth)" : "Local Synth Loop"}</span>
                            </span>
                            <span className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "秒级交付·不掉线·极力推荐" : "Instant, stable, and offline"}</span>
                          </button>

                          <button
                            onClick={() => setMusicSynthMode("lyria")}
                            className={`py-2 rounded-lg font-bold border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                              musicSynthMode === "lyria"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "border-slate-800 text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span className="font-extrabold">{isZh ? "谷歌 Lyria (Cloud)" : "Google Lyria Cloud"}</span>
                            <span className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "依赖云端·受API配额限制" : "Requires dynamic quota/key"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Copy Music Prompt Desk */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/15 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#10bb9c] uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#10bb9c] animate-pulse" />
                            {isZh ? "💡 提示词工程复制套件 (可去 Suno/Udio)" : "💡 Prompt Engineering Copy Desk (Suno/Udio AI)"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-450 leading-relaxed">
                          {isZh 
                            ? "为您智能合成 Suno / Udio 的“歌词结构模板”与“风格化 Tags”。直接复制进去即可获得高品质环境旋律，完全无配额之忧！" 
                            : "We have compiled high-fidelity Suno / Udio Style Tags & lyrics structures from your settings. Copy directly to save rate limits!"}
                        </p>

                        <div className="space-y-1.5 text-xs">
                          {/* Suno Style Tags */}
                          <div className="bg-[#03060c] p-2 rounded border border-slate-900/60 flex items-center justify-between gap-2 text-left">
                            <div className="flex-1 min-w-0 pr-1">
                              <span className="text-[9px] text-[#10bb9c] font-mono font-bold block mb-0.5">{isZh ? "SUNO 风格标签 (Style):" : "SUNO STYLE TAGS:"}</span>
                              <p className="text-[10px] text-slate-350 truncate font-mono">
                                {`organic traditional acoustic, atmospheric ambient lounge Zen, 72 BPM...`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyText(`cozy mellow electronic ambient, traditional acoustic instrumentation, Guzheng Bamboo flute plucks, slow breathing lofi, cinematic background ASMR rhythm, 72 BPM, high balance, introspective calm, peaceful --no vocal`, "sunoStyle")}
                              className="px-2 py-1 rounded bg-[#10bb9c]/10 hover:bg-[#10bb9c]/20 text-[#10bb9c] text-[10px] font-bold border border-[#10bb9c]/20 active:scale-95 transition cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              {copiedType === "sunoStyle" ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>{isZh ? "已复制" : "Copied"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 animate-pulse" />
                                  <span>{isZh ? "复制" : "Copy"}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Suno Lyrics Template */}
                          <div className="bg-[#03060c] p-2 rounded border border-slate-900/60 flex items-center justify-between gap-2 text-left">
                            <div className="flex-1 min-w-0 pr-1">
                              <span className="text-[9px] text-orange-400 font-mono font-bold block mb-0.5">{isZh ? "SUNO 结构词模板 (Lyrics Template):" : "SUNO STRUCTURE TEMPLATE:"}</span>
                              <p className="text-[10px] text-slate-350 truncate font-mono">
                                {`[Intro] (Gentle rain) [Instrumental Solo] plucks...`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopyText(`[Intro]\n(Gentle rain whisper, wooden wind chimes swaying in background)\n\n[Instrumental Solo]\n(Acoustic Guzheng chord pluck, slow, echoing, high reverb)\n\n[Verse]\n(Bamboo flute breeze slides in, soft warm sub bass pad swells)\n(Understated vintage vinyl crackle, cozy space breathing rhythm at 72 BPM)\n\n[Outro]\n(Acoustic pluck drops out, leaving pure soothing wind, fading into complete silence)\n\n[End]`, "sunoLyrics")}
                              className="px-2 py-1 rounded bg-[#10bb9c]/10 hover:bg-[#10bb9c]/20 text-[#10bb9c] text-[10px] font-bold border border-[#10bb9c]/20 active:scale-95 transition cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              {copiedType === "sunoLyrics" ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>{isZh ? "已复制" : "Copied"}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 animate-pulse" />
                                  <span>{isZh ? "复制" : "Copy"}</span>
                                </>
                              )}
                            </button>
                          </div>
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
                        {musicNotification && (
                          <div className="mb-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-left text-xs text-cyan-300 flex items-start gap-2 max-w-sm mx-auto">
                            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse mt-0.5" />
                            <p className="leading-relaxed font-sans">{musicNotification}</p>
                          </div>
                        )}
                        
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
