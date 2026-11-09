# visual/scenarios/login.js

Live and `manual` (`npm run vm:login`). One-time sign-in of the app's browser profile (`~/ytloop/.profile/chrome` on the VM) so likes work.

1. Skipped unless `BROWSER_CHANNEL=chrome` (the bundled Chromium cannot sign in to Google reliably).
2. Opens plain Google Chrome with `open -W -n -a "Google Chrome" --args --user-data-dir=<profile>` and the YouTube sign-in page. No automation is attached, which is why Google accepts the sign-in (it often rejects automated browsers). The scenario waits until you quit that Chrome (Cmd+Q), up to 15 minutes.
3. Opens the same profile with the automated browser and checks `login.1`: no signed-out masthead link on youtube.com. The cookies set in step 2 are reused.

Why a separate profile: Chrome 136 and newer ignore remote debugging on its default profile, so Playwright cannot drive the profile you normally use; it needs its own `--user-data-dir`. Sign in here once; the profile keeps it between runs. Evidence: `login.page.png`, `login.screen.png`.
