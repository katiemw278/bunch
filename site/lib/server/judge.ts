import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { judgments as judgmentTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { DEV_SEED_JUDGMENTS, JUDGING_POLICY } from "./judge-data";

type Category = { id: string; label: string; definition: string };
type Judgment = { categoryId: string; matches: boolean; explanation: string; invalidAnswer?: boolean };

export async function judgeAnswer(answer: string, categories: Category[]): Promise<Judgment[] | null> {
  if (!categories.length) return [];
  // Keep individual model requests small for larger boards, using the same
  // validated judging path as Easy mode. Never apply partial results.
  if (categories.length > 9) {
    const all: Judgment[] = [];
    for (let start = 0; start < categories.length; start += 9) {
      const batch = await judgeAnswer(answer, categories.slice(start, start + 9));
      if (!batch) return null;
      if (batch.some(row => row.invalidAnswer)) return categories.map(c => ({ categoryId: c.id, matches: false, explanation: "Too descriptive.", invalidAnswer: true }));
      all.push(...batch);
    }
    return all;
  }
  const db = getDb();
  const cached = await db.select().from(judgmentTable).where(and(
    eq(judgmentTable.answer, answer), eq(judgmentTable.version, "5"),
    inArray(judgmentTable.categoryId, categories.map(c => c.id)),
  ));
  const results: Judgment[] = cached.filter(c => categories.some(category => category.id === c.categoryId)).map(c => ({ categoryId: c.categoryId, matches: !!c.matches, explanation: c.explanation }));
  const pending = categories.filter(c => !results.some(r => r.categoryId === c.id));
  if (!pending.length) return results;
  const key = (env as unknown as { GROQ_API_KEY?: string }).GROQ_API_KEY;
  if (!key) {
    const seeds = DEV_SEED_JUDGMENTS as Record<string, { matches: boolean; explanation: string }>;
    // Unconfigured previews must never mark an unknown answer wrong by default.
    if (!pending.some(c => seeds[`${answer}|${c.id}`])) return null;
    return [...results, ...pending.map(c => ({ categoryId: c.id, matches: seeds[`${answer}|${c.id}`]?.matches ?? false, explanation: seeds[`${answer}|${c.id}`]?.explanation ?? "No seeded match." }))];
  }
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: JUDGING_POLICY },
          { role: "user", content: `Evaluate the answer and categories in this JSON data: ${JSON.stringify({ answer, categories: pending })}. First determine whether the entire answer names one established entity or phrase, rather than a sentence, description, or keyword list. Return ONLY a JSON object {"validAnswer":true,"results":[{"categoryId":"...","matches":true,"explanation":"One sentence."}]} with exactly one result for each category.` },
        ],
      }),
    });
    if (!response.ok) return null;
    const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
    const parsed = JSON.parse(payload.choices?.[0]?.message?.content ?? "null");
    if (typeof parsed?.validAnswer !== "boolean") return null;
    if (parsed.validAnswer === false) {
      return [...results, ...pending.map(c => ({ categoryId: c.id, matches: false, invalidAnswer: true, explanation: "Use one recognized word, name, or familiar phrase—not a sentence or keyword list." }))];
    }
    const rows: unknown = Array.isArray(parsed) ? parsed : parsed?.results ?? parsed?.judgments;
    if (!Array.isArray(rows) || rows.length !== pending.length) return null;
    const expected = new Set(pending.map(c => c.id));
    const valid: Judgment[] = [];
    for (const row of rows) {
      if (!row || !expected.delete(row.categoryId) || typeof row.matches !== "boolean" || typeof row.explanation !== "string") return null;
      valid.push({ categoryId: row.categoryId, matches: parsed.validAnswer && row.matches, explanation: parsed.validAnswer ? row.explanation.slice(0, 1000) : "Use one recognized word, name, or familiar phrase—not a sentence or keyword list." });
    }
    if (expected.size) return null;
    // D1 permits at most 100 bound parameters per statement. Each cached
    // judgment uses five, so a 25-card board must be written in batches.
    // Caching is optional: a storage failure must not discard a valid verdict.
    try {
      for (let start = 0; start < valid.length; start += 10) {
        await db.insert(judgmentTable).values(valid.slice(start, start + 10).map(r => ({ answer, categoryId: r.categoryId, version: "5", matches: r.matches ? 1 : 0, explanation: r.explanation }))).onConflictDoNothing();
      }
    } catch (error) {
      console.error("Judgment cache write failed", error instanceof Error ? error.message : "Unknown storage error");
    }
    return [...results, ...valid];
  } catch { return null; }
}
