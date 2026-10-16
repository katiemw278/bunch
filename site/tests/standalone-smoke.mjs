import assert from "node:assert/strict";
const base = new URL(process.env.BUNCH_TEST_URL ?? "http://127.0.0.1:5173");
if (!["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)) throw new Error("Smoke tests must target a local server in seeded mode.");
async function submit(answer, selectedCategoryIds, extra = {}) {
  const response = await fetch(new URL("/api/submit", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ puzzleId: "puzzle-004-hard4", answer, selectedCategoryIds, ...extra }) });
  return { status: response.status, body: await response.json() };
}
assert.equal((await fetch(base)).status, 200);
const today = await (await fetch(new URL("/api/puzzle/today", base))).json();
assert.equal(today.categories.length, 16);
const one = await submit("poncho", ["p4-c6"]);
assert.equal(one.body.type, "result");
assert.deepEqual(one.body.newlyCleared, ["p4-c6"]);
assert.equal(one.body.moveScore, 10);
const mixed = await submit(" PONCHO ", ["p4-c6", "p4-c9", "p4-c14"]);
assert.equal(mixed.body.type, "result");
assert.deepEqual(new Set(mixed.body.newlyCleared), new Set(["p4-c6", "p4-c9"]));
assert.equal(mixed.body.moveScore, 30);
assert.equal(mixed.body.judgmentMap["p4-c14"].matches, false);
assert.equal(Object.keys(mixed.body.judgmentMap).length, 3);
assert.equal((await submit("unknown-local-fixture", ["p4-c6"])).body.type, "retry");
assert.equal((await submit("poncho", [])).body.type, "invalid");
assert.equal((await submit("poncho", ["p4-c6"], { previousAnswers: ["poncho"] })).body.type, "duplicate");
const report = await fetch(new URL("/api/report", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ puzzleId: "puzzle-004-hard4", answer: "poncho", categoryId: "p4-c6", note: "Local smoke test" }) });
assert.equal(report.status, 200);
assert.equal((await report.json()).success, true);
console.log("PASS: local page, daily board, selected-only judgments, multiple matches, nonmatch, unknown fixture, selection validation, duplicates, and database report write.");
