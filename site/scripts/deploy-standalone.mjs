import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const config = JSON.parse(readFileSync(new URL("../wrangler.json", import.meta.url), "utf8"));
const db = config.d1_databases?.find(db => db.binding === "DB");
if (!db?.database_id || db.database_id === "00000000-0000-4000-8000-000000000000") {
  throw new Error("Create an account-owned D1 database and replace database_id in wrangler.json before deploying. Local development does not need an account.");
}
if (!process.argv.includes("--allow-seeded") && config.vars?.JUDGING_MODE !== "live") {
  throw new Error("Production judging is still in seeded demo mode. Configure JUDGING_MODE=live and the GROQ_API_KEY secret, or explicitly use --allow-seeded to deploy a limited demo.");
}
for (const args of [["node_modules/vinext/dist/cli.js", "build"], ["node_modules/wrangler/bin/wrangler.js", "deploy", "--config", "dist/server/wrangler.json"]]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
