import { getPuzzleById } from "@/lib/server/puzzles";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPuzzleById(id);
  if (!p) return Response.json({ error: "Puzzle not found" }, { status: 404 });
  return Response.json({ id: p.id, number: p.number, date: p.date, categories: p.categories.map(c => ({ id: c.id, label: c.label })) });
}
