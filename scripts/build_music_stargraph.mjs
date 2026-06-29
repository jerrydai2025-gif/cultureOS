import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const root = process.cwd();
const dataDir = path.join(root, 'data_store');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'cultureos.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS music_star_nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  label_zh TEXT,
  decade TEXT,
  region TEXT,
  genre TEXT,
  weight REAL DEFAULT 1,
  metadata_json TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS music_star_edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  weight REAL DEFAULT 1,
  reason TEXT,
  metadata_json TEXT,
  created_at TEXT,
  UNIQUE(source_id, target_id, relation),
  FOREIGN KEY(source_id) REFERENCES music_star_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY(target_id) REFERENCES music_star_nodes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_music_star_nodes_type ON music_star_nodes(type);
CREATE INDEX IF NOT EXISTS idx_music_star_nodes_decade ON music_star_nodes(decade);
CREATE INDEX IF NOT EXISTS idx_music_star_nodes_region ON music_star_nodes(region);
CREATE INDEX IF NOT EXISTS idx_music_star_nodes_genre ON music_star_nodes(genre);
CREATE INDEX IF NOT EXISTS idx_music_star_edges_source ON music_star_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_music_star_edges_target ON music_star_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_music_star_edges_relation ON music_star_edges(relation);

CREATE TABLE IF NOT EXISTS music_import_jobs (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_path TEXT,
  status TEXT,
  imported_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error TEXT,
  started_at TEXT,
  finished_at TEXT
);
`);

const now = new Date().toISOString();
const nodeStmt = db.prepare(`INSERT OR REPLACE INTO music_star_nodes
(id,type,label,label_zh,decade,region,genre,weight,metadata_json,created_at,updated_at)
VALUES (@id,@type,@label,@label_zh,@decade,@region,@genre,@weight,@metadata_json,@created_at,@updated_at)`);
const edgeStmt = db.prepare(`INSERT OR IGNORE INTO music_star_edges
(source_id,target_id,relation,weight,reason,metadata_json,created_at)
VALUES (@source_id,@target_id,@relation,@weight,@reason,@metadata_json,@created_at)`);

function safeId(s){ return String(s||'unknown').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g,'-').replace(/^-|-$/g,'').slice(0,120) || 'unknown'; }
function addNode(id,type,label,extra={}){
  nodeStmt.run({ id, type, label, label_zh: extra.label_zh||'', decade: extra.decade||'', region: extra.region||'', genre: extra.genre||'', weight: extra.weight||1, metadata_json: JSON.stringify(extra.metadata||{}), created_at: now, updated_at: now });
}
function addEdge(source_id,target_id,relation,weight=1,reason='',metadata={}){
  if(source_id===target_id) return;
  edgeStmt.run({ source_id,target_id,relation,weight,reason,metadata_json:JSON.stringify(metadata),created_at:now });
}

const tx = db.transaction(() => {
  // 200-year timeline nodes: 1830s-2020s. 1820s is sparse for recorded/popular song metadata, so we include early roots as 1830s+.
  for(let y=1830; y<=2020; y+=10){
    const id=`decade-${y}s`;
    addNode(id,'decade',`${y}s`,{decade:`${y}s`,weight:1.2});
  }
  const eras = [
    ['era-romantic-salon','Romantic salon / parlor song era','浪漫主义沙龙与家庭客厅歌曲','1830s','Europe'],
    ['era-minstrel-parlor','19th-century parlor/minstrel popular song','19世纪客厅歌曲与早期流行歌','1840s','US/Europe'],
    ['era-ragtime','Ragtime and early syncopation','拉格泰姆与早期切分节奏','1890s','US'],
    ['era-blues-jazz-roots','Blues and jazz roots','布鲁斯与爵士根源','1900s','US'],
    ['era-recording-industry','Early recording industry / Tin Pan Alley','早期唱片工业与叮砰巷','1910s','US/Europe'],
    ['era-radio-swing','Radio, swing and cinema song','广播、Swing与电影歌曲','1930s','US/Europe'],
    ['era-postwar-pop','Post-war pop, bolero, chanson, crooner','战后流行、Bolero、Chanson、Crooner','1940s','Global'],
    ['era-rock-soul','Rock, soul, bossa nova, youth culture','摇滚、灵魂、Bossa Nova与青年文化','1960s','Global'],
    ['era-disco-funk','Disco, funk, reggae, progressive rock','Disco、Funk、Reggae与前卫摇滚','1970s','Global'],
    ['era-synth-hiphop','Synthpop, city pop, early hip-hop','Synthpop、City Pop与早期Hip-hop','1980s','Global'],
    ['era-globalized-mtv','MTV globalization, grunge, house, boom bap','MTV全球化、Grunge、House、Boom Bap','1990s','Global'],
    ['era-digital-pop','Digital pop, reggaeton, pop punk, neo soul','数字流行、Reggaeton、Pop Punk、Neo Soul','2000s','Global'],
    ['era-streaming-social','Streaming, trap, K-pop globalization, lo-fi','流媒体、Trap、K-pop全球化、Lo-fi','2010s','Global'],
    ['era-algorithmic-viral','Algorithmic viral music, hyperpop, amapiano, phonk','算法爆款、Hyperpop、Amapiano、Phonk','2020s','Global']
  ];
  for(const [id,label,label_zh,decade,region] of eras){
    addNode(id,'era',label,{label_zh,decade,region,weight:2});
    addEdge(id,`decade-${decade}`,'belongs_to_decade',1,'era begins around decade');
  }

  const styles = db.prepare('SELECT * FROM music_styles').all();
  for(const s of styles){
    const styleId=`style-${s.id}`;
    addNode(styleId,'style',s.subgenre||s.genre,{decade:s.decade,region:s.region,genre:s.genre,weight:2,metadata:s});
    addEdge(styleId,`decade-${s.decade}`,'emerged_in_decade',1,`${s.genre} emerged or became iconic in ${s.decade}`);
    const genreId=`genre-${safeId(s.genre)}`;
    addNode(genreId,'genre',s.genre,{genre:s.genre,weight:2});
    addEdge(styleId,genreId,'is_substyle_of',1,'style to genre taxonomy');
    if(s.region){ const regionId=`region-${safeId(s.region)}`; addNode(regionId,'region',s.region,{region:s.region,weight:1.5}); addEdge(styleId,regionId,'associated_with_region',0.8,'style regional association'); }
    for(const mood of String(s.mood_tags||'').split(',').map(x=>x.trim()).filter(Boolean)){ const mid=`mood-${safeId(mood)}`; addNode(mid,'mood',mood,{weight:1}); addEdge(styleId,mid,'evokes_mood',0.75,'mood tag from style'); }
    for(const inst of String(s.instruments||'').split(',').map(x=>x.trim()).filter(Boolean)){ const iid=`instrument-${safeId(inst)}`; addNode(iid,'instrument',inst,{weight:0.8}); addEdge(styleId,iid,'uses_instrument',0.6,'instrument marker'); }
  }

  const archetypes = db.prepare('SELECT * FROM music_memory_archetypes').all();
  for(const a of archetypes){
    const aid=`memory-${a.id}`;
    addNode(aid,'memory',a.name_en,{label_zh:a.name_zh,weight:2,metadata:a});
    for(const g of String(a.recommended_genres||'').split(',').map(x=>x.trim()).filter(Boolean)){ const gid=`genre-${safeId(g)}`; addNode(gid,'genre',g,{genre:g}); addEdge(aid,gid,'recommended_genre',0.9,'memory archetype recommends genre'); }
  }

  const prefs = db.prepare('SELECT * FROM music_cultural_preferences').all();
  for(const p of prefs){
    const pid=`preference-${p.id}`;
    addNode(pid,'cultural_preference',p.country_or_group||p.region,{region:p.region,weight:2,metadata:p});
    const rid=`region-${safeId(p.region)}`; addNode(rid,'region',p.region,{region:p.region,weight:1.5}); addEdge(pid,rid,'belongs_to_region',1,'preference region');
    for(const g of String(p.preferred_genres||'').split(',').map(x=>x.trim()).filter(Boolean)){ const gid=`genre-${safeId(g)}`; addNode(gid,'genre',g,{genre:g}); addEdge(pid,gid,'prefers_genre',0.9,'cultural preference genre'); }
  }

  const tracks = db.prepare('SELECT * FROM music_tracks LIMIT 200000').all();
  for(const t of tracks){
    const tid=`track-${t.id}`;
    addNode(tid,'track',t.title,{decade:t.decade,region:t.country,genre:t.genre,weight:t.popularity_rank?Math.max(0.2,10/(t.popularity_rank+10)):1,metadata:t});
    if(t.decade) addEdge(tid,`decade-${t.decade}`,'released_in_decade',1,'track release decade');
    if(t.genre){ const gid=`genre-${safeId(t.genre)}`; addNode(gid,'genre',t.genre,{genre:t.genre}); addEdge(tid,gid,'classified_as_genre',0.8,'track genre metadata'); }
    if(t.country){ const cid=`region-${safeId(t.country)}`; addNode(cid,'region',t.country,{region:t.country}); addEdge(tid,cid,'origin_or_release_country',0.6,'track country metadata'); }
    if(t.artist){ const aid=`artist-${safeId(t.artist)}`; addNode(aid,'artist',t.artist,{weight:1}); addEdge(tid,aid,'performed_by',1,'track performer metadata'); }
    for(const m of String(t.memory_tags||'').split(',').map(x=>x.trim()).filter(Boolean)){ const mid=`memory-${safeId(m)}`; addNode(mid,'memory',m,{weight:1}); addEdge(tid,mid,'evokes_memory',0.7,'track memory tag'); }
  }
});

tx();
const counts = {
  nodes: db.prepare('SELECT COUNT(*) as c FROM music_star_nodes').get().c,
  edges: db.prepare('SELECT COUNT(*) as c FROM music_star_edges').get().c,
  tracks: db.prepare('SELECT COUNT(*) as c FROM music_tracks').get().c,
  styles: db.prepare('SELECT COUNT(*) as c FROM music_styles').get().c
};
console.log(JSON.stringify(counts,null,2));
db.close();
