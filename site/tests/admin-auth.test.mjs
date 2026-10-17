import {test} from 'node:test';
import assert from 'node:assert/strict';
import {signSession,verifySession,passwordMatches,validDate} from '../lib/server/admin-auth.js';
const secret='unit-test-fixture-not-production-1234567890';
test('admin is locked without a strong configured secret',async()=>{assert.equal(await verifySession('anything',undefined),false);assert.equal(await passwordMatches('short','short'),false);});
test('correct password only; signed session expires and rejects modification or secret rotation',async()=>{
 assert.equal(await passwordMatches(secret,secret),true);assert.equal(await passwordMatches('wrong',secret),false);
 const now=Date.now(),token=await signSession(secret,now);assert.equal(await verifySession(token,secret,now),true);
 assert.equal(await verifySession(token+'0',secret,now),false);assert.equal(await verifySession(token,secret+'rotated',now),false);assert.equal(await verifySession(token,secret,now+28800000),false);
 const parts=token.split('.');parts[0]=String(Number(parts[0])+1);assert.equal(await verifySession(parts.join('.'),secret,now),false);
});
test('release dates must be real dates after today',()=>{for(const date of ['2026-02-30','2026-10-16','2026-10-15','2026-99-99','tomorrow'])assert.equal(validDate(date,'2026-10-16'),false);assert.equal(validDate('2026-10-17','2026-10-16'),true);});
