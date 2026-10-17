import {authorized,adminJson,adminOrigin,readBody} from '@/lib/server/admin';
import {db,limited} from '@/lib/server/store';
import {easternDate,puzzleNumber} from '@/lib/server/calendar';
import {validDate} from '@/lib/server/admin-auth';
import {canonicalCategories,generateDraft} from '@/lib/server/generation';
type Row={id:string;target_date:string|null;release_date:string|null;number:number|null;status:string;content:string;source:string;created_at:string};
function revision(row:Row){return JSON.stringify([row.content,row.target_date,row.release_date,row.status]);}
export async function GET(req:Request){
 if(!await authorized(req))return adminJson({error:'Sign in to continue.'},401);
 const rows=await db().prepare("SELECT * FROM puzzles WHERE status='draft' OR status='reserve' OR release_date>=? ORDER BY COALESCE(release_date,target_date,'9999'),created_at LIMIT 90").bind(easternDate()).all<Row>();
 return adminJson({today:easternDate(),boards:rows.results.map(r=>({...r,categories:JSON.parse(r.content).categories,revision:revision(r),content:undefined}))});
}
export async function POST(req:Request){
 if(!await authorized(req))return adminJson({error:'Sign in to continue.'},401);
 if(!adminOrigin(req))return adminJson({error:'Invalid origin'},403);
 if(await limited('admin-write:'+(req.headers.get('cf-connecting-ip')??'local'),15))return adminJson({error:'Please wait a minute.'},429);
 try{
  const body=await readBody(req),today=easternDate();
  if(body.action==='generate'){
   if(!validDate(body.date,today))return adminJson({error:'Choose a valid future Eastern date.'},400);
   if(await db().prepare('SELECT id FROM puzzles WHERE target_date=? OR release_date=?').bind(body.date,body.date).first())return adminJson({error:'That date already has a board.'},409);
   await generateDraft(body.date);return adminJson({ok:true});
  }
  if(typeof body.id!=='string'||typeof body.revision!=='string')return adminJson({error:'Invalid draft'},400);
  const row=await db().prepare('SELECT * FROM puzzles WHERE id=?').bind(body.id).first<Row>();
  if(!row)return adminJson({error:'Board not found'},404);
  if(revision(row)!==body.revision)return adminJson({error:'This board changed in another tab. Reload the queue.'},409);
  if(row.status==='ready' && row.release_date && row.release_date<=today)return adminJson({error:'Released boards cannot be changed.'},409);
  if(body.action==='unapprove'){
   const result=await db().prepare("UPDATE puzzles SET status='draft',release_date=NULL,number=NULL WHERE id=? AND status='ready' AND release_date>? AND content=?").bind(row.id,today,row.content).run();
   return result.meta.changes===1?adminJson({ok:true}):adminJson({error:'Board cannot be unapproved.'},409);
  }
  if(row.status!=='draft')return adminJson({error:'Only drafts can be edited or approved.'},409);
  if(body.action==='regenerate'){
   if(!validDate(row.target_date,today))return adminJson({error:'Save a future release date first.'},400);
   await generateDraft(row.target_date!,{id:row.id,content:row.content,target_date:row.target_date});return adminJson({ok:true});
  }
  if(!['save','approve'].includes(body.action)||!validDate(body.date,today))return adminJson({error:'Choose a valid future Eastern date.'},400);
  if(body.action==='approve' && body.reviewed!==true)return adminJson({error:'Complete the review checklist first.'},400);
  const categories=await canonicalCategories(body.categories),content=JSON.stringify({categories});
  const duplicate=await db().prepare('SELECT id FROM puzzles WHERE id<>? AND (target_date=? OR release_date=?)').bind(row.id,body.date,body.date).first();
  if(duplicate)return adminJson({error:'That date already has a board.'},409);
  const approved=body.action==='approve';
  const result=await db().prepare("UPDATE puzzles SET content=?,target_date=?,release_date=?,number=?,status=? WHERE id=? AND status='draft' AND content=? AND target_date IS ?").bind(content,body.date,approved?body.date:null,approved?puzzleNumber(body.date):null,approved?'ready':'draft',row.id,row.content,row.target_date).run();
  return result.meta.changes===1?adminJson({ok:true}):adminJson({error:'The board changed. Reload the queue.'},409);
 }catch(error){const message=error instanceof Error?error.message:'Request failed';console.error('Admin board action failed',message);return adminJson({error:message.includes('UNIQUE constraint')?'That date already has a board.':message},400);}
}
