# Development on the test VM

This page is for contributors. The product itself runs on the user's own machine (`README.md`); the VM is only where the code is developed and tested, because the tests drive a real browser, the real mouse and the real screen (decision 0008).

```
npm run vm:setup     once: install Node, yt-dlp, deps and the Playwright browser on the VM
npm run vm:test      unit and fixture tests on the VM
npm run vm:verify    real-screen checks against the fake YouTube
npm run vm:login     once, with Chrome: sign in to YouTube in the profile the app uses (do it at the VM display)
npm run vm:probe     real YouTube: page, selectors, playback
npm run vm:watch     8 minute end-to-end run on real YouTube with a screen recording (background mode)
npm run vm:start     the real app on the VM (background mode; Ctrl+C here does not stop it on the VM)
npm run vm:fetch     copy the latest evidence from the VM to tmp/vm-results
npm run lint         on the Mac: style and docs-mirror checks (read only)
```

Set `VM_SSH` in `.env` to the ssh alias of the VM and `BROWSER_CHANNEL=chrome` to use the VM's Google Chrome (decision 0009). See decision 0008 for why everything runs on the VM, `docs/vm/*.md` for each script.

## What the VM needs (once)

1. **Reachable over ssh without a password.** An alias in the Mac's `~/.ssh/config` with key login. The scripts use `ssh -o BatchMode=yes -o ConnectTimeout=10`, so a dead VM fails in 10 s instead of hanging.
2. **Passwordless sudo for the ssh user.** The browser and `screencapture` only work inside the logged-in desktop session, so scripts run as the console user with `sudo launchctl asuser <uid> sudo -u <user>` (`vm/lib.sh`).
3. **A desktop session that stays unlocked.** Auto-login for the console user, screen lock off. `vm:setup` sets the screensaver to never; the keep-awake helper in `visual/lib/awake.js` covers the rest, and a locked screen fails the run with `screen.1` rather than recording a lock screen.
4. **Screen Recording permission** for the process that runs the scripts (granted to `sshd-keygen-wrapper` on prisma-vm).
5. **Google Chrome installed** and not admin-managed (no "DevTools remote debugging is disallowed" policy). Without Chrome, set `BROWSER_CHANNEL=chromium` and the app uses Playwright's Chromium.

Start a powered-off VM with `/Applications/UTM.app/Contents/MacOS/utmctl start macOS` (if UTM does not list it, open the `.utm` bundle once).

## First run

1. `cp .env.example .env`; set `PLAYLIST_URL`, `VM_SSH`, `BROWSER_CHANNEL=chrome`.
2. `npm run vm:setup`.
3. `npm run vm:test` and `npm run vm:verify`.
4. `npm run vm:login`: Chrome opens on the VM display at the Google sign-in page. Sign in, then quit that Chrome with Cmd+Q. The scenario then opens the same profile with the automated browser and checks that the "Sign in" link is gone (`login.1`).
5. `npm run vm:probe`, then `npm run vm:start`.

Why a separate profile and a special login: see `docs/scripts/login.js.md` and decision 0009. In short, Chrome 136 and newer ignore remote debugging on its default profile, so the app has `~/ytloop/.profile/chrome`, and plain Chrome must be started with the same fake-keychain flags Playwright uses, or the cookies it saves cannot be read.

## Running and stopping

- `vm:watch` and `vm:start` run detached on the VM (`vm/run.sh --bg`). The host polls `~/ytloop/tmp/run.log` and prints new output.
- Ctrl+C on the Mac stops only the local viewer. Stop the app with `ssh <alias> 'pkill -f "node src/main.js"'`; it closes its own Chrome on SIGTERM.
- App errors: `~/ytloop/logs/errors.log` on the VM. Evidence from `vm:*` runs is copied back automatically to `tmp/vm-results` (`vm:fetch` does it alone).

## Rules

- Never run a browser, the tests or trial runs of the app on the Mac while developing. The development npm scripts (`test`, `verify`, `probe`) refuse; use the `vm:*` ones.
- The VM has one screen: do not use it while a run is in progress, and never run two things at once (the lease enforces it, and also protects prisma-encryptor's runs).
- Scratch and fetched evidence go to `<repo>/tmp/`; delete them when finished.
- The VM keeps its own `node_modules`, browser profiles and results between runs; `vm/sync.sh` never deletes them.
