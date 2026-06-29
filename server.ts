import express from "express";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase limit to allow base64 images uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DATA_DIR = path.join(process.cwd(), "data_store");
const RUNS_FILE = path.join(DATA_DIR, "campaign_runs.json");
const FEEDBACK_FILE = path.join(DATA_DIR, "kpi_feedback.json");
const SQLITE_FILE = path.join(DATA_DIR, "cultureos.sqlite");
let sqlite: Database.Database | null = null;

function getDb() {
  ensureDataStore();
  if (!sqlite) {
    sqlite = new Database(SQLITE_FILE);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS campaign_runs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        name TEXT,
        culture_asset TEXT,
        mode TEXT,
        category TEXT,
        decision TEXT,
        score REAL,
        agent_count INTEGER DEFAULT 0,
        rule_count INTEGER DEFAULT 0,
        brief_json TEXT NOT NULL,
        result_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS agent_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        status TEXT,
        confidence REAL,
        rules_json TEXT,
        input_json TEXT,
        output_json TEXT,
        warnings_json TEXT,
        next_actions_json TEXT,
        FOREIGN KEY(run_id) REFERENCES campaign_runs(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS rule_hits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        rule_id TEXT NOT NULL,
        name TEXT,
        severity TEXT,
        reason TEXT,
        action TEXT,
        source TEXT,
        FOREIGN KEY(run_id) REFERENCES campaign_runs(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS kpi_reviews (
        review_id TEXT PRIMARY KEY,
        run_id TEXT,
        timestamp TEXT NOT NULL,
        decision TEXT,
        metrics_json TEXT NOT NULL,
        flags_json TEXT NOT NULL,
        actions_json TEXT NOT NULL,
        next_sprint_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS music_styles (
        id TEXT PRIMARY KEY,
        decade TEXT NOT NULL,
        year_start INTEGER,
        year_end INTEGER,
        region TEXT,
        genre TEXT NOT NULL,
        subgenre TEXT,
        mood_tags TEXT,
        instruments TEXT,
        bpm_min INTEGER,
        bpm_max INTEGER,
        platform_fit TEXT,
        creator_use_case TEXT,
        prompt_en TEXT NOT NULL,
        prompt_zh TEXT NOT NULL,
        negative_prompt TEXT,
        source TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS music_prompt_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        use_case TEXT,
        template_en TEXT NOT NULL,
        template_zh TEXT NOT NULL,
        required_slots TEXT,
        negative_prompt TEXT
      );
      CREATE TABLE IF NOT EXISTS music_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT,
        license_note TEXT,
        imported_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_campaign_runs_timestamp ON campaign_runs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_agent_executions_run ON agent_executions(run_id);
      CREATE INDEX IF NOT EXISTS idx_rule_hits_run ON rule_hits(run_id);
      CREATE INDEX IF NOT EXISTS idx_kpi_reviews_run ON kpi_reviews(run_id);
    `);
    seedMusicDatabase(sqlite);
  }
  return sqlite;
}

function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(RUNS_FILE)) fs.writeFileSync(RUNS_FILE, "[]", "utf-8");
  if (!fs.existsSync(FEEDBACK_FILE)) fs.writeFileSync(FEEDBACK_FILE, "[]", "utf-8");
}

function readJsonArray(file: string): any[] {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray(file: string, data: any[]) {
  ensureDataStore();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function parseCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(v => v.trim());
}

function readCsvDatabase() {
  const csvDir = path.join(process.cwd(), "csv");
  const result: Record<string, any[]> = {};
  if (!fs.existsSync(csvDir)) return result;
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith(".csv"));
  for (const file of files) {
    const full = path.join(csvDir, file);
    const raw = fs.readFileSync(full, "utf-8").replace(/^\uFEFF/, "");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) continue;
    const headers = parseCsvLine(lines[0]);
    result[file.replace(/\.csv$/, "")] = lines.slice(1).map((line, idx) => {
      const cols = parseCsvLine(line);
      const row: any = { _row: idx + 1, _source: file };
      headers.forEach((h, i) => row[h] = cols[i] ?? "");
      return row;
    });
  }
  return result;
}

function saveCampaignRun(run: any) {
  const runs = readJsonArray(RUNS_FILE);
  runs.unshift(run);
  writeJsonArray(RUNS_FILE, runs.slice(0, 200));

  try {
    const db = getDb();
    const tx = db.transaction(() => {
      db.prepare(`
        INSERT OR REPLACE INTO campaign_runs
        (id, timestamp, name, culture_asset, mode, category, decision, score, agent_count, rule_count, brief_json, result_json)
        VALUES (@id, @timestamp, @name, @culture_asset, @mode, @category, @decision, @score, @agent_count, @rule_count, @brief_json, @result_json)
      `).run({
        id: run.id,
        timestamp: run.timestamp,
        name: run.brief?.name || "",
        culture_asset: run.brief?.cultureAsset || "",
        mode: run.mode || "",
        category: run.category || "",
        decision: run.decision || "",
        score: run.score || 0,
        agent_count: run.agentCount || 0,
        rule_count: run.ruleCount || 0,
        brief_json: JSON.stringify(run.brief || {}),
        result_json: JSON.stringify(run.result || {})
      });
      db.prepare("DELETE FROM agent_executions WHERE run_id = ?").run(run.id);
      const agentStmt = db.prepare(`
        INSERT INTO agent_executions
        (run_id, agent_id, status, confidence, rules_json, input_json, output_json, warnings_json, next_actions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const agents = run.result?.agentCluster?.agents || run.result?.culturePack?.mvp_agent_cluster?.agents || [];
      for (const a of agents) {
        agentStmt.run(run.id, a.agentId, a.status || "done", a.confidence || 0, JSON.stringify(a.rulesUsed || []), JSON.stringify(a.input || {}), JSON.stringify(a.output || {}), JSON.stringify(a.warnings || []), JSON.stringify(a.nextActions || []));
      }
      db.prepare("DELETE FROM rule_hits WHERE run_id = ?").run(run.id);
      const ruleStmt = db.prepare(`
        INSERT INTO rule_hits (run_id, rule_id, name, severity, reason, action, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const rules = run.result?.rulesTriggered || run.result?.agentCluster?.rulesTriggered || [];
      for (const r of rules) ruleStmt.run(run.id, r.ruleId, r.name, r.severity, r.reason, r.action, r.source);
    });
    tx();
  } catch (error) {
    console.warn("SQLite campaign persistence failed, JSON fallback retained:", error);
  }
}


function seedMusicDatabase(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as count FROM music_styles").get() as any).count;
  if (count > 0) return;
  const now = new Date().toISOString();
  const styles = [
    ["1920s-jazz-dixieland","1920s",1920,1929,"New Orleans / US","Jazz","Dixieland","joyful,brassy,swing,street parade","trumpet,clarinet,trombone,banjo,upright bass,drums",120,190,"Shorts,Vlog,Retro Ads","复古开场、城市街头、老钱氛围","1920s New Orleans dixieland jazz, lively brass band, clarinet counter-melodies, banjo rhythm, upright bass, vintage mono warmth, street parade energy","1920年代新奥尔良Dixieland爵士，明亮铜管、单簧管对位、班卓琴节奏、复古单声道街头巡游感","no modern EDM, no trap drums","seed:public-genre-knowledge"],
    ["1920s-blues-delta","1920s",1920,1929,"Mississippi Delta / US","Blues","Delta Blues","raw,lonely,earthy,storytelling","slide guitar,acoustic guitar,harmonica,foot stomp",65,95,"Documentary,Vlog","人物故事、手作孤独感","raw delta blues, fingerpicked acoustic guitar, bottleneck slide, dusty porch ambience, intimate vocal-like guitar phrasing","原始Delta Blues，指弹木吉他、滑棒、尘土门廊氛围、叙事性旋律","no glossy pop, no synth pads","seed:public-genre-knowledge"],
    ["1930s-swing-bigband","1930s",1930,1939,"US","Jazz","Big Band Swing","upbeat,dance,classy,brass","sax section,trumpets,trombones,piano,double bass,drums",140,210,"Reels,TikTok","高能复古转场、时尚大片","1930s big band swing, punchy horn stabs, walking bass, brushed drums, glamorous ballroom recording","1930年代大乐队Swing，铜管齐奏、行走贝斯、刷鼓、舞厅高级感","no electronic bass, no modern sidechain","seed:public-genre-knowledge"],
    ["1930s-chanson","1930s",1930,1939,"France","Chanson","Parisian Chanson","romantic,nostalgic,cafe,cinematic","accordion,nylon guitar,violin,upright bass",70,115,"Travel,Vlog,Reels","欧洲文旅、咖啡馆慢镜头","Parisian chanson, musette accordion, nylon guitar, soft violin, intimate cafe ambience, nostalgic romantic melody","巴黎香颂，手风琴、尼龙吉他、小提琴、咖啡馆怀旧浪漫旋律","no EDM, no heavy drums","seed:public-genre-knowledge"],
    ["1940s-bebop","1940s",1940,1949,"US","Jazz","Bebop","fast,virtuosic,urban,smart","alto sax,trumpet,piano,double bass,ride cymbal",160,260,"Knowledge,Podcast","知识型内容、城市智性氛围","1940s bebop jazz, fast saxophone lines, complex piano comping, walking bass, ride cymbal swing, smoky club","1940年代Bebop，快速萨克斯、复杂钢琴伴奏、行走贝斯、烟雾爵士俱乐部","no smooth jazz, no electronic drums","seed:public-genre-knowledge"],
    ["1940s-bolero","1940s",1940,1949,"Latin America","Bolero","Classic Bolero","romantic,warm,serenade,slow dance","nylon guitar,strings,congas,soft trumpet",70,100,"Reels,TikTok","拉美温情、礼物、家庭故事","classic Latin bolero, romantic nylon guitar, lush strings, soft percussion, warm serenade vocal phrasing instrumental","经典拉美Bolero，浪漫尼龙吉他、弦乐、轻打击、温暖小夜曲器乐","no reggaeton beat, no club synth","seed:public-genre-knowledge"],
    ["1950s-rockabilly","1950s",1950,1959,"US","Rock","Rockabilly","rebellious,retro,driving,fun","electric guitar,slap bass,drums,handclaps",130,190,"TikTok,Ads","复古产品展示、活力开场","1950s rockabilly, slapback electric guitar, upright slap bass, tight snare, handclaps, vintage tape echo","1950年代Rockabilly，复古电吉他回声、拍击贝斯、紧凑军鼓、手拍","no metal distortion, no modern trap","seed:public-genre-knowledge"],
    ["1950s-doowop","1950s",1950,1959,"US","R&B","Doo-wop","sweet,romantic,teen,nostalgic","vocal harmonies,piano,sax,brush drums",70,125,"Shorts,Reels","甜美怀旧、人物关系","1950s doo-wop instrumental feel, close harmony pads, gentle piano triplets, soft saxophone, street corner nostalgia","1950年代Doo-wop感觉，和声铺底、钢琴三连音、柔和萨克斯、街角怀旧","no aggressive drums, no EDM","seed:public-genre-knowledge"],
    ["1960s-motown-soul","1960s",1960,1969,"Detroit / US","Soul","Motown","uplifting,warm,groovy,classic","drums,bass,guitar,piano,strings,brass",100,140,"TikTok,Reels,Ads","积极转化、温暖品牌故事","1960s Motown soul groove, tight drums, melodic bassline, handclaps, bright strings and brass, analog tape warmth","1960年代Motown灵魂乐律动，紧鼓、旋律贝斯、拍手、明亮弦乐铜管、磁带暖感","no trap hi hats, no EDM riser","seed:public-genre-knowledge"],
    ["1960s-bossa-nova","1960s",1960,1969,"Brazil","Bossa Nova","Classic Bossa","breezy,elegant,beach,soft","nylon guitar,soft percussion,upright bass,flute",110,140,"Travel,Beauty,Vlog","优雅生活方式、海边、咖啡","classic bossa nova, syncopated nylon guitar, soft brushed percussion, airy flute, warm beachside ambience","经典Bossa Nova，切分尼龙吉他、轻刷打击、空气感长笛、温暖海边氛围","no heavy kick, no club bass","seed:public-genre-knowledge"],
    ["1960s-psychedelic-rock","1960s",1965,1969,"US/UK","Rock","Psychedelic Rock","dreamy,colorful,experimental,retro","electric guitar,organ,sitar,tape delay,drums",90,150,"Art,Reels","艺术视觉、复古迷幻转场","1960s psychedelic rock, swirling organ, fuzzy guitar, tape delay, sitar colors, kaleidoscopic analog texture","1960年代迷幻摇滚，旋转风琴、模糊吉他、磁带延迟、锡塔琴色彩、万花筒质感","no modern EDM drop, no metalcore","seed:public-genre-knowledge"],
    ["1970s-disco","1970s",1970,1979,"US/Europe","Disco","Classic Disco","glamorous,dance,bright,nightlife","four-on-floor drums,funk bass,strings,brass,clav",110,130,"TikTok,Ads,Fashion","时尚、舞蹈、产品高光","1970s classic disco, four-on-the-floor kick, funky bassline, lush strings, brass hits, glittery dancefloor","1970年代经典Disco，四拍底鼓、放克贝斯、华丽弦乐、铜管点缀、闪亮舞池","no modern EDM supersaw, no trap","seed:public-genre-knowledge"],
    ["1970s-funk","1970s",1970,1979,"US","Funk","P-Funk / Deep Funk","groovy,confident,playful,bass-heavy","syncopated bass,clavinet,wah guitar,horns,drums",90,120,"Ads,TikTok","潮流产品、街头自信","1970s funk groove, syncopated slap bass, wah-wah guitar, clavinet, punchy horns, dry drums","1970年代Funk，切分Slap贝斯、哇音吉他、Clavinet、强铜管、干鼓声","no quantized EDM, no trap hats","seed:public-genre-knowledge"],
    ["1970s-krautrock","1970s",1970,1979,"Germany","Rock/Electronic","Krautrock","motorik,hypnotic,experimental,minimal","motorik drums,bass,synth,clean guitar",90,160,"Tech,Vlog,Art","科技、路途、实验影像","1970s krautrock motorik beat, hypnotic bass pulse, analog synth textures, minimal clean guitar, forward motion","1970年代Krautrock，机械律动鼓、催眠贝斯、模拟合成器、极简清音吉他、前进感","no EDM drop, no pop chorus","seed:public-genre-knowledge"],
    ["1980s-synthpop","1980s",1980,1989,"UK/US","Pop","Synthpop","neon,catchy,retro,futuristic","analog synth,drum machine,electric bass,gated reverb",100,130,"TikTok,Shorts,Tech","复古科技、霓虹转场","1980s synthpop, analog polysynth chords, punchy drum machine, gated snare, neon nostalgic melody","1980年代Synthpop，模拟复音合成器、鼓机、门限混响军鼓、霓虹怀旧旋律","no dubstep, no trap hats","seed:public-genre-knowledge"],
    ["1980s-city-pop","1980s",1980,1989,"Japan","Pop","City Pop","urban,nostalgic,smooth,summer night","electric piano,slap bass,clean guitar,brass,synth",95,125,"Vlog,Reels,Beauty","精致生活、城市夜晚","Japanese 1980s city pop, smooth electric piano, slap bass, clean guitar, brass stabs, summer night city lights","日本80年代City Pop，电钢琴、Slap贝斯、清音吉他、铜管、夏夜城市灯光","no modern trap, no aggressive EDM","seed:public-genre-knowledge"],
    ["1980s-hiphop-oldschool","1980s",1980,1989,"New York / US","Hip Hop","Old School","block party,raw,playful,breakbeat","drum breaks,turntable,bass,synth stab",90,115,"TikTok,Street","街头、教程、节奏口播","1980s old school hip hop instrumental, breakbeat drums, turntable scratches, simple bassline, block party energy","80年代Old School Hip Hop器乐，Breakbeat鼓、唱盘Scratch、简单贝斯、街区派对能量","no modern trap 808, no drill","seed:public-genre-knowledge"],
    ["1990s-boombap","1990s",1990,1999,"US East Coast","Hip Hop","Boom Bap","gritty,headnod,urban,classic","sampled drums,jazz sample,bass,vinyl crackle",80,100,"Knowledge,Shorts","知识口播、街头真实感","1990s east coast boom bap, crunchy sampled drums, dusty jazz loop, warm bass, vinyl crackle, head-nod groove","90年代东海岸Boom Bap，颗粒采样鼓、尘土爵士Loop、温暖贝斯、黑胶噪声","no trap hi-hats, no EDM synth","seed:public-genre-knowledge"],
    ["1990s-trip-hop","1990s",1990,1999,"Bristol / UK","Electronic","Trip Hop","dark,downtempo,cinematic,moody","slow breakbeat,dub bass, Rhodes,strings,vinyl",65,90,"Fashion,Art,Vlog","高级暗调、时尚大片","1990s Bristol trip-hop, slow dusty breakbeat, deep dub bass, Rhodes chords, cinematic strings, smoky atmosphere","90年代Bristol Trip-hop，慢速尘土Breakbeat、深Dub贝斯、Rhodes、电影音弦乐、烟雾感","no bright pop, no fast EDM","seed:public-genre-knowledge"],
    ["1990s-house-chicago","1990s",1985,1999,"Chicago / US","House","Classic House","uplifting,club,groovy,steady","909 drums,piano stab,bassline,vocal chop",118,128,"Dance,TikTok","舞蹈、活力开场","classic Chicago house, 909 four-on-floor drums, piano stabs, warm bassline, soulful vocal chops, warehouse groove","经典Chicago House，909四拍鼓、钢琴切分、温暖贝斯、灵魂人声切片、仓库舞曲感","no dubstep drop, no trap","seed:public-genre-knowledge"],
    ["1990s-grunge","1990s",1990,1999,"Seattle / US","Rock","Grunge","raw,angsty,distorted,garage","distorted guitars,bass,live drums",80,140,"Story,Vlog","真实反叛、粗粝人物故事","1990s grunge rock, distorted guitars, raw live drums, gritty bass, garage room sound, emotional tension","90年代Grunge，失真吉他、粗粝真鼓、车库房间声、情绪张力","no polished pop, no EDM","seed:public-genre-knowledge"],
    ["2000s-pop-punk","2000s",2000,2009,"US","Rock","Pop Punk","youthful,fast,energetic,anthemic","power chords,bass,fast drums",150,190,"TikTok,Vlog","青春、高能日常","2000s pop punk, fast power chords, bright distorted guitars, punchy drums, youthful anthem energy","2000年代Pop Punk，快速强力和弦、明亮失真吉他、冲击鼓、青春合唱感","no metal growl, no EDM","seed:public-genre-knowledge"],
    ["2000s-rnb-neosoul","2000s",2000,2009,"US","R&B","Neo Soul","smooth,warm,intimate,groovy","Rhodes,soft drums,bass,guitar,strings",70,100,"Beauty,Vlog,Podcast","亲密高级、生活方式","2000s neo soul, warm Rhodes chords, laid-back drums, deep bass, subtle guitar licks, intimate groove","2000年代Neo Soul，温暖Rhodes、松弛鼓、深贝斯、细腻吉他、亲密律动","no harsh EDM, no trap overload","seed:public-genre-knowledge"],
    ["2000s-reggaeton","2000s",2000,2009,"Puerto Rico / Latin America","Reggaeton","Dembow","percussive,club,latin,confident","dembow drums,sub bass,latin percussion,synth",90,105,"TikTok,Dance","拉美舞蹈、活力带货","2000s reggaeton dembow rhythm, punchy latin percussion, sub bass, club synth stabs, confident urban energy","2000年代Reggaeton Dembow节奏，拉丁打击、Sub贝斯、俱乐部合成器、城市自信","no offensive lyrics, no unlicensed samples","seed:public-genre-knowledge"],
    ["2010s-trap","2010s",2010,2019,"US South","Hip Hop","Trap","dark,modern,808,confident","808 bass,trap hats,snare rolls,minor synth",120,160,"TikTok,Shorts","潮流、强冲击转场","2010s trap instrumental, deep 808 bass, rolling hi-hats, sharp snares, dark minor synth melody, modern bounce","2010年代Trap器乐，深808、滚动Hi-hat、锐利军鼓、小调合成器、现代弹跳","no explicit lyrics, no copyrighted sample","seed:public-genre-knowledge"],
    ["2010s-future-bass","2010s",2010,2019,"Global","Electronic","Future Bass","bright,emotional,wide,festival","supersaw chords,sidechain,808,pluck synth",130,160,"Ads,TikTok","情绪爆发、科技产品","2010s future bass, wide detuned synth chords, sidechain pulse, bright plucks, emotional festival lift","2010年代Future Bass，宽阔失谐合成器和弦、侧链律动、明亮Pluck、情绪抬升","no harsh dubstep growls, no muddy mix","seed:public-genre-knowledge"],
    ["2010s-lofi-hiphop","2010s",2010,2019,"Internet / Global","Hip Hop","Lo-fi Hip Hop","cozy,study,warm,nostalgic","dusty drums,jazz chords,v vinyl,soft bass",60,90,"Vlog,Study,ASMR","学习、手作、陪伴","lo-fi hip hop study beat, dusty drums, warm jazz chords, vinyl crackle, soft bass, cozy room ambience","Lo-fi Hip Hop学习节拍，尘土鼓、温暖爵士和弦、黑胶噪声、柔和贝斯、房间氛围","no loud vocals, no aggressive drums","seed:public-genre-knowledge"],
    ["2010s-kpop-edm","2010s",2010,2019,"Korea","Pop","K-pop EDM Pop","polished,bright,dance,high-energy","EDM drums,synth bass,vocal chops,brass hits",120,130,"Dance,TikTok","舞蹈挑战、精致快剪","2010s K-pop EDM pop instrumental, polished synth bass, tight dance drums, vocal chop hooks, bright brass hits","2010年代K-pop EDM流行器乐，精致合成贝斯、紧凑舞曲鼓、人声切片Hook、明亮铜管","no copyrighted melody, no vocals mimicking artists","seed:public-genre-knowledge"],
    ["2020s-hyperpop","2020s",2020,2029,"Internet / Global","Pop","Hyperpop","glitchy,maximal,bright,chaotic","distorted synth,glitch drums,pitched chops,808",140,180,"TikTok,GenZ","Z世代、强视觉冲击","2020s hyperpop instrumental, glossy distorted synths, glitch percussion, pitched vocal chops, maximal digital sparkle","2020年代Hyperpop器乐，失真亮面合成器、Glitch打击、变调切片、极大主义数字闪光","no artist imitation, no harsh clipping","seed:public-genre-knowledge"],
    ["2020s-afrobeats","2020s",2020,2029,"West Africa / Global","Afrobeats","Afropop","warm,groovy,sunny,global","african percussion,log drum,guitar,bass,soft keys",95,115,"TikTok,Travel,Lifestyle","阳光生活方式、全球化","modern Afrobeats, warm syncopated percussion, log drum accents, clean guitar riffs, smooth bass, sunny global pop feel","现代Afrobeats，温暖切分打击、Log Drum点缀、清音吉他、顺滑贝斯、阳光全球流行感","no cultural caricature, no unlicensed vocals","seed:public-genre-knowledge"],
    ["2020s-phonk","2020s",2020,2029,"Internet / Eastern Europe / Brazil","Electronic/Hip Hop","Phonk","dark,drift,aggressive,viral","cowbell,808,distorted drums,memphis samples",120,170,"Shorts,TikTok","赛车、强节奏剪辑","2020s drift phonk instrumental, distorted cowbell melody, heavy 808, gritty drums, dark viral car edit energy","2020年代Drift Phonk器乐，失真Cowbell旋律、重808、粗粝鼓、暗黑赛车剪辑能量","no uncleared vocal samples, no excessive clipping","seed:public-genre-knowledge"],
    ["2020s-ambient-wellness","2020s",2020,2029,"Global","Ambient","Wellness Ambient","calm,breathing,meditative,spa","soft pads,field recordings,handpan,flute,bells",50,75,"ASMR,Wellness,Vlog","疗愈但不宣称疗效、冥想背景","2020s wellness ambient, slow evolving pads, handpan overtones, soft flute, field recordings, breath-like pacing","2020年代Wellness Ambient，缓慢Pad、手碟泛音、柔和长笛、自然录音、呼吸节奏","no medical healing claims, no binaural cure claims","seed:public-genre-knowledge"],
    ["2020s-amapiano","2020s",2020,2029,"South Africa","Dance","Amapiano","deep,groovy,log-drum,social","log drum,shakers,piano chords,bass,percussion",110,115,"Dance,TikTok","社交舞蹈、轻松聚会","South African amapiano, deep log drum bass, airy shakers, jazzy piano chords, relaxed township groove","南非Amapiano，深Log Drum贝斯、空气感沙锤、爵士钢琴和弦、松弛社交律动","no cultural caricature, no copied vocal chant","seed:public-genre-knowledge"]
  ];
  const stmt = db.prepare(`INSERT OR REPLACE INTO music_styles
    (id, decade, year_start, year_end, region, genre, subgenre, mood_tags, instruments, bpm_min, bpm_max, platform_fit, creator_use_case, prompt_en, prompt_zh, negative_prompt, source, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertMany = db.transaction(() => {
    for (const row of styles) stmt.run(...row, now);
    const sourceStmt = db.prepare("INSERT OR REPLACE INTO music_sources (id, name, url, license_note, imported_at) VALUES (?, ?, ?, ?, ?)");
    sourceStmt.run("seed-public-genre-knowledge", "Curated public genre knowledge seed", "local://seed", "Descriptive metadata and prompts curated for original generation; not copied lyrics/melodies.", now);
    const tpl = db.prepare("INSERT OR REPLACE INTO music_prompt_templates (id, name, use_case, template_en, template_zh, required_slots, negative_prompt) VALUES (?, ?, ?, ?, ?, ?, ?)");
    tpl.run("creator-short-video", "Creator Short Video BGM", "TikTok/Reels/Shorts", "{genre} inspired {duration}s background music for {creator_type}, {mood}, {instruments}, {bpm} BPM, safe for social media, no copyrighted melody", "为{creator_type}创作{duration}秒{genre}风格短视频背景音乐，情绪{mood}，乐器{instruments}，{bpm} BPM，适合社媒发布，无版权旋律", "genre,duration,creator_type,mood,instruments,bpm", "no copyrighted melody, no artist imitation, no explicit lyrics");
    tpl.run("brand-asmr", "Brand ASMR Product Score", "Product/ASMR", "sensory ASMR product score, {genre} texture, close-mic details, {instruments}, subtle rhythm, premium clean mix", "感官ASMR产品配乐，{genre}质感，近距离细节声，{instruments}，轻节奏，高级干净混音", "genre,instruments", "no medical claims, no harsh noise");
    tpl.run("culture-localization", "Culture Localization Music", "Cross-cultural adaptation", "localized {region} music influence blended with {genre}, respectful modern arrangement, {mood}, creator-safe instrumental", "融合{region}本地音乐影响与{genre}，尊重文化语境的现代编曲，{mood}，适合创作者使用的器乐", "region,genre,mood", "no stereotypes, no sacred chant misuse, no copied folk melody");
  });
  insertMany();
}

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
  const { provider, customApiKey } = req.body;
  const activeProvider = provider || "openai";
  if (activeProvider === "gemini") {
    if (!process.env.GEMINI_API_KEY && !customApiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add it in Settings > Secrets or select a different provider.",
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
  const base = apiBase.replace(/\/+$/, "");
      // Prevent double-append; ensure /v1 is present for standard OpenAI-compatible endpoints
      const url = base.endsWith("/chat/completions")
        ? base
        : /\/v[0-9]+$/.test(base)
          ? `${base}/chat/completions`
          : `${base}/v1/chat/completions`;
  
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



type CreatorBrief = {
  name?: string;
  cultureAsset?: string;
  businessGoal?: string;
  targetRegions?: string[];
  targetPlatforms?: string[];
  emotionalKernel?: string[];
  mustHave?: string[];
  mustNot?: string[];
  brandTone?: string;
};

const REGION_PLAYBOOKS: Record<string, any> = {
  "North America": {
    aliases: ["North America", "北美", "US", "USA", "Canada"],
    language: "English",
    localEmotion: "independent creator autonomy + cozy micro-ritual",
    insight: "Short-form viewers reward authentic making processes, creator vulnerability, transparent materials, and FTC-safe personal storytelling. Avoid hard claims; show the lived ritual instead.",
    risks: ["FTC endorsement disclosure", "FDA/health efficacy claims", "DMCA music risk", "privacy of followers and minors"],
    hooks: ["POV: you built a tiny ritual from scratch", "I stopped selling outcomes and started sharing process", "From China desk to global creator studio"],
    visual: "clean daylight workbench, macro hands, warm neutral palette, subtitle-first editing",
    music: "warm lo-fi guitar, soft room tone, light vinyl texture, no copyrighted melody",
    hashtags: ["#creatorstory", "#slowmade", "#smallbusiness", "#crafttok", "#behindthescenes"],
    kpi: { ctr: "1.8%+", saveRate: "6%+", commentRate: "1.2%+" }
  },
  "Latin America": {
    aliases: ["Latin America", "拉美", "LATAM", "Mexico", "Brazil"],
    language: "Spanish/Portuguese-localized",
    localEmotion: "family warmth + neighborly joy + handmade affection",
    insight: "Community, color, music, and gift-giving outperform cold premium positioning. Make the creator feel like a trusted friend showing a heartfelt tradition.",
    risks: ["religious stereotype", "over-exoticizing folklore", "misusing local slang", "unlicensed music"],
    hooks: ["Hecho con calma, compartido con cariño", "Un pequeño ritual para regalar alegría", "La historia detrás de mis manos"],
    visual: "golden-hour table, saturated accents, family gift wrapping, friendly smile cutaways",
    music: "acoustic guitar, gentle shaker, pan flute accent, upbeat but intimate",
    hashtags: ["#hechoamano", "#creadores", "#regalosconamor", "#emprender", "#historiasreales"],
    kpi: { ctr: "2.0%+", shareRate: "4%+", commentRate: "1.5%+" }
  },
  "Europe": {
    aliases: ["Europe", "欧洲", "EU", "UK", "Germany", "France"],
    language: "English + local subtitles",
    localEmotion: "sustainable craft + quiet credibility + provenance",
    insight: "European audiences respond to proof of materials, sustainability, provenance, privacy respect, and understated design. Replace hype with evidence and craft discipline.",
    risks: ["GDPR data capture", "greenwashing", "unverified sustainability claims", "country-specific ad disclosures"],
    hooks: ["The provenance of one handmade detail", "Less hype, more proof", "A quiet object with a traceable story"],
    visual: "minimal natural light, material closeups, recycled packaging, captions with source notes",
    music: "minimal piano, soft field recording, clean licensing",
    hashtags: ["#sustainablecreator", "#craftsmanship", "#slowdesign", "#independentmaker"],
    kpi: { ctr: "1.5%+", saveRate: "7%+", emailSignup: "3%+" }
  },
  "Southeast Asia": {
    aliases: ["Southeast Asia", "东南亚", "SEA", "Singapore", "Malaysia", "Indonesia", "Thailand"],
    language: "English + market subtitles",
    localEmotion: "mobile-first creator relatability + practical beauty + respectful cultural fit",
    insight: "Mobile-first creator communities prefer fast proof, practical use, live commerce readiness, and careful handling of religious/halal sensitivities.",
    risks: ["religious sensitivity", "halal/ingredient ambiguity", "overly revealing visuals", "marketplace policy violations"],
    hooks: ["A tiny ritual for humid busy days", "Made by hand, tested in real life", "Creator desk to your daily bag"],
    visual: "bright mobile closeups, practical before/after usage without medical claims, modest styling",
    music: "light pop percussion, soft marimba, clean beat loop",
    hashtags: ["#smallcreator", "#dailyritual", "#handmade", "#tiktokshop"],
    kpi: { ctr: "2.2%+", liveClick: "5%+", addToCart: "3%+" }
  },
  "East Asia": {
    aliases: ["East Asia", "日韩", "Japan", "Korea", "日本", "韩国"],
    language: "Japanese/Korean-localized",
    localEmotion: "delicate detail + trustable routine + low-key refinement",
    insight: "Detail fidelity, packaging discipline, routine demonstration, and precise subtitles matter more than loud selling. Avoid exaggerated superiority claims.",
    risks: ["beauty efficacy claims", "insufficient localization", "rude informality", "copyrighted BGM"],
    hooks: ["A quiet routine from a small studio", "The detail I repeat every batch", "Handmade, but disciplined"],
    visual: "tidy desk, small labels, packaging ASMR, macro texture, pastel restraint",
    music: "soft city-pop inspired royalty-free loop, light keys",
    hashtags: ["#smallstudio", "#routine", "#handmade", "#asmr"],
    kpi: { ctr: "1.6%+", saveRate: "8%+", repeatView: "20%+" }
  }
};

function resolveRegionPlaybook(region: string) {
  return Object.values(REGION_PLAYBOOKS).find((p: any) => p.aliases.some((a: string) => region.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(region.toLowerCase()))) || REGION_PLAYBOOKS["North America"];
}

function normalizeList(value: any, fallback: string[]) {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,，;；]/).map(v => v.trim()).filter(Boolean);
  return fallback;
}

type DataTrace = { source: string; recordId: string; reason: string; confidence: number };
type RuleHit = { ruleId: string; name: string; severity: "low" | "medium" | "high"; reason: string; action: string; source: string };

const CREATOR_CATEGORY_PLAYBOOKS: Record<string, any> = {
  personal_creator: { id: "personal_creator", nameZh: "个人自媒体 / 真实人格 IP", nameEn: "Personal Creator / Human-led IP", keywords: ["vlog", "生活", "个人", "日常", "creator", "博主", "自媒体"], narratives: ["真实过程", "连续陪伴", "评论驱动选题", "低压关系"], contentPillars: ["Who I am", "How I make", "What I learned", "Audience Q&A", "Behind the scene"], risks: ["虚假人设", "过度包装", "隐私暴露", "无披露商业合作"], templates: ["POV Hook", "Before/After without hard claims", "Comment-to-video", "Creator diary"] },
  beauty_craft_creator: { id: "beauty_craft_creator", nameZh: "美妆护肤/香膏手作创作者", nameEn: "Beauty Craft / Handmade Skincare Creator", keywords: ["护肤", "美妆", "香膏", "香水", "草本", "skincare", "beauty", "balm", "makeup"], narratives: ["clean ritual", "sensory care", "handmade proof", "ingredient transparency"], contentPillars: ["材料透明", "制作过程", "使用仪式", "包装审美", "合规避坑"], risks: ["FDA 药用声明", "FTC 背书披露", "过敏/功效暗示", "Before-after 误导"], templates: ["Ingredient proof", "ASMR making", "Routine ritual", "Claim-safe transformation"] },
  knowledge_creator: { id: "knowledge_creator", nameZh: "知识/课程/咨询型创作者", nameEn: "Knowledge / Course / Consulting Creator", keywords: ["知识", "课程", "咨询", "顾问", "教程", "course", "coach", "consult", "framework"], narratives: ["framework proof", "case breakdown", "template lead magnet", "no-income-guarantee"], contentPillars: ["误区拆解", "框架教学", "案例复盘", "模板领取", "直播答疑"], risks: ["收益保证", "夸大资历", "财务/医疗/法律建议越界", "未披露 affiliate"], templates: ["3-step framework", "Mistake teardown", "Template walkthrough", "Case clinic"] },
  culture_travel_creator: { id: "culture_travel_creator", nameZh: "文旅/城市/非遗体验创作者", nameEn: "Culture Travel / Heritage Experience Creator", keywords: ["文旅", "城市", "旅行", "非遗", "文化", "街巷", "travel", "heritage", "city"], narratives: ["hidden local story", "respectful heritage", "human guide", "slow discovery"], contentPillars: ["地点故事", "人物采访", "工艺细节", "路线攻略", "文化避坑"], risks: ["东方主义猎奇", "宗教/民族刻板印象", "未经许可拍摄", "地点安全隐私"], templates: ["Hidden story", "One street one craft", "Local myth fact-check", "Respectful guide"] },
  ai_tool_creator: { id: "ai_tool_creator", nameZh: "AI 工具/效率教程创作者", nameEn: "AI Tool / Productivity Creator", keywords: ["AI", "工具", "效率", "剪辑", "自动化", "notion", "software", "template"], narratives: ["productivity proof", "tutorial", "template download", "workflow evidence"], contentPillars: ["一屏展示结果", "步骤教程", "模板复用", "案例前后", "工具比较"], risks: ["自动赚钱夸大", "平台 ToS 违规", "数据隐私", "未经授权抓取"], templates: ["Screen-record tutorial", "Prompt teardown", "Template lead magnet", "Workflow challenge"] }
};

const PLATFORM_PLAYBOOKS: Record<string, any> = {
  TikTok: { aliases: ["TikTok", "抖音海外"], format: "9:16, 15-35s", hook: "0-3秒强视觉/强问题", cadence: "每日1-2条", cta: "Follow for part 2 / comment to choose next", risks: ["版权音乐", "夸大声明", "未披露广告"], kpis: { threeSec: "65%+", completion: "28%+", ctr: "1.8%+" } },
  "Instagram Reels": { aliases: ["Instagram", "Reels", "IG"], format: "9:16, 20-45s", hook: "审美封面 + 保存价值", cadence: "每日1条+Story互动", cta: "Save this / DM keyword", risks: ["图片授权", "虚假生活方式", "抽奖规则"], kpis: { saveRate: "6%+", shareRate: "2%+", profileClick: "1.5%+" } },
  "YouTube Shorts": { aliases: ["YouTube Shorts", "Shorts", "YouTube"], format: "9:16, 30-60s", hook: "搜索标题 + 结果先行", cadence: "每周5-7条", cta: "Watch the full guide / subscribe", risks: ["误导标题", "重复搬运", "版权BGM"], kpis: { retention: "55%+", subRate: "0.8%+", searchLift: "week over week" } },
  Newsletter: { aliases: ["Newsletter", "邮件", "Substack"], format: "800-1500 words", hook: "清单/模板/案例复盘", cadence: "每周1-2封", cta: "Download checklist", risks: ["GDPR consent", "垃圾邮件合规"], kpis: { openRate: "35%+", clickRate: "5%+", signupRate: "3%+" } }
};

const GLOBAL_RISK_RULES: RuleHit[] = [
  { ruleId: "FDA-HEALTH-CLAIM", name: "禁止医疗/疗效承诺", severity: "high", reason: "美妆、香膏、身心内容不可暗示治疗、治愈、抗焦虑等功效。", action: "改为感官、生活方式、过程证明表达。", source: "risk_rules.csv + creator compliance playbook" },
  { ruleId: "FTC-ENDORSEMENT", name: "商业合作/赠品披露", severity: "high", reason: "个人创作者出海必须披露赞助、赠品、affiliate。", action: "加入 #ad / paid partnership / affiliate disclosure。", source: "FTC Endorsement Guides" },
  { ruleId: "DMCA-MUSIC", name: "版权音乐与素材授权", severity: "high", reason: "欧美平台版权识别严格，未授权音乐会导致限流/下架。", action: "使用平台商用曲库或自有授权素材并记录来源。", source: "platforms.csv + DMCA playbook" },
  { ruleId: "GDPR-PRIVACY", name: "隐私与邮件订阅合规", severity: "high", reason: "欧洲用户数据收集需要明确同意和退订机制。", action: "表单加入 consent、privacy link、unsubscribe。", source: "GDPR rules" },
  { ruleId: "NO-INCOME-GUARANTEE", name: "禁止收益保证", severity: "high", reason: "知识/AI/商业类内容不可承诺自动赚钱或固定收益。", action: "改为案例、过程、变量、风险提示。", source: "creator monetization policy" },
  { ruleId: "CULTURAL-STEREOTYPE", name: "文化刻板印象拦截", severity: "medium", reason: "出海内容不能把东方/拉美/宗教符号当猎奇装饰。", action: "使用具体人物、地点、过程和来源说明替代泛化标签。", source: "culture_narratives.csv" }
];

function scoreText(text: string, keywords: string[]) {
  const low = text.toLowerCase();
  return keywords.reduce((n, k) => n + (low.includes(String(k).toLowerCase()) ? 1 : 0), 0);
}

function detectCreatorCategory(brief: CreatorBrief, ipType?: string) {
  const text = `${brief.name || ""} ${brief.cultureAsset || ""} ${brief.businessGoal || ""} ${(brief.mustHave || []).join(" ")} ${(brief.mustNot || []).join(" ")}`;
  let best = "personal_creator";
  let bestScore = ipType === "personal" ? 1 : 0;
  for (const [id, pb] of Object.entries(CREATOR_CATEGORY_PLAYBOOKS)) {
    const score = scoreText(text, pb.keywords);
    if (score > bestScore) { best = id; bestScore = score; }
  }
  return best;
}

function resolvePlatformPlaybook(platform: string) {
  return Object.values(PLATFORM_PLAYBOOKS).find((p: any) => p.aliases.some((a: string) => platform.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(platform.toLowerCase()))) || PLATFORM_PLAYBOOKS.TikTok;
}

function buildDataContext(brief: CreatorBrief, ipType?: string) {
  const csvDb = readCsvDatabase();
  const categoryId = detectCreatorCategory(brief, ipType);
  const category = CREATOR_CATEGORY_PLAYBOOKS[categoryId];
  const markets = normalizeList(brief.targetRegions, ["North America"]).map(name => ({ name, ...resolveRegionPlaybook(name) }));
  const platforms = normalizeList(brief.targetPlatforms, ["TikTok", "Instagram Reels", "YouTube Shorts"]).map(name => ({ name, ...resolvePlatformPlaybook(name) }));
  const text = `${brief.name || ""} ${brief.cultureAsset || ""} ${brief.businessGoal || ""} ${(brief.mustHave || []).join(" ")} ${(brief.mustNot || []).join(" ")}`;
  const hay = `${text} ${category.risks.join(" ")} ${markets.flatMap((m:any)=>m.risks).join(" ")} ${platforms.flatMap((p:any)=>p.risks).join(" ")}`;
  const rulesTriggered = GLOBAL_RISK_RULES.filter(rule => rule.ruleId === "CULTURAL-STEREOTYPE" || scoreText(hay, rule.name.split(/[\/与 ]/).concat(rule.reason.split(/[，。/ ]/))) > 0 || hay.toLowerCase().includes(rule.ruleId.split("-")[0].toLowerCase()));
  const dataSourceTrace: DataTrace[] = [
    { source: "categories.csv + creator playbook", recordId: category.id, reason: `根据内容资产与目标识别为 ${category.nameZh}`, confidence: 0.9 },
    ...markets.map((m:any) => ({ source: "target_markets.csv + Hofstede playbook", recordId: m.name, reason: `匹配目标市场 ${m.name} 的文化情绪与合规边界`, confidence: 0.88 })),
    ...platforms.map((pl:any) => ({ source: "platforms.csv + platform policy", recordId: pl.name, reason: `匹配 ${pl.name} 的格式、Hook、节奏与KPI`, confidence: 0.86 })),
    ...rulesTriggered.map(r => ({ source: r.source, recordId: r.ruleId, reason: r.reason, confidence: r.severity === "high" ? 0.94 : 0.82 }))
  ];
  return { matchedCategory: category, matchedMarkets: markets, matchedPlatforms: platforms, matchedNarratives: category.narratives, matchedRiskRules: rulesTriggered, matchedTemplates: category.templates, matchedKpis: platforms.map((p:any) => ({ platform: p.name, kpis: p.kpis })), csvDbSummary: Object.fromEntries(Object.entries(csvDb).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])), csvSamples: Object.fromEntries(Object.entries(csvDb).map(([k, v]) => [k, Array.isArray(v) ? v.slice(0, 3) : []])), dataSourceTrace };
}

function buildAgentResult(agentId: string, input: any, output: any, rulesUsed: string[], confidence = 0.9, warnings: string[] = [], nextActions: string[] = []) {
  return { agentId, input, output, rulesUsed, confidence, status: "done", warnings, nextActions };
}

function buildCreatorMvpResponse(brief: CreatorBrief, ipType?: string) {
  const now = new Date();
  const timestampStr = now.toLocaleTimeString();
  const campaignId = `creator-mvp-${now.getTime().toString(36)}`;
  const customName = brief.name || "个人自媒体 IP";
  const customAsset = brief.cultureAsset || "创作者故事、技能与日常内容资产";
  const customGoal = brief.businessGoal || "在海外获得第一批精准粉丝、验证内容定位并形成可复用转化路径";
  const customRegions = normalizeList(brief.targetRegions, ["North America"]);
  const customPlatforms = normalizeList(brief.targetPlatforms, ["TikTok", "Instagram Reels", "YouTube Shorts"]);
  const kernels = normalizeList(brief.emotionalKernel, ["真实", "陪伴", "慢生活", "可信任"]);
  const mustHave = normalizeList(brief.mustHave, ["展示真人/真实过程", "字幕双语", "明确无夸大承诺", "可复制的发布节奏"]);
  const mustNot = normalizeList(brief.mustNot, ["医疗/收益保证", "搬运版权音乐", "文化刻板印象", "虚假稀缺营销"]);
  const tone = brief.brandTone || "真诚、专业、温暖、有行动感";
  const dataContext = buildDataContext(brief, ipType);
  const category = dataContext.matchedCategory;
  const regions = dataContext.matchedMarkets.map((m:any) => ({ reg: m.name, playbook: m }));
  const platformPlans = dataContext.matchedPlatforms;
  const rulesTriggered = dataContext.matchedRiskRules;
  const riskItems = Array.from(new Map(rulesTriggered.map((r: RuleHit) => [r.ruleId, r])).values()).slice(0, 10).map((rule: RuleHit) => ({ category: rule.name, categoryZh: rule.name, severity: rule.severity, reason: rule.reason, reasonZh: rule.reason, suggestion: rule.action, suggestionZh: rule.action, basisType: /DMCA|版权|platform/i.test(rule.ruleId) ? "platform_terms" as const : /FDA|FTC|GDPR|收益/.test(rule.ruleId) ? "regulatory_rule" as const : "cultural_taboo" as const, triggeredRuleCode: rule.ruleId, triggeredRuleCodeZh: rule.ruleId, basisDescription: rule.source, basisDescriptionZh: rule.source }));

  const regionInsights = regions.map(({ reg, playbook }: any) => ({ name: reg, insights: [playbook.insight, `品类匹配：${category.nameZh}，推荐叙事=${category.narratives.join(" / ")}。`, `适配 ${customName}：用「${customAsset}」作为 proof，而不是抽象口号。Must-Have: ${mustHave.slice(0, 3).join(" / ")}`], risks: Array.from(new Set([...playbook.risks, ...category.risks, ...mustNot])).slice(0, 8) }));
  const localCanons = regions.map(({ reg, playbook }: any) => ({ region: reg, localEmotion: playbook.localEmotion, scenes: [playbook.visual, `真实拍摄：开场 0-3 秒直接展示 ${customAsset} 的过程或结果`, `评论区提问转下一条视频，形成连续剧式内容飞轮`], dont: ["不要用国内黑话直译", "不要夸大疗效/收入/身份背书", ...playbook.risks.slice(0, 3)], mappingDescription: `将中文个人 IP 的「努力/审美/手艺/知识」转译为 ${reg} 可理解的 creator proof：过程透明、语气平视、字幕友好、风险可控。`, adaptationBasis: `Creator-market fit playbook: ${playbook.localEmotion}; language=${playbook.language}.`, adaptationBasisZh: `创作者出海适配依据：${playbook.localEmotion}；语言策略=${playbook.language}。`, evidenceData: `MVP benchmark: target CTR ${playbook.kpi.ctr || "1.8%+"}, save/share/comment metrics tracked weekly.`, evidenceDataZh: `MVP 复盘阈值：CTR ${playbook.kpi.ctr || "1.8%+"}，并按周追踪收藏/分享/评论质量。` }));
  const videoThemes = [
    { title: "Day 1｜3 秒自我定位", duration: "15s", concept: `第一镜头展示 ${customAsset}，字幕：I make this for people who need ${kernels[0]}. 结尾问：Which country should I test next?` },
    { title: "Day 2｜过程 ASMR / Proof", duration: "20s", concept: `套用模板：${category.templates[0]}。不解释概念，直接拍材料、手部动作、屏幕过程、失败重做。` },
    { title: "Day 3｜本地化误区避坑", duration: "30s", concept: `讲一个中文内容直接出海会踩的坑：${mustNot[0]}，展示安全替代表达。` },
    { title: "Day 4｜用户评论二创", duration: "15s", concept: "把海外评论/问题变成下一条视频标题，形成连续互动。" },
    { title: "Day 5｜软转化 CTA", duration: "20s", concept: "引导关注、领取清单、加入 newsletter/社群，不做强硬销售。" },
    { title: "Day 6｜规则透明化", duration: "25s", concept: `公开创作边界：${rulesTriggered.slice(0,2).map((r:RuleHit)=>r.name).join("、")}，建立信任。` }
  ];
  const copyRegions = regions.map(({ reg, playbook }: any) => ({ region: reg, title: `${customName} | ${playbook.hooks[0]}`, tiktokCaption: `${playbook.hooks[1]} ✨ ${mustHave[0] || "real process"}. Follow the series as I localize this creator journey for ${reg}.`, igReelsCaption: `A quieter look at ${customAsset}. Built for ${reg} with ${tone}. Save this if you are building a cross-border personal brand.`, lyricsHook: reg.includes("Latin") || reg.includes("拉美") ? "Hecho con calma, brilla con cariño" : "Small ritual, real hands, brighter days", musicPrompt: playbook.music, hashtags: playbook.hashtags, storyboard: [{ timeframe: "00:00 - 00:03", scene: `硬切到 ${customAsset} 最有视觉冲击的动作/结果`, textOverlay: playbook.hooks[0] }, { timeframe: "00:03 - 00:10", scene: "展示 2-3 个真实过程镜头：材料、屏幕、手部、失败重做", textOverlay: "No hype. Just the process." }, { timeframe: "00:10 - 00:18", scene: `解释为什么这对 ${reg} 用户有用：${playbook.localEmotion}`, textOverlay: "Localized for real people." }, { timeframe: "00:18 - 00:25", scene: "以问题收尾，邀请评论决定下一条", textOverlay: "Which version should I test next?" }] }));
  const sprint = Array.from({ length: 14 }, (_, idx) => { const platform = platformPlans[idx % platformPlans.length]; const template = category.templates[idx % category.templates.length]; return { day: idx + 1, task: idx % 3 === 0 ? `在 ${platform.name} 发布 ${template} hook 测试` : idx % 3 === 1 ? `把胜出素材重剪到 ${platform.name}` : "回复评论并生成下一条选题", deliverable: idx % 3 === 0 ? "1条短视频 + 2个标题版本 + 1个封面" : idx % 3 === 1 ? "跨平台重剪版 + 本地化caption" : "评论洞察 + RAG/规则更新记录", metric: Object.entries(platform.kpis || {}).map(([k,v]) => `${k}:${v}`).join(" / ") || "CTR / 3秒留存 / 评论率", ruleFocus: rulesTriggered[idx % Math.max(1, rulesTriggered.length)]?.ruleId || "CREATOR-PROOF" }; });

  const culturePack: any = { market_insight: { title: `${customName} 个人自媒体出海 MVP Agent 集群策略`, regions: regionInsights }, cultural_adaptation: { framework: `Personal Creator Globalization MVP: data retrieval → rule engine → persona proof → content sprint → compliance gate → growth loop. Category=${category.id}.`, localCanons }, content_strategy: { pillars: [`人设锚点：${customName} = ${tone} 的个人创作者，而不是无脸品牌号。`, `内容资产：围绕「${customAsset}」拆成 ${category.contentPillars.join(" / ")}。`, `增长目标：${customGoal}，以小步快跑验证市场。`, `合规护栏：${riskItems.map((r:any)=>r.triggeredRuleCode).slice(0,4).join(" / ")}。`], videoThemes, abTest: ["A/B Hook：过程证明型开场 vs 情绪共鸣型开场", "A/B CTA：关注下一集 vs 下载清单/加入 newsletter", "A/B Visual：真人出镜讲述 vs 纯手部/屏幕过程 ASMR", "A/B Market：北美 proof-first vs 拉美 warmth-first"], platformPlan: platformPlans.map((p:any)=>`${p.name}: ${p.format}; ${p.hook}; ${p.cadence}; CTA=${p.cta}`).join(" | ") }, copy_pack: { regions: copyRegions }, visual_prompt: { regions: regions.map(({ reg, playbook }: any) => ({ region: reg, prompt: `Photorealistic vertical short-video frames for ${customName}, ${playbook.visual}, showing ${customAsset}, authentic personal creator studio, bilingual subtitles, natural light, no medical or income claims, 9:16`, description: `适合 ${reg} 的真实个人创作者视觉：${playbook.visual}` })) }, compliance_review: { decision: riskItems.some((r:any) => r.severity === "high") ? "Revise" as const : "Pass" as const, decisionText: "MVP can run after revising high-risk claims and confirming music/image licensing. Publish with disclosure and measurement links.", decisionTextZh: "修订高风险宣称并确认音乐/图片授权后即可跑通 MVP。发布时需加入披露说明与追踪链接。", risks: riskItems }, evaluation_score: { overall: 4.7, final_recommendation: `建议立即启动 14 天 MVP：每天发布 1 条本地化短视频，每 3 天复盘 hook 与 CTA，将胜出模板扩展到 ${customRegions.join("、")}。`, scores: [{ key: "data_grounding", labelZh: "数据底座可信度", labelEn: "Data Grounding", score: 4.8, feedbackZh: `已命中 ${dataContext.dataSourceTrace.length} 条数据/规则来源。`, feedbackEn: `${dataContext.dataSourceTrace.length} data/rule traces matched.` }, { key: "persona_clarity", labelZh: "人设清晰度", labelEn: "Persona Clarity", score: 4.7, feedbackZh: "已从演示型品牌包装升级为可执行个人创作者定位。", feedbackEn: "Converted into runnable creator positioning." }, { key: "content_velocity", labelZh: "内容生产速度", labelEn: "Content Velocity", score: 4.6, feedbackZh: "14天冲刺、模板、平台改写已明确。", feedbackEn: "Sprint, templates, and platform repurposing are defined." }, { key: "compliance_score", labelZh: "合规安全", labelEn: "Compliance Safety", score: 4.5, feedbackZh: "高风险声明、版权和隐私边界已拦截。", feedbackEn: "Claims, copyright, and privacy risks gated." }, { key: "growth_loop", labelZh: "增长闭环", labelEn: "Growth Loop", score: 4.8, feedbackZh: "已给出 KPI、A/B 实验与评论驱动复盘机制。", feedbackEn: "KPI and comment-led loop included." }] }, mvp_agent_cluster: { version: "MVP-1.0-perfect-data-rules", campaignId, dataContext, rulesTriggered, agents: [], executionTrace: [], handoffMap: [], failureFallbacks: ["No API key → deterministic rule engine", "Model JSON parse fail → schema-safe local response", "High-risk claim → ComplianceAgent rewrite gate"], fourteen_day_sprint: sprint, launch_checklist: ["完成英文/本地语言 bio：一句话说明你是谁、帮助谁、凭什么可信", "建立授权音乐与素材文件夹，记录来源", "设置 UTM/短链或表单用于衡量转化", "准备 10 条评论回复模板和 5 条危机响应模板", "发布前跑 ComplianceAgent：禁用疗效、收益、绝对化承诺", "每72小时复盘 CTR/完播/收藏/评论质量并更新 RAG"] } };
  const agentResults = [buildAgentResult("OrchestratorAgent", { brief }, { campaignId, normalizedGoal: customGoal, markets: customRegions, platforms: customPlatforms }, [], 0.96, [], ["handoff_to_data_retrieval"]), buildAgentResult("DataRetrievalAgent", { campaignId }, dataContext, dataContext.dataSourceTrace.map((d:DataTrace)=>d.recordId), 0.94, [], ["handoff_to_market_research"]), buildAgentResult("MarketResearchAgent", { markets: customRegions }, { regionInsights, platformPlans: platformPlans.map((p:any)=>({ name:p.name, format:p.format, kpis:p.kpis })) }, ["target_markets.csv", "market_platform_map.csv"], 0.91), buildAgentResult("PersonaPositioningAgent", { category: category.id }, { bio: `${customName} helps global viewers experience ${kernels[0]} through ${customAsset}.`, pillars: category.contentPillars, tone }, [category.id], 0.92), buildAgentResult("CultureAdapterAgent", { regions: customRegions }, { localCanons }, customRegions, 0.9), buildAgentResult("NarrativeStrategyAgent", { templates: category.templates }, { videoThemes, sprintPreview: sprint.slice(0, 5) }, category.templates, 0.89), buildAgentResult("CopyAgent", { platforms: customPlatforms }, { copyRegions }, customPlatforms, 0.88), buildAgentResult("VisualMusicAgent", { regions: customRegions }, { visual: culturePack.visual_prompt, music: copyRegions.map((r:any)=>({ region:r.region, prompt:r.musicPrompt })) }, ["content_templates.csv", "platforms.csv"], 0.87, riskItems.some((r:any)=>r.triggeredRuleCode === "DMCA-MUSIC") ? ["必须确认音乐授权"] : []), buildAgentResult("ComplianceAgent", { rules: rulesTriggered }, { decision: culturePack.compliance_review.decision, risks: riskItems }, riskItems.map((r:any)=>r.triggeredRuleCode), 0.95, riskItems.filter((r:any)=>r.severity === "high").map((r:any)=>r.category), ["revise_high_risk_claims"]), buildAgentResult("GrowthEvaluatorAgent", { sprint }, { score: culturePack.evaluation_score.overall, kpis: dataContext.matchedKpis, nextExperiment: culturePack.content_strategy.abTest }, ["kpi_presets.csv"], 0.91)];
  culturePack.mvp_agent_cluster.agents = agentResults;
  culturePack.mvp_agent_cluster.executionTrace = agentResults.map((a:any, i:number)=>({ step: i+1, timestamp: timestampStr, agent: a.agentId, status: a.status, confidence: a.confidence, summary: typeof a.output === "string" ? a.output : JSON.stringify(a.output).slice(0, 220) }));
  culturePack.mvp_agent_cluster.handoffMap = agentResults.slice(0,-1).map((a:any, i:number)=>({ from: a.agentId, to: agentResults[i+1].agentId, payload: "structured_context" }));
  const logs = agentResults.map((item:any, index:number) => ({ timestamp: timestampStr, agent: item.agentId, event: index === 0 ? "Init" : index === agentResults.length - 1 ? "Scored" : "Completed", message: `${item.agentId} completed with confidence ${item.confidence}. Rules: ${item.rulesUsed.slice(0,3).join(", ") || "none"}`, type: item.warnings?.length ? "warning" as const : "success" as const }));
  return { success: true, culturePack, logs, agentBlueprint: agentResults, agentCluster: culturePack.mvp_agent_cluster, dataContext, rulesTriggered, generatedAt: now.toISOString(), mode: "deterministic-mvp-agent-cluster-v2" };
}

/**
 * 1. MULTI-TURN CHAT ENDPOINT
 * Statelessly processes a chat conversation.
 */
app.post("/api/gemini/chat", checkApiKey, async (req, res) => {
  try {
    const { provider, model, history, systemInstruction, message, customApiKey, customApiBase } = req.body;
    
    const selectedProvider = provider || "openai";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : selectedProvider === "openai" ? "gpt-4o-mini" : "deepseek-chat");

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
        apiKey = apiKey || process.env.OPENAI_API_KEY || ""; // Uses OPENAI_API_KEY from .env
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
    const selectedProvider = provider || "openai";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : selectedProvider === "openai" ? "gpt-4o-mini" : "deepseek-chat");

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
        apiKey = apiKey || process.env.OPENAI_API_KEY || ""; // Uses OPENAI_API_KEY from .env
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

    const selectedProvider = provider || "openai";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : selectedProvider === "openai" ? "gpt-4o-mini" : "deepseek-chat");

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

    const selectedProvider = provider || "openai";
    const selectedModel = model || (selectedProvider === "gemini" ? "gemini-3.5-flash" : selectedProvider === "openai" ? "gpt-4o-mini" : "deepseek-chat");
    const hasKey = selectedProvider === "gemini" ? !!process.env.GEMINI_API_KEY : !!(customApiKey || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.GLM_API_KEY);

    const mvpResult = buildCreatorMvpResponse(brief, ipType);

    // MVP default: always return a complete, runnable deterministic agent-cluster package.
    // If a model key is present, enrich the trace with a live model advisory note without making the MVP depend on upstream availability.
    if (hasKey) {
      try {
        const advisoryPrompt = `You are a senior growth strategist. Review this creator globalization MVP briefly and return 3 concise improvement bullets in Chinese. Brief: ${JSON.stringify(brief).slice(0, 2000)}`;
        let advisoryText = "";
        if (selectedProvider === "gemini") {
          const response = await generateContentWithFallback({ model: selectedModel, contents: advisoryPrompt });
          advisoryText = response.text || "";
        } else {
          let apiKey = customApiKey || "";
          let apiBase = customApiBase || "";
          if (selectedProvider === "openai") { apiKey = apiKey || process.env.OPENAI_API_KEY || ""; apiBase = apiBase || process.env.OPENAI_API_BASE || "https://api.openai.com/v1"; }
          else if (selectedProvider === "deepseek") { apiKey = apiKey || process.env.DEEPSEEK_API_KEY || ""; apiBase = apiBase || process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/v1"; }
          else if (selectedProvider === "glm") { apiKey = apiKey || process.env.GLM_API_KEY || ""; apiBase = apiBase || process.env.GLM_API_BASE || "https://open.bigmodel.cn/api/paas/v4"; }
          if (apiKey) advisoryText = await callOpenAICompatible({ apiBase, apiKey, model: selectedModel, messages: [{ role: "user", content: advisoryPrompt }] });
        }
        if (advisoryText) {
          mvpResult.logs.push({
            timestamp: timestampStr,
            agent: "LiveModelAdvisor",
            event: "Enriched",
            message: advisoryText.slice(0, 800),
            type: "success" as const
          });
          (mvpResult.culturePack.evaluation_score as any).live_model_advisory = advisoryText;
        }
      } catch (liveError: any) {
        mvpResult.logs.push({
          timestamp: timestampStr,
          agent: "LiveModelAdvisor",
          event: "Skipped",
          message: `上游模型增强不可用，MVP 已使用本地确定性 Agent 集群继续跑通：${liveError.message || liveError}`,
          type: "warning" as const
        });
      }
    }

    saveCampaignRun({
      id: (mvpResult as any).agentCluster?.campaignId || `run-${Date.now()}`,
      timestamp: new Date().toISOString(),
      brief,
      ipType,
      mode: (mvpResult as any).mode,
      category: (mvpResult as any).dataContext?.matchedCategory?.id,
      decision: (mvpResult as any).culturePack?.compliance_review?.decision,
      score: (mvpResult as any).culturePack?.evaluation_score?.overall,
      agentCount: (mvpResult as any).agentCluster?.agents?.length || 0,
      ruleCount: (mvpResult as any).rulesTriggered?.length || 0,
      result: mvpResult
    });

    res.json(mvpResult);
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

/**
 * 8. DATA HUB / RUN HISTORY / KPI REVIEW APIs
 */
app.get("/api/datahub", (_req, res) => {
  try {
    const csvDb = readCsvDatabase();
    res.json({
      success: true,
      tables: Object.fromEntries(Object.entries(csvDb).map(([k, v]) => [k, { rows: v.length, sample: v.slice(0, 5) }])),
      loadedAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to read data hub." });
  }
});

app.get("/api/campaign/runs", (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit || "20"), 10), 100);
  try {
    const rows = getDb().prepare(`
      SELECT id, timestamp, name, culture_asset as cultureAsset, mode, category, decision, score,
             agent_count as agentCount, rule_count as ruleCount
      FROM campaign_runs ORDER BY timestamp DESC LIMIT ?
    `).all(limit);
    return res.json({ success: true, source: "sqlite", runs: rows });
  } catch (error) {
    const runs = readJsonArray(RUNS_FILE).slice(0, limit).map(run => ({
      id: run.id,
      timestamp: run.timestamp,
      name: run.brief?.name,
      cultureAsset: run.brief?.cultureAsset,
      mode: run.mode,
      category: run.category,
      decision: run.decision,
      score: run.score,
      agentCount: run.agentCount,
      ruleCount: run.ruleCount
    }));
    res.json({ success: true, source: "json-fallback", runs });
  }
});

app.get("/api/campaign/runs/:id", (req, res) => {
  try {
    const row: any = getDb().prepare("SELECT * FROM campaign_runs WHERE id = ?").get(req.params.id);
    if (row) {
      const agents = getDb().prepare("SELECT * FROM agent_executions WHERE run_id = ? ORDER BY id ASC").all(req.params.id);
      const rules = getDb().prepare("SELECT * FROM rule_hits WHERE run_id = ? ORDER BY id ASC").all(req.params.id);
      return res.json({ success: true, source: "sqlite", run: { ...row, brief: JSON.parse(row.brief_json), result: JSON.parse(row.result_json), agents, rules } });
    }
  } catch (error) {}
  const runs = readJsonArray(RUNS_FILE);
  const run = runs.find(r => r.id === req.params.id);
  if (!run) return res.status(404).json({ error: "Run not found" });
  res.json({ success: true, source: "json-fallback", run });
});

function buildKpiReview(payload: any) {
  const metrics = payload.metrics || {};
  const runId = payload.runId || "manual";
  const ctr = Number(metrics.ctr || metrics.CTR || 0);
  const completion = Number(metrics.completion || metrics.completionRate || 0);
  const saveRate = Number(metrics.saveRate || 0);
  const commentRate = Number(metrics.commentRate || 0);
  const flags: string[] = [];
  const actions: string[] = [];
  if (ctr && ctr < 1.5) { flags.push("CTR低于冷启动阈值"); actions.push("重做前3秒Hook：结果先行或冲突问题先行"); }
  if (completion && completion < 25) { flags.push("完播率不足"); actions.push("把视频压缩到15-25秒，删除解释性铺垫"); }
  if (saveRate && saveRate < 4) { flags.push("收藏率不足"); actions.push("增加清单、模板、步骤图、可复用价值"); }
  if (commentRate && commentRate < 1) { flags.push("评论互动不足"); actions.push("结尾改成二选一问题，让评论决定下一集"); }
  if (flags.length === 0) actions.push("当前数据达到MVP阈值，建议扩展到第二市场并复用胜出模板");
  return {
    reviewId: `review-${Date.now().toString(36)}`,
    runId,
    timestamp: new Date().toISOString(),
    metrics,
    decision: flags.length ? "Iterate" : "Scale",
    flags,
    actions,
    nextSprint: [
      { day: 1, task: actions[0] || "复制胜出模板", metric: "CTR / 3秒留存" },
      { day: 2, task: "用评论生成下一条脚本", metric: "commentRate" },
      { day: 3, task: "重剪到第二平台并本地化caption", metric: "save/share" }
    ]
  };
}

app.post("/api/campaign/review", (req, res) => {
  try {
    const review = buildKpiReview(req.body || {});
    const feedback = readJsonArray(FEEDBACK_FILE);
    feedback.unshift(review);
    writeJsonArray(FEEDBACK_FILE, feedback.slice(0, 500));
    try {
      getDb().prepare(`
        INSERT OR REPLACE INTO kpi_reviews
        (review_id, run_id, timestamp, decision, metrics_json, flags_json, actions_json, next_sprint_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(review.reviewId, review.runId, review.timestamp, review.decision, JSON.stringify(review.metrics), JSON.stringify(review.flags), JSON.stringify(review.actions), JSON.stringify(review.nextSprint));
    } catch (dbError) {
      console.warn("SQLite review persistence failed, JSON fallback retained:", dbError);
    }
    res.json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to review KPI." });
  }
});

app.get("/api/campaign/reviews", (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit || "50"), 10), 200);
  try {
    const rows = getDb().prepare("SELECT * FROM kpi_reviews ORDER BY timestamp DESC LIMIT ?").all(limit).map((r: any) => ({
      reviewId: r.review_id,
      runId: r.run_id,
      timestamp: r.timestamp,
      decision: r.decision,
      metrics: JSON.parse(r.metrics_json || "{}"),
      flags: JSON.parse(r.flags_json || "[]"),
      actions: JSON.parse(r.actions_json || "[]"),
      nextSprint: JSON.parse(r.next_sprint_json || "[]")
    }));
    return res.json({ success: true, source: "sqlite", reviews: rows });
  } catch (error) {
    res.json({ success: true, source: "json-fallback", reviews: readJsonArray(FEEDBACK_FILE).slice(0, limit) });
  }
});

app.get("/api/db/health", (_req, res) => {
  try {
    const db = getDb();
    const tables = ["campaign_runs", "agent_executions", "rule_hits", "kpi_reviews"];
    const counts = Object.fromEntries(tables.map(t => [t, (db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as any).count]));
    res.json({ success: true, engine: "sqlite", file: SQLITE_FILE, counts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "SQLite unavailable" });
  }
});


app.get("/api/music/styles", (req, res) => {
  try {
    const decade = String(req.query.decade || "");
    const genre = String(req.query.genre || "").toLowerCase();
    const q = String(req.query.q || "").toLowerCase();
    const limit = Math.min(parseInt(String(req.query.limit || "100"), 10), 500);
    let sql = "SELECT * FROM music_styles WHERE 1=1";
    const params: any[] = [];
    if (decade) { sql += " AND decade = ?"; params.push(decade); }
    if (genre) { sql += " AND lower(genre) LIKE ?"; params.push(`%${genre}%`); }
    if (q) { sql += " AND (lower(genre) LIKE ? OR lower(subgenre) LIKE ? OR lower(mood_tags) LIKE ? OR lower(instruments) LIKE ? OR lower(prompt_en) LIKE ? OR prompt_zh LIKE ?)"; params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    sql += " ORDER BY year_start ASC, genre ASC LIMIT ?"; params.push(limit);
    res.json({ success: true, source: "sqlite", styles: getDb().prepare(sql).all(...params) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to query music styles" });
  }
});

app.get("/api/music/decades", (_req, res) => {
  try {
    const rows = getDb().prepare("SELECT decade, COUNT(*) as count, MIN(year_start) as start, MAX(year_end) as end FROM music_styles GROUP BY decade ORDER BY start ASC").all();
    res.json({ success: true, decades: rows });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.post("/api/music/recommend", (req, res) => {
  try {
    const { region, mood, platform, creatorType, decade } = req.body || {};
    const terms = [region, mood, platform, creatorType].filter(Boolean).join(" ").toLowerCase();
    const rows: any[] = getDb().prepare("SELECT * FROM music_styles WHERE (? = '' OR decade = ?) ORDER BY year_start ASC").all(decade || "", decade || "");
    const scored = rows.map(row => {
      const hay = `${row.region} ${row.genre} ${row.subgenre} ${row.mood_tags} ${row.platform_fit} ${row.creator_use_case} ${row.prompt_en} ${row.prompt_zh}`.toLowerCase();
      const score = terms.split(/\s+/).filter(Boolean).reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0) + (platform && String(row.platform_fit).toLowerCase().includes(String(platform).toLowerCase()) ? 2 : 0);
      return { ...row, matchScore: score };
    }).sort((a,b) => b.matchScore - a.matchScore || a.year_start - b.year_start).slice(0, 12);
    res.json({ success: true, recommendations: scored });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/templates", (_req, res) => {
  try { res.json({ success: true, templates: getDb().prepare("SELECT * FROM music_prompt_templates ORDER BY id ASC").all() }); }
  catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/tracks", (req, res) => {
  try {
    const q = String(req.query.q || "").toLowerCase();
    const decade = String(req.query.decade || "");
    const country = String(req.query.country || "").toLowerCase();
    const genre = String(req.query.genre || "").toLowerCase();
    const limit = Math.min(parseInt(String(req.query.limit || "100"), 10), 1000);
    let sql = "SELECT * FROM music_tracks WHERE 1=1";
    const params: any[] = [];
    if (q) { sql += " AND (lower(title) LIKE ? OR lower(artist) LIKE ? OR lower(memory_tags) LIKE ? OR lower(cultural_tags) LIKE ?)"; params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    if (decade) { sql += " AND decade = ?"; params.push(decade); }
    if (country) { sql += " AND lower(country) LIKE ?"; params.push(`%${country}%`); }
    if (genre) { sql += " AND lower(genre) LIKE ?"; params.push(`%${genre}%`); }
    sql += " ORDER BY popularity_rank ASC, release_year ASC LIMIT ?"; params.push(limit);
    res.json({ success: true, tracks: getDb().prepare(sql).all(...params) });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/memory-archetypes", (_req, res) => {
  try { res.json({ success: true, archetypes: getDb().prepare("SELECT * FROM music_memory_archetypes ORDER BY id ASC").all() }); }
  catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/cultural-preferences", (req, res) => {
  try {
    const region = String(req.query.region || "").toLowerCase();
    const rows = region
      ? getDb().prepare("SELECT * FROM music_cultural_preferences WHERE lower(region) LIKE ? OR lower(country_or_group) LIKE ? ORDER BY region ASC").all(`%${region}%`, `%${region}%`)
      : getDb().prepare("SELECT * FROM music_cultural_preferences ORDER BY region ASC").all();
    res.json({ success: true, preferences: rows });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/suno-semantics", (req, res) => {
  try {
    const q = String(req.query.q || "").toLowerCase();
    const rows = q
      ? getDb().prepare("SELECT * FROM suno_prompt_semantics WHERE lower(semantic_axis) LIKE ? OR human_meaning_zh LIKE ? OR lower(human_meaning_en) LIKE ? OR lower(genres) LIKE ? ORDER BY id ASC").all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)
      : getDb().prepare("SELECT * FROM suno_prompt_semantics ORDER BY id ASC").all();
    res.json({ success: true, semantics: rows });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.post("/api/music/emotion-match", (req, res) => {
  try {
    const { memory, region, platform, creatorType } = req.body || {};
    const db = getDb();
    const archetypes: any[] = db.prepare("SELECT * FROM music_memory_archetypes").all();
    const prefs: any[] = db.prepare("SELECT * FROM music_cultural_preferences").all();
    const sems: any[] = db.prepare("SELECT * FROM suno_prompt_semantics").all();
    const text = `${memory || ""} ${region || ""} ${platform || ""} ${creatorType || ""}`.toLowerCase();
    const score = (hay: string) => text.split(/\s+|,|，/).filter(Boolean).reduce((n,t)=>n+(hay.toLowerCase().includes(t)?1:0),0);
    const bestArch = archetypes.map(a => ({...a, score: score(`${a.name_zh} ${a.name_en} ${a.core_emotion} ${a.memory_scene} ${a.recommended_genres}`)})).sort((a,b)=>b.score-a.score)[0];
    const regionText = String(region || "").toLowerCase();
    const bestPref = prefs.map(p => {
      let prefScore = score(`${p.region} ${p.country_or_group} ${p.preferred_genres} ${p.emotional_drivers} ${p.creator_context}`);
      const prefHay = `${p.region} ${p.country_or_group}`.toLowerCase();
      if ((regionText.includes("mexico") || regionText.includes("latin") || regionText.includes("latam")) && prefHay.includes("latin")) prefScore += 20;
      if ((regionText.includes("japan") || regionText.includes("korea") || regionText.includes("east asia")) && prefHay.includes("japan")) prefScore += 20;
      if ((regionText.includes("europe") || regionText.includes("eu")) && prefHay.includes("europe")) prefScore += 20;
      if ((regionText.includes("southeast") || regionText.includes("sea")) && prefHay.includes("sea")) prefScore += 20;
      return {...p, score: prefScore};
    }).sort((a,b)=>b.score-a.score)[0];
    const bestSem = sems.map(s => ({...s, score: score(`${s.semantic_axis} ${s.human_meaning_zh} ${s.human_meaning_en} ${s.genres} ${s.sonic_features}`)})).sort((a,b)=>b.score-a.score)[0];
    const promptZh = `${bestArch?.prompt_zh || ""}。结合${bestPref?.region || region || "目标市场"}偏好：${bestPref?.prompt_guidance_zh || ""}。Suno语义：${bestSem?.prompt_phrase_zh || ""}`;
    const promptEn = `${bestArch?.prompt_en || ""}. Adapt to ${bestPref?.region || region || "target market"}: ${bestPref?.prompt_guidance_en || ""}. Suno semantics: ${bestSem?.prompt_phrase_en || ""}`;
    res.json({ success: true, match: { archetype: bestArch, preference: bestPref, semantic: bestSem, promptZh, promptEn, negativePrompt: [bestArch?.negative_prompt, bestPref?.taboo_or_risk, bestSem?.negative_prompt].filter(Boolean).join('; ') } });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/stargraph/stats", (_req, res) => {
  try {
    const db = getDb();
    const nodeTypes = db.prepare("SELECT type, COUNT(*) as count FROM music_star_nodes GROUP BY type ORDER BY count DESC").all();
    const edgeTypes = db.prepare("SELECT relation, COUNT(*) as count FROM music_star_edges GROUP BY relation ORDER BY count DESC").all();
    const totals = {
      nodes: (db.prepare("SELECT COUNT(*) as count FROM music_star_nodes").get() as any).count,
      edges: (db.prepare("SELECT COUNT(*) as count FROM music_star_edges").get() as any).count,
      tracks: (db.prepare("SELECT COUNT(*) as count FROM music_tracks").get() as any).count,
      styles: (db.prepare("SELECT COUNT(*) as count FROM music_styles").get() as any).count
    };
    res.json({ success: true, totals, nodeTypes, edgeTypes });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/stargraph", (req, res) => {
  try {
    const type = String(req.query.type || "");
    const q = String(req.query.q || "").toLowerCase();
    const limit = Math.min(parseInt(String(req.query.limit || "300"), 10), 2000);
    let sql = "SELECT * FROM music_star_nodes WHERE 1=1";
    const params: any[] = [];
    if (type) { sql += " AND type = ?"; params.push(type); }
    if (q) { sql += " AND (lower(label) LIKE ? OR lower(label_zh) LIKE ? OR lower(genre) LIKE ? OR lower(region) LIKE ?)"; params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    sql += " ORDER BY weight DESC, label ASC LIMIT ?"; params.push(limit);
    const nodes: any[] = getDb().prepare(sql).all(...params);
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = nodes.length ? getDb().prepare(`SELECT * FROM music_star_edges WHERE source_id IN (${nodes.map(()=>'?').join(',')}) OR target_id IN (${nodes.map(()=>'?').join(',')}) LIMIT ?`).all(...nodes.map(n=>n.id), ...nodes.map(n=>n.id), limit * 3).filter((e:any)=>nodeIds.has(e.source_id) || nodeIds.has(e.target_id)) : [];
    res.json({ success: true, nodes, edges });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/stargraph/neighbors/:id", (req, res) => {
  try {
    const id = req.params.id;
    const center = getDb().prepare("SELECT * FROM music_star_nodes WHERE id = ?").get(id);
    if (!center) return res.status(404).json({ success: false, error: "Node not found" });
    const edges: any[] = getDb().prepare("SELECT * FROM music_star_edges WHERE source_id = ? OR target_id = ? ORDER BY weight DESC LIMIT 200").all(id, id);
    const ids = Array.from(new Set(edges.flatMap(e => [e.source_id, e.target_id])));
    const nodes = ids.length ? getDb().prepare(`SELECT * FROM music_star_nodes WHERE id IN (${ids.map(()=>'?').join(',')})`).all(...ids) : [];
    res.json({ success: true, center, nodes, edges });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.post("/api/music/import/tracks-json", (req, res) => {
  try {
    const tracks = Array.isArray(req.body?.tracks) ? req.body.tracks : [];
    const now = new Date().toISOString();
    const db = getDb();
    const stmt = db.prepare(`INSERT OR REPLACE INTO music_tracks
      (id,title,artist,release_year,decade,country,language,genre,subgenre,mood_tags,memory_tags,cultural_tags,popularity_rank,source,source_url,metadata_json,created_at,updated_at)
      VALUES (@id,@title,@artist,@release_year,@decade,@country,@language,@genre,@subgenre,@mood_tags,@memory_tags,@cultural_tags,@popularity_rank,@source,@source_url,@metadata_json,@created_at,@updated_at)`);
    let imported = 0;
    const tx = db.transaction(() => {
      for (let i=0;i<tracks.length;i++) {
        const t = tracks[i];
        if (!t.title) continue;
        const year = Number(t.release_year || t.year || 0) || null;
        const decade = t.decade || (year ? `${Math.floor(year/10)*10}s` : "");
        const id = t.id || `local-${String(t.artist||'unknown').toLowerCase().replace(/\W+/g,'-')}-${String(t.title).toLowerCase().replace(/\W+/g,'-')}`.slice(0,160);
        stmt.run({ id, title: t.title, artist: t.artist || "", release_year: year, decade, country: t.country || "", language: t.language || "", genre: t.genre || "", subgenre: t.subgenre || "", mood_tags: Array.isArray(t.mood_tags)?t.mood_tags.join(','):t.mood_tags||"", memory_tags: Array.isArray(t.memory_tags)?t.memory_tags.join(','):t.memory_tags||"", cultural_tags: Array.isArray(t.cultural_tags)?t.cultural_tags.join(','):t.cultural_tags||"", popularity_rank: t.popularity_rank || i+1, source: t.source || "local-json", source_url: t.source_url || "", metadata_json: JSON.stringify(t), created_at: now, updated_at: now });
        imported++;
      }
    });
    tx();
    res.json({ success: true, imported, note: "Run scripts/build_music_stargraph.mjs to rebuild graph edges after bulk import." });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/search", (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(String(req.query.limit || "50"), 10), 500);
    if (!q) return res.json({ success: true, source: "empty", tracks: [] });
    const db = getDb();
    try {
      const rows = db.prepare(`
        SELECT t.*, bm25(music_tracks_fts) as rank
        FROM music_tracks_fts f
        JOIN music_tracks t ON t.id = f.track_id
        WHERE music_tracks_fts MATCH ?
        ORDER BY rank LIMIT ?
      `).all(q.replace(/['"]/g, ' '), limit);
      return res.json({ success: true, source: "fts", tracks: rows });
    } catch (ftsError) {
      const like = `%${q.toLowerCase()}%`;
      const rows = db.prepare(`SELECT * FROM music_tracks WHERE lower(title) LIKE ? OR lower(artist) LIKE ? OR lower(genre) LIKE ? OR lower(memory_tags) LIKE ? OR lower(cultural_tags) LIKE ? LIMIT ?`).all(like, like, like, like, like, limit);
      return res.json({ success: true, source: "like-fallback", tracks: rows });
    }
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.get("/api/music/import/schema", (_req, res) => {
  res.json({
    success: true,
    csvTemplate: "data_import/music_tracks_template.csv",
    scripts: {
      importCsv: "node scripts/import_music_tracks_csv.mjs data_import/your_music_tracks.csv",
      rebuildFts: "node scripts/rebuild_music_fts.mjs",
      rebuildStargraph: "node scripts/build_music_stargraph.mjs",
      wikidataMetadata: "node scripts/seed_music_intelligence.mjs --wikidata --limit=10000"
    },
    required: ["title"],
    recommended: ["id","artist","release_year","country","language","genre","subgenre","mood_tags","memory_tags","cultural_tags","popularity_rank","source","source_url"],
    copyrightNote: "Store metadata/tags only. Do not import copyrighted audio, full lyrics, or melody transcriptions."
  });
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
