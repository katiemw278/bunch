import { availablePuzzle,publicPuzzle,json } from '@/lib/server/store';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}) {const {id}=await params;const p=await availablePuzzle(id);return p?json(publicPuzzle(p)):json({error:'Puzzle not found'},null,404);}
