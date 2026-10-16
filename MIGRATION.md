# Standalone migration checklist

## Current checkpoint

- Current 4×4 source is preserved in `site/`, matching Sites source commit `2d0bb73ef6fba752d0e16a62360e0ad3b92c88aa`.
- Existing root, client, and server code is retained. The import does not move live hosting or copy database contents.
- The current source passed TypeScript checks and the production build during the latest Sites update. This import changes no game code.

## Next steps without a domain purchase

1. Prepare a standalone build in `site/`: replace Sites-specific build plugins and execution-profile assumptions, configure a Worker entrypoint and D1 binding using an account-owned database.
2. Verify a local no-secret workflow with sample judgments; add a database migration and document how to supply GROQ_API_KEY for live checking. Do not commit a real key or call paid APIs as part of ordinary tests.
3. Add request limits, monitoring, coordinated cache misses, overall AI deadlines, and safe error handling.
4. Move dated puzzles into the database. Generate and validate future 16-category boards ahead of time and release one shared board at midnight America/New_York. Keep a reserve queue and protect future boards from public access.
5. Add server-verified sessions and completion records, optional recoverable identity, daily streaks, and an archive with independent per-puzzle progress. Archive wins should not repair daily streaks unless that policy is intentionally changed.
6. Test staging and load behavior; choose hosting and AI budgets. A custom domain can be purchased later.
7. Measure retention before testing light ads, supporter subscriptions, or sponsorships. Keep scoring and judging independent of payment.

## Important migration details

- Browser progress is origin-specific and will not automatically transfer to a new domain.
- Export judgments and reports from the current host if supported; otherwise expect a cold cache initially.
- Stable category definition versions should let word/category judgments be reused across boards.
- The full project plan is in the Google Doc titled Bunch current state and launch plan.
