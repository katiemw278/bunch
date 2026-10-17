import {env} from 'cloudflare:workers';
import {adminConfigured,authorized,adminJson,adminCookie,adminOrigin,readBody} from '@/lib/server/admin';
import {passwordMatches,signSession} from '@/lib/server/admin-auth';
import {limited} from '@/lib/server/store';
export async function GET(req:Request){return adminJson({configured:adminConfigured(),authenticated:await authorized(req)});}
export async function POST(req:Request){
 if(!adminOrigin(req))return adminJson({error:'Invalid origin'},403);
 if(!adminConfigured())return adminJson({error:'Add an ADMIN_PASSWORD secret of at least 32 characters in Cloudflare to enable admin access.'},503);
 if(await limited('admin-login:'+(req.headers.get('cf-connecting-ip')??'local'),5))return adminJson({error:'Too many attempts. Wait a minute.'},429);
 try {const body=await readBody(req);if(!await passwordMatches(body?.password,env.ADMIN_PASSWORD))return adminJson({error:'Incorrect password.'},401);
 return adminJson({authenticated:true},200,adminCookie(req,await signSession(env.ADMIN_PASSWORD)));
 }catch{return adminJson({error:'Invalid request'},400);}
}
export async function DELETE(req:Request){if(!adminOrigin(req))return adminJson({error:'Invalid origin'},403);return adminJson({authenticated:false},200,adminCookie(req,'',0));}
