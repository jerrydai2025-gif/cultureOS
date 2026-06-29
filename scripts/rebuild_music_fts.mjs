import path from 'path';
import Database from 'better-sqlite3';

const root=process.cwd();
const db=new Database(path.join(root,'data_store','cultureos.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE VIRTUAL TABLE IF NOT EXISTS music_tracks_fts USING fts5(
  track_id UNINDEXED,
  title,
  artist,
  country,
  language,
  genre,
  subgenre,
  mood_tags,
  memory_tags,
  cultural_tags,
  content=''
);
DELETE FROM music_tracks_fts;
`);
const rows=db.prepare('SELECT * FROM music_tracks').all();
const stmt=db.prepare(`INSERT INTO music_tracks_fts
(track_id,title,artist,country,language,genre,subgenre,mood_tags,memory_tags,cultural_tags)
VALUES (@id,@title,@artist,@country,@language,@genre,@subgenre,@mood_tags,@memory_tags,@cultural_tags)`);
const tx=db.transaction(()=>{ for(const r of rows) stmt.run(r); });
tx();
console.log(JSON.stringify({ftsRows: rows.length}, null, 2));
db.close();
