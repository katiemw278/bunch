import { getDb } from "@/db";
import { reports } from "@/db/schema";
import { availablePuzzle,limited,sameOrigin } from "@/lib/server/store";
import { normalizeAnswer } from "@/lib/server/logic";
export async function POST(req: Request) {
  try {
    if(!await sameOrigin(req))return Response.json({error:"Invalid origin"},{status:403});
    if(await limited("report:"+(req.headers.get("cf-connecting-ip")??"local"),10))return Response.json({error:"Please wait before sending another report"},{status:429});
    const text=await req.text();if(text.length>4096)return Response.json({error:"Request too large"},{status:413});
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid request" }, { status: 400 });
    const { puzzleId, answer, categoryId, note } = body as Record<string, unknown>;
    if (typeof puzzleId !== "string" || typeof answer !== "string" || !answer.trim() || answer.length > 80 || typeof categoryId !== "string" || (note !== undefined && (typeof note !== "string" || note.length > 2000)) || !(await availablePuzzle(puzzleId))?.categories.some(c => c.id === categoryId)) return Response.json({ error: "Invalid report" }, { status: 400 });
    await getDb().insert(reports).values({ puzzleId, answer: normalizeAnswer(answer), categoryId, note: note ?? null, createdAt: new Date().toISOString() });
    return Response.json({ success: true, message: "Thanks for the report." });
  } catch { return Response.json({ error: "Couldn't save the report" }, { status: 500 }); }
}
