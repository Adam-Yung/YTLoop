# test/fixture/guard.spec.js

Covers `src/guard.js` and `src/browser.js`:

- Normal page: no wall, `waitForHuman` returns false.
- Bot-check page is detected.
- Wall cleared by a "human" mid-wait: returns true.
- Wall never cleared: `WallError`, and no extra navigation happens (nothing is clicked or reloaded).
- `launch` gives `navigator.webdriver === false` and creates the profile directory.
