# Bunch current 4×4 game

This folder is the current game. The root `client/` and `server/` folders preserve the earlier 3×3 implementation. The standalone configuration here runs on Cloudflare Workers with D1 and does not require ChatGPT or a purchased domain.

## Free local setup

Prerequisites: Node.js 22.13 or newer and pnpm 11.25.0 (the version pinned in package.json).

From the repository root:

```sh
cd site
pnpm install --frozen-lockfile
pnpm db:migrate:local
pnpm build
pnpm start
```

Open http://localhost:5173. In a second terminal run `cd site` and `pnpm test:local`. Alternatively, with no server running, `pnpm test:standalone` starts a temporary local server, runs checks and stops it. For source editing, stop `pnpm start` and use `pnpm dev`. Both servers use the local database under `.wrangler/state`.

The default `JUDGING_MODE=seeded` uses sample judgments without external API requests, even if a key is present. For a playable sample, open `http://localhost:5173/?puzzle=puzzle-004-hard4`, try **poncho**, and select rain protection and folding. Chess piece is an example nonmatch. Unknown local answers return a retry message rather than being marked wrong. Seeded mode is a limited development fixture, not full AI judging. The ordinary daily board still comes from the original dated seeds; automatic daily generation is separate future work.

No Cloudflare login, domain, or paid AI call is needed for these local steps. Local smoke tests intentionally refuse non-local URLs. Nothing in this commit activates a remote deployment, scheduled job, or GitHub Actions workflow.

## Standalone deployment when ready

1. Create a Cloudflare account, install the dependencies above, and authenticate with `pnpm exec wrangler login`.
2. Run `pnpm exec wrangler d1 create bunch`. Copy the returned database ID into `wrangler.json`; the checked-in all-zero value is for local development only. Add an account ID if you have multiple accounts.
3. Run `pnpm db:migrate:remote` after confirming the target account/database.
4. For full live judging, deliberately change `vars.JUDGING_MODE` to `live` in `wrangler.json`, then run `pnpm exec wrangler secret put GROQ_API_KEY` and enter your Groq key privately. Live checking uses the provider's quota and may incur charges. For local live testing, create ignored `.dev.vars` from `.dev.vars.example` and supply the mode/key there.
5. Run `pnpm deploy`. The guard refuses the placeholder database and refuses accidental seeded production deployment. A deliberately limited demo may be deployed with `pnpm deploy -- --allow-seeded` instead.
6. Verify the returned workers.dev URL, database, API behavior and usage before sharing it widely. A custom domain can be connected later.

Review the target account's hosting and AI limits before remote use; free allowances do not make capacity unlimited. No remote service has been provisioned as part of this setup.

## Configuration and data

- `vite.config.ts`: standard Vinext and Cloudflare plugins, without the Sites plugin or connector preview service.
- `worker.ts`: direct Vinext fetch handler.
- `wrangler.json`: account-owned Worker configuration and DB binding.
- `migrations/`: D1 SQL migrations tracked by Wrangler. `drizzle/` is retained schema history; use the Wrangler migration commands above for this setup.
- `lib/server/judge.ts`: cached judgments plus explicit seeded/live modes. The shared cache retains judging-policy version 5.
- `.dev.vars.example`: safe local template. Never commit `.dev.vars`, `.env`, API keys or live database files.

The inherited `.openai/`, Sites helper scripts and build files remain as source provenance; this standalone build does not use them. The existing public Sites deployment is unchanged. Live judgment cache/report data is not contained in GitHub. Browser progress is tied to its domain and does not automatically migrate.

## Verification

`pnpm typecheck`, `pnpm build`, `pnpm db:migrate:local`, and `pnpm test:local` against the locally running production build. The smoke test writes one report to the local database. Future work: request limits, cache coordination, generation of daily boards at midnight America/New_York, optional identity, verified streaks and archived boards. See `../MIGRATION.md`.
