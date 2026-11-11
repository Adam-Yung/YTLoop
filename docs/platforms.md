# Platforms

The app is plain Node and is meant to run the same on macOS, Windows and Ubuntu, directly on the user's machine (`npm start`). Development and testing run on the test VM (macOS or Windows, `docs/vm.md`, decisions 0008 and 0010). Only macOS is tested; Windows and Ubuntu are untested.

## Requirements on the machine that runs the app

- Node.js 22 or newer
- `yt-dlp` on PATH
- `npm install`
- Google Chrome (`BROWSER_CHANNEL=chrome`), or `npm run setup` to download Playwright's Chromium (about 150 MB) and leave `BROWSER_CHANNEL` unset. Admin-managed Chrome cannot be remote-controlled (decisions 0007 and 0009).
- `.env` copied from `.env.example` with `PLAYLIST_URL` set
- A desktop session that stays awake and unlocked: the browser is headed and uses the real mouse

On the test VM all of this except Chrome is installed by `npm run vm:setup` under `~/tools` (Node tarball and yt-dlp, no Homebrew, no sudo, no ffmpeg).

## Signing in

Likes need a signed-in profile. `npm run login` (`scripts/login.js`) opens plain Chrome on the app's profile, `.profile/chrome`, at the Google sign-in page; sign in and quit it. On macOS it does this itself. On Windows and Ubuntu it prints the Chrome command to run by hand (untested). The fake-keychain flags it passes are only needed on macOS and are harmless elsewhere.

## macOS

`brew install node yt-dlp`, install Chrome, `npm install`. The real-screen checks in `visual/` (development only) use `screencapture`, `sips` and JXA (`osascript -l JavaScript`) for the mouse nudge and for raising/identifying the frontmost window, all built in. The shell's app needs Screen Recording permission (on the VM it is granted to `sshd-keygen-wrapper`). No Accessibility or Automation permission is needed.

## Windows (unverified)

`winget install OpenJS.NodeJS.LTS yt-dlp.yt-dlp`, install Chrome, `npm install`, run from PowerShell with `npm start`. The screen checks in `visual/` run on a Windows test VM (`visual/lib/win.js`, decision 0010); they are not meant for a developer's own Windows machine.

## Ubuntu (unverified)

Install Node from NodeSource or nvm and `yt-dlp` with `pipx install yt-dlp` (apt's version is stale). If Chromium fails to start, run `sudo npx playwright install-deps chromium`. A desktop session is required because the browser runs headed. For a server use `xvfb-run npm start`.

## Manual verification checklist (Windows and Ubuntu)

1. `npm install`, set `.env`, and for Chromium `npm run setup`. To run the unit and fixture tests on a throwaway machine, set `YTLOOP_VM=1` (see `scripts/require-vm.js`).
2. `npm run login` (or sign in by hand) if you want likes.
3. `npm start` opens the browser, plays the last playlist entry and logs an ad skip or the next video.
4. Ctrl+C closes the browser cleanly.
5. Restart: the profile keeps the YouTube login.
6. With a signed-in profile an unliked video gets liked once, and a liked one is left alone.
