import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getPuzzleById} from '../lib/server/puzzles.js';
import {materializeGeneratedCategories,generationReviewWarnings,GENERATION_POLICY} from '../lib/server/generation-policy.js';
const reference=()=>structuredClone(getPuzzleById('puzzle-004-hard4').categories);
test('today’s reference board has no style warnings',()=>assert.deepEqual(generationReviewWarnings(reference()),[]));
test('frames construct readable category phrases without guessing the meaning',()=>{
 const rows=materializeGeneratedCategories([{frame:'Has',subject:' wheels ',definition:'Objects with wheels',examples:['car','bicycle','suitcase']},{frame:'A type of',subject:'bird'},{frame:'Something',subject:'sticky'}]);
 assert.deepEqual(rows.map(c=>c.label),['Has wheels','A type of bird','Something sticky']);assert.equal(rows[0].definition,'Objects with wheels');
});
test('single words and long labels are review warnings, never discarded drafts',()=>{const cats=reference();cats[0].label='Purple';cats[1].label='A very complicated category with far too many different qualifications';const warnings=generationReviewWarnings(cats);assert.ok(warnings.some(w=>w.includes('phrase label')));assert.ok(warnings.some(w=>w.includes('shorten')));assert.equal(cats.length,16);});
test('missing shared examples save for review rather than demanding regeneration',()=>{const cats=reference().map((c,i)=>({...c,examples:['a'+i,'b'+i,'c'+i]}));assert.match(generationReviewWarnings(cats).join(' '),/Few shared examples/);});
test('catch-all examples and spelling gimmicks are flagged',()=>{const cats=reference().map(c=>({...c,examples:[...c.examples,'thing']}));cats[0].label='Words that rhyme';const warnings=generationReviewWarnings(cats).join(' ');assert.match(warnings,/more than five/);assert.match(warnings,/spelling-game/);});
test('legacy response labels and broad definitions are preserved',()=>{const cats=reference();assert.deepEqual(materializeGeneratedCategories(cats),cats);assert.match(GENERATION_POLICY,/without making examples exhaustive/);});
