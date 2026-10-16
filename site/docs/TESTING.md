# Bunch validation

Run from `site/`:

```
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:unit
pnpm db:migrate:local
pnpm db:seed:local
pnpm build
pnpm test:standalone
```

The GitHub `Bunch checks` workflow runs these steps for standalone changes on main and pull requests. It uses read-only repository permissions, pinned actions, one Linux job, a 15-minute timeout and cancels superseded runs. It does not deploy, call a paid model, use Cloudflare credentials, upload artifacts or enable paid services. GitHub Actions uses the account's existing minutes/budget; no billing settings are changed here.

Unit tests exercise the real judging orchestration with a fake provider and cache: selected-only requests, cached matches/nonmatches, no provider calls in seeded mode, malformed replies, provider failures, no partial result on failed batches, invalid descriptions and cache write failures. Sharing tests use the production sharing function. Database-backed HTTP tests cover complete daily/archived games, refresh restoration, guest isolation, streak rules, normalization, duplicate words, selection validation, forged progress, misses, simultaneous tabs, reports and origin checks. Calendar checks cover Eastern daylight-saving boundaries.

## Judging accuracy still needs live evaluation

`tests/judging-cases.json` is an 18-case expected-answer review set against the legacy 4×4 board definitions. It includes alternate meanings, the poncho/folded regression, familiar phrases, legitimate misses, descriptive keyword lists and embedded instructions. Offline mocks do not measure a model's semantic accuracy. No live semantic accuracy score is claimed. Once provider credentials and a spending limit are configured, evaluate these cases with the production judge on an isolated empty cache, record actual results, and review every false rejection/acceptance. Re-run after prompt, model or policy-version changes. Do not insert expected results into production cache to manufacture a passing evaluation.

## Real-device checks before launch

These are manual checks, not completed browser automation:

- Laptop and narrow phone: full board, input, history, long category labels, keyboard-open layout and tap targets.
- Select cards, submit, inspect purple bursts and rejected-card shake; remaining cards retain their slots.
- Open/close instructions, points and results at several scroll positions; closing preserves position.
- Reload mid-game and after finishing; restored board, score, history and results agree.
- Switch between home, archive and today; archived results show the correct board number in copied text.
- Leave a tab open across midnight New York time; notice offers today's board without discarding the old game.
- Two tabs submit at once; only one move persists, the other restores correctly after refresh.
- Clipboard success and blocked-clipboard fallback; shared text has circles per move and no category spoilers.
- Clear cookies in a separate test browser: progress is isolated and the guest-data limitation is clear.

No desktop/mobile visual or accessibility audit is implied by the API tests. Cross-device accounts and recovery are not implemented.
