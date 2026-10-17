const enc = new TextEncoder();
async function key(secret) { return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']); }
const hex = bytes => Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export function configured(secret) { return typeof secret==='string' && secret.length>=32; }
export async function passwordMatches(value,secret) {
 if(!configured(secret)||typeof value!=='string')return false;
 const k=await key(secret), signature=await crypto.subtle.sign('HMAC',k,enc.encode('login:'+secret));
 return crypto.subtle.verify('HMAC',k,signature,enc.encode('login:'+value));
}
export async function signSession(secret,now=Date.now()) {
 if(!configured(secret))throw new Error('Admin access is not configured');
 const body=`${Math.floor(now/1000)+28800}.${crypto.randomUUID()}`;
 return body+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret),enc.encode('bunch-admin:'+body)));
}
export async function verifySession(token,secret,now=Date.now()) {
 if(!configured(secret)||typeof token!=='string'||token.length>200)return false;
 const parts=token.split('.');if(parts.length!==3||!/^\d+$/.test(parts[0])||!/^[a-f0-9-]{36}$/.test(parts[1])||!/^[a-f0-9]{64}$/.test(parts[2]))return false;
 const expiry=Number(parts[0]),seconds=Math.floor(now/1000);if(expiry<=seconds||expiry>seconds+28800)return false;
 return crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(parts[2].match(/../g),b=>parseInt(b,16)),enc.encode('bunch-admin:'+parts[0]+'.'+parts[1]));
}
export function validDate(date,today) { return typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date+'T12:00:00Z')) && new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date && date>today && date<='2099-12-31'; }
