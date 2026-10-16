import { getDb } from "@/db";
import { reports } from "@/db/schema";
import { getPuzzleById } from "@/lib/server/puzzles";
import { normalizeAnswer } from "@/lib/server/logic";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Invalid request" }, { status: 400 });
    const { puzzleId, answer, categoryId, note } = body as Record<string, unknown>;
    if (typeof puzzleId !== "string" || typeof answer !== "string" || !answer.trim() || answer.length > 80 || typeof categoryId !== "string" || (note !== undefined && (typeof note !== "string" || note.length > 2000)) || !getPuzzleById(puzzleId)?.categories.some(c => c.id === categoryId)) return Response.json({ error: "Invalid report" }, { status: 400 });
    await getDb().insert(reports).values({ puzzleId, answer: normalizeAnswer(answer), categoryId, note: note ?? null, createdAt: new Date().toISOString() });
    return Response.json({ success: true, message: "Thanks for the report." });
  } catch { return Response.json({ error: "Couldn't save the report" }, { status: 500 }); }
}
