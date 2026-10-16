import {guest,json,session,availablePuzzle} from '@/lib/server/store';
export async function GET(req:Request){const id=new URL(req.url).searchParams.get('puzzle')??'';if(!await availablePuzzle(id))return json({error:'Puzzle not found'},null,404);const p=await guest(req);return json((await session(p!.id,id)).state,p!.cookie);}
