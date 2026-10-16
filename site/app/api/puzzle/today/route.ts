import { dailyPuzzle,publicPuzzle,json } from '@/lib/server/store';
export const dynamic='force-dynamic';
export async function GET(){ const p=await dailyPuzzle();return p?json(publicPuzzle(p)):json({error:'Today’s board is not ready yet. Please try again shortly.'},null,503); }
