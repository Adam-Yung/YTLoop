# 0009 Google Chrome on the VM, with its own signed-in profile

Context: decision 0007 made Playwright's Chromium the default because the developer Mac's Chrome is admin-managed. The test VM's Chrome is not managed: there is no policy, and remote debugging works (checked 2026-11-08, Chrome 156). The owner asked to use real Chrome on the VM, mainly so the browser, its codecs and its sign-in behave like what a person uses.

Decision:
- On the VM, `.env` sets `BROWSER_CHANNEL=chrome`. The code default stays `chromium` (decision 0007), so a machine without Chrome works without configuration.
- The app uses its own profile, `.profile/chrome` (per channel). Chrome 136 and newer ignore remote debugging on the default profile, so the Chrome the person normally uses cannot be driven, and a separate profile is also what keeps the automation away from their browsing.
- The login is done once with `npm run vm:login`: plain Chrome (no automation attached, so Google accepts the sign-in) opened on the app's profile with `--use-mock-keychain --password-store=basic`. Playwright always starts Chrome with those two flags; cookies that plain Chrome encrypted with the real macOS keychain key cannot be decrypted by it, and Chrome drops them, so the first attempt looked signed in but was signed out. Matching the flags fixes it. The scenario then checks the session in the automated browser (`login.1`), and `vm:watch` fails (`watch.signin`) when the profile is signed out.
- The app's window is raised by process id, not by name (`visual/lib/capture.js`): the person's own Chrome windows have the same application name, and raising by name put the wrong window in front of the app and failed 4 `vm:verify` checks. `watch.9` asserts that the app's browser is the frontmost application at the end of a live run.
- The fixture tests also run on Chrome when `BROWSER_CHANNEL=chrome`. They are slower than on Chromium, so `playwright.config.js` caps the workers at 3 and the fake pages run at a slower clock (see `docs/playwright.config.js.md`).

Consequences:
- Chrome shows an "unsupported command-line flag" bar because of `--disable-blink-features=AutomationControlled`. It is cosmetic. It is also a visible sign of automation; remove the flag if that matters more than hiding `navigator.webdriver`.
- A Chrome update on the VM can change the DOM or the flags it tolerates; `npm run vm:probe` is the check.
- A Chrome that is open on the app's profile (for example a `vm:login` window the person forgot to quit) makes the next launch fail with "profile is already in use". Quit it first.
- Admin-managed Chrome (decision 0007) is still not supported; use Chromium there.
