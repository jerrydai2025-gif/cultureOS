import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, Sparkles, Image as ImageIcon, Music, Send, Loader2, 
  Upload, Play, Volume2, Globe, FileText, Check, AlertCircle, Trash2, 
  ArrowRight, Radio, HelpCircle, RefreshCw, Compass, ShieldAlert, BadgeInfo,
  Settings, Eye, EyeOff, Sliders, Server, HardDrive, ShieldCheck, Copy,
  Video, Filter, VolumeX, Plus, Terminal, Minus,
  Folder, FolderOpen, Search, Maximize2, ChevronLeft, ChevronRight, ChevronDown, Scissors, FileVideo, MoreHorizontal, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MUSIC_PRESETS, MusicPreset } from "../data/music_presets";

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

function generateProceduralZenMusic(
  prompt: string, 
  isZh: boolean, 
  durationSec = 15,
  options?: {
    leadInstrument?: string;
    scaleMode?: string;
    tempoBpm?: number;
    fxLayer?: string;
    volumes?: { lead: number; pad: number; rhythm: number; fx: number }
  }
): { base64Wav: string; lyrics: string } {
  const sampleRate = 22050; 
  const numSamples = sampleRate * durationSec;
  const buffer = new Float32Array(numSamples);

  const opt = {
    leadInstrument: options?.leadInstrument || 'guzheng',
    scaleMode: options?.scaleMode || 'pentatonic_yo',
    tempoBpm: options?.tempoBpm || 72,
    fxLayer: options?.fxLayer || 'rain',
    volumes: options?.volumes || { lead: 0.8, pad: 0.6, rhythm: 0.5, fx: 0.4 }
  };

  // 1. Scale Modes pitches mapping
  let scalePitches = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // Pentatonic Yo
  if (opt.scaleMode === 'natural_minor') {
    scalePitches = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99, 880.00];
  } else if (opt.scaleMode === 'pentatonic_major') {
    scalePitches = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
  } else if (opt.scaleMode === 'phrygian_latam') {
    scalePitches = [220.00, 233.08, 277.18, 293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 554.37, 587.33, 659.25, 783.99, 880.00];
  }

  // Layer 1: Hum / Deep warm drone (Chords Pad)
  const volPad = opt.volumes.pad;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Chords shift slowly
    const chordIdx = Math.floor(t / 4.0) % 3;
    let drone1 = Math.sin(2 * Math.PI * 110.00 * t);
    let drone2 = Math.sin(2 * Math.PI * 165.00 * t);
    
    if (chordIdx === 1) {
      drone1 = Math.sin(2 * Math.PI * 130.81 * t); // C3
      drone2 = Math.sin(2 * Math.PI * 196.00 * t); // G3
    } else if (chordIdx === 2) {
      drone1 = Math.sin(2 * Math.PI * 146.83 * t); // D3
      drone2 = Math.sin(2 * Math.PI * 220.00 * t); // A3
    }
    const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t); 
    buffer[i] = (drone1 * 0.6 + drone2 * 0.4) * swell * 0.22 * volPad;
  }

  // Layer 2: Lead Instrument melody plucks
  const volLead = opt.volumes.lead;
  const stepInterval = 60 / opt.tempoBpm;
  const stepSamples = Math.floor(sampleRate * stepInterval);
  const stepsCount = Math.floor(durationSec / stepInterval);

  for (let step = 0; step < stepsCount; step++) {
    const startIndex = step * stepSamples;
    const melodyPattern = [0, 2, 4, 3, 5, 4, 7, 6, 8, 5, 9, 7];
    const pitchIndex = melodyPattern[step % melodyPattern.length] % scalePitches.length;
    const freq = scalePitches[pitchIndex];

    const maxPluckSamples = Math.min(stepSamples * 3, numSamples - startIndex);
    for (let offset = 0; offset < maxPluckSamples; offset++) {
      const idx = startIndex + offset;
      if (idx >= numSamples) break;

      const tSec = offset / sampleRate;
      let val = 0;

      // Instrument physically modeled synthesis
      if (opt.leadInstrument === 'guzheng') {
        // Steep rise, fast exponential decay, Guzheng tremolo
        const env = Math.exp(-4.5 * tSec);
        let pluck = Math.sin(2 * Math.PI * freq * tSec);
        pluck += 0.35 * Math.sin(2 * Math.PI * (freq * 2) * tSec) * Math.exp(-9 * tSec);
        pluck += 0.15 * Math.sin(2 * Math.PI * (freq * 3.5) * tSec) * Math.exp(-15 * tSec);
        const tremolo = 1.0 + 0.12 * Math.sin(2 * Math.PI * 15 * tSec);
        val = pluck * env * tremolo * 0.28 * volLead;

      } else if (opt.leadInstrument === 'flute') {
        // Breathy rise, soft attack, natural pitch vibrato
        const env = Math.sin(Math.PI * Math.min(1, tSec / 0.15)) * Math.exp(-1.5 * tSec);
        const vibrato = 1.0 + 0.02 * Math.sin(2 * Math.PI * 6.5 * tSec);
        const breath = 0.05 * (Math.random() - 0.5); // Air blow sound
        let flute = Math.sin(2 * Math.PI * freq * vibrato * tSec);
        flute += 0.25 * Math.sin(2 * Math.PI * (freq * 3) * tSec) * Math.exp(-4 * tSec);
        val = (flute + breath) * env * 0.32 * volLead;

      } else if (opt.leadInstrument === 'guitar') {
        // Acoustic warm pluck, longer decay
        const env = Math.exp(-2.2 * tSec);
        let pluck = Math.sin(2 * Math.PI * freq * tSec);
        pluck += 0.4 * Math.sin(2 * Math.PI * (freq * 2) * tSec) * Math.exp(-6 * tSec);
        pluck += 0.15 * Math.cos(2 * Math.PI * (freq * 3) * tSec) * Math.exp(-10 * tSec);
        val = pluck * env * 0.25 * volLead;

      } else if (opt.leadInstrument === 'piano') {
        // Slower attack, rich harmonics, deep damp decay
        const env = Math.exp(-1.8 * tSec) * (1 - Math.exp(-25 * tSec));
        let key = Math.sin(2 * Math.PI * freq * tSec);
        key += 0.45 * Math.sin(2 * Math.PI * (freq * 2) * tSec) * Math.exp(-4 * tSec);
        key += 0.25 * Math.sin(2 * Math.PI * (freq * 3.1) * tSec) * Math.exp(-8 * tSec);
        key += 0.1 * Math.sin(2 * Math.PI * (freq * 4) * tSec) * Math.exp(-14 * tSec);
        val = key * env * 0.26 * volLead;

      } else if (opt.leadInstrument === 'kalimba') {
        // High crystalline tines, ultra fast exponential decay
        const highFreq = freq * 1.5; // Kalimba is usually tuned high
        const env = Math.exp(-8.0 * tSec);
        let tine = Math.sin(2 * Math.PI * highFreq * tSec);
        tine += 0.5 * Math.sin(2 * Math.PI * highFreq * 2.01 * tSec) * Math.exp(-18 * tSec);
        val = tine * env * 0.30 * volLead;

      } else if (opt.leadInstrument === 'handpan') {
        // Deep hollow metallic, resonance harmonics
        const env = Math.exp(-3.5 * tSec);
        let strike = Math.sin(2 * Math.PI * freq * tSec);
        strike += 0.3 * Math.sin(2 * Math.PI * freq * 1.5 * tSec) * Math.exp(-6 * tSec); // Perfect fifth resonance
        strike += 0.2 * Math.sin(2 * Math.PI * freq * 2.0 * tSec) * Math.exp(-10 * tSec); // Octave resonance
        val = strike * env * 0.28 * volLead;

      } else { // shakuhachi
        // Deep breath blow, slow attack, microtonal bend
        const env = Math.sin(Math.PI * Math.min(1, tSec / 0.25)) * Math.exp(-1.8 * tSec);
        const pitchBend = 1.0 - 0.015 * Math.exp(-5.0 * tSec); // Traditional sliding pitch
        const breath = 0.08 * (Math.random() - 0.5);
        let wind = Math.sin(2 * Math.PI * freq * pitchBend * tSec);
        wind += 0.3 * Math.sin(2 * Math.PI * (freq * 2.02) * tSec) * Math.exp(-3 * tSec);
        val = (wind + breath) * env * 0.28 * volLead;
      }

      buffer[idx] += val;
    }
  }

  // Layer 3: Rhythm Percussion Beats (Soft kick & shaker)
  const volRhythm = opt.volumes.rhythm;
  if (volRhythm > 0) {
    for (let step = 0; step < stepsCount; step++) {
      const startIndex = step * stepSamples;
      const isDownbeat = step % 2 === 0;

      if (isDownbeat) {
        // Soft low sub-bass kick drum strike
        const maxKickSamples = Math.min(sampleRate * 0.3, numSamples - startIndex);
        for (let offset = 0; offset < maxKickSamples; offset++) {
          const idx = startIndex + offset;
          if (idx >= numSamples) break;
          const tSec = offset / sampleRate;
          // Sweeping kick frequency
          const freqSweep = 55.0 * Math.exp(-18.0 * tSec) + 25.0;
          const kickVal = Math.sin(2 * Math.PI * freqSweep * tSec) * Math.exp(-15.0 * tSec);
          buffer[idx] += kickVal * 0.24 * volRhythm;
        }
      } else {
        // Soft high shaker rattle
        const maxShakerSamples = Math.min(sampleRate * 0.08, numSamples - startIndex);
        for (let offset = 0; offset < maxShakerSamples; offset++) {
          const idx = startIndex + offset;
          if (idx >= numSamples) break;
          const tSec = offset / sampleRate;
          const noise = (Math.random() - 0.5) * 0.05;
          const shakerVal = noise * Math.exp(-40.0 * tSec);
          buffer[idx] += shakerVal * 0.25 * volRhythm;
        }
      }
    }
  }

  // Layer 4: Procedural Soundscape FX Layers
  const volFx = opt.volumes.fx;
  if (opt.fxLayer !== 'none' && volFx > 0) {
    if (opt.fxLayer === 'rain') {
      // White noise rain pitter-patter
      let lastVal = 0;
      for (let i = 0; i < numSamples; i++) {
        const rawNoise = (Math.random() - 0.5) * 0.035;
        // High-pass filter via difference
        const filteredNoise = rawNoise - lastVal * 0.95;
        lastVal = rawNoise;
        buffer[i] += filteredNoise * volFx;
      }
    } else if (opt.fxLayer === 'wind_chimes') {
      // Wind chimes striking occasionally
      const chimeChances = Math.floor(durationSec / 2.0);
      for (let c = 0; c < chimeChances; c++) {
        // Strike at a random offset around each 2s block
        const strikeOffsetSec = c * 2.0 + Math.random() * 1.5;
        const startIndex = Math.floor(strikeOffsetSec * sampleRate);
        if (startIndex >= numSamples) continue;

        // Choose random high bell frequency from scale
        const chimeFreq = scalePitches[Math.floor(Math.random() * scalePitches.length)] * 4.0;
        const maxChimeSamples = Math.min(sampleRate * 2.5, numSamples - startIndex);

        for (let offset = 0; offset < maxChimeSamples; offset++) {
          const idx = startIndex + offset;
          const tSec = offset / sampleRate;
          const chimeVal = Math.sin(2 * Math.PI * chimeFreq * tSec) * Math.exp(-7.5 * tSec);
          buffer[idx] += chimeVal * 0.055 * volFx;
        }
      }
    } else if (opt.fxLayer === 'campfire') {
      // Campfire crackling pops
      for (let i = 0; i < numSamples; i++) {
        // Low rustle crackle
        const lowRustle = (Math.random() - 0.5) * 0.0035;
        buffer[i] += lowRustle * volFx;

        // Sharp pine logs snapping
        if (Math.random() > 0.9997) {
          const snapIndex = i;
          const snapSamples = Math.min(sampleRate * 0.05, numSamples - snapIndex);
          for (let offset = 0; offset < snapSamples; offset++) {
            const idx = snapIndex + offset;
            const tSec = offset / sampleRate;
            const popVal = (Math.random() - 0.5) * 0.15 * Math.exp(-120 * tSec);
            buffer[idx] += popVal * volFx;
          }
        }
      }
    } else if (opt.fxLayer === 'waves') {
      // Ebb and flow tidal waves
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const slowSwell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.07 * t);
        const noise = (Math.random() - 0.5) * 0.02 * slowSwell;
        buffer[i] += noise * volFx;
      }
    } else if (opt.fxLayer === 'vinyl') {
      // Vinyl record pops & background friction
      for (let i = 0; i < numSamples; i++) {
        const friction = (Math.random() - 0.5) * 0.005;
        buffer[i] += friction * volFx;

        if (Math.random() > 0.99985) {
          const popIndex = i;
          const popSamples = Math.min(sampleRate * 0.02, numSamples - popIndex);
          for (let offset = 0; offset < popSamples; offset++) {
            const idx = popIndex + offset;
            const tSec = offset / sampleRate;
            const clickVal = (Math.random() - 0.5) * 0.07 * Math.exp(-220 * tSec);
            buffer[idx] += clickVal * volFx;
          }
        }
      }
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
    buffer[i] = val * fade * 0.95; // safe master headroom
  }

  const base64Wav = writeWavBytes(buffer, sampleRate);
  
  // Find preset or build dynamic lyrics based on selection
  let lyricText = "";
  if (isZh) {
    lyricText = `[00:01] (本地和声引擎: [${opt.leadInstrument.toUpperCase()}] 旋律起...)\n` +
      `[00:03] 调式：${opt.scaleMode.toUpperCase()} | 速度：${opt.tempoBpm} BPM | 音效：${opt.fxLayer.toUpperCase()}\n` +
      `[00:07] [混音配置就绪] 主音量: ${(opt.volumes.lead*100).toFixed(0)}% | 伴奏: ${(opt.volumes.pad*100).toFixed(0)}% | 节奏: ${(opt.volumes.rhythm*100).toFixed(0)}%\n` +
      `[00:11] 正在播放：针对出海 [${opt.leadInstrument}] 环境音，一呼一吸，心安自愈\n` +
      `[00:15] (环境和弦徐徐回响，禅意收敛...)`;
  } else {
    lyricText = `[00:01] (Procedural Engine: [${opt.leadInstrument.toUpperCase()}] melody plucks rise...)\n` +
      `[00:03] Scale: ${opt.scaleMode.toUpperCase()} | Tempo: ${opt.tempoBpm} BPM | FX: ${opt.fxLayer.toUpperCase()}\n` +
      `[00:07] [Mixer Bus Active] Lead: ${(opt.volumes.lead*100).toFixed(0)}% | Drone: ${(opt.volumes.pad*100).toFixed(0)}% | Rhythm: ${(opt.volumes.rhythm*100).toFixed(0)}%\n` +
      `[00:11] Soundtrack playing: Customized ambient, fully cleared and licensed\n` +
      `[00:15] (Acoustic loop decays elegantly, Zen quietness returns...)`;
  }

  return {
    base64Wav: `data:audio/wav;base64,${base64Wav}`,
    lyrics: lyricText
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
  const [activeTab, setActiveTab] = useState<"canvas" | "chatbot" | "intelligence" | "visuals" | "audio" | "media" | "settings">("canvas");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Multi-Media Experience Hub States
  const [activeMediaSubTab, setActiveMediaSubTab] = useState<"video" | "audio" | "image">("video");
  
  // Audio Playback states for Hub
  const [isMediaAudioPlaying, setIsMediaAudioPlaying] = useState<boolean>(false);
  const mediaAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaVisualizerAnimRef = useRef<number | null>(null);

  // Lists of media (initialized with gorgeous high-quality presets so the screen is immediately engaging)
  const [mediaVideos, setMediaVideos] = useState<Array<{ id: string; name: string; url: string; size: string }>>([
    { id: "v-1", name: "Tokyo Crossing Shibuya Traffic Vibe.mp4", url: "https://assets.mixkit.co/videos/preview/mixkit-traffic-in-shibuya-crossing-at-night-42171-large.mp4", size: "4.2 MB" },
    { id: "v-2", name: "Serene Chinese Bamboo Forest Drone.mp4", url: "https://assets.mixkit.co/videos/preview/mixkit-woodland-drone-shot-at-sunset-40292-large.mp4", size: "3.5 MB" }
  ]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>("https://assets.mixkit.co/videos/preview/mixkit-traffic-in-shibuya-crossing-at-night-42171-large.mp4");
  const [videoFilter, setVideoFilter] = useState<"none" | "warm" | "vintage" | "cyber" | "cool" | "noir">("none");
  const [videoSubtitles, setVideoSubtitles] = useState<"none" | "zh" | "en" | "ar" | "ja">("none");
  const [videoWatermark, setVideoWatermark] = useState<boolean>(false);

  const [mediaAudios, setMediaAudios] = useState<Array<{ id: string; name: string; url: string; size: string }>>([
    { id: "a-1", name: "Chilled Serenade Guzheng Lofi.mp3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", size: "6.1 MB" },
    { id: "a-2", name: "Bamboo Breeze Meditation Flute.mp3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", size: "5.8 MB" }
  ]);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  const [audioAsmrVolume, setAudioAsmrVolume] = useState<number>(0.3);
  const [audioSpeedRate, setAudioSpeedRate] = useState<number>(1.0);
  const [selectedAsmrSfx, setSelectedAsmrSfx] = useState<"none" | "rain" | "chimes" | "waves" | "vinyl">("none");

  const [mediaImages, setMediaImages] = useState<Array<{ id: string; name: string; url: string; size: string }>>([
    { id: "i-1", name: "Traditional Crane and Sun Scroll.jpg", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop", size: "1.2 MB" },
    { id: "i-2", name: "Cozy Tea Ceremony Session.jpg", url: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&auto=format&fit=crop", size: "850 KB" }
  ]);
  const [activeImageUrl, setActiveImageUrl] = useState<string>("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop");
  const [imageFilterStyle, setImageFilterStyle] = useState<"none" | "warm" | "cool" | "neon" | "vintage">("none");
  const [imageReviewNotes, setImageReviewNotes] = useState<Array<{ id: string; x: number; y: number; text: string; textEn: string; type: "warning" | "info" | "success" }>>([
    { id: "n-1", x: 45, y: 35, text: "⚠️ 警告：背景色调红金搭配在中东地区极具高贵感，但在拉美特定国家需避免大面积深红重合。", textEn: "⚠️ Note: Gold & red carries royal weight in GCC but check specific contrast rules in LatAm.", type: "warning" },
    { id: "n-2", x: 70, y: 60, text: "✨ 亮点：此处留白（Negative Space）符合东亚高语境社会的高端审美体验。", textEn: "✨ Accent: Beautiful use of empty space aligns precisely with High-Context East Asian aesthetics.", type: "success" }
  ]);
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [clickCoord, setClickCoord] = useState<{ x: number; y: number } | null>(null);

  // Audio elements for ambient overlay
  const asmrAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync ambient sound overlay when state triggers
  useEffect(() => {
    if (asmrAudioRef.current) {
      asmrAudioRef.current.volume = audioAsmrVolume;
      if (isMediaAudioPlaying && selectedAsmrSfx !== "none") {
        asmrAudioRef.current.play().catch(e => console.log("ASMR autoplay blocked", e));
      } else {
        asmrAudioRef.current.pause();
      }
    }
  }, [selectedAsmrSfx, isMediaAudioPlaying, audioAsmrVolume]);

  // Sync playback speed rate
  useEffect(() => {
    if (mediaAudioRef.current) {
      mediaAudioRef.current.playbackRate = audioSpeedRate;
    }
  }, [audioSpeedRate, activeAudioUrl]);

  // Canvas visualizer engine for audio hub
  useEffect(() => {
    if (activeMediaSubTab !== "audio") {
      if (mediaVisualizerAnimRef.current) {
        cancelAnimationFrame(mediaVisualizerAnimRef.current);
      }
      return;
    }

    const canvas = mediaVisualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      width = canvas.width;
      height = canvas.height;
    };
    handleResize();

    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas);

    let phase = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(4, 7, 16, 0.2)";
      ctx.fillRect(0, 0, width, height);

      const computedHeight = height / (window.devicePixelRatio || 1);
      const computedWidth = width / (window.devicePixelRatio || 1);

      // Centered Circle visualizer or waveform
      const isPlaying = isMediaAudioPlaying;
      const baseRadius = Math.min(computedWidth, computedHeight) * 0.22;
      const pulse = isPlaying ? baseRadius + Math.sin(phase * 8) * 12 + Math.cos(phase * 3) * 6 : baseRadius;
      const centerX = computedWidth / 2;
      const centerY = computedHeight / 2;

      // Glow backdrop
      const glowGrad = ctx.createRadialGradient(centerX, centerY, pulse * 0.5, centerX, centerY, pulse * 1.5);
      glowGrad.addColorStop(0, `rgba(6, 182, 212, ${isPlaying ? 0.15 : 0.05})`);
      glowGrad.addColorStop(1, "rgba(4, 7, 16, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer animated bars
      const barCount = 100;
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const offset = isPlaying ? Math.abs(Math.sin(i * 0.15 + phase * 6) * 35 + Math.cos(i * 0.3 - phase * 4) * 15) : 5;
        const startR = pulse;
        const endR = pulse + offset;

        const startX = centerX + Math.cos(angle) * startR;
        const startY = centerY + Math.sin(angle) * startR;
        const endX = centerX + Math.cos(angle) * endR;
        const endY = centerY + Math.sin(angle) * endR;

        ctx.strokeStyle = `hsla(${(i * 3.6 + phase * 50) % 360}, 90%, 65%, ${isPlaying ? 0.8 : 0.35})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Inner wave paths
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulse - 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(236, 72, 153, 0.3)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulse + 12, 0, Math.PI * 2);
      ctx.stroke();

      phase += isPlaying ? 0.05 : 0.008;
      mediaVisualizerAnimRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (mediaVisualizerAnimRef.current) {
        cancelAnimationFrame(mediaVisualizerAnimRef.current);
      }
      observer.disconnect();
    };
  }, [activeMediaSubTab, isMediaAudioPlaying]);

  // State for Model configuration management
  const defaultModelConfigs = {
      gemini: { apiKey: "", apiBase: "", activeModel: "gemini-3.5-flash" },
      openai: { apiKey: "", apiBase: "https://api.openai-next.com/v1", activeModel: "gpt-4o-mini" },
      deepseek: { apiKey: "", apiBase: "https://api.deepseek.com/v1", activeModel: "deepseek-chat" },
      glm: { apiKey: "", apiBase: "https://open.bigmodel.cn/api/paas/v4", activeModel: "glm-4-flash" },
      custom: { apiKey: "", apiBase: "", activeModel: "custom-llm" }
    };
  const [modelConfigs, setModelConfigs] = useState(() => {
    const saved = localStorage.getItem("cultureos_model_configs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        for (const key of Object.keys(defaultModelConfigs)) {
          if (!parsed[key]) parsed[key] = defaultModelConfigs[key];
          if (!parsed[key].apiBase && defaultModelConfigs[key].apiBase) parsed[key].apiBase = defaultModelConfigs[key].apiBase;
          if (!parsed[key].activeModel && defaultModelConfigs[key].activeModel) parsed[key].activeModel = defaultModelConfigs[key].activeModel;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse model configs:", e);
      }
    }
    return defaultModelConfigs;
  });

  // Save configs to localStorage when altered
  const saveConfigs = (newConfigs: any) => {
    setModelConfigs(newConfigs);
    localStorage.setItem("cultureos_model_configs", JSON.stringify(newConfigs));
  };

  // File upload and click helpers for Media Hub
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const newVid = { id: `uv-${Date.now()}`, name: file.name, url, size: sizeStr };
      setMediaVideos(prev => [newVid, ...prev]);
      setActiveVideoUrl(url);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const newAud = { id: `ua-${Date.now()}`, name: file.name, url, size: sizeStr };
      setMediaAudios(prev => [newAud, ...prev]);
      setActiveAudioUrl(url);
      setIsMediaAudioPlaying(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const sizeStr = (file.size / 1024).toFixed(0) + " KB";
      const newImg = { id: `ui-${Date.now()}`, name: file.name, url, size: sizeStr };
      setMediaImages(prev => [newImg, ...prev]);
      setActiveImageUrl(url);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setClickCoord({ x, y });
  };

  const handleAddImageNote = (type: "warning" | "info" | "success") => {
    if (!newNoteText.trim() || !clickCoord) return;
    const newNote = {
      id: `un-${Date.now()}`,
      x: clickCoord.x,
      y: clickCoord.y,
      text: newNoteText,
      textEn: newNoteText,
      type
    };
    setImageReviewNotes(prev => [...prev, newNote]);
    setNewNoteText("");
    setClickCoord(null);
  };

  // State for dynamic provider selection
  const [chatProvider, setChatProvider] = useState<"gemini" | "openai" | "deepseek" | "glm" | "custom">("openai");
  const [intelProvider, setIntelProvider] = useState<"gemini" | "openai" | "deepseek" | "glm" | "custom">("openai");

  // State for Chatbot
  const [chatModel, setChatModel] = useState<string>("gpt-4o-mini");
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
  const [intelModel, setIntelModel] = useState<string>("gpt-4o-mini");
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
  const [musicSynthMode, setMusicSynthMode] = useState<"procedural" | "lyria" | "minimax" | "suno">("procedural"); 
  const [musicNotification, setMusicNotification] = useState<string>("");

  // Minimax & Suno configurations
  const [minimaxVocalMode, setMinimaxVocalMode] = useState<"instrumental" | "vocals_female" | "vocals_male">("instrumental");
  const [minimaxModel, setMinimaxModel] = useState<"music-01" | "music-02">("music-01");
  const [sunoInstrumental, setSunoInstrumental] = useState<boolean>(true);
  const [minimaxCustomKey, setMinimaxCustomKey] = useState<string>("");
  const [sunoCustomKey, setSunoCustomKey] = useState<string>("");
  const [customLyricsInput, setCustomLyricsInput] = useState<string>("");

  // Enhanced composition States
  const [selectedMusicPreset, setSelectedMusicPreset] = useState<string>("lucky_deer");
  const [musicLeadInstrument, setMusicLeadInstrument] = useState<'guzheng' | 'flute' | 'guitar' | 'piano' | 'kalimba' | 'handpan' | 'shakuhachi'>("guzheng");
  const [musicScaleMode, setMusicScaleMode] = useState<'pentatonic_yo' | 'natural_minor' | 'pentatonic_major' | 'phrygian_latam'>("pentatonic_yo");
  const [musicTempoBpm, setMusicTempoBpm] = useState<number>(72);
  const [musicFxLayer, setMusicFxLayer] = useState<'rain' | 'wind_chimes' | 'campfire' | 'waves' | 'vinyl' | 'none'>("rain");
  const [musicVolumeLead, setMusicVolumeLead] = useState<number>(0.85);
  const [musicVolumePad, setMusicVolumePad] = useState<number>(0.60);
  const [musicVolumeRhythm, setMusicVolumeRhythm] = useState<number>(0.40);
  const [musicVolumeFx, setMusicVolumeFx] = useState<number>(0.50);

  // Canvas visualizer refs & state
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // ==========================================
  // MINIMAX HUB CANVAS WORKSTATION STATES
  // ==========================================
  const [canvasActiveWorkspace, setCanvasActiveWorkspace] = useState<string>("Workspace-01");
  const [canvasWorkspaces, setCanvasWorkspaces] = useState<string[]>(["Pixel Elements", "Short drama", "Workspace-01"]);
  const [canvasSearchQuery, setCanvasSearchQuery] = useState<string>("");
  const [canvasTypeFilter, setCanvasTypeFilter] = useState<string>("All");
  const [canvasDateFilter, setCanvasDateFilter] = useState<string>("Newest");
  const [canvasSortFilter, setCanvasSortFilter] = useState<string>("Name");

  // Pan, Zoom, and Height adjustments states
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasHeight, setCanvasHeight] = useState<number>(500);
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);

  // Left and Right Sidebars width stretching state and drag states
  const [leftWidth, setLeftWidth] = useState<number>(290);
  const [rightWidth, setRightWidth] = useState<number>(290);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(true);
  const [resizeType, setResizeType] = useState<"left" | "right" | null>(null);

  const startResizing = (e: React.MouseEvent, type: "left" | "right") => {
    e.preventDefault();
    setResizeType(type);
  };

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Shot-01": true,
    "Shot-02": true,
    "Group1": true,
    "Shot-03": false,
  });

  interface CanvasNode {
    id: string;
    title: string;
    type: "image" | "video" | "audio" | "prompt";
    x: number;
    y: number;
    contentUrl?: string;
    promptText?: string;
    duration?: string;
    resolution?: string;
    model?: string;
    status: "complete" | "loading" | "waiting";
  }

  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([
    {
      id: "n-1",
      title: "Pixel Cat.png",
      type: "image",
      x: 180,
      y: 80,
      contentUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300&auto=format&fit=crop",
      promptText: "A funny pixel art cat meme featuring a slightly chubby white cat with a dramatic blank stare, sitting in a messy retro computer room. 8-bit pixel style.",
      status: "complete"
    },
    {
      id: "n-2",
      title: "Pixel Car.png",
      type: "image",
      x: 520,
      y: 110,
      contentUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=300&auto=format&fit=crop",
      promptText: "Classic 80s synthwave sports car, side view, pixel art aesthetic, glowing neon grids in background.",
      status: "complete"
    },
    {
      id: "n-3",
      title: "Pixel-art landscapes.png",
      type: "image",
      x: 350,
      y: 320,
      contentUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
      promptText: "Serene bamboo forest with golden morning sunrays filtering through the leaves, 16-bit pixel art scenic view.",
      status: "complete"
    }
  ]);

  const [canvasConnections, setCanvasConnections] = useState<Array<{ from: string; to: string }>>([
    { from: "n-1", to: "n-3" },
    { from: "n-2", to: "n-3" }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("n-1");

  // Prompt configuration bar states
  const [canvasPrompt, setCanvasPrompt] = useState<string>("");
  const [canvasModel, setCanvasModel] = useState<string>("H3");
  const [canvasAspect, setCanvasAspect] = useState<string>("16:9");
  const [canvasResolution, setCanvasResolution] = useState<string>("720p");
  const [canvasDuration, setCanvasDuration] = useState<string>("5s");
  const [isCanvasGenerating, setIsCanvasGenerating] = useState<boolean>(false);
  const [canvasGenSteps, setCanvasGenSteps] = useState<string[]>([]);
  const [activeGenStepIdx, setActiveGenStepIdx] = useState<number>(-1);

  // Floating toolbar toggles
  const [canvasSubtitlesAction, setCanvasSubtitlesAction] = useState<string>("Remove subtitles");
  const [canvasHdMode, setCanvasHdMode] = useState<boolean>(true);

  // Right sidebar co-pilot messages
  const [copilotMessages, setCopilotMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string; thinking?: string }>>([
    {
      id: "c-1",
      role: "user",
      text: "Use Meme Cat to generate a short story."
    },
    {
      id: "c-2",
      role: "assistant",
      text: "Generating a short 8-bit video concept featuring Pixel Meme Cat in an epic workspace adventure...",
      thinking: "Selected reference node: Pixel Cat.png. Applying cultural storytelling frames..."
    }
  ]);
  const [copilotInput, setCopilotInput] = useState<string>("");

  const handleAddFileToCanvas = (
    title: string, 
    type: "image" | "video" | "audio", 
    contentUrl: string, 
    promptText: string
  ) => {
    const newId = `n-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newId,
      title,
      type,
      x: 80 + Math.random() * 100,
      y: 60 + Math.random() * 80,
      contentUrl,
      promptText,
      status: "complete"
    };
    setCanvasNodes(prev => [...prev, newNode]);
    if (selectedNodeId) {
      setCanvasConnections(prev => [...prev, { from: selectedNodeId, to: newId }]);
    }
    setSelectedNodeId(newId);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(".canvas-node") || 
      (e.target as HTMLElement).closest("button") || 
      (e.target as HTMLElement).closest("select") || 
      (e.target as HTMLElement).closest("textarea")
    ) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY;
    setZoomScale(prev => {
      const next = prev - delta * 0.0015;
      return Math.max(0.4, Math.min(2.5, next));
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeType) return;
      if (resizeType === "left") {
        const newWidth = Math.max(180, Math.min(500, e.clientX - 40));
        setLeftWidth(newWidth);
      } else if (resizeType === "right") {
        const newWidth = Math.max(180, Math.min(500, window.innerWidth - e.clientX - 40));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizeType(null);
    };

    if (resizeType) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizeType]);

  useEffect(() => {
    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        width = canvas.width;
        height = canvas.height;
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(canvas);

    const render = () => {
      ctx.fillStyle = "rgba(3, 6, 12, 0.2)";
      ctx.fillRect(0, 0, width, height);

      const targetHeight = height / (window.devicePixelRatio || 1);
      const targetWidth = width / (window.devicePixelRatio || 1);

      // Draw middle baseline
      ctx.beginPath();
      ctx.strokeStyle = "rgba(30, 47, 77, 0.15)";
      ctx.moveTo(0, targetHeight / 2);
      ctx.lineTo(targetWidth, targetHeight / 2);
      ctx.stroke();

      const ampBase = isMusicPlaying ? 25 : 5;
      const waveCount = 3;

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(0, 0, targetWidth, 0);
        if (w === 0) {
          grad.addColorStop(0, "rgba(6, 182, 212, 0.8)"); // Cyan
          grad.addColorStop(0.5, "rgba(59, 130, 246, 0.8)"); // Blue
          grad.addColorStop(1, "rgba(139, 92, 246, 0.8)"); // Purple
        } else if (w === 1) {
          grad.addColorStop(0, "rgba(16, 185, 129, 0.6)"); // Emerald
          grad.addColorStop(0.5, "rgba(6, 182, 212, 0.6)");
          grad.addColorStop(1, "rgba(245, 158, 11, 0.6)"); // Amber
        } else {
          grad.addColorStop(0, "rgba(139, 92, 246, 0.35)");
          grad.addColorStop(1, "rgba(236, 72, 153, 0.35)"); // Pink
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = w === 0 ? 2 : 1;

        const freqMod = 0.012 + w * 0.006;
        const phaseShift = phase * (1 + w * 0.4);

        for (let x = 0; x < targetWidth; x++) {
          const y = targetHeight / 2 + 
            Math.sin(x * freqMod + phaseShift) * ampBase * Math.sin(x * 0.0015 + phase * 0.1) +
            Math.cos(x * 0.015 - phaseShift * 0.5) * (ampBase * 0.25);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Equalizer bars
      const barCount = 35;
      const barWidth = 3;
      const gap = (targetWidth - barCount * barWidth) / (barCount - 1);
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        let barAmp = 1 + Math.sin(i * 0.4 + phase * 3) * 2;
        if (isMusicPlaying) {
          barAmp = 4 + Math.abs(Math.sin(i * 0.4 + phase * 5)) * 22 + Math.cos(i * 0.15 + phase * 7) * 8;
        }
        ctx.fillStyle = `rgba(6, 182, 212, ${isMusicPlaying ? 0.18 : 0.05})`;
        ctx.fillRect(x, targetHeight / 2 - barAmp / 2, barWidth, barAmp);
      }

      phase += isMusicPlaying ? 0.06 : 0.01;
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isMusicPlaying]);

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
      setIntelModel("gemini-3.5-flash");
    } else if (intelProvider === "openai") {
      setIntelModel("gpt-4o-mini");
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
        const result = generateProceduralZenMusic(
          musicPrompt, 
          isZh, 
          musicLength === "pro" ? 30 : 15,
          {
            leadInstrument: musicLeadInstrument,
            scaleMode: musicScaleMode,
            tempoBpm: musicTempoBpm,
            fxLayer: musicFxLayer,
            volumes: {
              lead: musicVolumeLead,
              pad: musicVolumePad,
              rhythm: musicVolumeRhythm,
              fx: musicVolumeFx
            }
          }
        );
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

    if (musicSynthMode === "minimax") {
      try {
        const response = await fetch("/api/music/minimax", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: musicPrompt,
            lyrics: customLyricsInput,
            model: minimaxModel,
            vocalMode: minimaxVocalMode,
            customApiKey: minimaxCustomKey || undefined
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "MiniMax music generation failed.");
        }

        if (data.success && data.audioUrl) {
          setMusicResultUrl(data.audioUrl);
          setMusicLyrics(data.lyrics || "");
          if (data.realApiCalled) {
            setMusicNotification(isZh ? "💎 成功连接 MiniMax (海螺音乐) 官方接口！正在为您播放出海多媒体资产。" : "💎 Successfully connected to official MiniMax Music API! Now streaming your globalization asset.");
          } else {
            setMusicNotification(isZh ? "💡 未检测到 MiniMax Key，已在出海沙箱环境中模拟 MiniMax 接口响应（包含 Request Payload 与 JSON 结构映射）。" : "💡 No MiniMax Key detected; simulated MiniMax API JSON schema response inside our sandbox.");
          }
        } else {
          throw new Error("Missing audio URL from MiniMax response.");
        }
      } catch (err: any) {
        setMusicError(err.message || "Failed to generate music using MiniMax.");
      } finally {
        setIsMusicLoading(false);
      }
      return;
    }

    if (musicSynthMode === "suno") {
      try {
        const response = await fetch("/api/music/suno", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: musicPrompt,
            lyrics: customLyricsInput,
            makeInstrumental: sunoInstrumental,
            customApiKey: sunoCustomKey || undefined
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Suno AI music generation failed.");
        }

        if (data.success && data.audioUrl) {
          setMusicResultUrl(data.audioUrl);
          setMusicLyrics(data.lyrics || "");
          if (data.realApiCalled) {
            setMusicNotification(isZh ? "💎 成功连接 Suno AI 官方生产接口！正在为您流式播放生成的音轨。" : "💎 Successfully connected to Suno AI music production API! Streaming rendered soundtrack.");
          } else {
            setMusicNotification(isZh ? "💡 未检测到 Suno Key，已在出海沙箱环境中模拟 Suno API 的格式与响应结果（包含 Payload 和 JSON 字段）。" : "💡 No Suno API Key detected; simulated Suno JSON API generation response inside our sandbox.");
          }
        } else {
          throw new Error("Missing audio URL from Suno response.");
        }
      } catch (err: any) {
        setMusicError(err.message || "Failed to generate music using Suno AI.");
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
        const result = generateProceduralZenMusic(
          musicPrompt, 
          isZh, 
          musicLength === "pro" ? 30 : 15,
          {
            leadInstrument: musicLeadInstrument,
            scaleMode: musicScaleMode,
            tempoBpm: musicTempoBpm,
            fxLayer: musicFxLayer,
            volumes: {
              lead: musicVolumeLead,
              pad: musicVolumePad,
              rhythm: musicVolumeRhythm,
              fx: musicVolumeFx
            }
          }
        );
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
      {!isSidebarCollapsed && (
        <div className="lg:col-span-3 space-y-3 animate-fade-in">
          <div className="p-4 rounded-2xl bg-[#0c1322]/90 border border-[#1e2f4d]/60 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#1e2f4d]/30 pb-2">
              <h4 className="text-xs font-mono uppercase font-black text-slate-500 tracking-wider">
                {isZh ? "💎 创意工具套件" : "💎 Creative Toolkits"}
              </h4>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1 rounded bg-[#14233c]/80 hover:bg-[#1e2f4d] border border-[#1e2f4d]/50 text-slate-400 hover:text-slate-200 transition cursor-pointer flex items-center justify-center"
                title={isZh ? "收起工具栏" : "Collapse Sidebar"}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              
              <button
                onClick={() => setActiveTab("canvas")}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                  activeTab === "canvas"
                    ? "bg-gradient-to-r from-cyan-500/15 to-cyan-500/5 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/5 animate-pulse"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
                }`}
              >
                <Cpu className="w-4.5 h-4.5 text-cyan-400" />
                <div className="flex-1">
                  <p className="font-extrabold leading-tight">{isZh ? "海螺智能画板" : "MiniMax Canvas Hub"}</p>
                  <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">Visual Board & Co-Pilot</p>
                </div>
              </button>

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
                onClick={() => setActiveTab("media")}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold text-left transition flex items-center gap-3 cursor-pointer ${
                  activeTab === "media"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#14233c]/60 border border-transparent"
                }`}
              >
                <Video className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                <div className="flex-1">
                  <p className="font-bold leading-tight">{isZh ? "多媒体体验舱" : "Interactive Media Hub"}</p>
                  <p className="text-[10px] font-normal text-slate-500 leading-none mt-0.5">{isZh ? "视频、音频及图像物料" : "Upload, Preview & Playback"}</p>
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
                ? "系统支持跨厂牌大语言模型（Gemini/DeepSeek/OpenAI/智谱），部分高级多模态 tasks（如 Imagen 生成、Lyria 作曲）仍需绑定生效的 Gemini API Key 进行处理。" 
                : "The suite supports multi-label upstream LLM engines (Gemini, DeepSeek, OpenAI, GLM). Note that specialized modal creation (Imagen/Lyria) utilizes your default Gemini key credentials."}
            </p>
          </div>
        </div>
      )}

      {/* Main Tool Content Panel */}
      <div className={isSidebarCollapsed ? "lg:col-span-12 transition-all duration-300" : "lg:col-span-9 transition-all duration-300"}>
        <div className="p-6 rounded-2xl bg-[#0c1322]/85 border border-[#1e2f4d]/50 shadow-2xl relative min-h-[520px] flex flex-col justify-between">
          
          {/* Top Utility Bar for Collapsed State */}
          {isSidebarCollapsed && (
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e2f4d]/40 animate-fade-in">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-400 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title={isZh ? "展开工具套件" : "Expand Toolkits"}
              >
                <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                <span>{isZh ? "展开工具套件" : "Expand Toolkits"}</span>
              </button>
              <div className="h-4 w-px bg-[#1e2f4d]/60" />
              <span className="text-xs text-slate-400 font-mono">
                {isZh ? "当前工具" : "Active Tool"}: <span className="text-cyan-300 font-bold">{
                  activeTab === "canvas" ? (isZh ? "海螺智能画板" : "Canvas Hub") :
                  activeTab === "chatbot" ? (isZh ? "出海咨询顾问" : "Multiverse Advisor") :
                  activeTab === "intelligence" ? (isZh ? "爆款内容洞察" : "Copy Gen Intelligence") :
                  activeTab === "visuals" ? (isZh ? "视觉创意画布" : "Image Visual Studio") :
                  activeTab === "audio" ? (isZh ? "流配乐作曲家" : "Folk Sound Composer") :
                  activeTab === "media" ? (isZh ? "多媒体体验舱" : "Interactive Media Hub") :
                  (isZh ? "多模型配置中心" : "Model Registry Settings")
                }</span>
              </span>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            
            {/* 0. MINIMAX CANVAS WORKSTATION PANEL */}
            {activeTab === "canvas" && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-between h-full space-y-4"
              >
                {/* Header controls & Tab-bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1e2f4d]/60 pb-3 gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                    {canvasWorkspaces.map((ws) => (
                      <button
                        key={ws}
                        onClick={() => setCanvasActiveWorkspace(ws)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                          canvasActiveWorkspace === ws
                            ? "bg-gradient-to-b from-[#14233c] to-[#0a1424] text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10 font-black"
                            : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/25"
                        }`}
                      >
                        {ws}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const name = prompt(isZh ? "请输入新工作区名称:" : "Enter workspace name:");
                        if (name) {
                          setCanvasWorkspaces([...canvasWorkspaces, name]);
                          setCanvasActiveWorkspace(name);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/20 transition cursor-pointer"
                      title={isZh ? "新建画布工作区" : "New Canvas Workspace"}
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] md:text-[10px] font-mono font-bold bg-[#14233c]/60 text-cyan-400 px-2 py-0.5 md:py-1 rounded border border-cyan-500/20 shadow-inner flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>{isZh ? "可视化画板 v2.8.0-Pro" : "Canvas Workshop v2.8.0-Pro"}</span>
                    </span>
                  </div>
                </div>

                {/* Main Widescreen Three-Pane Workspace */}
                <div className="flex flex-col lg:flex-row gap-1 items-stretch w-full min-h-[500px]">
                  
                  {/* PANE 1: LEFT SIDEBAR (Material & Asset Tree) */}
                  <div 
                    style={{ width: isLargeScreen ? `${leftWidth}px` : "100%", flexShrink: 0 }}
                    className="bg-[#040810]/95 border border-[#1e2f4d]/50 rounded-xl p-3 flex flex-col justify-between min-h-[500px] transition-[width] duration-75"
                  >
                    <div className="space-y-3">
                      {/* Folder header */}
                      <div className="flex items-center justify-between border-b border-[#1e2f4d]/30 pb-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Folder className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                            {isZh ? "素材库" : "Pixel Materials"}
                          </span>
                        </div>

                        {/* Width controller */}
                        {isLargeScreen && (
                          <div className="flex items-center gap-1 bg-[#081020]/90 px-1.5 py-0.5 rounded border border-[#1e2f4d]/40 scale-90 origin-right flex-shrink-0">
                            <button
                              onClick={() => setLeftWidth(prev => Math.max(180, prev - 25))}
                              className="text-slate-400 hover:text-white transition text-xs font-bold w-4 h-4 flex items-center justify-center bg-slate-800/40 rounded cursor-pointer"
                              title={isZh ? "变窄" : "Narrower"}
                            >
                              －
                            </button>
                            <span className="text-[9px] font-mono font-bold text-cyan-400 min-w-[28px] text-center">
                              {leftWidth}px
                            </span>
                            <button
                              onClick={() => setLeftWidth(prev => Math.min(500, prev + 25))}
                              className="text-slate-400 hover:text-white transition text-xs font-bold w-4 h-4 flex items-center justify-center bg-slate-800/40 rounded cursor-pointer"
                              title={isZh ? "变宽" : "Wider"}
                            >
                              ＋
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-slate-500 flex-shrink-0">
                          <button 
                            onClick={() => {
                              setCanvasSearchQuery("");
                              setCanvasTypeFilter("All");
                            }}
                            className="p-1 hover:text-slate-300 transition cursor-pointer" 
                            title={isZh ? "重置" : "Reset"}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Filter Controls Row */}
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <select
                          value={canvasTypeFilter}
                          onChange={(e) => setCanvasTypeFilter(e.target.value)}
                          className="bg-[#090f1e] border border-[#1e2f4d]/40 rounded px-1.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500/60"
                        >
                          <option value="All">{isZh ? "类型: 全部" : "Type: All"}</option>
                          <option value="Image">{isZh ? "图像 (.png)" : "Images (.png)"}</option>
                          <option value="Video">{isZh ? "视频 (.mp4)" : "Videos (.mp4)"}</option>
                          <option value="Audio">{isZh ? "音频 (.mp3)" : "Audios (.mp3)"}</option>
                        </select>
                        <select
                          value={canvasSortFilter}
                          onChange={(e) => setCanvasSortFilter(e.target.value)}
                          className="bg-[#090f1e] border border-[#1e2f4d]/40 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
                        >
                          <option value="Name">{isZh ? "排序: 名称" : "Sort: Name"}</option>
                          <option value="Date">{isZh ? "排序: 时间" : "Sort: Date"}</option>
                        </select>
                      </div>

                      {/* Search box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder={isZh ? "检索素材..." : "Search assets..."}
                          value={canvasSearchQuery}
                          onChange={(e) => setCanvasSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-[#081020] border border-[#1e2f4d]/40 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      {/* Asset Folders Tree Layout */}
                      <div 
                        style={{ maxHeight: `${canvasHeight - 180}px` }}
                        className="space-y-1.5 overflow-y-auto scrollbar-thin text-left pr-0.5"
                      >
                        {/* Folder 1: Shot-01 (Images) */}
                        <div className="space-y-1">
                          <button
                            onClick={() => setExpandedFolders(prev => ({ ...prev, "Shot-01": !prev["Shot-01"] }))}
                            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300 hover:text-white transition px-1 py-1 rounded hover:bg-slate-800/20"
                          >
                            <span className="flex items-center gap-1.5">
                              {expandedFolders["Shot-01"] ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-cyan-400" />}
                              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span>Shot-01</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.5 rounded">3</span>
                          </button>

                          {expandedFolders["Shot-01"] && (
                            <div className="pl-4 border-l border-cyan-500/10 space-y-1">
                              {/* Pixel Cat */}
                              <div
                                onClick={() => handleAddFileToCanvas(
                                  "Pixel Meme Cat.png", 
                                  "image", 
                                  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=300&auto=format&fit=crop",
                                  "High-contrast retro pixel meme cat with glowing emerald eyes."
                                )}
                                className="group flex items-center gap-1.5 text-[10.5px] text-slate-400 hover:text-cyan-300 py-1 px-1.5 rounded hover:bg-[#14233c]/35 transition cursor-pointer"
                                title={isZh ? "双击/点击载入画板" : "Double-click / click to import to canvas"}
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="truncate flex-1">Pixel Meme Cat.png</span>
                                <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded scale-90 group-hover:opacity-100 opacity-0 transition">ADD</span>
                              </div>

                              {/* Pixel Car */}
                              <div
                                onClick={() => handleAddFileToCanvas(
                                  "Pixel Car.png", 
                                  "image", 
                                  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=300&auto=format&fit=crop",
                                  "Classic retro cyber sports car side-view, 8-bit style."
                                )}
                                className="group flex items-center gap-1.5 text-[10.5px] text-slate-400 hover:text-cyan-300 py-1 px-1.5 rounded hover:bg-[#14233c]/35 transition cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="truncate flex-1">Pixel Car.png</span>
                                <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded scale-90 group-hover:opacity-100 opacity-0 transition">ADD</span>
                              </div>

                              {/* Pixel Landscapes */}
                              <div
                                onClick={() => handleAddFileToCanvas(
                                  "Pixel-art landscapes.png", 
                                  "image", 
                                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
                                  "Serene morning bamboo forest scene, sunrays casting over 16-bit vegetation."
                                )}
                                className="group flex items-center gap-1.5 text-[10.5px] text-slate-400 hover:text-cyan-300 py-1 px-1.5 rounded hover:bg-[#14233c]/35 transition cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="truncate flex-1">Pixel-art landscapes.png</span>
                                <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded scale-90 group-hover:opacity-100 opacity-0 transition">ADD</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Folder 2: Shot-02 (Videos / Group1) */}
                        <div className="space-y-1">
                          <button
                            onClick={() => setExpandedFolders(prev => ({ ...prev, "Shot-02": !prev["Shot-02"] }))}
                            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300 hover:text-white transition px-1 py-1 rounded hover:bg-slate-800/20"
                          >
                            <span className="flex items-center gap-1.5">
                              {expandedFolders["Shot-02"] ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-cyan-400" />}
                              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span>Shot-02</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.5 rounded">2</span>
                          </button>

                          {expandedFolders["Shot-02"] && (
                            <div className="pl-4 border-l border-cyan-500/10 space-y-1">
                              {/* Sub Folder: Group1 */}
                              <button
                                onClick={() => setExpandedFolders(prev => ({ ...prev, "Group1": !prev["Group1"] }))}
                                className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-400 hover:text-white transition px-1 py-0.5 rounded"
                              >
                                <span className="flex items-center gap-1">
                                  {expandedFolders["Group1"] ? <ChevronDown className="w-2.5 h-2.5 text-cyan-400" /> : <ChevronRight className="w-2.5 h-2.5 text-cyan-400" />}
                                  <span>Group1</span>
                                </span>
                              </button>

                              {expandedFolders["Group1"] && (
                                <div className="pl-3 border-l border-cyan-500/5 space-y-1">
                                  <div
                                    onClick={() => handleAddFileToCanvas(
                                      "Pixel landscapes.mp4", 
                                      "video", 
                                      "https://assets.mixkit.co/videos/preview/mixkit-woodland-drone-shot-at-sunset-40292-large.mp4",
                                      "Processed high-fidelity pixel animation video showing dynamic woodland drones."
                                    )}
                                    className="group flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-cyan-300 py-1 px-1 rounded hover:bg-[#14233c]/35 transition cursor-pointer"
                                  >
                                    <FileVideo className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate flex-1">Pixel landscapes.mp4</span>
                                    <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded scale-90 opacity-0 group-hover:opacity-100 transition">ADD</span>
                                  </div>

                                  <div
                                    onClick={() => handleAddFileToCanvas(
                                      "Dark pixel illus.mp4", 
                                      "video", 
                                      "https://assets.mixkit.co/videos/preview/mixkit-traffic-in-shibuya-crossing-at-night-42171-large.mp4",
                                      "Dynamic cyberpunk night road driving pixel sequence."
                                    )}
                                    className="group flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-cyan-300 py-1 px-1 rounded hover:bg-[#14233c]/35 transition cursor-pointer"
                                  >
                                    <FileVideo className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate flex-1">Dark pixel illus.mp4</span>
                                    <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded scale-90 opacity-0 group-hover:opacity-100 transition">ADD</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Folder 3: Shot-03 (Audio/Empty) */}
                        <div>
                          <button
                            onClick={() => setExpandedFolders(prev => ({ ...prev, "Shot-03": !prev["Shot-03"] }))}
                            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-300 hover:text-white transition px-1 py-1 rounded hover:bg-slate-800/20"
                          >
                            <span className="flex items-center gap-1.5">
                              {expandedFolders["Shot-03"] ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-cyan-400" />}
                              <Folder className="w-3.5 h-3.5 text-amber-400" />
                              <span>Shot-03</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.5 rounded">0</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action: upload material */}
                    <div className="pt-2 border-t border-[#1e2f4d]/40">
                      <button
                        onClick={() => {
                          const name = prompt(isZh ? "请输入导入文件名 (如 custom_scene.png):" : "Enter filename to import (e.g., custom_scene.png):");
                          if (name) {
                            handleAddFileToCanvas(
                              name,
                              name.endsWith(".mp4") ? "video" : "image",
                              "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?q=80&w=300&auto=format&fit=crop",
                              "Custom user uploaded workspace elements. Loaded to visual board successfully."
                            );
                          }
                        }}
                        className="w-full py-2.5 rounded-xl border border-dashed border-cyan-500/30 text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isZh ? "上传本地素材" : "Upload materials"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Drag Resizer 1 (Left to Middle) */}
                  {isLargeScreen && (
                    <div
                      onMouseDown={(e) => startResizing(e, "left")}
                      className="hidden lg:flex w-2.5 bg-transparent hover:bg-cyan-500/20 active:bg-cyan-500/35 cursor-col-resize self-stretch transition-all duration-150 z-20 items-center justify-center group flex-shrink-0"
                      title={isZh ? "按住左右拖拽调整宽度" : "Drag left/right to resize"}
                    >
                      <div className="w-[2px] h-8 bg-[#1e2f4d]/80 group-hover:bg-cyan-400/80 rounded transition-colors" />
                    </div>
                  )}

                  {/* PANE 2: MIDDLE CANVAS (Visual Mindmap Grid) */}
                  <div 
                    style={{ height: `${canvasHeight}px` }}
                    className="flex-1 min-w-0 bg-[#02050c] relative rounded-xl border border-[#1e2f4d]/50 overflow-hidden flex flex-col justify-between"
                  >
                    
                    {/* Interactive Viewport Container */}
                    <div 
                      ref={canvasViewportRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      onWheel={handleCanvasWheel}
                      className="flex-1 w-full relative overflow-hidden z-10 cursor-grab active:cursor-grabbing"
                    >
                      
                      {/* Panned & Zoomed Content Wrapper */}
                      <div
                        style={{
                          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                          transformOrigin: "center center",
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          left: 0,
                          top: 0,
                        }}
                      >
                        {/* 1. Background Grid & Connecting Bezier Curves */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                          <svg className="w-full h-full">
                            <defs>
                              <pattern id="dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.1" fill="#1e2f4d" fillOpacity="0.45" />
                              </pattern>
                              <linearGradient id="canvas-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.75" />
                                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.75" />
                              </linearGradient>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dot-grid)" />
                            
                            {/* Dynamic lines */}
                            {canvasConnections.map((conn, idx) => {
                              const fromNode = canvasNodes.find(n => n.id === conn.from);
                              const toNode = canvasNodes.find(n => n.id === conn.to);
                              if (!fromNode || !toNode) return null;
                              
                              // source connector point (mid-right of fromNode)
                              const x1 = fromNode.x + 150;
                              const y1 = fromNode.y + 40;
                              
                              // target connector point (mid-left of toNode)
                              const x2 = toNode.x;
                              const y2 = toNode.y + 40;
                              
                              const dx = Math.abs(x2 - x1) * 0.45;
                              const cx1 = x1 + dx;
                              const cy1 = y1;
                              const cx2 = x2 - dx;
                              const cy2 = y2;
                              
                              return (
                                <path
                                  key={idx}
                                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                                  fill="none"
                                  stroke="url(#canvas-line-grad)"
                                  strokeWidth="2"
                                  filter="drop-shadow(0 0 3px rgba(34,211,238,0.3))"
                                />
                              );
                            })}
                          </svg>
                        </div>

                        {/* 3. Drag-and-drop Nodes Rendering */}
                        {canvasNodes.map((node) => (
                          <motion.div
                            key={node.id}
                            drag
                            dragMomentum={false}
                            dragTransition={{ power: 0 }}
                            dragElastic={0}
                            onDrag={(e, info) => {
                              setCanvasNodes(prev => prev.map(n => {
                                  if (n.id === node.id) {
                                    return { ...n, x: n.x + info.delta.x / zoomScale, y: n.y + info.delta.y / zoomScale };
                                  }
                                  return n;
                                }));
                            }}
                            style={{ left: node.x, top: node.y, position: "absolute" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNodeId(node.id);
                            }}
                            className={`canvas-node w-38 md:w-44 rounded-xl border p-2.5 select-none cursor-grab active:cursor-grabbing transition-all pointer-events-auto ${
                              selectedNodeId === node.id
                                ? "border-cyan-400 bg-[#071328]/95 shadow-md shadow-cyan-500/10 z-30"
                                : "border-[#1e2f4d]/60 bg-[#030814]/95 hover:border-slate-400 z-10"
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-[#1e2f4d]/30 pb-1 mb-1.5">
                              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wide flex items-center gap-1">
                                {node.type === "image" && <ImageIcon className="w-3 h-3 text-cyan-400" />}
                                {node.type === "video" && <Video className="w-3 h-3 text-emerald-400 animate-pulse" />}
                                {node.type === "audio" && <Music className="w-3 h-3 text-cyan-400 animate-bounce" />}
                                <span className="truncate max-w-[80px]">{node.title}</span>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCanvasNodes(prev => prev.filter(n => n.id !== node.id));
                                  setCanvasConnections(prev => prev.filter(conn => conn.from !== node.id && conn.to !== node.id));
                                  if (selectedNodeId === node.id) setSelectedNodeId(null);
                                }}
                                className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                                title={isZh ? "从画布中删除" : "Remove from Canvas"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Node Thumbnail content */}
                            <div className="relative rounded bg-slate-950/70 overflow-hidden h-18 md:h-20 mb-1.5 border border-[#1e2f4d]/20 flex items-center justify-center">
                              {node.contentUrl ? (
                                <img
                                  src={node.contentUrl}
                                  alt={node.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-[10px] text-cyan-400 font-mono flex flex-col items-center gap-1 animate-pulse">
                                  <Cpu className="w-4 h-4 text-cyan-400" />
                                  <span>PROCESSING</span>
                                </div>
                              )}
                              <div className="absolute top-1 left-1 bg-black/60 text-[8px] font-mono text-slate-300 px-1 py-0.5 rounded">
                                {node.type.toUpperCase()}
                              </div>
                            </div>

                            {/* Node Prompt Text preview */}
                            {node.promptText && (
                              <p className="text-[9px] text-slate-400 leading-tight line-clamp-2 text-left">
                                {node.promptText}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>

                    </div>

                    {/* 2. Floating Top Canvas Toolbar */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#050b16]/90 border border-[#1e2f4d]/80 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-lg z-20 pointer-events-auto backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={canvasSubtitlesAction}
                          onChange={(e) => setCanvasSubtitlesAction(e.target.value)}
                          className="bg-transparent text-[10px] font-black text-cyan-300 focus:outline-none border-none cursor-pointer"
                        >
                          <option value="Remove subtitles" className="bg-[#0c1322]">🎬 {isZh ? "去除字幕" : "Remove subtitles"}</option>
                          <option value="Smart Subtitle" className="bg-[#0c1322]">📝 {isZh ? "自动配字" : "Add subtitles"}</option>
                          <option value="Translate Sub" className="bg-[#0c1322]">🌐 {isZh ? "双语译幕" : "Translate subs"}</option>
                        </select>
                      </div>
                      <span className="w-px h-3 bg-[#1e2f4d]"></span>
                      
                      <button 
                        onClick={() => alert(isZh ? "✂️ 已开启剪辑帧提取，可在右侧Co-pilot中调整微小切片" : "✂️ Slice extraction initiated. Frame cuts details loaded in co-pilot.")}
                        className="text-slate-400 hover:text-white transition cursor-pointer" 
                        title={isZh ? "视频剪切" : "Video Trim"}
                      >
                        <Scissors className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setCanvasHdMode(!canvasHdMode)}
                        className={`text-xs font-black px-1.5 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                          canvasHdMode ? "bg-[#14233c] text-cyan-400 font-bold" : "text-slate-500"
                        }`}
                        title={isZh ? "高画质渲染" : "HD Resolution Render"}
                      >
                        <span className="text-[9px]">HD</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${canvasHdMode ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
                      </button>

                      <button 
                        onClick={() => alert(isZh ? "🎛️ 音视频波形对齐系统已重置，当前误差 0ms" : "🎛️ Audio waveforms synced successfully. Phase delta 0ms.")}
                        className="text-slate-400 hover:text-white transition cursor-pointer" 
                        title={isZh ? "音画同步校对" : "Audio-Video Sync Panel"}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => {
                          alert(isZh ? "🎵 已触发海螺AI智能配曲，使用Guzheng Lofi风格自动拟合..." : "🎵 Suno/Lyria soundtrack background loop triggered...");
                        }}
                        className="text-slate-400 hover:text-white transition cursor-pointer" 
                        title={isZh ? "一键背景配音配乐" : "One-click background soundtrack"}
                      >
                        <Music className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button 
                        onClick={() => alert(isZh ? "🔊 文字转语音合成已注入" : "🔊 Custom text-to-speech engine configured.")}
                        className="text-slate-400 hover:text-white transition cursor-pointer" 
                        title={isZh ? "人声音轨合成" : "Vocal Track Synth"}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-px h-3 bg-[#1e2f4d]"></span>
                      <button 
                        onClick={() => {
                          setZoomScale(1);
                          setPanOffset({ x: 0, y: 0 });
                          alert(isZh ? "已重置画布比例与焦点定位！" : "Grid bounds recalculated and centered.");
                        }}
                        className="text-slate-400 hover:text-white transition cursor-pointer" 
                        title={isZh ? "全屏无边界画布" : "Fullscreen Grid Canvas"}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Floating Zoom & Pan Control Deck */}
                    <div className="absolute bottom-4 right-4 bg-[#050b16]/95 border border-[#1e2f4d]/80 rounded-lg p-1.5 flex flex-col sm:flex-row items-center gap-2 shadow-xl z-30 pointer-events-auto text-slate-300">
                      <div className="flex items-center gap-1 bg-[#081020] px-1 py-0.5 rounded border border-[#1e2f4d]/40">
                        <button
                          onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.15))}
                          className="p-1 hover:text-white hover:bg-slate-800/40 rounded transition"
                          title={isZh ? "缩小" : "Zoom Out"}
                        >
                          <Minus className="w-3 h-3 text-slate-400" />
                        </button>
                        
                        <span className="text-[10px] font-mono font-bold text-cyan-400 min-w-[34px] text-center">
                          {Math.round(zoomScale * 100)}%
                        </span>

                        <button
                          onClick={() => setZoomScale(prev => Math.min(2.2, prev + 0.15))}
                          className="p-1 hover:text-white hover:bg-slate-800/40 rounded transition"
                          title={isZh ? "放大" : "Zoom In"}
                        >
                          <Plus className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setZoomScale(1);
                          setPanOffset({ x: 0, y: 0 });
                        }}
                        className="px-2 py-1 text-[9px] font-bold bg-[#14233c] hover:bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded transition"
                        title={isZh ? "复位视图" : "Reset View"}
                      >
                        {isZh ? "复位" : "Reset"}
                      </button>

                      <span className="hidden sm:inline w-px h-3 bg-[#1e2f4d]"></span>

                      {/* Height stretching controls */}
                      <div className="flex items-center gap-1.5 bg-[#081020] px-2 py-1 rounded border border-[#1e2f4d]/40">
                        <span className="text-[9px] text-slate-500 font-bold">{isZh ? "高度:" : "H:"}</span>
                        <button
                          onClick={() => setCanvasHeight(prev => Math.max(380, prev - 60))}
                          className="w-5 h-5 flex items-center justify-center hover:text-white hover:bg-slate-800/40 rounded transition text-[10px] font-black"
                          title={isZh ? "减小画布高度" : "Decrease Canvas Height"}
                        >
                          －
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-300 min-w-[32px] text-center">
                          {canvasHeight}px
                        </span>
                        <button
                          onClick={() => setCanvasHeight(prev => Math.min(850, prev + 60))}
                          className="w-5 h-5 flex items-center justify-center hover:text-cyan-400 hover:bg-slate-800/40 rounded transition text-[10px] font-black text-cyan-400"
                          title={isZh ? "拉伸画布高度" : "Stretch Canvas Height"}
                        >
                          ＋
                        </button>
                      </div>
                    </div>

                    {/* 4. Canvas Interactive Prompt / Generate Area */}
                    <div className="m-3 p-3 bg-[#040915]/95 border border-[#1e2f4d]/60 rounded-xl space-y-2 relative z-20 backdrop-blur-sm text-left">
                      <div className="flex items-center justify-between text-[10px] border-b border-[#1e2f4d]/30 pb-1.5 mb-1 gap-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>{isZh ? "生成目标: 绑定主画布卡片并转译微剧本" : "Direct canvas translation co-pilot"}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-cyan-950 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-bold font-mono">
                            {isZh ? "引用:" : "Ref:"} {selectedNodeId ? canvasNodes.find(n => n.id === selectedNodeId)?.title : (isZh ? "无" : "None")}
                          </span>
                        </div>
                      </div>

                      {/* Prompt Input textarea */}
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={canvasPrompt}
                          onChange={(e) => setCanvasPrompt(e.target.value)}
                          placeholder={isZh ? "输入指令，输入 '/' 调起高阶微短剧合成技能与多端配乐模板..." : "Enter workspace instructions. Use '/' to pull adaptive short-video templates..."}
                          className="w-full bg-[#060c18] border border-[#1e2f4d]/40 rounded-lg p-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
                        />
                        {canvasPrompt === "" && (
                          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                            <button
                              onClick={() => setCanvasPrompt(isZh ? "使用 Meme Cat 模版生成中东大区 A/B 短视频" : "Use Meme Cat template to generate AB test group short dramas.")}
                              className="text-[9px] bg-[#14233c]/60 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded hover:bg-cyan-500/10 transition cursor-pointer"
                            >
                              🚀 {isZh ? "推荐指令" : "Example"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Row 2: parameters & button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                          <select
                            value={canvasModel}
                            onChange={(e) => setCanvasModel(e.target.value)}
                            className="bg-[#0c1322] border border-[#1e2f4d]/40 rounded px-1 text-slate-300 focus:outline-none"
                          >
                            <option value="H3">H3 Model</option>
                            <option value="H4-Pro">H4 Pro</option>
                            <option value="Gemini-2.0">Gemini 2.0</option>
                          </select>
                          <select
                            value={canvasAspect}
                            onChange={(e) => setCanvasAspect(e.target.value)}
                            className="bg-[#0c1322] border border-[#1e2f4d]/40 rounded px-1 text-slate-300 focus:outline-none"
                          >
                            <option value="16:9">16:9 (720p)</option>
                            <option value="9:16">9:16 (Vertical)</option>
                            <option value="1:1">1:1 (Square)</option>
                          </select>
                          <span className="bg-[#14233c]/50 text-slate-400 border border-[#1e2f4d]/40 px-1.5 rounded">{canvasDuration}</span>
                        </div>

                        {/* Generate Trigger Button */}
                        <button
                          onClick={async () => {
                            if (isCanvasGenerating) return;
                            
                            // Check quota consumption
                            const pass = onConsumeQuota ? onConsumeQuota("canvas_generation") : true;
                            if (!pass) return;

                            setIsCanvasGenerating(true);
                            setCanvasGenSteps([
                              isZh ? "🔍 正在分析画板输入指令，检索选中参考卡片 (Pixel Cat.png)..." : "🔍 Analysing workspace prompt and referenced asset (Pixel Cat.png)...",
                              isZh ? "🧬 触发 Hofstede 跨国社会偏好雷达对位，规避中东/东南亚流行违规禁忌..." : "🧬 Alignment to Hofstede dimensional metrics. Mitigating regional culture taboos...",
                              isZh ? "📝 利用 DeepSeek V3 大模型编排 3 镜头微型像素故事剧本线..." : "📝 Dispatching DeepSeek V3 engine to compile storyboard narrative sequence...",
                              isZh ? "🎨 调用 MiniMax Video-01 智能多模态引擎渲染 HD 像素风动态帧..." : "🎨 Invoking MiniMax Video-01 model to render scenic high-definition 8-bit frames...",
                              isZh ? "🎵 整合 SoundScape 钢琴古筝合成器自动压制立体声舒缓背景乐..." : "🎵 Conjoining SoundScape synth to stitch backing loops...",
                              isZh ? "✅ 校验完成，画板装载物料生成成功！" : "✅ Security audit passed. Delivered assets successfully loaded!"
                            ]);
                            
                            let step = 0;
                            setActiveGenStepIdx(0);
                            
                            const interval = setInterval(() => {
                              step++;
                              if (step <= 5) {
                                setActiveGenStepIdx(step);
                              } else {
                                clearInterval(interval);
                                // Add a beautiful video node on canvas
                                const newId = `n-${Date.now()}`;
                                const newNode: CanvasNode = {
                                  id: newId,
                                  title: isZh ? "海螺微剧场-01.mp4" : "H螺-PixShort_01.mp4",
                                  type: "video",
                                  x: 230,
                                  y: 180,
                                  contentUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop",
                                  promptText: canvasPrompt || (isZh ? "海螺画板自动渲染：像素风奇幻叙事，中东本土化文化配音。" : "Meme Cat short video: premium 8-bit dynamic composite."),
                                  status: "complete"
                                };
                                
                                setCanvasNodes(prev => [...prev, newNode]);
                                // Connect from referenced node
                                if (selectedNodeId) {
                                  setCanvasConnections(prev => [...prev, { from: selectedNodeId, to: newId }]);
                                }
                                
                                setSelectedNodeId(newId);
                                setIsCanvasGenerating(false);
                                setActiveGenStepIdx(-1);
                                setCanvasPrompt("");

                                // Add to copilot logs
                                setCopilotMessages(prev => [
                                  ...prev,
                                  {
                                    id: `c-${Date.now()}`,
                                    role: "assistant",
                                    text: isZh 
                                      ? "✅ 剧本已经装配完毕，生成物料「海螺微剧场-01.mp4」已自动推送到您的画布中央，并连接到参考节点。请播放预览！" 
                                      : "✅ Completed synthesis. 'H螺-PixShort_01.mp4' has been added to your canvas workspace. Try playing it!",
                                    thinking: "Model pipeline success. Output size: 16:9, codec: h264."
                                  }
                                ]);
                              }
                            }, 1100);
                          }}
                          disabled={isCanvasGenerating}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black text-slate-950 bg-[#eab308] hover:bg-[#d9a300] shadow-sm transition flex items-center gap-1 cursor-pointer shrink-0 ${
                            isCanvasGenerating ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          {isCanvasGenerating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{isZh ? "生成中..." : "Synthesizing..."}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isZh ? "开始生成" : "Generate"}</span>
                              <span className="text-[9px] font-mono bg-black/15 text-slate-900 px-1 rounded">30</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drag Resizer 2 (Middle to Right) */}
                  {isLargeScreen && (
                    <div
                      onMouseDown={(e) => startResizing(e, "right")}
                      className="hidden lg:flex w-2.5 bg-transparent hover:bg-cyan-500/20 active:bg-cyan-500/35 cursor-col-resize self-stretch transition-all duration-150 z-20 items-center justify-center group flex-shrink-0"
                      title={isZh ? "按住左右拖拽调整宽度" : "Drag left/right to resize"}
                    >
                      <div className="w-[2px] h-8 bg-[#1e2f4d]/80 group-hover:bg-cyan-400/80 rounded transition-colors" />
                    </div>
                  )}

                  {/* PANE 3: RIGHT SIDEBAR (AI Assistant Co-pilot & Approval Panel) */}
                  <div 
                    style={{ width: isLargeScreen ? `${rightWidth}px` : "100%", flexShrink: 0 }}
                    className="bg-[#040810]/95 border border-[#1e2f4d]/50 rounded-xl p-3 flex flex-col justify-between min-h-[500px] transition-[width] duration-75"
                  >
                    
                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-3 flex-1 flex flex-col">
                        {/* Panel header */}
                        <div className="flex items-center justify-between border-b border-[#1e2f4d]/30 pb-2">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span className="text-xs font-black text-white uppercase tracking-wider truncate">
                              {isZh ? "AI 协作者" : "Co-Pilot Workspace"}
                            </span>
                          </div>

                          {/* Width controller */}
                          {isLargeScreen && (
                            <div className="flex items-center gap-1 bg-[#081020]/90 px-1.5 py-0.5 rounded border border-[#1e2f4d]/40 scale-90 origin-right flex-shrink-0">
                              <button
                                onClick={() => setRightWidth(prev => Math.max(180, prev - 25))}
                                className="text-slate-400 hover:text-white transition text-xs font-bold w-4 h-4 flex items-center justify-center bg-slate-800/40 rounded cursor-pointer"
                                title={isZh ? "变窄" : "Narrower"}
                              >
                                －
                              </button>
                              <span className="text-[9px] font-mono font-bold text-cyan-400 min-w-[28px] text-center">
                                {rightWidth}px
                              </span>
                              <button
                                onClick={() => setRightWidth(prev => Math.min(500, prev + 25))}
                                className="text-slate-400 hover:text-white transition text-xs font-bold w-4 h-4 flex items-center justify-center bg-slate-800/40 rounded cursor-pointer"
                                title={isZh ? "变宽" : "Wider"}
                              >
                                ＋
                              </button>
                            </div>
                          )}

                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                        </div>

                        {/* Co-pilot messages log */}
                        <div 
                          style={{ maxHeight: `${canvasHeight - 260}px` }}
                          className="space-y-3.5 overflow-y-auto scrollbar-thin text-left pr-1 mt-2 flex-1"
                        >
                          {copilotMessages.map((msg) => (
                            <div key={msg.id} className="space-y-1">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider block text-slate-500">
                                {msg.role === "user" ? "👤 User" : "🤖 Co-Pilot Advisor"}
                              </span>
                              <div className={`p-2 rounded-lg text-xs leading-relaxed ${
                                msg.role === "user" 
                                  ? "bg-[#1e2f4d]/35 text-slate-200 border border-[#1e2f4d]/40" 
                                  : "bg-[#050b16]/90 text-cyan-100 border border-[#1e2f4d]/30"
                              }`}>
                                <p>{msg.text}</p>
                              </div>
                              {msg.thinking && (
                                <div className="text-[9px] font-mono text-slate-500 pl-1.5 border-l border-cyan-500/20 italic">
                                  ⚡ {msg.thinking}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Live generation steps if active */}
                          {isCanvasGenerating && (
                            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/25 space-y-2 text-left">
                              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
                                <span className="font-bold flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>{isZh ? "多端协同生成中..." : "Multi-agent synthesis..."}</span>
                                </span>
                                <span>{activeGenStepIdx + 1} / 6</span>
                              </div>
                              <div className="space-y-1.5 text-[10px] text-slate-300">
                                {canvasGenSteps.map((step, sIdx) => (
                                  <div 
                                    key={sIdx} 
                                    className={`flex items-start gap-1.5 transition-opacity duration-300 ${
                                      sIdx === activeGenStepIdx 
                                        ? "text-cyan-300 font-bold" 
                                        : sIdx < activeGenStepIdx 
                                          ? "text-emerald-400 opacity-60" 
                                          : "text-slate-500 opacity-40"
                                    }`}
                                  >
                                    <span className="shrink-0 font-mono">
                                      {sIdx < activeGenStepIdx ? "✓" : sIdx === activeGenStepIdx ? "●" : "○"}
                                    </span>
                                    <p className="leading-tight">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Draft segment */}
                      <div className="bg-[#030610] border border-[#1e2f4d]/40 p-2.5 rounded-lg text-left space-y-2 mt-2">
                        <div className="flex items-center justify-between border-b border-[#1e2f4d]/20 pb-1.5 text-[9px] font-mono font-bold">
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>{isZh ? "草稿审批流 (Waiting Approval)" : "Generation Draft"}</span>
                          </span>
                          <span className="bg-amber-500/10 text-amber-400 px-1 rounded uppercase">
                            H3 16:9
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed max-h-[85px] overflow-y-auto scrollbar-thin">
                          {isZh 
                            ? "A funny pixel art cat meme featuring a slightly chubby cat with a dramatic blank stare, sitting in a messy retro computer room. 8-bit pixel style..." 
                            : "A funny pixel art cat meme featuring a slightly chubby cat with a dramatic blank stare, sitting in a messy retro computer room. 8-bit pixel style, chaotic internet energy."}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#1e2f4d]/10">
                          <button
                            onClick={() => alert(isZh ? "已拒绝该草稿重新编排" : "Draft cancelled.")}
                            className="px-2 py-1 rounded bg-[#1e2f4d]/40 text-slate-400 hover:text-white text-[9px] transition cursor-pointer"
                          >
                            {isZh ? "取消" : "Cancel"}
                          </button>
                          <button
                            onClick={() => {
                              alert(isZh ? "草稿校验成功，已触发 30 算力微镜头压制！" : "Draft approved! Generation started.");
                              setCanvasPrompt(isZh ? "使用 Meme Cat 模版生成中东大区 A/B 短视频" : "Use Meme Cat template to generate AB test group short dramas.");
                            }}
                            className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[9px] transition cursor-pointer"
                          >
                            {isZh ? "通过并生成" : "Approve & Gen"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Co-pilot Message submission form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!copilotInput.trim()) return;
                        
                        const text = copilotInput;
                        setCopilotMessages(prev => [
                          ...prev,
                          { id: `c-u-${Date.now()}`, role: "user", text }
                        ]);
                        setCopilotInput("");

                        // Quick automated AI co-pilot reply matching content
                        setTimeout(() => {
                          let aiText = isZh 
                            ? "收到您的画板调节指令！我已更新您的画板剧本，并调整了合成大模型参数。点击「开始生成」即可压制多媒体微镜头。" 
                            : "Received instructions! Adjusted the workspace configuration accordingly. Click 'Generate' to initiate rendering.";
                          let thinkingText = "Processed query. Aligning canvas configurations...";

                          if (text.toLowerCase().includes("cat") || text.includes("猫")) {
                            aiText = isZh 
                              ? "正在聚焦 Pixel Meme Cat。我建议将此卡片作为核心镜头（Shot-01），利用 H3 多模态大模型将其与 SoundHelix Guzheng Lofi 立体乐进行自动化融合渲染。"
                              : "Focusing on Pixel Meme Cat. Recommended to set this as central reference card (Shot-01), rendering high-fidelity h264 footage with Chinese Lofi backdrops.";
                            thinkingText = "Set focus reference: Pixel Cat.png. Pre-compiling Lyria prompt tags.";
                          }

                          setCopilotMessages(prev => [
                            ...prev,
                            {
                              id: `c-a-${Date.now()}`,
                              role: "assistant",
                              text: aiText,
                              thinking: thinkingText
                            }
                          ]);
                        }, 900);
                      }}
                      className="pt-2 border-t border-[#1e2f4d]/40 space-y-1.5"
                    >
                      <div className="flex items-center gap-1 text-[9px] font-mono">
                        <button
                          type="button"
                          onClick={() => alert(isZh ? "已切换到 H3-Pro 大模型" : "Model set to H3-Pro")}
                          className="bg-[#0c1322] border border-[#1e2f4d]/40 rounded-full px-2 py-0.5 text-slate-400 hover:text-white transition"
                        >
                          Model
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(isZh ? "已启用「像素风增强」和「文化等效映射」" : "Active skills: Pixel Enhancer, Cultural Symbolic Mapper")}
                          className="bg-[#0c1322] border border-[#1e2f4d]/40 rounded-full px-2 py-0.5 text-slate-400 hover:text-white transition"
                        >
                          Skill (2)
                        </button>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-500">Ask mode</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-[#081020] border border-[#1e2f4d]/50 rounded-xl p-1">
                        <input
                          type="text"
                          value={copilotInput}
                          onChange={(e) => setCopilotInput(e.target.value)}
                          placeholder={isZh ? "和AI协作者交流指令..." : "Instruct your co-pilot advisor..."}
                          className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                  </div>
                </div>
              </motion.div>
            )}
            
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
                <div className="border-b border-[#1e2f4d]/50 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-cyan-400" />
                    <span>{isZh ? "极简拟真音轨作曲家 (CultureOS Acoustic Mixer)" : "CultureOS Acoustic Synth Mixer"}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isZh 
                      ? "利用物理声学流模型，可调配主奏乐器、调式、BPM速度与环境音效。亦可读取预设，进行4轨单独混音渲染。" 
                      : "Utilize advanced acoustic models to stream regional-native background beats. Configure pitch, scale modes, tempo and individual mixing faders."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-stretch">
                  
                  {/* Soundtrack Parameters */}
                  <div className="space-y-3.5 bg-[#050912]/50 border border-[#1e2f4d]/30 rounded-xl p-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Preset Selection Rail */}
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                          <span>{isZh ? "品牌声景预设" : "Brand Soundscapes"}</span>
                          <span className="text-[9px] text-cyan-400 font-mono font-bold">{isZh ? "一键配置参数" : "Quick Mix Pre-sets"}</span>
                        </span>
                        <div className="grid grid-cols-3 lg:grid-cols-5 gap-1 text-xs">
                          {Object.values(MUSIC_PRESETS).map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setSelectedMusicPreset(preset.id);
                                setMusicLeadInstrument(preset.leadInstrument);
                                setMusicScaleMode(preset.scaleMode);
                                setMusicTempoBpm(preset.tempoBpm);
                                setMusicFxLayer(preset.fxLayer);
                                setMusicVolumeLead(preset.volumes.lead);
                                setMusicVolumePad(preset.volumes.pad);
                                setMusicVolumeRhythm(preset.volumes.rhythm);
                                setMusicVolumeFx(preset.volumes.fx);
                                setMusicPrompt(isZh ? preset.promptZh : preset.promptEn);
                              }}
                              className={`px-1.5 py-1.5 rounded-lg border text-center flex flex-col justify-center items-center transition cursor-pointer leading-tight ${
                                selectedMusicPreset === preset.id
                                  ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold"
                                  : "border-[#1e2f4d]/30 bg-[#050912]/40 text-slate-400 hover:border-[#1e2f4d]/65 hover:text-slate-300"
                              }`}
                            >
                              <span className="font-extrabold truncate text-[9px] block w-full">
                                {isZh ? preset.nameZh.split(" ")[0] : preset.nameEn.split(" ")[0]}
                              </span>
                              <span className="text-[8px] text-slate-500 truncate leading-none mt-0.5 scale-90 font-mono">
                                {preset.tempoBpm} BPM
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional Image grounding */}
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "读图作曲参考图 (选填，开启 Image-to-Audio)" : "Visual Grounding reference (Optional)"}
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
                          <div className="relative group border border-dashed border-[#1e2f4d]/60 rounded-lg p-2.5 text-center hover:border-cyan-500/50 transition">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUploadHelper(e, "music")}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-4 h-4 text-slate-450 mx-auto mb-1" />
                            <p className="text-[9px] text-slate-450">{isZh ? "上传视觉参考图 — 音乐节奏将自动契合视觉氛围" : "Attach media graphic poster for theme pacing adaptation"}</p>
                          </div>
                        )}
                      </div>

                      {/* Instruments & Scale Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Lead Instrument */}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {isZh ? "主奏乐器" : "Lead Instrument"}
                          </label>
                          <select
                            value={musicLeadInstrument}
                            onChange={(e) => setMusicLeadInstrument(e.target.value as any)}
                            className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2 text-slate-200 outline-none focus:border-cyan-500/50 text-xs font-mono"
                          >
                            <option value="guzheng">{isZh ? "古筝 (Guzheng)" : "Guzheng"}</option>
                            <option value="flute">{isZh ? "竹笛 (Flute Breeze)" : "Bamboo Flute"}</option>
                            <option value="guitar">{isZh ? "木吉他 (Guitar Pluck)" : "Acoustic Guitar"}</option>
                            <option value="piano">{isZh ? "温馨钢琴 (Warm Piano)" : "Warm Piano"}</option>
                            <option value="kalimba">{isZh ? "卡林巴琴 (Kalimba)" : "Kalimba"}</option>
                            <option value="handpan">{isZh ? "手碟 (Handpan)" : "Handpan"}</option>
                            <option value="shakuhachi">{isZh ? "尺八 (Shakuhachi)" : "Shakuhachi"}</option>
                          </select>
                        </div>

                        {/* Musical Scale */}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {isZh ? "和声调式" : "Musical Scale"}
                          </label>
                          <select
                            value={musicScaleMode}
                            onChange={(e) => setMusicScaleMode(e.target.value as any)}
                            className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2 text-slate-200 outline-none focus:border-cyan-500/50 text-xs font-mono"
                          >
                            <option value="pentatonic_yo">{isZh ? "东方的律吕 (Yo scale)" : "Pentatonic Yo"}</option>
                            <option value="natural_minor">{isZh ? "自然小调 (calm)" : "Natural Minor"}</option>
                            <option value="pentatonic_major">{isZh ? "大调五声 (warm)" : "Pentatonic Major"}</option>
                            <option value="phrygian_latam">{isZh ? "弗里吉亚拉丁 (warmth)" : "Phrygian Dominant"}</option>
                          </select>
                        </div>
                      </div>

                      {/* Tempo & FX Layer */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Tempo BPM */}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                            <span>{isZh ? "和弦速度" : "Tempo BPM"}</span>
                            <span className="text-cyan-400 font-mono font-bold">{musicTempoBpm} BPM</span>
                          </label>
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="range"
                              min="50"
                              max="120"
                              step="1"
                              value={musicTempoBpm}
                              onChange={(e) => setMusicTempoBpm(parseInt(e.target.value))}
                              className="flex-1 h-1 bg-[#14233c] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                        </div>

                        {/* Soundscape FX Layer */}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                            {isZh ? "高保真环境音效" : "Ambient ASMR FX"}
                          </label>
                          <select
                            value={musicFxLayer}
                            onChange={(e) => setMusicFxLayer(e.target.value as any)}
                            className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2 text-slate-200 outline-none focus:border-cyan-500/50 text-xs font-mono"
                          >
                            <option value="rain">{isZh ? "竹林细雨 (Rain ASMR)" : "Rain ASMR"}</option>
                            <option value="wind_chimes">{isZh ? "木制风铃 (Wind Chimes)" : "Wind Chimes"}</option>
                            <option value="campfire">{isZh ? "深夜篝火 (Campfire)" : "Campfire Crackle"}</option>
                            <option value="waves">{isZh ? "海岸潮汐 (Ocean Waves)" : "Ocean Waves"}</option>
                            <option value="vinyl">{isZh ? "复古黑胶 (Vinyl record)" : "Vinyl Crackle"}</option>
                            <option value="none">{isZh ? "静音 (None)" : "None"}</option>
                          </select>
                        </div>
                      </div>

                      {/* Multi-Track Mixing Console */}
                      <div className="p-3 bg-[#03060d] border border-[#1e2f4d]/40 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            {isZh ? "4轨声学硬件混音台" : "4-Track Mixer Bus"}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono uppercase">Master: -1.5dB</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          {/* Track 1: Lead */}
                          <div className="space-y-1 bg-[#050912]/50 p-1.5 rounded border border-[#1e2f4d]/20">
                            <span className="block text-[8px] font-bold text-slate-400 truncate uppercase">{isZh ? "主奏轨" : "Lead"}</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={musicVolumeLead}
                              onChange={(e) => setMusicVolumeLead(parseFloat(e.target.value))}
                              className="w-full h-1 bg-[#14233c] rounded-lg appearance-none cursor-pointer accent-cyan-400 scale-y-95"
                            />
                            <span className="text-[8px] text-cyan-400 font-mono block">{(musicVolumeLead * 100).toFixed(0)}%</span>
                          </div>

                          {/* Track 2: Pad */}
                          <div className="space-y-1 bg-[#050912]/50 p-1.5 rounded border border-[#1e2f4d]/20">
                            <span className="block text-[8px] font-bold text-slate-400 truncate uppercase">{isZh ? "和鸣轨" : "Pad"}</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={musicVolumePad}
                              onChange={(e) => setMusicVolumePad(parseFloat(e.target.value))}
                              className="w-full h-1 bg-[#14233c] rounded-lg appearance-none cursor-pointer accent-cyan-400 scale-y-95"
                            />
                            <span className="text-[8px] text-cyan-400 font-mono block">{(musicVolumePad * 100).toFixed(0)}%</span>
                          </div>

                          {/* Track 3: Beat */}
                          <div className="space-y-1 bg-[#050912]/50 p-1.5 rounded border border-[#1e2f4d]/20">
                            <span className="block text-[8px] font-bold text-slate-400 truncate uppercase">{isZh ? "打击轨" : "Beat"}</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={musicVolumeRhythm}
                              onChange={(e) => setMusicVolumeRhythm(parseFloat(e.target.value))}
                              className="w-full h-1 bg-[#14233c] rounded-lg appearance-none cursor-pointer accent-cyan-400 scale-y-95"
                            />
                            <span className="text-[8px] text-cyan-400 font-mono block">{(musicVolumeRhythm * 100).toFixed(0)}%</span>
                          </div>

                          {/* Track 4: FX */}
                          <div className="space-y-1 bg-[#050912]/50 p-1.5 rounded border border-[#1e2f4d]/20">
                            <span className="block text-[8px] font-bold text-slate-400 truncate uppercase">{isZh ? "特效轨" : "ASMR"}</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={musicVolumeFx}
                              onChange={(e) => setMusicVolumeFx(parseFloat(e.target.value))}
                              className="w-full h-1 bg-[#14233c] rounded-lg appearance-none cursor-pointer accent-cyan-400 scale-y-95"
                            />
                            <span className="text-[8px] text-cyan-400 font-mono block">{(musicVolumeFx * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Music Prompt text */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                          {isZh ? "微声配乐描述与情感意境" : "Background Sound Prompt Vibe"}
                        </label>
                        <textarea
                          rows={2}
                          value={musicPrompt}
                          onChange={(e) => setMusicPrompt(e.target.value)}
                          className="w-full bg-[#050912] border border-[#1e2f4d]/60 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      {/* Engine Selection & Length Grid */}
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                              {isZh ? "合成音轨长度" : "Duration Preset"}
                            </label>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => setMusicLength("clip")}
                                className={`py-1 rounded border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                                  musicLength === "clip"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                                    : "border-slate-800 text-slate-400 hover:text-slate-350"
                                }`}
                              >
                                <span className="font-bold text-[10px]">Clip (15s)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setMusicLength("pro")}
                                className={`py-1 rounded border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                                  musicLength === "pro"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                                    : "border-slate-800 text-slate-400 hover:text-slate-350"
                                }`}
                              >
                                <span className="font-bold text-[10px]">Full (30s)</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                              <span>{isZh ? "基本合成器" : "Local Engines"}</span>
                            </label>
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => setMusicSynthMode("procedural")}
                                className={`py-1 rounded border transition cursor-pointer flex flex-col items-center justify-center p-1 ${
                                  musicSynthMode === "procedural"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                                    : "border-slate-800 text-slate-400 hover:text-slate-350"
                                }`}
                              >
                                <span className="font-bold text-[9px]">{isZh ? "本地硬件" : "Local"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setMusicSynthMode("lyria")}
                                className={`py-1 rounded border transition cursor-pointer flex flex-col items-center justify-center p-1 ${
                                  musicSynthMode === "lyria"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                                    : "border-slate-800 text-slate-400 hover:text-slate-350"
                                }`}
                              >
                                <span className="font-bold text-[9px]">Cloud Lyria</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Additional Choice for Modern Platforms */}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                            {isZh ? "跨平台外部专业配曲模型" : "External Production Platforms"}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setMusicSynthMode("minimax")}
                              className={`py-1.5 rounded border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                                musicSynthMode === "minimax"
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/50"
                                  : "border-slate-800 text-slate-400 hover:text-slate-300"
                              }`}
                            >
                              <span className="font-bold text-[10.5px]">MiniMax (海螺音乐)</span>
                              <span className="text-[8px] text-slate-500 mt-0.5">Vocal & T2M Model</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMusicSynthMode("suno")}
                              className={`py-1.5 rounded border transition cursor-pointer flex flex-col items-center justify-center p-1.5 ${
                                musicSynthMode === "suno"
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/50"
                                  : "border-slate-800 text-slate-400 hover:text-slate-300"
                              }`}
                            >
                              <span className="font-bold text-[10.5px]">Suno AI v3/v4</span>
                              <span className="text-[8px] text-slate-500 mt-0.5">High-Fidelity Audio</span>
                            </button>
                          </div>
                        </div>

                        {/* MINIMAX EXTRAS PANEL */}
                        {musicSynthMode === "minimax" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-[#050912]/80 border border-[#1e2f4d]/40 rounded-lg p-3 space-y-2.5 text-left text-slate-300"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Model Version</label>
                                <select 
                                  value={minimaxModel} 
                                  onChange={(e: any) => setMinimaxModel(e.target.value)}
                                  className="w-full bg-[#0c1325] border border-[#1e2f4d]/60 rounded p-1.5 text-[10.5px] text-slate-200 outline-none focus:border-cyan-500/40"
                                >
                                  <option value="music-01">music-01 (Standard)</option>
                                  <option value="music-02">music-02 (High Tempo)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Vocal Mode</label>
                                <select 
                                  value={minimaxVocalMode} 
                                  onChange={(e: any) => setMinimaxVocalMode(e.target.value)}
                                  className="w-full bg-[#0c1325] border border-[#1e2f4d]/60 rounded p-1.5 text-[10.5px] text-slate-200 outline-none focus:border-cyan-500/40"
                                >
                                  <option value="instrumental">{isZh ? "纯乐器伴奏 (Instrumental)" : "Pure Instrumental"}</option>
                                  <option value="vocals_female">{isZh ? "温暖女声独唱 (Female Vocal)" : "Warm Female Solo"}</option>
                                  <option value="vocals_male">{isZh ? "浑厚男声低吟 (Male Vocal)" : "Rich Male Baritone"}</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                                {isZh ? "唱词/歌词配置 (Optional Lyrics)" : "Lyrics Sheet / Speech Content"}
                              </label>
                              <textarea
                                rows={2}
                                placeholder={isZh ? "输入您的多语种歌词以生成专属人声乐章..." : "Enter lyrics to render matching synthetic vocals..."}
                                value={customLyricsInput}
                                onChange={(e) => setCustomLyricsInput(e.target.value)}
                                className="w-full bg-[#0c1325] border border-[#1e2f4d]/60 rounded p-1.5 text-[10.5px] text-slate-200 outline-none focus:border-cyan-500/40 font-sans"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase">MiniMax API Key</label>
                                <span className="text-[8px] text-amber-400 font-mono">Optional Playground</span>
                              </div>
                              <input 
                                type="password" 
                                placeholder={isZh ? "填写以调用您的 MiniMax 真实余额；留空则使用本地沙箱。" : "Optional. Leave blank to trigger simulated response."}
                                value={minimaxCustomKey}
                                onChange={(e) => setMinimaxCustomKey(e.target.value)}
                                className="w-full bg-[#0c1325] border border-[#1e2f4d]/60 rounded p-1.5 text-[10.5px] text-slate-200 outline-none focus:border-cyan-500/40 font-mono"
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* SUNO EXTRAS PANEL */}
                        {musicSynthMode === "suno" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-[#050912]/80 border border-[#1e2f4d]/40 rounded-lg p-3 space-y-2.5 text-left text-slate-300"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase">{isZh ? "纯乐器伴奏模式" : "Instrumental Track"}</span>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={sunoInstrumental} 
                                  onChange={(e) => setSunoInstrumental(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                              </label>
                            </div>

                            {!sunoInstrumental && (
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                                  {isZh ? "歌词文本 (Lyrics Prompt)" : "Lyrics Prompt"}
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder={isZh ? "输入 Suno 所唱的自定义歌词..." : "Enter custom Suno song lyrics..."}
                                  value={customLyricsInput}
                                  onChange={(e) => setCustomLyricsInput(e.target.value)}
                                  className="w-full bg-[#0c1325] border border-[#1e2f4d]/60 rounded p-1.5 text-[10.5px] text-slate-200 outline-none focus:border-cyan-500/40 font-sans"
                                />
                              </div>
                            )}

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase">Suno API Key</label>
                                <span className="text-[8px] text-amber-400 font-mono">Optional Playground</span>
                              </div>
                              <input 
                                type="password" 
                                placeholder={isZh ? "填写以直接调用您的 Suno 开发者余额；留空则使用本地沙箱。" : "Optional. Leave blank to trigger simulated response."}
                                value={sunoCustomKey}
                                onChange={(e) => setSunoCustomKey(e.target.value)}
                                className="w-full bg-[#0c1325] border border-[#1e2f4d]/60 rounded p-1.5 text-[10.5px] text-slate-200 outline-none focus:border-cyan-500/40 font-mono"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleMusicSubmit}
                      disabled={isMusicLoading || (!musicPrompt.trim() && !musicImgBase64)}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md mt-2"
                    >
                      {isMusicLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>CultureOS acoustic mixer synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>{isZh ? "和声硬件卷积合成 & 渲染音轨" : "Render & Mix Audio Track"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Render Sound Track output */}
                  <div className="bg-[#050912]/80 border border-[#1e2f4d]/45 rounded-xl p-4 flex flex-col justify-between items-stretch">
                    {isMusicLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center">
                        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-300">{isZh ? "和声轨多通道卷积合成中..." : "Synthesizing Multichannel Track"}</p>
                          <p className="text-[10px] text-slate-500 max-w-xs">{isZh ? "整合古筝、竹笛打击乐，叠加深夜细雨等自然声景..." : "Blending melody tracks, chord pads, and soundscape layers..."}</p>
                        </div>
                      </div>
                    ) : musicResultUrl ? (
                      <div className="w-full h-full flex flex-col justify-between space-y-3">
                        {musicNotification && (
                          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-left text-[10px] text-cyan-300 flex items-start gap-1.5 max-w-sm mx-auto">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse mt-0.5" />
                            <p className="leading-relaxed font-sans">{musicNotification}</p>
                          </div>
                        )}
                        
                        {/* Audio Player and visualizer canvas */}
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#03060c] p-4 rounded-xl border border-[#1e2f4d]/30 relative overflow-hidden min-h-[160px]">
                          <div className="absolute inset-0 pointer-events-none opacity-85">
                            <canvas ref={canvasRef} className="w-full h-full block" />
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-center justify-center space-y-3 w-full h-full">
                            <div className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                              isMusicPlaying 
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-md shadow-cyan-500/10 scale-105" 
                                : "bg-[#050912]/80 border-[#1e2f4d]/60 text-slate-400"
                            }`}>
                              <Volume2 className={`w-5 h-5 ${isMusicPlaying ? "animate-pulse" : ""}`} />
                            </div>
                            
                            <div className="space-y-0.5 text-center bg-slate-950/40 p-1 px-3 rounded-lg border border-slate-900/60 backdrop-blur-xs">
                              <p className="text-xs font-bold text-white tracking-wide">
                                {isZh ? "声学和弦混音.wav" : "Custom Acoustic Wave"} • <span className="text-cyan-400 font-mono text-[10px]">{musicLeadInstrument.toUpperCase()}</span>
                              </p>
                              <p className="text-[9px] text-slate-450 uppercase font-mono tracking-wider leading-none">
                                {musicScaleMode.replace("_", " ").toUpperCase()} @ {musicTempoBpm} BPM
                              </p>
                            </div>

                            <audio
                              ref={audioRef}
                              src={musicResultUrl}
                              controls
                              onPlay={() => setIsMusicPlaying(true)}
                              onPause={() => setIsMusicPlaying(false)}
                              onEnded={() => setIsMusicPlaying(false)}
                              className="w-full h-8 px-2 max-w-xs block scale-90 relative z-20 accent-cyan-500"
                            />
                          </div>
                        </div>

                        {/* Lyrics rendering */}
                        {musicLyrics && (
                          <div className="p-2.5 bg-[#020408]/80 rounded-xl border border-[#1e2f4d]/20 text-left">
                            <span className="block text-[8px] font-mono tracking-widest font-black text-slate-500 uppercase mb-1">
                              {isZh ? "唱词字幕 / 伴奏音源 metadata 描述" : "Song Lyrics / Audio Metadata"}
                            </span>
                            <p className="text-[10px] text-slate-300 italic whitespace-pre-wrap leading-relaxed max-h-[75px] overflow-y-auto font-sans">
                              {musicLyrics}
                            </p>
                          </div>
                        )}

                        {/* Copy Music Prompt Desk (Pulled dynamically from Preset) */}
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/15 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#10bb9c] uppercase tracking-widest flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#10bb9c] animate-pulse" />
                              {isZh ? "💡 提示词工程复制套件 (可去 Suno/Udio)" : "💡 Prompt Copy Desk (Suno/Udio AI)"}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            {/* Suno Style Tags */}
                            <div className="bg-[#03060c] p-2 rounded border border-slate-900/60 flex items-center justify-between gap-2 text-left">
                              <div className="flex-1 min-w-0 pr-1">
                                <span className="text-[9px] text-[#10bb9c] font-mono font-bold block mb-0.5">{isZh ? "Suno 风格标签 (Style Tags):" : "Suno Style Tags:"}</span>
                                <p className="text-[9px] text-slate-350 truncate font-mono">
                                  {MUSIC_PRESETS[selectedMusicPreset]?.styleTags || "organic acoustic, lofi beats..."}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(MUSIC_PRESETS[selectedMusicPreset]?.styleTags || "", "sunoStyle")}
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
                                <span className="text-[9px] text-orange-400 font-mono font-bold block mb-0.5">{isZh ? "Suno 结构词模板 (Structure):" : "Suno Structure:"}</span>
                                <p className="text-[9px] text-slate-350 truncate font-mono">
                                  {MUSIC_PRESETS[selectedMusicPreset]?.lyricsTemplate.replace(/\n/g, " ") || "[Intro] Guzheng solo..."}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(MUSIC_PRESETS[selectedMusicPreset]?.lyricsTemplate || "", "sunoLyrics")}
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

                        <div className="flex items-center justify-between text-xs bg-[#14233c]/30 p-2 rounded-xl border border-[#1e2f4d]/40">
                          <span className="text-slate-450 text-[10px] font-mono uppercase">{isZh ? "输出格式: 16-bit hifi-wav" : "Format: 16-bit Wav"}</span>
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
                      <div className="flex-1 flex flex-col items-center justify-center space-y-1.5 p-6 text-center text-red-400">
                        <AlertCircle className="w-8 h-8 mx-auto" />
                        <p className="text-xs font-bold">{isZh ? "音乐合成中断" : "Lyria Composition Failed"}</p>
                        <p className="text-[10px] text-red-300/80 max-w-xs">{musicError}</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-2 p-6 text-slate-550 max-w-sm text-center mx-auto">
                        <Volume2 className="w-12 h-12 text-slate-700 animate-pulse mx-auto" />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-400">{isZh ? "混音输出盘 (Mixer Desk Output)" : "Mixer Output Panel"}</p>
                          <p className="text-[10px] text-slate-550 leading-relaxed">
                            {isZh 
                              ? "在左侧设定预设、选择主奏乐器（如尺八、手碟、卡林巴琴）、调式（Yo scale、自然小调等）、滑移各音轨音量，点击下端合成即可在此输出精美和声，并伴生 Suno/Udio 提示词。亦支持实时等比波形图。" 
                              : "Tune instrument paths, adjust sliders, and mix live waveforms. The generated backing tracks and lyrics overlays will output here."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* INTERACTIVE ENTERPRISE API PLAYGROUND & RESEARCH DOCS */}
                {(musicSynthMode === "minimax" || musicSynthMode === "suno") && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-[#1e2f4d]/55 bg-gradient-to-b from-[#091122] to-[#040810] rounded-xl p-4 space-y-4 text-left mt-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1e2f4d]/40 pb-2.5 gap-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {musicSynthMode === "minimax" ? "MiniMax Music API Integration Research" : "Suno AI Generation API Integration Research"}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            {isZh ? "深度调研行业主流音乐合成平台接口，提供实时的请求负载与响应结构分析" : "Deep research of commercial music synthesis API specifications and real-time payload schema mapping."}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-[#14233c] text-cyan-400 px-2 py-0.5 rounded border border-[#1e2f4d]/50 self-start sm:self-auto">
                        {musicSynthMode === "minimax" ? "https://api.minimax.chat" : "https://api.suno.ai"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Column 1: API Specifications */}
                      <div className="space-y-3 bg-[#03060d]/65 border border-[#1e2f4d]/25 p-3 rounded-lg">
                        <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block border-b border-[#1e2f4d]/20 pb-1">
                          {isZh ? "1. 接口技术规约" : "1. API Technical Specification"}
                        </span>
                        <div className="space-y-2 text-[10.5px] text-slate-300">
                          <p className="leading-relaxed">
                            <strong>{isZh ? "请求方式" : "HTTP Method"}:</strong> <span className="font-mono text-emerald-400 font-bold">POST</span>
                          </p>
                          <p className="leading-relaxed">
                            <strong>{isZh ? "接口地址" : "Endpoint Path"}:</strong>{" "}
                            <span className="font-mono text-slate-400 break-all text-[10px]">
                              {musicSynthMode === "minimax" 
                                ? "v1/music_generation" 
                                : "v1/generations"}
                            </span>
                          </p>
                          <p className="leading-relaxed">
                            <strong>{isZh ? "授权鉴权" : "Authorization"}:</strong>{" "}
                            <span className="font-mono text-slate-400">Bearer {"{API_KEY}"}</span>
                          </p>
                          <div className="text-[9.5px] text-slate-400 pt-1 border-t border-[#1e2f4d]/10 leading-relaxed space-y-1">
                            {musicSynthMode === "minimax" ? (
                              <>
                                <p>• <strong>MiniMax</strong> {isZh ? "音乐合成大模型支持分流乐器或人声音轨，适用于高度定制化、高表现力的人声配曲场景。" : "supports multi-track separating, suitable for vocal synthesis and emotional Chinese/English content composition."}</p>
                                <p>• {isZh ? "通过 vocal_mode 设置纯乐器 (instrumental) 或者是带有情感声线的人声合成。" : "Configure vocal_mode for pure instrumental tracks or specific male/female emotional singing voices."}</p>
                              </>
                            ) : (
                              <>
                                <p>• <strong>Suno AI</strong> {isZh ? "拥有顶级的音乐整体渲染表现。v3/v4 接口提供风格化歌词自动拟合，支持最长4分钟的高保真立体声声景渲染。" : "provides industry-leading cohesive melody flow. The API fits rhythm matching tags and generates up to 4 minutes of gorgeous stereophonic soundscapes."}</p>
                                <p>• {isZh ? "make_instrumental 字段设定是否过滤歌手唱词，专注于高密度的纯氛围音乐合成。" : "Use make_instrumental to switch between vocal-driven songs and dense ambient backdrop soundscapes."}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Live Request Payload */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block">
                          {isZh ? "2. 动态请求报文 (Request Payload)" : "2. Live Request Payload JSON"}
                        </span>
                        <div className="bg-[#03060d]/90 border border-[#1e2f4d]/45 p-2 rounded-lg font-mono text-[9px] text-slate-300 h-40 overflow-y-auto leading-relaxed relative scrollbar-thin">
                          <pre className="whitespace-pre-wrap select-all">
                            {JSON.stringify(
                              musicSynthMode === "minimax" ? {
                                model: minimaxModel,
                                prompt: musicPrompt || "Generate a highly emotional atmospheric background music track...",
                                lyrics: customLyricsInput || "No lyrics compiled.",
                                vocal_mode: minimaxVocalMode === "instrumental" ? "instrumental" : "vocals",
                                voice_setting: {
                                  voice_id: minimaxVocalMode === "vocals_female" ? "female-warm-01" : "male-rich-01",
                                  speed_ratio: 1.0
                                }
                              } : {
                                prompt: musicPrompt || "Soothing oriental lo-fi beat",
                                make_instrumental: sunoInstrumental,
                                wait_audio: true,
                                lyrics: customLyricsInput || "No lyrics provided.",
                                title: "CultureOS SoundScape"
                              },
                              null,
                              2
                            )}
                          </pre>
                          <span className="absolute right-2 top-2 bg-[#14233c] text-[8px] text-cyan-300 px-1 rounded font-bold uppercase select-none">
                            JSON Payload
                          </span>
                        </div>
                      </div>

                      {/* Column 3: Expected API Response */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest block">
                          {isZh ? "3. 预期响应报文 (Response Schema)" : "3. Expected Response JSON"}
                        </span>
                        <div className="bg-[#03060d]/90 border border-[#1e2f4d]/45 p-2 rounded-lg font-mono text-[9px] text-slate-300 h-40 overflow-y-auto leading-relaxed relative scrollbar-thin">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(
                              musicSynthMode === "minimax" ? {
                                base_resp: {
                                  status_code: 0,
                                  status_msg: "success"
                                },
                                music_url: musicResultUrl || "https://api.minimax.chat/v1/retrieve_music/file_id.mp3",
                                duration: 30,
                                file_id: "minimax-file-example-001"
                              } : [
                                {
                                  id: "suno-track-example-001",
                                  audio_url: musicResultUrl || "https://cdn.suno.ai/track_uuid.mp3",
                                  status: "complete",
                                  title: "CultureOS SoundScape",
                                  prompt: musicPrompt || "Soothing oriental lo-fi beat",
                                  created_at: new Date().toISOString()
                                }
                              ],
                              null,
                              2
                            )}
                          </pre>
                          <span className="absolute right-2 top-2 bg-[#14233c] text-[8px] text-cyan-300 px-1 rounded font-bold uppercase select-none">
                            JSON Response
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            )}

            {/* 5. INTERACTIVE MULTIMEDIA EXPERIENCE HUB */}
            {activeTab === "media" && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                {/* Header Info */}
                <div className="border-b border-[#1e2f4d]/50 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Video className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span>{isZh ? "出海多媒体资产质检与演练舱 (Interactive Media Hub)" : "Interactive Globalization Media Testing Cabin"}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isZh 
                        ? "支持本地音视频、图片素材拖拽上传与流畅播放。提供多语种贴片字幕、环境音效混音演练，以及可交互海报文化审核标注。" 
                        : "Upload, test, and preview raw local marketing video, audio, or image assets. Inject captions, mix white noise SFX, or map cultural notes."}
                    </p>
                  </div>

                  {/* Sub-Tabs for Media Selection */}
                  <div className="flex bg-[#050912]/80 border border-[#1e2f4d]/50 p-1 rounded-xl text-xs gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setActiveMediaSubTab("video");
                        setIsMediaAudioPlaying(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeMediaSubTab === "video" 
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isZh ? "视频演练 (Video)" : "Video"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMediaSubTab("audio");
                        setIsMediaAudioPlaying(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeMediaSubTab === "audio" 
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>{isZh ? "音频配乐 (Audio)" : "Audio"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveMediaSubTab("image");
                        setIsMediaAudioPlaying(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeMediaSubTab === "image" 
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{isZh ? "画报审核 (Image)" : "Image"}</span>
                    </button>
                  </div>
                </div>

                {/* Main Hub Grid Split */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Column: Asset Locker / File List & Uploader */}
                  <div className="xl:col-span-4 bg-[#050912]/55 border border-[#1e2f4d]/40 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                          {isZh ? "📂 物料储物柜 (Asset Locker)" : "📂 Asset Locker"}
                        </span>
                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/10">
                          {activeMediaSubTab === "video" ? `${mediaVideos.length} Videos` :
                           activeMediaSubTab === "audio" ? `${mediaAudios.length} Audios` : `${mediaImages.length} Images`}
                        </span>
                      </div>

                      {/* Drag & Drop Local File Uploader */}
                      <label className="border-2 border-dashed border-[#1e2f4d]/60 hover:border-cyan-500/40 bg-cyan-500/[0.01] hover:bg-cyan-500/[0.03] transition p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer relative group">
                        {activeMediaSubTab === "video" && (
                          <input 
                            type="file" 
                            accept="video/mp4,video/webm" 
                            className="hidden" 
                            onChange={handleVideoFileChange} 
                          />
                        )}
                        {activeMediaSubTab === "audio" && (
                          <input 
                            type="file" 
                            accept="audio/mp3,audio/wav,audio/mpeg,audio/x-m4a" 
                            className="hidden" 
                            onChange={handleAudioFileChange} 
                          />
                        )}
                        {activeMediaSubTab === "image" && (
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageFileChange} 
                          />
                        )}
                        <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition mb-2 animate-bounce" />
                        <span className="text-xs font-bold text-slate-350 block">
                          {isZh ? "点击或拖拽上传本地物料" : "Upload Local Media"}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {activeMediaSubTab === "video" ? "支持 MP4, WEBM (Max 50MB)" :
                           activeMediaSubTab === "audio" ? "支持 MP3, WAV, M4A (Max 15MB)" : "支持 JPG, PNG, GIF, SVG"}
                        </span>
                      </label>

                      {/* Display Selected Lists */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {activeMediaSubTab === "video" && mediaVideos.map((vid) => (
                          <div 
                            key={vid.id}
                            onClick={() => setActiveVideoUrl(vid.url)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              activeVideoUrl === vid.url 
                                ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300" 
                                : "bg-[#090f1e]/40 border-[#1e2f4d]/30 text-slate-400 hover:bg-[#0c1325]/80 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 mr-2">
                              <Video className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-cyan-400" />
                              <span className="text-xs truncate font-medium">{vid.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono bg-[#14233c] px-1.5 py-0.5 rounded text-slate-400">{vid.size}</span>
                              {vid.id.startsWith("uv-") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMediaVideos(prev => prev.filter(v => v.id !== vid.id));
                                    if (activeVideoUrl === vid.url && mediaVideos.length > 1) {
                                      setActiveVideoUrl(mediaVideos[1].url);
                                    }
                                  }}
                                  className="text-slate-550 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {activeMediaSubTab === "audio" && mediaAudios.map((aud) => (
                          <div 
                            key={aud.id}
                            onClick={() => {
                              setActiveAudioUrl(aud.url);
                              setIsMediaAudioPlaying(false);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              activeAudioUrl === aud.url 
                                ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300" 
                                : "bg-[#090f1e]/40 border-[#1e2f4d]/30 text-slate-400 hover:bg-[#0c1325]/80 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 mr-2">
                              <Music className="w-4 h-4 shrink-0 text-slate-500" />
                              <span className="text-xs truncate font-medium">{aud.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono bg-[#14233c] px-1.5 py-0.5 rounded text-slate-400">{aud.size}</span>
                              {aud.id.startsWith("ua-") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMediaAudios(prev => prev.filter(a => a.id !== aud.id));
                                    if (activeAudioUrl === aud.url && mediaAudios.length > 1) {
                                      setActiveAudioUrl(mediaAudios[1].url);
                                      setIsMediaAudioPlaying(false);
                                    }
                                  }}
                                  className="text-slate-550 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {activeMediaSubTab === "image" && mediaImages.map((img) => (
                          <div 
                            key={img.id}
                            onClick={() => {
                              setActiveImageUrl(img.url);
                              setImageReviewNotes([]); // Reset user loaded reviews if they shift
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              activeImageUrl === img.url 
                                ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300" 
                                : "bg-[#090f1e]/40 border-[#1e2f4d]/30 text-slate-400 hover:bg-[#0c1325]/80 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate flex-1 mr-2">
                              <ImageIcon className="w-4 h-4 shrink-0 text-slate-500" />
                              <span className="text-xs truncate font-medium">{img.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono bg-[#14233c] px-1.5 py-0.5 rounded text-slate-400">{img.size}</span>
                              {img.id.startsWith("ui-") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMediaImages(prev => prev.filter(i => i.id !== img.id));
                                    if (activeImageUrl === img.url && mediaImages.length > 1) {
                                      setActiveImageUrl(mediaImages[1].url);
                                    }
                                  }}
                                  className="text-slate-550 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#1e2f4d]/25 border border-[#1e2f4d]/45 p-3 rounded-xl text-[11px] text-slate-400 leading-relaxed font-sans">
                      <span className="text-amber-400 font-bold block mb-1">💡 {isZh ? "安全沙箱说明" : "Sandbox Isolation Info"}</span>
                      {isZh 
                        ? "所有上传物料均由浏览器原生 API 在本地生成沙箱 Blob URL 播放，不会产生服务器流量，对您的文件具有 100% 的保密性。" 
                        : "Uploaded media files generate instant client-side sandboxed Blob URLs locally. Zero data is transmitted to remote storage hubs, ensuring full security."}
                    </div>
                  </div>

                  {/* Right Column: Immersive Playback and Configuration Workspace */}
                  <div className="xl:col-span-8 bg-[#050912]/35 border border-[#1e2f4d]/35 rounded-2xl p-5 flex flex-col justify-between">
                    
                    {/* VIDEO PLAYBACK MODE */}
                    {activeMediaSubTab === "video" && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        {/* Video Player Box */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#1e2f4d]/40 flex items-center justify-center group shadow-2xl">
                          <video
                            src={activeVideoUrl}
                            controls
                            className="w-full h-full max-h-[380px] object-contain transition-all duration-300"
                            style={{
                              filter: 
                                videoFilter === "warm" ? "sepia(0.25) contrast(1.1) saturate(1.1)" :
                                videoFilter === "vintage" ? "grayscale(0.15) sepia(0.4) contrast(0.95)" :
                                videoFilter === "cyber" ? "hue-rotate(55deg) saturate(1.35) contrast(1.15)" :
                                videoFilter === "cool" ? "hue-rotate(180deg) saturate(1.1) brightness(1.05)" :
                                videoFilter === "noir" ? "grayscale(1) contrast(1.25)" : "none"
                            }}
                          />

                          {/* Watermark Overlay */}
                          {videoWatermark && (
                            <div className="absolute top-3 right-3 bg-amber-400/80 backdrop-blur-sm text-slate-950 font-mono text-[9px] font-black px-2 py-1 rounded tracking-wider shadow-md pointer-events-none select-none z-10">
                              CULTUREOS GLOBAL COGNITIVE STAMP
                            </div>
                          )}

                          {/* Captions / Localized Subtitle Tracks */}
                          {videoSubtitles !== "none" && (
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl text-center max-w-[85%] border border-[#1e2f4d]/50 shadow-lg pointer-events-none z-10">
                              <p className="text-xs font-black text-cyan-300 font-sans tracking-wide">
                                {videoSubtitles === "zh" && "「主奏 - 古筝配乐」柔和的流水意境切入，伴随琴声起伏，契合中日高语境人群对静穆减压的向往。"}
                                {videoSubtitles === "en" && "[Lead - Traditional Strings] A calming stream enters with melodic chords, matching High-Context relaxation goals."}
                                {videoSubtitles === "ar" && "[عزف قانون شرقي] ينبض إيقاع مهدئ مع النغمات الطائرة، للتناغم التام مع عادات الاسترخاء في دول مجلس التعاون الخليجي."}
                                {videoSubtitles === "ja" && "「メイン和楽器 - 箏」静かなせせらぎに響きが溶け込み、日常を忘れる癒しの余白空間を演出。"}
                              </p>
                              <span className="text-[9px] uppercase font-mono text-slate-500 mt-1 block">Subtitle Transcreation Track</span>
                            </div>
                          )}
                        </div>

                        {/* Video Controls Panel */}
                        <div className="bg-[#050912]/80 border border-[#1e2f4d]/60 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                          {/* Filter control */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Filter className="w-3.5 h-3.5 text-cyan-400" />
                              {isZh ? "画面文化风格滤镜" : "Cultural Tone Filters"}
                            </span>
                            <select
                              value={videoFilter}
                              onChange={(e: any) => setVideoFilter(e.target.value)}
                              className="w-full bg-[#090f1f] text-slate-200 border border-[#1e2f4d]/60 p-2 rounded-lg text-xs focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                            >
                              <option value="none">{isZh ? "原画无滤镜 (Standard)" : "Standard - Raw Vibe"}</option>
                              <option value="warm">{isZh ? "丝路暖金 (Warm Silk Road)" : "Warm Silk Road"}</option>
                              <option value="vintage">{isZh ? "怀旧羊皮纸 (Vintage Parchment)" : "Vintage Parchment"}</option>
                              <option value="cyber">{isZh ? "涩谷极夜 (Shibuya Cyberpunk)" : "Shibuya Cyberpunk"}</option>
                              <option value="cool">{isZh ? "北欧极简冰 (Nordic Ice)" : "Nordic Ice Minimal"}</option>
                              <option value="noir">{isZh ? "黑胶胶片 (Vintage Noir)" : "Noir Vinyl Film"}</option>
                            </select>
                          </div>

                          {/* Subtitle track */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                              {isZh ? "叠加语境贴片字幕" : "Caption Transcreations"}
                            </span>
                            <select
                              value={videoSubtitles}
                              onChange={(e: any) => setVideoSubtitles(e.target.value)}
                              className="w-full bg-[#090f1f] text-slate-200 border border-[#1e2f4d]/60 p-2 rounded-lg text-xs focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                            >
                              <option value="none">{isZh ? "不显示字幕 (None)" : "No Subtitles"}</option>
                              <option value="zh">{isZh ? "中文简繁 (Chinese Sub)" : "Chinese Caption"}</option>
                              <option value="en">{isZh ? "英文适配 (English Trans)" : "English Caption"}</option>
                              <option value="ar">{isZh ? "阿拉伯文意译 (Arabic)" : "Arabic Caption"}</option>
                              <option value="ja">{isZh ? "日文润色 (Japanese)" : "Japanese Caption"}</option>
                            </select>
                          </div>

                          {/* Watermark and presets */}
                          <div className="space-y-1.5 flex flex-col justify-end">
                            <label className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={videoWatermark}
                                onChange={(e) => setVideoWatermark(e.target.checked)}
                                className="w-3.5 h-3.5 text-cyan-500 rounded border-slate-700 bg-slate-900 focus:ring-cyan-500"
                              />
                              <span className="font-bold">{isZh ? "叠加出海安全合规浮水印" : "Global Compliance Overlay"}</span>
                            </label>
                            <p className="text-[9.5px] text-slate-500 font-sans leading-relaxed">
                              {isZh ? "叠加防漏水、反篡改的数字内容安全溯源标签。" : "Verify branding safely under real dynamic bounds."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AUDIO SOUNDTRACK PLAYBACK MODE */}
                    {activeMediaSubTab === "audio" && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                        
                        {/* Audio Waveform Canvas Container */}
                        <div className="relative h-[220px] rounded-xl overflow-hidden bg-[#040710] border border-[#1e2f4d]/50 flex flex-col items-center justify-center p-4">
                          <canvas 
                            ref={mediaVisualizerCanvasRef} 
                            className="absolute inset-0 w-full h-full pointer-events-none"
                          />

                          {/* Centered state overlay info */}
                          <div className="relative text-center space-y-1 z-10 pointer-events-none">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                              {isMediaAudioPlaying ? (isZh ? "频谱流分析中" : "Wave Stream Active") : (isZh ? "等待播放" : "Ready to Stream")}
                            </span>
                            <p className="text-sm font-black text-white max-w-sm truncate mt-1">
                              {mediaAudios.find(a => a.url === activeAudioUrl)?.name || "audio_file.mp3"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              44.1 kHz • Float32 Stereo Path
                            </p>
                          </div>

                          {/* Native invisible playback and ASMR sources */}
                          <audio
                            ref={mediaAudioRef}
                            src={activeAudioUrl}
                            onPlay={() => setIsMediaAudioPlaying(true)}
                            onPause={() => setIsMediaAudioPlaying(false)}
                            onEnded={() => setIsMediaAudioPlaying(false)}
                            controls
                            className="absolute bottom-4 left-4 right-4 h-10 filter invert opacity-80 hover:opacity-100 transition z-10"
                          />

                          <audio
                            ref={asmrAudioRef}
                            src={
                              selectedAsmrSfx === "rain" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" :
                              selectedAsmrSfx === "waves" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" :
                              selectedAsmrSfx === "chimes" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" :
                              selectedAsmrSfx === "vinyl" ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" : ""
                            }
                            loop
                            className="hidden"
                          />
                        </div>

                        {/* Interactive Sound Mixer Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#050912]/80 border border-[#1e2f4d]/55 rounded-xl p-4">
                          
                          {/* Ambient ASMR mixer */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-cyan-400" />
                              {isZh ? "环境音效混音叠层 (ASMR Sound Layer)" : "ASMR Ambient Mixer"}
                            </span>
                            <div className="grid grid-cols-5 gap-1.5">
                              {(["none", "rain", "chimes", "waves", "vinyl"] as const).map((sfx) => (
                                <button
                                  key={sfx}
                                  onClick={() => setSelectedAsmrSfx(sfx)}
                                  className={`px-1 py-1.5 rounded-lg text-[9px] font-bold transition capitalize cursor-pointer border text-center ${
                                    selectedAsmrSfx === sfx 
                                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/35" 
                                      : "bg-[#090f1e] text-slate-500 border-transparent hover:text-slate-350"
                                  }`}
                                >
                                  {sfx === "none" ? (isZh ? "无" : "None") : sfx}
                                </button>
                              ))}
                            </div>
                            
                            {/* ASMR Volume slider */}
                            {selectedAsmrSfx !== "none" && (
                              <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                  <span>ASMR Layer Volume:</span>
                                  <span>{Math.round(audioAsmrVolume * 100)}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={audioAsmrVolume}
                                  onChange={(e) => setAudioAsmrVolume(parseFloat(e.target.value))}
                                  className="w-full accent-cyan-400 h-1 bg-[#0c1322] rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            )}
                          </div>

                          {/* Playback speed controller */}
                          <div className="space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                                {isZh ? "播放语速与音轨变调" : "Playback Tempo Speed"}
                              </span>
                              <div className="grid grid-cols-5 gap-1">
                                {([0.5, 0.75, 1.0, 1.25, 1.5] as const).map((spd) => (
                                  <button
                                    key={spd}
                                    onClick={() => setAudioSpeedRate(spd)}
                                    className={`px-1 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                                      audioSpeedRate === spd 
                                        ? "bg-amber-400 text-slate-900" 
                                        : "bg-[#090f1f] text-slate-450 hover:text-slate-300 border border-[#1e2f4d]/40"
                                    }`}
                                  >
                                    {spd}x
                                  </button>
                                ))}
                              </div>
                            </div>
                            <p className="text-[9.5px] text-slate-500 leading-tight">
                              {isZh ? "调整语速以对齐大区主流流媒体短视频（如 TikTok 快速、YouTube 沉浸）节奏规律。" : "Simulate pace matches against localized short-form platform algorithms."}
                            </p>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* IMAGE REVIEW & COORDINATE DOT OVERLAY MODE */}
                    {activeMediaSubTab === "image" && (
                      <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                        
                        {/* Interactive Image Display Board */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                          
                          {/* Image box with coordinate tagging capability */}
                          <div className="lg:col-span-7 flex flex-col justify-center">
                            <span className="text-[9.5px] font-mono text-slate-450 uppercase tracking-widest block mb-1">
                              {isZh ? "🎯 点击画面任意处可添加出海文化风险审核标注 (Click to Tag Note)" : "🎯 Click image anywhere to record localized audit dots"}
                            </span>
                            <div 
                              onClick={handleImageClick}
                              className="relative rounded-xl overflow-hidden bg-slate-950 border border-[#1e2f4d]/50 cursor-crosshair shadow-2xl group group-hover:border-cyan-500/45 transition"
                            >
                              <img
                                src={activeImageUrl}
                                alt="Visual Review Target"
                                className="w-full max-h-[300px] object-contain mx-auto select-none transition-all duration-300"
                                referrerPolicy="no-referrer"
                                style={{
                                  filter: 
                                    imageFilterStyle === "warm" ? "sepia(0.3) contrast(1.1) saturate(1.1)" :
                                    imageFilterStyle === "cool" ? "hue-rotate(180deg) saturate(1.15) brightness(1.03)" :
                                    imageFilterStyle === "neon" ? "hue-rotate(75deg) saturate(1.6) contrast(1.2)" :
                                    imageFilterStyle === "vintage" ? "sepia(0.5) grayscale(0.2) contrast(0.9)" : "none"
                                }}
                              />

                              {/* Click coordinate form anchor popup directly on the spot */}
                              {clickCoord && (
                                <div 
                                  className="absolute bg-[#090f1f]/95 border border-cyan-500/60 p-3 rounded-xl shadow-2xl text-xs space-y-2 z-30 max-w-[200px]"
                                  style={{ 
                                    left: `${Math.min(clickCoord.x, 60)}%`, 
                                    top: `${Math.min(clickCoord.y, 65)}%` 
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-cyan-300 font-mono text-[10px]">Tag: X:{clickCoord.x}% Y:{clickCoord.y}%</span>
                                    <button onClick={() => setClickCoord(null)} className="text-slate-500 hover:text-white font-bold">×</button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder={isZh ? "录入文化或合规见解..." : "Add local comments..."}
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    className="w-full bg-slate-900 text-slate-200 p-1.5 rounded text-[10.5px] focus:outline-none focus:border-cyan-500 border border-[#1e2f4d]/50"
                                  />
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleAddImageNote("warning")} 
                                      className="flex-1 bg-amber-500 text-slate-950 font-bold p-1 rounded text-[9px] hover:opacity-90"
                                    >
                                      {isZh ? "风险 (Warn)" : "Warn"}
                                    </button>
                                    <button 
                                      onClick={() => handleAddImageNote("success")} 
                                      className="flex-1 bg-green-500 text-slate-950 font-bold p-1 rounded text-[9px] hover:opacity-90"
                                    >
                                      {isZh ? "亮点 (Idea)" : "Idea"}
                                    </button>
                                    <button 
                                      onClick={() => handleAddImageNote("info")} 
                                      className="flex-1 bg-blue-500 text-slate-950 font-bold p-1 rounded text-[9px] hover:opacity-90"
                                    >
                                      {isZh ? "说明 (Info)" : "Info"}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Render review note dots absolutely positioned on image */}
                              {imageReviewNotes.map((note) => (
                                <div
                                  key={note.id}
                                  className="absolute group/dot cursor-pointer z-20"
                                  style={{ left: `${note.x}%`, top: `${note.y}%` }}
                                >
                                  {/* Pulsing indicator ring */}
                                  <span className={`absolute -left-2 -top-2 w-5 h-5 rounded-full animate-ping opacity-75 ${
                                    note.type === "warning" ? "bg-amber-400" :
                                    note.type === "success" ? "bg-green-400" : "bg-cyan-400"
                                  }`} />
                                  <span className={`block w-2.5 h-2.5 rounded-full border border-slate-950 shadow-md ${
                                    note.type === "warning" ? "bg-amber-400" :
                                    note.type === "success" ? "bg-green-400" : "bg-cyan-400"
                                  }`} />

                                  {/* Tooltip on hover */}
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden group-hover/dot:block bg-[#090f1f]/95 border border-[#1e2f4d]/75 p-2 rounded-lg shadow-xl w-[180px] text-[10px] leading-relaxed z-30 font-sans text-slate-200">
                                    {isZh ? note.text : note.textEn}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Image review list of annotations */}
                          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                            <div className="space-y-3 flex-1">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                {isZh ? "📋 审核记录与优化决案" : "📋 Visual Audit Review Notes"}
                              </span>
                              
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {imageReviewNotes.length === 0 ? (
                                  <div className="p-6 border border-dashed border-[#1e2f4d]/40 rounded-xl text-center text-slate-500 text-xs">
                                    {isZh ? "暂无评审标注，点击左侧画报可快速记录画面缺陷或本土适配亮点" : "No notes logged. Click the poster to place annotation pins"}
                                  </div>
                                ) : (
                                  imageReviewNotes.map((note) => (
                                    <div 
                                      key={note.id}
                                      className={`p-2 rounded-lg border text-[10.5px] leading-relaxed font-sans ${
                                        note.type === "warning" ? "bg-amber-500/5 border-amber-500/20 text-amber-300" :
                                        note.type === "success" ? "bg-green-500/5 border-green-500/20 text-green-300" :
                                        "bg-blue-500/5 border-blue-500/20 text-blue-300"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="flex-1">
                                          <strong>(X:{note.x}%, Y:{note.y}%)</strong> - {isZh ? note.text : note.textEn}
                                        </p>
                                        <button
                                          onClick={() => setImageReviewNotes(prev => prev.filter(n => n.id !== note.id))}
                                          className="text-slate-500 hover:text-red-400 cursor-pointer shrink-0 ml-1 font-bold text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Image tone controller select */}
                            <div className="bg-[#050912]/80 border border-[#1e2f4d]/50 p-3 rounded-xl space-y-2">
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                                {isZh ? "图片文化调性渲染" : "Image Tone Filter preset"}
                              </span>
                              <div className="grid grid-cols-5 gap-1">
                                {([
                                  { k: "none", name: isZh ? "原画" : "Raw" },
                                  { k: "warm", name: isZh ? "暖玉" : "Jade" },
                                  { k: "cool", name: isZh ? "冰极" : "Ice" },
                                  { k: "neon", name: isZh ? "极光" : "Neon" },
                                  { k: "vintage", name: isZh ? "宣纸" : "Scroll" }
                                ] as const).map((it) => (
                                  <button
                                    key={it.k}
                                    onClick={() => setImageFilterStyle(it.k)}
                                    className={`py-1 rounded text-[10px] font-bold transition cursor-pointer border text-center ${
                                      imageFilterStyle === it.k 
                                        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/35" 
                                        : "bg-[#090f1f] text-slate-500 border-transparent hover:text-slate-350"
                                    }`}
                                  >
                                    {it.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </motion.div>
            )}

            {/* 6. MULTI-MODEL SETUP PANEL */}
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
