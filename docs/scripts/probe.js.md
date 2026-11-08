# scripts/probe.js

`npm run probe [videoUrl]` opens a real YouTube watch page in the dedicated Chrome profile and prints whether each selector in `selectors.js` matched (player, video, play button, autoplay toggle, owner link, sidebar cards and links). Exit code 1 if any is missing.

Without an argument it uses the first walk-order id of `PLAYLIST_URL`. If a bot check or consent wall shows up it waits for you (up to `botWaitMs`). It waits 8 s for the page to settle.

The Skip Ad selectors cannot be probed because the button only exists during a skippable ad. If ads stop being skipped, inspect the button in DevTools and update `selectors.skip`.

Run this after any YouTube UI change and before trusting a long unattended run. Fixture tests cannot detect real DOM drift.
