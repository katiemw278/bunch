// Deliberately local-only. Reuses one reviewed legacy board as a development fixture.
import { getPuzzleById } from '../lib/server/puzzles.js';
import { easternDate,addDays,puzzleNumber } from '../lib/server/calendar.js';
import { createHash } from 'node:crypto';
import { mkdtemp,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const categories=getPuzzleById('puzzle-004-hard4').categories.map(c=>({...c,id:'cat-'+createHash('sha256').update(c.label.trim().toLowerCase()+'|'+c.definition.trim()).digest('hex')}));
let sql='';
for(let day=-4;day<=7;day++){
 const date=addDays(easternDate(),day);
 sql+=`INSERT INTO puzzles(id,number,release_date,target_date,status,content,source,created_at) VALUES(${quote('daily-'+date)},${puzzleNumber(date)},${quote(date)},${quote(date)},'ready',${quote(JSON.stringify({categories}))},'local-fixture',${quote(new Date().toISOString())}) ON CONFLICT DO NOTHING;\n`;
}
for(const c of categories)for(const answer of c.examples)sql+=`INSERT INTO judgments(answer,category_id,version,matches,explanation) VALUES(${quote(answer.trim().toLowerCase())},${quote(c.id)},'5',1,'Reviewed local fixture example') ON CONFLICT DO NOTHING;\n`;
const dir=await mkdtemp(join(tmpdir(),'bunch-seed-'));
try {const file=join(dir,'seed.sql');await writeFile(file,sql);const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to','.wrangler/state','--file',file],{stdio:'inherit'});if(result.status!==0)process.exitCode=1;} finally {await rm(dir,{recursive:true,force:true});}
console.log('Development fixtures only: repeated boards, not production daily content.');
