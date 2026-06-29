import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const root = process.cwd();
const dataDir = path.join(root, 'data_store');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'cultureos.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS music_tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  release_year INTEGER,
  decade TEXT,
  country TEXT,
  language TEXT,
  genre TEXT,
  subgenre TEXT,
  mood_tags TEXT,
  memory_tags TEXT,
  cultural_tags TEXT,
  popularity_rank INTEGER,
  source TEXT,
  source_url TEXT,
  metadata_json TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS music_track_style_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id TEXT NOT NULL,
  style_id TEXT,
  style_label TEXT,
  confidence REAL DEFAULT 0.75,
  reason TEXT,
  FOREIGN KEY(track_id) REFERENCES music_tracks(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS music_memory_archetypes (
  id TEXT PRIMARY KEY,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  core_emotion TEXT,
  memory_scene TEXT,
  sonic_markers TEXT,
  recommended_genres TEXT,
  prompt_zh TEXT,
  prompt_en TEXT,
  negative_prompt TEXT
);
CREATE TABLE IF NOT EXISTS music_cultural_preferences (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  country_or_group TEXT,
  preferred_genres TEXT,
  rhythm_preferences TEXT,
  emotional_drivers TEXT,
  taboo_or_risk TEXT,
  creator_context TEXT,
  prompt_guidance_zh TEXT,
  prompt_guidance_en TEXT,
  source TEXT
);
CREATE TABLE IF NOT EXISTS suno_prompt_semantics (
  id TEXT PRIMARY KEY,
  semantic_axis TEXT NOT NULL,
  human_meaning_zh TEXT NOT NULL,
  human_meaning_en TEXT NOT NULL,
  sonic_features TEXT,
  genres TEXT,
  instruments TEXT,
  bpm_range TEXT,
  vocal_guidance TEXT,
  structure_guidance TEXT,
  prompt_phrase_zh TEXT,
  prompt_phrase_en TEXT,
  negative_prompt TEXT
);
CREATE INDEX IF NOT EXISTS idx_music_tracks_decade ON music_tracks(decade);
CREATE INDEX IF NOT EXISTS idx_music_tracks_country ON music_tracks(country);
CREATE INDEX IF NOT EXISTS idx_music_tracks_genre ON music_tracks(genre);
CREATE INDEX IF NOT EXISTS idx_music_tracks_memory ON music_tracks(memory_tags);
CREATE INDEX IF NOT EXISTS idx_music_cultural_region ON music_cultural_preferences(region);
`);

const now = new Date().toISOString();

const archetypes = [
  ['childhood_summer','童年夏日','Childhood Summer','安全、明亮、无忧、时间变慢','暑假傍晚、冰汽水、街边风扇、蝉鸣','major 7 chords, glockenspiel, nylon guitar, soft tape hiss, field recordings','city pop,bossa nova,folk pop,lo-fi hip hop','童年夏日回忆感，明亮大七和弦、木吉他、轻钟琴、风扇与蝉鸣环境声，温暖但不幼稚','childhood summer nostalgia, bright major 7 chords, nylon guitar, light glockenspiel, fan noise and cicadas, warm but not childish','no creepy toy music, no nursery rhyme plagiarism'],
  ['first_love','初恋心动','First Love','羞涩、期待、轻微不安、甜感','校园走廊、雨后车站、第一次告白','soft electric piano, clean guitar arpeggio, breathy pads, gentle drums','city pop,dream pop,indie pop,neo soul','初恋心动氛围，电钢琴、清音吉他分解、轻柔鼓组、空气感Pad，甜但克制','first love butterflies, soft electric piano, clean guitar arpeggios, gentle drums, airy pads, sweet but restrained','no melodramatic strings, no copied pop hook'],
  ['homecoming','归乡','Homecoming','思念、安心、身份认同、泪点','火车窗外、老街、家里厨房、方言声','warm strings, acoustic guitar, piano, subtle folk percussion','folk,chanson,bolero,country,ambient','归乡与家人重逢，温暖弦乐、木吉他、钢琴、轻民谣打击，像老照片慢慢显影','homecoming reunion, warm strings, acoustic guitar, piano, subtle folk percussion, old photo developing feeling','no national anthem imitation, no sacred misuse'],
  ['urban_loneliness','城市孤独','Urban Loneliness','疏离、夜行、清醒、独处','夜班地铁、出租屋窗边、雨中霓虹','Rhodes, muted drums, vinyl, distant sax, sub bass','trip hop,lo-fi hip hop,neo soul,ambient jazz','城市夜晚孤独感，Rhodes、电台噪声、远处萨克斯、低频贝斯、雨夜霓虹','urban night loneliness, Rhodes chords, vinyl noise, distant saxophone, low sub bass, rainy neon','no depressive clinical claims, no harsh noise'],
  ['family_warmth','家庭温情','Family Warmth','亲密、照顾、烟火气、分享','厨房、节日饭桌、祖辈手艺、邻里问候','nylon guitar, accordion, light percussion, handclaps, warm bass','bolero,bossa nova,folk,soul,afrobeats','家庭温情与节日饭桌，尼龙吉他、手风琴、轻打击、温暖贝斯、手拍','family warmth and shared table, nylon guitar, accordion, light percussion, warm bass, handclaps','no stereotypes, no religious caricature'],
  ['victory_drive','逆袭高光','Victory Drive','自信、冲刺、完成、掌控','完成作品、上线发布、跑步冲线、灯光亮起','driving drums, brass hits, synth bass, rising chords','funk,disco,house,future bass,pop punk','逆袭高光时刻，推进鼓组、铜管点缀、上扬和弦、明亮贝斯，适合发布成果','victory drive, driving drums, brass hits, rising chords, bright bass, launch moment energy','no aggressive war drums, no copyrighted sports theme'],
  ['ritual_healing','日常仪式感','Daily Ritual','安顿、秩序、低压疗愈、专注','泡茶、护肤、手作、整理桌面','handpan, flute, kalimba, soft pads, water/steam ASMR','wellness ambient,lo-fi,modern classical,bossa nova','日常仪式感，手碟、长笛、卡林巴、蒸汽/水声ASMR，安静专注但不宣称疗效','daily ritual calm, handpan, flute, kalimba, steam and water ASMR, focused and gentle without medical claims','no healing cure claims, no binaural medical claims'],
  ['rebellious_youth','青春反叛','Rebellious Youth','释放、不服、奔跑、真实','校园乐队、滑板、夜路、朋友大笑','power chords, live drums, bass, shouted gang-like instrumental energy','pop punk,grunge,rockabilly,old school hip hop','青春反叛和朋友一起冲出去的能量，强力和弦、真鼓、贝斯、粗粝空间','rebellious youth energy, power chords, live drums, bass, raw room sound, friends running at night','no explicit lyrics, no artist imitation']
];
const archStmt = db.prepare(`INSERT OR REPLACE INTO music_memory_archetypes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const a of archetypes) archStmt.run(...a);

