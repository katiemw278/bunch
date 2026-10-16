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


## Daily boards, archives, and guest streaks

The standalone source now uses D1 for dated puzzles, guest game sessions, completions and shared category/answer judgments. Run `pnpm db:migrate:local`, `pnpm db:seed:local`, `pnpm build`, then `pnpm test:standalone`. Seeding is local-only, idempotent, and intentionally repeats the legacy board across dates. These are development fixtures, not production daily content. Re-run the seed if testing more than a week later.

Daily rollover uses `America/New_York` (midnight Eastern, including daylight saving). Everyone gets the same dated board. Reading today's board resolves its date immediately; it does not depend on the cron arriving at midnight. A missing date consumes an approved reserve atomically if available, otherwise returns an unavailable response rather than silently serving yesterday. Old boards remain in the archive. Open games check for a new daily board every minute and on focus.

A guest cookie restores server-owned progress. Complete an official board on its release date to extend a streak; playing an archive increases completed boards without repairing or extending daily streaks. Current streak remains active through the following day until that day's deadline. Clearing cookies, changing browsers or devices loses access to this guest identity. Accounts and cross-device recovery are future work.

Submissions check only selected, uncleared categories. Individual normalized answer/category/version results are cached. Category IDs hash the label and definition so changed meanings cannot reuse older judgments. Both matches and nonmatches are cached. Server sessions own scores/history; concurrent writes use optimistic version checks and final completion is saved in the same D1 batch. A request ID makes retries of the latest successful move idempotent. Stale tabs receive a refresh message. Per-IP and guest request limits reduce accidental abuse; these are a starting point, not a load-tested public abuse defense.

### AI drafting and review

`GENERATION_MODE=disabled` and `JUDGING_MODE=seeded` prevent paid provider calls locally. The hourly scheduled handler is wired but drafting stays disabled until explicitly configured. When enabled, it drafts at most one missing board in the next seven days per invocation. AI output must pass shape/length/uniqueness checks and is stored privately as a draft. No draft is published automatically. The existing provider is Groq, independent of a ChatGPT subscription. Do not enable live mode until a provider key and spending controls are configured.

List drafts with `pnpm puzzles:review`. Inspect every definition, verify example answers and meaningful overlaps, and confirm a full clearing path. Approve with `pnpm puzzles:review --approve ID --date YYYY-MM-DD --reviewed`. Add `--remote` only after Cloudflare setup to review the production database. The command refuses to overwrite an occupied date. Approved future boards are hidden until their release date. Review needs human judgment; validation alone cannot establish puzzle quality. A scheduled low-queue warning goes to Worker logs. Alert delivery, a review dashboard, distributed generation locking and automatic reserve creation are not implemented yet.

### Remaining before public launch

Create the Cloudflare account/D1 database; replace the placeholder database ID; apply remote migrations; configure live judging and its secret; approve a queue of real daily boards; then deploy and test on the free workers.dev URL. Production seeding must not use the local fixture script. Set up monitoring, usage/spending limits, backups, a privacy notice and a guest-data retention policy. Test the archive, mobile layout, rollover and recovery on real devices. Add optional sign-in and cross-device streak recovery later. No Cloudflare resources, provider calls or purchases were made during local preparation.
