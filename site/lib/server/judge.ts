import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { judgments as judgmentTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { DEV_SEED_JUDGMENTS, JUDGING_POLICY } from "./judge-data";
import { createJudge } from "./judge-core";

type Category = { id: string; label: string; definition: string };
type Judgment = { categoryId: string; matches: boolean; explanation: string; invalidAnswer?: boolean };
export async function judgeAnswer(answer:string,categories:Category[]):Promise<Judgment[]|null> {
 const db=getDb();
 return createJudge({
  mode:env.JUDGING_MODE??'seeded',key:env.GROQ_API_KEY,policy:JUDGING_POLICY,
  seeds:{...DEV_SEED_JUDGMENTS,
   'poncho|p4-c6':{matches:true,explanation:'A poncho protects against rain.'},
   'poncho|p4-c9':{matches:true,explanation:'A poncho can be folded for storage.'},
   'poncho|p4-c14':{matches:false,explanation:'A poncho is not a chess piece.'}},
  readCache:async (word:string,ids:string[])=>db.select().from(judgmentTable).where(and(eq(judgmentTable.answer,word),eq(judgmentTable.version,'5'),inArray(judgmentTable.categoryId,ids))),
  writeCache:async (word:string,rows:Judgment[])=>{
   for(let start=0;start<rows.length;start+=10)await db.insert(judgmentTable).values(rows.slice(start,start+10).map(r=>({answer:word,categoryId:r.categoryId,version:'5',matches:r.matches?1:0,explanation:r.explanation}))).onConflictDoNothing();
  },
 })(answer,categories);
}
