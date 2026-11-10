# scripts/login.js

`npm run login`. One-time YouTube sign-in for the app's browser profile, so the app can like videos. Runs on the machine that runs the app (on the test VM the same step is the `login` scenario, `npm run vm:login`).

- Reads `.env`. Only needed for `BROWSER_CHANNEL=chrome`; otherwise it says so and exits. The profile is `PROFILE_DIR` (default `<repo>/.profile/chrome`).
- macOS: opens plain Google Chrome on that profile (`open -W -n -a "Google Chrome" --args ...`) at the Google sign-in page and waits until you quit it with Cmd+Q, up to 15 minutes. No automation is attached, which is why Google accepts the sign-in.
- Other platforms (untested): prints the Chrome command to run by hand.
- `chromeArgs(profileDir)` adds `--use-mock-keychain --password-store=basic`. Playwright always starts Chrome with those flags, so cookies that plain Chrome encrypted with the real macOS keychain could not be read by the app and the session was silently lost (decision 0009).

Why a separate profile: Chrome 136 and newer ignore remote debugging on its default profile, so the app cannot drive the Chrome you normally use. Quit the login Chrome before starting the app; a Chrome still open on the profile makes the app's launch fail with "profile is already in use".

Exports `chromeArgs`, `openPlainChrome`, `LOGIN_URL`, `WAIT_MS` for `visual/scenarios/login.js`.
