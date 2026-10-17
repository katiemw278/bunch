import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2),remote=args.includes('--remote');
if(args.includes('--approve'))throw new Error('Approve boards through /admin so consecutive-day category rules are enforced.');
const sql="SELECT id,target_date,status,source,content FROM puzzles WHERE status IN ('draft','reserve') ORDER BY target_date,created_at";
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB',remote?'--remote':'--local',...(!remote?['--persist-to','.wrangler/state']:[]),'--command',sql,'--json'],{stdio:'inherit'});process.exitCode=result.status??1;
