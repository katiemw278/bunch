import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
// Strip types only; exercise the real browser-independent sharing function.
const source=await readFile(new URL('../lib/sharing.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {buildShareText}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('daily board shares its displayed number, move counts and circles, without category spoilers',()=>{
 const state={puzzleId:'daily-2026-10-16',moveCount:3,score:40,history:[{tilesCleared:['secret1','secret2']},{tilesCleared:[]},{tilesCleared:['secret3']}]};
 assert.equal(buildShareText(state,[],4),'Bunch #004\nMoves: 3\nScore: 40\n\n🟣🟣\n❌\n🟣');
});
test('legacy share callers keep their existing puzzle number',()=>{assert.match(buildShareText({puzzleId:'puzzle-004-hard4',moveCount:0,score:0,history:[]},[]),/^Bunch #004/);});
