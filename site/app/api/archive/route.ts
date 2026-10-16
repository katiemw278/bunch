import {db,guest,json} from '@/lib/server/store';
import {easternDate} from '@/lib/server/calendar';
export async function GET(req:Request){
 const url=new URL(req.url),before=url.searchParams.get('before')??easternDate();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(before))return json({error:'Invalid date'},null,400);
 const p=await guest(req);const rows=await db().prepare(`SELECT p.id,p.number,p.release_date date,CASE WHEN c.puzzle_id IS NOT NULL THEN 'completed' WHEN s.version>0 THEN 'in-progress' ELSE 'not-started' END status FROM puzzles p LEFT JOIN completions c ON c.puzzle_id=p.id AND c.player_id=? LEFT JOIN game_sessions s ON s.puzzle_id=p.id AND s.player_id=? WHERE p.status='ready' AND p.release_date<? AND p.release_date<? ORDER BY p.release_date DESC LIMIT 31`).bind(p!.id,p!.id,easternDate(),before).all();
 return json({boards:rows.results,nextBefore:rows.results.length===31?(rows.results[30] as {date:string}).date:null},p!.cookie);
}
