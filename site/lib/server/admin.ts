import {env} from 'cloudflare:workers';
import {verifySession,configured} from './admin-auth';
export function adminConfigured(){return configured(env.ADMIN_PASSWORD);}
export async function authorized(req:Request){
 const token=req.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('bunch_admin='))?.slice(12);
 return verifySession(token,env.ADMIN_PASSWORD);
}
export function adminJson(data:unknown,status=200,cookie?:string){return Response.json(data,{status,headers:{'Cache-Control':'no-store, private','X-Robots-Tag':'noindex, nofollow',...(cookie?{'Set-Cookie':cookie}:{})}});}
export function adminCookie(req:Request,value:string,maxAge=28800){return `bunch_admin=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
export function adminOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export async function readBody(req:Request){
 const reader=req.body?.getReader();if(!reader)throw new Error('Missing request');
 const chunks:Uint8Array[]=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>40000){await reader.cancel();throw new Error('Request too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
