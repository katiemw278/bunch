import {adjacentRepeatLabels,withScheduleLock} from './category-reuse';
import { env } from 'cloudflare:workers';
import { easternDate, puzzleNumber, streakStats, addDays } from './calendar';
import { getPuzzleById as legacyPuzzle } from './puzzles';
export type StoredCategory = { id:string; label:string; definition:string; examples:string[] };
export type StoredPuzzle = { id:string; number:number; date:string; categories:StoredCategory[] };
type PuzzleRow = {id:string;number:number;release_date:string;status:string;content:string};
export function db() { if(!env.DB) throw new Error('DB binding unavailable'); return env.DB; }
export function publicPuzzle(p:StoredPuzzle) {return {id:p.id,number:p.number,date:p.date,categories:p.categories.map(({id,label})=>({id,label}))};}
export async function releaseReserve(date:string) {
  await withScheduleLock(db(),async()=>{
   if(await db().prepare('SELECT id FROM puzzles WHERE release_date=?').bind(date).first())return;
   const neighbors=await db().prepare("SELECT release_date date,content FROM puzzles WHERE status='ready' AND release_date IN (?,?)").bind(addDays(date,-1),addDays(date,1)).all<{date:string;content:string}>();
   const boards=neighbors.results.map(r=>({date:r.date,categories:JSON.parse(r.content).categories}));
   const reserves=await db().prepare("SELECT id,content FROM puzzles WHERE status='reserve' ORDER BY created_at,id LIMIT 100").all<{id:string;content:string}>();
   const candidate=reserves.results.find(r=>!adjacentRepeatLabels(JSON.parse(r.content).categories,boards,date).length);
   if(candidate)await db().prepare("UPDATE puzzles SET release_date=?,number=?,status='ready' WHERE id=? AND status='reserve' AND NOT EXISTS(SELECT 1 FROM puzzles WHERE release_date=?)").bind(date,puzzleNumber(date),candidate.id,date).run();
  });
}
function unpack(row:PuzzleRow):StoredPuzzle { return {id:row.id,number:row.number,date:row.release_date,categories:JSON.parse(row.content).categories}; }
// Keep the original playtest board active until daily releases are explicitly enabled.
export function pinnedPuzzleId() { return (env as unknown as {PINNED_PUZZLE_ID?:string}).PINNED_PUZZLE_ID?.trim(); }
async function pinnedPuzzle():Promise<StoredPuzzle|null> {
 const id=pinnedPuzzleId();if(!id)return null;
 const row=await db().prepare("SELECT * FROM puzzles WHERE id=? AND status IN ('ready','reserve')").bind(id).first<PuzzleRow>();
 const original=legacyPuzzle('puzzle-004-hard4') as StoredPuzzle;
 if(row)return {...unpack(row),number:row.number??original.number,date:row.release_date??original.date};
 // A fresh installation can still play the original bundled board.
 return id==='demo-board-001'?original:null;
}
export async function dailyPuzzle(date=easternDate()) {
  if(pinnedPuzzleId())return pinnedPuzzle();
  let row=await db().prepare("SELECT * FROM puzzles WHERE release_date=? AND status='ready'").bind(date).first<PuzzleRow>();
  if(!row) { await releaseReserve(date); row=await db().prepare("SELECT * FROM puzzles WHERE release_date=? AND status='ready'").bind(date).first<PuzzleRow>(); }
  return row?unpack(row):null;
}
export async function availablePuzzle(id:string) {
 if(pinnedPuzzleId()){const pinned=await pinnedPuzzle();if(pinned?.id===id)return pinned;}
 const row=await db().prepare("SELECT * FROM puzzles WHERE id=? AND status='ready' AND release_date<=?").bind(id,easternDate()).first<PuzzleRow>();
 if(row)return unpack(row);
 const p=legacyPuzzle(id);
 return p && p.categories.length===16 && p.date<=easternDate() ? p as StoredPuzzle : null;
}
export async function guest(req:Request, create=true) {
 const raw=req.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('bunch_guest='))?.slice(12);
 if(raw && /^[a-f0-9-]{36}$/.test(raw)) { const found=await db().prepare('SELECT id FROM players WHERE id=?').bind(raw).first<{id:string}>();if(found)return {id:found.id,cookie:null}; }
 if(!create)return null;
 const id=crypto.randomUUID();await db().prepare('INSERT INTO players(id,created_at) VALUES(?,?)').bind(id,new Date().toISOString()).run();
 const secure=new URL(req.url).protocol==='https:'?'; Secure':'';
 return {id,cookie:`bunch_guest=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`};
}
export function json(data:unknown, cookie?:string|null,status=200) { return Response.json(data,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}}); }
export async function sameOrigin(req:Request) { const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin; }
export async function limited(key:string, max=40) {
 const bucket=Math.floor(Date.now()/60000); const name=key+':'+bucket;
 const row=await db().prepare('INSERT INTO request_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(name,Date.now()+120000).first<{count:number}>();
 return (row?.count??max+1)>max;
}
export function emptyState(puzzleId:string) {return {puzzleId,status:'playing',moveCount:0,score:0,clearedTiles:[] as string[],previousAnswers:[] as string[],history:[] as {moveNumber:number;answer:string;tilesCleared:string[];score:number;label:string}[]};}
export async function session(player:string,puzzle:string) {
 await db().prepare('INSERT INTO game_sessions(player_id,puzzle_id,state) VALUES(?,?,?) ON CONFLICT DO NOTHING').bind(player,puzzle,JSON.stringify(emptyState(puzzle))).run();
 const row=await db().prepare('SELECT state,version,last_request,last_response FROM game_sessions WHERE player_id=? AND puzzle_id=?').bind(player,puzzle).first<{state:string;version:number;last_request:string|null;last_response:string|null}>();
 if(!row)throw new Error('Session unavailable');return {...row,state:JSON.parse(row.state) as ReturnType<typeof emptyState>};
}
export async function playerStats(id:string) {
 const all=await db().prepare('SELECT release_date,daily_eligible FROM completions WHERE player_id=? ORDER BY release_date').bind(id).all<{release_date:string;daily_eligible:number}>();
 return {...streakStats(all.results.filter(r=>r.daily_eligible===1).map(r=>r.release_date),easternDate()),totalCompleted:all.results.length,guest:true};
}
