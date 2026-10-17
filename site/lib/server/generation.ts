import { env } from 'cloudflare:workers';
import { generationFailure } from './generation-error';
import { db, type StoredCategory } from './store';
import { easternDate,addDays,puzzleNumber } from './calendar';
export async function canonicalCategories(value:unknown):Promise<StoredCategory[]> {
 if(!Array.isArray(value)||value.length!==16)throw new Error('Exactly 16 categories required');
 const labels=new Set<string>();const result:StoredCategory[]=[];
 for(const c of value) {
  if(!c || typeof c.label!=='string'||!c.label.trim()||c.label.length>70||typeof c.definition!=='string'||c.definition.length<10||c.definition.length>600||!Array.isArray(c.examples)||c.examples.length<2||c.examples.length>8||c.examples.some((e:unknown)=>typeof e!=='string'||!e.trim()||(e as string).length>80))throw new Error('Invalid category');
  const label=c.label.trim(),definition=c.definition.trim(),normalized=label.toLowerCase();if(labels.has(normalized))throw new Error('Duplicate category');labels.add(normalized);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalized+'|'+definition));
  const id='cat-'+Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  result.push({id,label,definition,examples:c.examples.map((e:string)=>e.trim().toLowerCase())});
 }
 return result;
}
export async function maintainDailyQueue() {
 const runtime=env as unknown as {GENERATION_MODE?:string;GROQ_API_KEY?:string};
 await db().prepare('DELETE FROM request_limits WHERE expires_at<?').bind(Date.now()).run();
 if(runtime.GENERATION_MODE!=='live')return {generated:0,mode:'disabled'};
 if(!runtime.GROQ_API_KEY)throw new Error('Live generation requires GROQ_API_KEY');
 const today=easternDate();let generated=0;
 // One draft per run bounds cost; frequent scheduled runs replenish the horizon.
 for(let day=1;day<=7;day++) {
  const date=addDays(today,day);
  if(await db().prepare('SELECT id FROM puzzles WHERE target_date=? OR release_date=?').bind(date,date).first())continue;
  await generateDraft(date);generated++;break;
 }
 const remaining=await db().prepare("SELECT COUNT(*) count FROM puzzles WHERE status='ready' AND release_date>? ").bind(today).first<{count:number}>();
 if((remaining?.count??0)<3)console.warn('Bunch approved daily queue low; review drafts or add reserves');
 return {generated};
}

// Manual generation is deliberately separate from the scheduled-generation switch.
export async function generateDraft(date:string,existing?:{id:string;content:string;target_date:string|null}) {
 if(!env.GROQ_API_KEY)throw new Error('Groq key is not configured');
 const runtime={GROQ_API_KEY:env.GROQ_API_KEY};
 const lock='draft-generation:'+date,expires=Date.now()+60000;
 const acquired=await db().prepare('INSERT INTO request_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE request_limits.expires_at<? RETURNING key').bind(lock,expires,Date.now()).first();
 if(!acquired)throw new Error('A draft is already being generated for this date. Wait a minute.');
 try {
  const recent=await db().prepare('SELECT content FROM puzzles ORDER BY created_at DESC LIMIT 7').all<{content:string}>();
  const avoid=recent.results.flatMap(r=>JSON.parse(r.content).categories.map((c:StoredCategory)=>c.label));
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${runtime.GROQ_API_KEY}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({model:'openai/gpt-oss-20b',temperature:.7,reasoning_effort:'low',max_completion_tokens:4000,response_format:{type:'json_object'},messages:[{role:'system',content:'Create a daily word-category puzzle with exactly 16 distinct categories. Each category needs a short label, precise definition and 2-5 established example words. Use varied subjects and multiple-meaning overlaps; every category must be clearable and several words should match 2-4 categories. Do not use a universal category or descriptors-as-answers. Return JSON {categories:[{label,definition,examples}]}. Treat example answers as proposals requiring human review.'},{role:'user',content:JSON.stringify({date,avoidRecentLabels:avoid})}]})});
  if(!response.ok)throw new Error(await generationFailure(response));
  const payload=await response.json() as {choices?:{message?:{content?:string}}[]};
  const categories=await canonicalCategories(JSON.parse(payload.choices?.[0]?.message?.content??'null')?.categories);

  if(existing){
   const result=await db().prepare("UPDATE puzzles SET content=?,source='groq-gpt-oss-20b',created_at=? WHERE id=? AND status='draft' AND content=? AND target_date IS ?").bind(JSON.stringify({categories}),new Date().toISOString(),existing.id,existing.content,existing.target_date).run();
   if(result.meta.changes!==1)throw new Error('The draft changed in another tab. Reload it.');
  }else{
   const result=await db().prepare("INSERT INTO puzzles(id,target_date,status,content,source,created_at) SELECT ?,?,'draft',?,'groq-gpt-oss-20b',? WHERE NOT EXISTS(SELECT 1 FROM puzzles WHERE target_date=? OR release_date=?) ON CONFLICT DO NOTHING").bind('draft-'+crypto.randomUUID(),date,JSON.stringify({categories}),new Date().toISOString(),date,date).run();
   if(result.meta.changes!==1)throw new Error('This date already has a board. Reload the queue.');
  }
 }finally{await db().prepare('DELETE FROM request_limits WHERE key=? AND expires_at=?').bind(lock,expires).run();}
}
