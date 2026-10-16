import { getPuzzleForDate } from "@/lib/server/puzzles";
export const dynamic = "force-dynamic";
export function GET() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const puzzle = getPuzzleForDate(date, "hard");
  return Response.json({ id: puzzle.id, number: puzzle.number, date: puzzle.date, categories: puzzle.categories.map(c => ({ id: c.id, label: c.label })) }, { headers: { "Cache-Control": "no-store" } });
}
