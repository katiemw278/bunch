# Bunch — private playtest

This is the hosted preview of the uploaded Bunch game. Edit this checkout for future preview changes; it preserves the cleaned-up board, category-count celebrations, and compact share results. Results open in a centered native dialog after the final match animation, with keyboard dismissal and a reopen button. The visual identity uses a light yellow background, ink outlines, vibrant grape accents, and an original bunch character. The normal-width wordmark uses a local waist distortion to suggest an invisible string cinching the letters.

The React interface lives in `app`, `components`, and `hooks`. API routes are in `app/api`; server game rules and puzzle data are in `lib/server`. The hosted backend uses D1 for judgment caching and ruling reports. Game progress remains in browser localStorage, as in the original app.

`GROQ_API_KEY` is configured as a server-side Site secret; no API credentials belong in source or the client bundle. The original three dated puzzles and first-puzzle fallback remain in place.

Build with `node /root/.codex/plugins/cache/openai-curated-remote/sites/1.0.0/scripts/build-site.mjs` in this environment, then use the Sites source workflow and private deployment for this checkout's project ID. Do not create a new Site for later edits.

The game now allows unlimited moves. Legacy eight-move losses resume automatically. Scoring is shared between the API and the visible Points per bunch guide in `lib/scoring.js`. The board remains 3×3.

Scores use ten times the original triangular values (10–450). Saved history is recalculated on load so older scores migrate safely and do not multiply again on reload.

The how-to-play guide opens on each site load. Its Ratings & points section and match feedback use the rating names in `lib/scoring.js`. Move celebrations contain no emoji and remain visible until the next submission. Completion results wait until the guide closes.
