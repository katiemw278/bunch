import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generationFailure} from '../lib/server/generation-error.js';
test('rate-limit errors give a bounded retry delay',async()=>{const r=Response.json({error:{code:'rate_limit_exceeded'}},{status:429,headers:{'retry-after':'12'}});assert.match(await generationFailure(r),/Wait 12 seconds/);});
test('credentials and unavailable service errors are distinct',async()=>{assert.match(await generationFailure(new Response('',{status:401})),/GROQ_API_KEY/);assert.match(await generationFailure(new Response('',{status:503})),/temporarily unavailable/);});
test('invalid model JSON is actionable without exposing raw provider content',async()=>{const message=await generationFailure(Response.json({error:{code:'json_validate_failed',message:'private raw prompt'}},{status:400}));assert.match(message,/valid JSON board/);assert.ok(!message.includes('private'));});
test('other provider errors retain only status and safe code',async()=>{const m=await generationFailure(Response.json({error:{code:'bad-code with private data',message:'private'}},{status:400}));assert.match(m,/HTTP 400/);assert.ok(!m.includes('private'));});
