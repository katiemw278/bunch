# Private board studio

Open `/admin` on the deployed Bunch site. Before access is configured it shows a locked setup screen. Drafts, definitions and example answers are served only by authenticated admin APIs; hiding the URL is not the access control.

## First setup

In Cloudflare, open Workers & Pages → bunch → Settings → Variables and Secrets. Add a **Secret** named `ADMIN_PASSWORD`, with a unique password of at least 32 characters from a password manager. Save/deploy, then reload `/admin` and sign in. Do not put the password in GitHub, chat, a URL, or a public environment variable. The existing `GROQ_API_KEY` secret powers manual draft generation. No additional database migrations are required.

This is single-owner password access, not individual user accounts or MFA. The server issues an eight-hour HMAC-signed HttpOnly cookie with SameSite=Strict, an admin API path, and Secure on HTTPS. Login attempts are limited per IP. Mutations require the exact request origin. Rotating or removing `ADMIN_PASSWORD` invalidates all sessions. Sign-out clears this browser's cookie; it does not centrally revoke a previously copied cookie. For multiple administrators or stronger account protection, add verified Cloudflare Access authentication later.

## Review workflow

1. Choose a future release date (New York time) and click **Generate draft**. Each click uses Groq quota and generates one board. Automatic scheduled generation remains disabled. No drafts have been generated merely by deploying this page.
2. Select the draft in the queue. Inspect the board preview, category definitions, and 2–8 example answers per card. Edit labels/definitions/examples and save drafts as needed.
3. Verify the suggested overlaps and a full path to clear all 16 cards. Shared examples are AI proposals; they do not prove a connection or seed the production judging cache. Regenerate a weak draft if needed; confirmation is required because it replaces that draft.
4. Complete all review checkboxes and click **Approve**. Approval saves current edits and schedules release for midnight Eastern on the chosen date. It does not publish early.
5. Approved future boards can be returned to draft and edited. Already released boards are read-only, preserving existing players' games. A date can have only one scheduled board.

Changes use content revisions to reject stale-tab writes. Generation holds a date-specific database lease to prevent duplicate requests for the same date from overlapping. The provider call has a 30-second timeout and at most 4,000 completion tokens. This is a bounded request, not an organization-wide spending cap. Groq plan/rate limits still apply. Draft listing is capped at 90 queued/current records; old released boards are available through the player archive rather than this editor. Reserve boards are read-only here.

## Validation and development

`pnpm test:unit` checks missing/short secrets, wrong passwords, token tampering, expiry, secret rotation and valid future dates. `pnpm test:standalone` also exercises unauthenticated access, cookie flags, origin checks, private drafts, edits, stale revisions, approval/unapproval, future-board visibility, immutable released boards, and logout.

The local-only seed script creates `admin-fixture` for HTTP tests. The local test runner explicitly supplies a public test password only to a local Worker; it is never a production default. Never reuse that fixture password in production. Production access remains disabled without the actual Cloudflare secret.

Manual visual and real-provider generation checks remain necessary. Automated tests do not send generation requests to Groq. After configuring your admin password, generate and review your first real draft before scheduling additional boards.

## Generation style

The generator uses the original 4×4 board as an explicit style reference: short, everyday labels about traits, parts, uses, places and recognizable types. It proposes 3–5 examples per card and at least four shared example words spanning eight cards. Mechanical checks flag overlong labels, spelling-game patterns, insufficient shared examples and one example repeated across more than five cards as review warnings. Structurally valid drafts are saved for editing. These checks apply to AI-generated drafts, not your hand-edited definitions, and cannot prove that the connections are factual or fun. Review remains required. Existing drafts are unchanged; use Regenerate to apply the new style to one of them. Recent approved labels are used as a freshness preference rather than using unapproved drafts as the style reference.

Generation now asks for a category frame (`Has`, `Found in`, `Something`, etc.) plus a subject, which the server combines into a phrase label. Legacy responses keep their labels for review. Style/overlap checks now appear as editing warnings in the studio instead of discarding structurally valid drafts and forcing regeneration. Exactly 16 valid categories and the existing required fields remain mandatory. A low shared-example count is evidence for review, not proof that no real connections exist. Approval still requires the owner's review checklist.

## Consecutive-day category rule

Generation receives the previous and next dates' draft/approved category labels with an explicit instruction not to repeat the same category or reword its meaning. Older recent labels are a preference only; recurrence after a gap is allowed. Approval checks both adjacent released/scheduled dates, independent of which board was approved first. Common label variations (case, punctuation, articles, basic plurals and some phrasing) are normalized. This is not a full semantic synonym detector: review reworded categories too. A shared publication lease prevents two admin approvals racing through this check. Reserve fallback also skips a board that repeats an adjacent category. Existing approved boards are not automatically removed; the studio shows repeat warnings so you can return a future board to draft and edit it. CLI approval is disabled in favor of the protected studio path.

## Fix with AI and independent example checks

For a draft, **Fix with AI** sends the current editor values, style warnings, neighboring-day forbidden categories and any previous AI findings to the generator. It asks for a targeted repair, retaining sound cards where possible, replacing repeats and proposing better overlapping examples. Save release-date changes first. It then makes one independent AI request to audit all proposed example/category pairs against the definitions. Unsupported examples are removed when at least two confirmed examples remain for that card. If too few remain, the card stays explicitly flagged for another repair rather than falsely claiming success. A separate **Check connections with AI** action audits examples without generating a new board.

The repair is bounded to one generation call plus one checking call per click; no unlimited retries. On rate-limit or checking failure, a structurally valid repair is saved with an incomplete-review warning and can be checked again later. Both operations use Groq quota. They do not seed the production judgment cache or publish the board. AI review uses the same provider in an independent request, not an independent factual source, and can still make mistakes. Consecutive-day repeat checks and the owner's final approval remain required. Manual edits clear the displayed review status; saved changes invalidate stored review results unless the category content is unchanged.

## Daily releases paused

`PINNED_PUZZLE_ID=demo-board-001` keeps the original board active, including after midnight. Its existing board ID and player progress are preserved. Scheduled boards and drafts stay saved but do not replace it. Scheduled AI generation also stays disabled while a board is pinned. Manual draft editing and AI tools remain available. To resume daily releases later, remove PINNED_PUZZLE_ID and prepare the approved daily queue; enable GENERATION_MODE separately if automatic AI drafts are desired. Existing daily-mode regression tests explicitly clear the pin.
