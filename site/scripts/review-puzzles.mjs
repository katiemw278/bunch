import {spawnSync} from 'node:child_process';
import {puzzleNumber} from '../lib/server/calendar.js';
const args=process.argv.slice(2),remote=args.includes('--remote');
const q=v=>"'"+v.replaceAll("'","''")+"'";
let sql="SELECT id,target_date,status,source,content FROM puzzles WHERE status IN ('draft','reserve') ORDER BY target_date,created_at";
if(args.includes('--approve')){
 const id=args[args.indexOf('--approve')+1],date=args[args.indexOf('--date')+1];
 if(!id||!args.includes('--date')||!/^\d{4}-\d{2}-\d{2}$/.test(date??'')||!args.includes('--reviewed'))throw new Error('Use --approve ID --date YYYY-MM-DD --reviewed after checking every category, examples, overlaps and a clearing path.');
 sql=`UPDATE puzzles SET status='ready',release_date=${q(date)},target_date=${q(date)},number=${puzzleNumber(date)} WHERE id=${q(id)} AND status='draft' AND NOT EXISTS(SELECT 1 FROM puzzles WHERE release_date=${q(date)}); SELECT id,status,release_date FROM puzzles WHERE id=${q(id)}`;
}
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB',remote?'--remote':'--local',...(!remote?['--persist-to','.wrangler/state']:[]),'--command',sql,'--json'],{stdio:'inherit'});process.exitCode=result.status??1;
