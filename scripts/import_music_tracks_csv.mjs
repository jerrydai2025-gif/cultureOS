import fs from 'fs';
import path from 'path';
import readline from 'readline';
import Database from 'better-sqlite3';

const root = process.cwd();
const fileArg = process.argv[2] || 'data_import/music_tracks_template.csv';
const csvPath = path.isAbsolute(fileArg) ? fileArg : path.join(root, fileArg);
if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`);
  process.exit(1);
}
const dbPath = path.join(root, 'data_store', 'cultureos.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

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
CREATE INDEX IF NOT EXISTS idx_music_tracks_decade ON music_tracks(decade);
CREATE INDEX IF NOT EXISTS idx_music_tracks_country ON music_tracks(country);
CREATE INDEX IF NOT EXISTS idx_music_tracks_genre ON music_tracks(genre);
CREATE INDEX IF NOT EXISTS idx_music_tracks_memory ON music_tracks(memory_tags);
`);

function parseCsvLine(line) {
  const out=[]; let cur=''; let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"' && line[i+1]==='"'){ cur+='"'; i++; }
    else if(ch==='"') quoted=!quoted;
    else if(ch===',' && !quoted){ out.push(cur); cur=''; }
    else cur+=ch;
  }
  out.push(cur);
  return out.map(v=>v.trim());
}
function safeId(s){ return String(s||'unknown').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,150) || 'unknown'; }
const stmt = db.prepare(`INSERT OR REPLACE INTO music_tracks
(id,title,artist,release_year,decade,country,language,genre,subgenre,mood_tags,memory_tags,cultural_tags,popularity_rank,source,source_url,metadata_json,created_at,updated_at)
VALUES (@id,@title,@artist,@release_year,@decade,@country,@language,@genre,@subgenre,@mood_tags,@memory_tags,@cultural_tags,@popularity_rank,@source,@source_url,@metadata_json,@created_at,@updated_at)`);

let headers=[]; let imported=0; let skipped=0; let batch=[]; const BATCH=1000;
function flush(){
  if(!batch.length) return;
  const tx=db.transaction(rows=>{ for(const r of rows) stmt.run(r); });
  tx(batch); imported += batch.length; batch=[];
  if(imported % 10000 === 0) console.log(`imported ${imported}`);
}

const rl = readline.createInterface({ input: fs.createReadStream(csvPath), crlfDelay: Infinity });
let lineNo=0;
for await (const line of rl) {
  lineNo++;
  if(!line.trim()) continue;
  const cols=parseCsvLine(line);
  if(lineNo===1){ headers=cols; continue; }
  const row={}; headers.forEach((h,i)=>row[h]=cols[i]||'');
  if(!row.title){ skipped++; continue; }
  const year=Number(row.release_year || row.year || 0) || null;
  const decade=row.decade || (year ? `${Math.floor(year/10)*10}s` : '');
  const id=row.id || `local-${safeId(row.artist)}-${safeId(row.title)}-${year||'na'}`;
  const now=new Date().toISOString();
  batch.push({
    id,title:row.title,artist:row.artist||'',release_year:year,decade,country:row.country||'',language:row.language||'',genre:row.genre||'',subgenre:row.subgenre||'',mood_tags:row.mood_tags||'',memory_tags:row.memory_tags||'',cultural_tags:row.cultural_tags||'',popularity_rank:Number(row.popularity_rank||0)||null,source:row.source||path.basename(csvPath),source_url:row.source_url||'',metadata_json:JSON.stringify(row),created_at:now,updated_at:now
  });
  if(batch.length>=BATCH) flush();
}
flush();
console.log(JSON.stringify({ csvPath, imported, skipped }, null, 2));
db.close();
