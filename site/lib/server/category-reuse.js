import {addDays} from './calendar.js';
export function categoryReuseKey(label) {
 let text=label.normalize('NFKC').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 text=text.replace(/^(?:a |an )?(?:type|kind) of /,'').replace(/^something (?:that |you )?/,'');
 text=text.replace(/\b(?:a|an|the|be)\b/g,' ').replace(/\bfolded\b/g,'fold').replace(/\s+/g,' ').trim();
 return text.split(' ').map(w=>w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w).join(' ');
}
export function adjacentRepeatLabels(categories,boards,date) {
 const neighbors=new Set([addDays(date,-1),addDays(date,1)]);
 const keys=new Set(boards.filter(b=>neighbors.has(b.date)).flatMap(b=>b.categories.map(c=>categoryReuseKey(c.label))));
 return [...new Set(categories.filter(c=>keys.has(categoryReuseKey(c.label))).map(c=>c.label))];
}
// Serialize publication through the admin UI and reserve fallback, including concurrent tabs.
export async function withScheduleLock(database,work) {
 const name='board-schedule-lock',expiry=Date.now()+30000;
 const row=await database.prepare('INSERT INTO request_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE request_limits.expires_at<? RETURNING key').bind(name,expiry,Date.now()).first();
 if(!row)throw new Error('Another board is being scheduled. Please try again shortly.');
 try{return await work();}finally{await database.prepare('DELETE FROM request_limits WHERE key=? AND expires_at=?').bind(name,expiry).run();}
}