const prefs = [
  ['pref_na_genz','North America','US/Canada Gen Z','hip hop,trap,hyperpop,indie pop,pop punk,lo-fi','strong hook, syncopated bounce, short loops','authenticity, self-expression, irony, vulnerability','health/income claims, undisclosed sponsorship, copyrighted samples','TikTok/Reels creator growth','北美Z世代偏好强Hook、自我表达、反讽与真实脆弱；避免疗效/收益承诺和未披露广告。','North American Gen Z favors strong hooks, self-expression, irony and vulnerability; avoid health/income claims and undisclosed ads.','curated + platform policy'],
  ['pref_na_millennial','North America','US/Canada Millennials','2000s pop punk,neo soul,indie rock,lo-fi hip hop,house','nostalgic guitar or warm groove','nostalgia, productivity, self-care, family life','medical claims, copyrighted throwback imitation','Vlog,knowledge,newsletter','北美千禧一代对2000年代青春、lo-fi效率和温暖R&B有强记忆唤醒。','North American millennials respond to 2000s youth nostalgia, lo-fi productivity and warm R&B memory cues.','curated'],
  ['pref_latam','Latin America','Mexico/Brazil/Colombia/LatAm','reggaeton,bolero,bossa nova,cumbia,latin pop,afrobeats','syncopated percussion, guitar, communal rhythm','family warmth, dance, romance, celebration, resilience','religious stereotypes, exoticization, wrong slang','Dance,beauty,lifestyle,community','拉美偏好节奏、家庭温情、浪漫和社区感；避免巫术化/宗教刻板印象。','LatAm audiences favor rhythm, family warmth, romance and community; avoid exoticized religious stereotypes.','curated'],
  ['pref_europe','Europe','EU/UK','chanson,disco,house,trip hop,ambient,indie,techno','tasteful restraint, groove, atmosphere','craft, sustainability, provenance, understated emotion','greenwashing, GDPR, cultural flattening','travel,design,knowledge','欧洲偏好克制、有来源感、工艺与氛围；过度夸张会降低信任。','European audiences favor restraint, provenance, craft and atmosphere; over-hype reduces trust.','curated'],
  ['pref_japan_korea','East Asia','Japan/Korea','city pop,k-pop,lo-fi,jazz fusion,modern classical,ambient','polished detail, tight arrangement, cute or refined hooks','detail, routine, seasonal memory, social subtlety','rude informality, low localization, copied idol style','beauty,vlog,routine','日韩偏好细节、季节感、精致编曲和日常仪式，不要粗糙直译。','Japan/Korea audiences favor detail, seasonality, polished arrangement and daily ritual; avoid rough localization.','curated'],
  ['pref_sea','Southeast Asia','SEA','afrobeats,k-pop,lo-fi,pop ballad,indie pop,amapiano','mobile-first rhythm, bright melody, soft pop','practicality, warmth, social sharing, modesty','religious sensitivity, halal ambiguity, over-revealing visuals','TikTok shop,lifestyle,beauty','东南亚偏好移动端强节奏和明亮旋律，同时注意宗教与清真敏感。','SEA audiences favor mobile-first rhythm and bright melody while respecting religious/halal sensitivities.','curated'],
  ['pref_mena','MENA','Middle East/North Africa','arab pop,ambient,oud fusion,lo-fi,cinematic percussion','maqam-like color, hand percussion, spacious melody','dignity, family, spirituality, luxury restraint','sacred chant misuse, immodest context, political symbols','luxury,travel,beauty','中东北非可用乌德琴色彩和宽阔旋律，但避免误用宗教吟诵。','MENA can use oud colors and spacious melody, avoid sacred chant misuse.','curated'],
  ['pref_africa','Africa','West/South Africa diaspora','afrobeats,amapiano,highlife,house,gospel-influenced soul','polyrhythm, log drum, guitar ostinato, call-response','joy, resilience, social dance, community pride','flattening Africa as one sound, copied chants','dance,lifestyle,travel','非洲及侨民偏好多节奏、社交舞蹈、社区自豪；不要把非洲扁平化为单一声音。','African and diaspora audiences favor polyrhythm, social dance and community pride; avoid flattening Africa into one sound.','curated']
];
const prefStmt = db.prepare(`INSERT OR REPLACE INTO music_cultural_preferences VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const r of prefs) prefStmt.run(...r);

const semantics = [
  ['sem_warm_nostalgia','memory_warmth','温暖怀旧：让人想起旧照片、家、童年、青春','Warm nostalgia: old photos, home, childhood, youth','tape saturation, vinyl crackle, major7/9 chords, soft transients','city pop,lo-fi,bossa nova,neo soul','Rhodes, nylon guitar, soft bass, strings','70-105','soft humming optional, no lead lyric copying','intro memory texture → gentle groove → soft outro','温暖怀旧、磁带饱和、黑胶噪声、大七和弦、柔和律动','warm nostalgic tape saturation, vinyl crackle, major seventh chords, soft groove','no copied melody, no artist imitation'],
  ['sem_bittersweet','bittersweet','甜中带酸：初恋、错过、雨后、未说出口','Bittersweet: first love, missed timing, after rain','minor-major mixture, suspended chords, gentle unresolved cadence','dream pop,city pop,indie pop,chanson','electric piano, clean guitar, soft strings','75-115','breathy non-lyrical vocal pad optional','gentle verse → lifted chorus without huge drop','甜中带酸、悬挂和弦、温柔未解决终止、雨后空气感','bittersweet suspended chords, gentle unresolved cadence, after-rain air','no melodramatic overkill'],
  ['sem_communal_joy','collective_joy','集体快乐：节日、家庭、街坊、一起跳舞','Collective joy: festival, family, neighbors, dancing together','syncopation, hand percussion, call-response motifs','bolero,reggaeton,afrobeats,amapiano,disco','nylon guitar, congas, shakers, log drum, brass','95-125','group chant texture only if original','rhythmic intro → communal groove → celebratory hook','集体快乐、切分打击、手拍、温暖贝斯、适合一起跳舞','collective joy, syncopated percussion, handclaps, warm bass, danceable','no cultural caricature, no sacred chant'],
  ['sem_focus_flow','focus_flow','专注心流：学习、工作、手作过程','Focus flow: study, work, craft process','low dynamic range, repetitive but warm loops, no distracting lead','lo-fi hip hop,ambient,jazzhop,minimal house','dusty drums, Rhodes, soft bass, field ambience','60-95','instrumental only','loopable 4/8 bar phrase with subtle variation','专注心流、低动态、温暖循环、无抢耳主旋律','focus flow, low dynamic warm loop, non-distracting instrumental','no loud vocal, no sudden drop'],
  ['sem_premium_luxury','premium_restraint','高级克制：质感、信任、奢华但不炫耀','Premium restraint: texture, trust, luxury without showing off','minimal arrangement, clean mix, tasteful reverb, sparse bass','trip hop,modern classical,ambient,neo soul,chanson','felt piano, strings, brushed drums, upright bass','65-105','no vocal or whisper texture','sparse intro → elegant motif → clean resolution','高级克制、极简编曲、干净混音、稀疏低频、精致混响','premium restrained minimal arrangement, clean mix, sparse bass, tasteful reverb','no hype riser, no cheap EDM'],
  ['sem_victory_launch','launch_energy','发布高光：上线、成功、冲刺、逆袭','Launch energy: release, success, sprint, comeback','rising chords, driving drums, brass/synth lift, bright hook','funk,disco,future bass,pop punk,house','brass, synth bass, power chords, drums','110-160','chant-like original hook optional','build → hook → payoff, short-video friendly','发布高光、上扬和弦、推进鼓组、明亮Hook、冲刺感','launch energy rising chords, driving drums, bright hook, payoff','no warlike aggression, no copied sports theme']
];
const semStmt = db.prepare(`INSERT OR REPLACE INTO suno_prompt_semantics VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
for (const r of semantics) semStmt.run(...r);

// Optional Wikidata importer for famous-song metadata. Safe: metadata only, no audio/lyrics.
async function importWikidata(limit=1000) {
  const query = `
SELECT ?song ?songLabel ?performerLabel ?genreLabel ?countryLabel ?date WHERE {
  ?song wdt:P31/wdt:P279* wd:Q7366.
  OPTIONAL { ?song wdt:P175 ?performer. }
  OPTIONAL { ?song wdt:P136 ?genre. }
  OPTIONAL { ?song wdt:P495 ?country. }
  OPTIONAL { ?song wdt:P577 ?date. }
  ?song wikibase:sitelinks ?sitelinks.
  FILTER(?sitelinks >= 10)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT ${Number(limit)||1000}`;
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
  const res = await fetch(url, { headers: { 'User-Agent': 'CultureOSMusicDB/0.1 metadata importer' }});
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
  const data = await res.json();
  const stmt = db.prepare(`INSERT OR IGNORE INTO music_tracks
    (id,title,artist,release_year,decade,country,language,genre,subgenre,mood_tags,memory_tags,cultural_tags,popularity_rank,source,source_url,metadata_json,created_at,updated_at)
    VALUES (@id,@title,@artist,@release_year,@decade,@country,@language,@genre,@subgenre,@mood_tags,@memory_tags,@cultural_tags,@popularity_rank,@source,@source_url,@metadata_json,@created_at,@updated_at)`);
  let n=0;
  const tx=db.transaction((rows)=>{
    rows.forEach((b,idx)=>{
      const id=(b.song?.value||'').split('/').pop();
      const title=b.songLabel?.value||id;
      const year=b.date?.value ? Number(String(b.date.value).slice(0,4)) : null;
      const decade=year ? `${Math.floor(year/10)*10}s` : '';
      stmt.run({ id:`wikidata-${id}`, title, artist:b.performerLabel?.value||'', release_year:year, decade, country:b.countryLabel?.value||'', language:'', genre:b.genreLabel?.value||'', subgenre:'', mood_tags:'', memory_tags:'', cultural_tags:'', popularity_rank:idx+1, source:'wikidata', source_url:b.song?.value||'', metadata_json:JSON.stringify(b), created_at:now, updated_at:now });
      n++;
    });
  });
  tx(data.results.bindings);
  return n;
}

if (process.argv.includes('--wikidata')) {
  const limArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limArg ? Number(limArg.split('=')[1]) : 1000;
  importWikidata(limit).then(n => { console.log(`Imported wikidata tracks: ${n}`); db.close(); }).catch(e => { console.error(e); db.close(); process.exit(1); });
} else {
  console.log('Seeded music intelligence DB:', dbPath);
  console.log('Use --wikidata --limit=10000 to import public song metadata (no audio/lyrics).');
  db.close();
}
