# test/fixture/guard.spec.js

Covers `src/guard.js` and `src/browser.js` in a real browser:

- Normal page: no wall, `waitForHuman` returns false.
- Bot-check page is detected.
- Wall never cleared: `WallError`, and no extra navigation happens (nothing is clicked or reloaded).
- `launch` gives `navigator.webdriver === false` and creates the profile directory. The profile is a scratch dir from `test/helpers/tmp.js` (under `<repo>/tmp/`) and is removed afterwards.

Waiting and clearing logic is covered without a browser in `test/unit/guard.spec.js`.
