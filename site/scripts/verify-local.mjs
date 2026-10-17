import { spawn } from "node:child_process";
const server = spawn(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "dev", "--config", "dist/server/wrangler.json", "--local", "--var", "JUDGING_MODE:seeded", "--var", "GENERATION_MODE:disabled", "--var", "ADMIN_PASSWORD:local-admin-fixture-password-32-chars", "--persist-to", ".wrangler/state", "--ip", "127.0.0.1", "--port", "5173", "--inspector-port", "0"], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, WRANGLER_SEND_METRICS: "false", WRANGLER_CI_DISABLE_CONFIG_WATCHING: "true" } });
let log = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", data => { log = (log + data).slice(-12000); });
try {
  const deadline = Date.now() + 45000;
  let ready = false;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error("Local server stopped before becoming ready");
    try { ready = (await fetch("http://127.0.0.1:5173", { signal: AbortSignal.timeout(1000) })).ok; } catch {}
    if (ready) {
      // Warm the admin route too: Wrangler can restart while loading its modules.
      try {
        const session = await fetch("http://127.0.0.1:5173/api/admin/session", { signal: AbortSignal.timeout(1000) });
        const data = session.ok ? await session.json() : null;
        ready = data?.configured === true && data?.authenticated === false;
      } catch { ready = false; }
    }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Local server did not become ready within 45 seconds");
  process.env.BUNCH_TEST_URL = "http://127.0.0.1:5173";
  await import("../tests/standalone-smoke.mjs");
  await import("../tests/gameplay-regression.mjs");
  await import("../tests/admin-regression.mjs");
} catch (error) {
  console.error(log);
  throw error;
} finally { server.kill("SIGTERM"); }
