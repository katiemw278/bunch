import assert from 'node:assert/strict';
const base=new URL(process.env.BUNCH_TEST_URL??'http://127.0.0.1:5173');
if(!['localhost','127.0.0.1','[::1]'].includes(base.hostname))throw new Error('Local only');
function client(){let cookie='';return async(path,body,headers={})=>{const r=await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000),method:body?'POST':'GET',headers:{Connection:'close',cookie,...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return{status:r.status,body:await r.json()};};}
const a=client(),puzzleId='puzzle-004-hard4';
await a('/api/game?puzzle='+puzzleId);
const state=async()=>(await a('/api/game?puzzle='+puzzleId)).body;
const submit=(answer,selectedCategoryIds,extra={})=>a('/api/submit',{puzzleId,answer,selectedCategoryIds,...extra});
for(const selected of [[],['not-a-card'],['p4-c6','p4-c6'],[null],Array(17).fill('p4-c6')]){assert.equal((await submit('poncho',selected)).body.type,'invalid');assert.equal((await state()).moveCount,0);}
assert.equal((await submit('x'.repeat(81),['p4-c6'])).status,400);
assert.equal((await a('/api/submit',{puzzleId,answer:'poncho',selectedCategoryIds:['p4-c6']},{origin:'https://other.invalid'})).status,403);
assert.equal((await state()).moveCount,0);
const unknown=await submit('not-a-seeded-fixture',['p4-c6']);assert.equal(unknown.body.type,'retry');assert.equal((await state()).moveCount,0);
const hit=await submit(' PONCHO ',['p4-c6'],{score:9999,moveCount:999,clearedTiles:['p4-c9'],previousAnswers:['poncho']});assert.equal(hit.body.type,'result');assert.equal(hit.body.moveScore,10);assert.deepEqual(hit.body.newlyCleared,['p4-c6']);
assert.equal((await state()).score,10);assert.equal((await state()).moveCount,1);assert.deepEqual((await state()).clearedTiles,['p4-c6']);
assert.equal((await submit('poncho',['p4-c9'])).body.type,'duplicate');
assert.equal((await submit('ponchos',['p4-c9'])).body.type,'duplicate');
assert.equal((await submit('word',['p4-c6'])).body.type,'invalid');
const b=client();await b('/api/game?puzzle='+puzzleId);
const misses=await b('/api/submit',{puzzleId,answer:'poncho',selectedCategoryIds:['p4-c14']});assert.equal(misses.body.type,'result');assert.equal(misses.body.moveScore,0);assert.equal(misses.body.newMoveCount,1);assert.deepEqual(misses.body.newlyCleared,[]);
// Two tabs with a shared identity must never clear the same cards twice.
const c=client();await c('/api/game?puzzle='+puzzleId);
const concurrent=await Promise.all([1,2].map(()=>c('/api/submit',{puzzleId,answer:'poncho',selectedCategoryIds:['p4-c6','p4-c9'],requestId:crypto.randomUUID()})));
assert.equal(concurrent.filter(r=>r.body.type==='result').length,1);
const saved=(await c('/api/game?puzzle='+puzzleId)).body;assert.equal(saved.moveCount,1);assert.equal(saved.score,30);assert.equal(saved.history.length,1);
const report=await a('/api/report',{puzzleId,answer:'poncho',categoryId:'p4-c6',note:'Automated local regression'});assert.equal(report.status,200);assert.equal(report.body.success,true);
assert.equal((await a('/api/report',{puzzleId,answer:'poncho',categoryId:'not-a-card'})).status,400);
assert.equal((await a('/api/archive?before=not-a-date')).status,400);
console.log('PASS: invalid selections, normalization, duplicates, forged progress, no-move retries, misses, concurrent tabs, reports, and cross-origin rejection.');
