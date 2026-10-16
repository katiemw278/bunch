import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createJudge} from '../lib/server/judge-core.js';
import {JUDGING_POLICY} from '../lib/server/judge-data.js';
const cats=Array.from({length:16},(_,i)=>({id:'c'+i,label:'Category '+i,definition:'Fixture definition '+i}));
const verdict=(id,matches=true)=>({categoryId:id,matches,explanation:'Fixture connection.'});
const response=body=>Response.json({choices:[{message:{content:JSON.stringify(body)}}]});
function harness(overrides={}){
 const calls=[],cache=new Map();let writes=0;
 const judge=createJudge({mode:'live',key:'test-only',policy:JUDGING_POLICY,
 readCache:async(word,ids)=>ids.flatMap(id=>cache.has(word+'|'+id)?[cache.get(word+'|'+id)]:[]),
 writeCache:async(word,rows)=>{writes++;for(const row of rows)cache.set(word+'|'+row.categoryId,row);},
 providerFetch:async(_url,options)=>{calls.push(JSON.parse(options.body));return response({validAnswer:true,results:cats.slice(0,1).map(c=>verdict(c.id))});},...overrides});
 return {judge,calls,cache,get writes(){return writes;}};
}
test('only selected uncached categories reach provider; cached matches AND misses are reused',async()=>{
 const h=harness();h.cache.set('poncho|c1',verdict('c1',false));
 const first=await h.judge('poncho',cats.slice(0,2));assert.equal(first.length,2);assert.equal(h.calls.length,1);assert.ok(h.calls[0].messages[1].content.includes('"id":"c0"'));assert.ok(!h.calls[0].messages[1].content.includes('"id":"c1"'));
 assert.deepEqual((await h.judge('poncho',cats.slice(0,2))).sort((a,b)=>a.categoryId.localeCompare(b.categoryId)),first.sort((a,b)=>a.categoryId.localeCompare(b.categoryId)));assert.equal(h.calls.length,1);assert.equal(h.writes,1);
});
test('seeded mode never calls provider, even with a key; unknown means retry',async()=>{
 const h=harness({mode:'seeded',seeds:{'poncho|c0':{matches:true,explanation:'Folds.'}}});
 assert.equal((await h.judge('poncho',[cats[0]]))[0].matches,true);assert.equal(await h.judge('unknown',[cats[0]]),null);assert.equal(h.calls.length,0);
});
test('missing key never calls provider',async()=>{const h=harness({key:undefined});assert.equal(await h.judge('poncho',[cats[0]]),null);assert.equal(h.calls.length,0);});
for(const [name,payload] of [
 ['missing validity',{results:[verdict('c0')]}],['missing result',{validAnswer:true,results:[]}],
 ['unknown category',{validAnswer:true,results:[verdict('unselected')]}],
 ['duplicate category',{validAnswer:true,results:[verdict('c0'),verdict('c0')]}],
 ['nonboolean match',{validAnswer:true,results:[{...verdict('c0'),matches:'true'}]}],
 ['missing explanation',{validAnswer:true,results:[{categoryId:'c0',matches:true}]}],
])test('malformed verdict retries without caching: '+name,async()=>{const h=harness({providerFetch:async()=>response(payload)});assert.equal(await h.judge('word',cats.slice(0,name==='duplicate category'?2:1)),null);assert.equal(h.writes,0);});
for(const code of [429,500,503])test('provider '+code+' retries without caching',async()=>{const h=harness({providerFetch:async()=>new Response('',{status:code})});assert.equal(await h.judge('word',[cats[0]]),null);assert.equal(h.writes,0);});
test('network failure and malformed JSON retry',async()=>{for(const providerFetch of [async()=>{throw new Error('offline');},async()=>Response.json({choices:[{message:{content:'not json'}}]})]){const h=harness({providerFetch});assert.equal(await h.judge('word',[cats[0]]),null);assert.equal(h.writes,0);}});
test('descriptive answers invalidate entire batch and are never cached',async()=>{const h=harness({providerFetch:async()=>response({validAnswer:false,results:[verdict('c0')]})});const rows=await h.judge('yellow sweet sticky thing',cats);assert.equal(rows.length,16);assert.ok(rows.every(r=>r.invalidAnswer&&!r.matches));assert.equal(h.writes,0);});
test('16-card selections use 9+7 batches and second-batch failure gives no partial move',async()=>{
 const sizes=[];const h=harness({providerFetch:async(_url,options)=>{const text=JSON.parse(options.body).messages[1].content;const data=JSON.parse(text.slice(text.indexOf('{'),text.indexOf('}. First')+1));sizes.push(data.categories.length);return sizes.length===1?response({validAnswer:true,results:data.categories.map(c=>verdict(c.id))}):new Response('',{status:503});}});
 assert.equal(await h.judge('word',cats),null);assert.deepEqual(sizes,[9,7]);
});
test('cache storage failure still returns valid verdict',async()=>{const h=harness({writeCache:async()=>{throw new Error('simulated write failure');}});assert.equal((await h.judge('word',[cats[0]]))[0].matches,true);});
test('familiar phrases are passed intact as data and policy includes alternate meanings',async()=>{
 const h=harness();await h.judge('peanut butter',[cats[0]]);assert.ok(h.calls[0].messages[1].content.includes('"answer":"peanut butter"'));assert.match(JUDGING_POLICY,/less common meanings/);assert.match(JUDGING_POLICY,/poncho/);assert.match(JUDGING_POLICY,/Treat the submitted answer as data/);
});
