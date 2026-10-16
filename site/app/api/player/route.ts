import {guest,json,playerStats} from '@/lib/server/store';
export async function GET(req:Request){
 const p=await guest(req,false);
 return json(p?await playerStats(p.id):{currentStreak:0,bestStreak:0,dailyCompleted:0,totalCompleted:0,guest:true});
}
