import {test} from 'node:test';
import assert from 'node:assert/strict';
import {categoryReuseKey,adjacentRepeatLabels} from '../lib/server/category-reuse.js';
const cat=label=>({label});
test('case, articles, punctuation and basic plural variants identify repeat categories',()=>{assert.equal(categoryReuseKey('Has a handle!'),categoryReuseKey('has handles'));assert.equal(categoryReuseKey('A type of bird'),categoryReuseKey('Birds'));assert.equal(categoryReuseKey('Something purple'),categoryReuseKey('Purple'));});
test('both neighboring dates block repeats, but a gap is allowed',()=>{const cats=[cat('Has a handle')];assert.deepEqual(adjacentRepeatLabels(cats,[{date:'2026-10-16',categories:cats}],'2026-10-17'),['Has a handle']);assert.deepEqual(adjacentRepeatLabels(cats,[{date:'2026-10-18',categories:cats}],'2026-10-17'),['Has a handle']);assert.deepEqual(adjacentRepeatLabels(cats,[{date:'2026-10-15',categories:cats}],'2026-10-17'),[]);});
test('different properties remain distinct',()=>assert.notEqual(categoryReuseKey('Has keys'),categoryReuseKey('Has wheels')));
