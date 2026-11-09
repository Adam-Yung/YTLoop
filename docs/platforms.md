# Platforms

The app itself is plain Node and runs the same on macOS, Windows and Ubuntu. This project's own development runs only on the test VM (macOS, `docs/vm.md`, decision 0008); the other platforms are untested.

## Requirements on the machine that runs the app

- Node.js 22 or newer
- `yt-dlp` on PATH
- `npm install`, then `npm run setup` (downloads Playwright's Chromium, about 150 MB)
- `.env` copied from `.env.example` with `PLAYLIST_URL` set
- Optional: Google Chrome stable, only if you set `BROWSER_CHANNEL=chrome` (decision 0007; admin-managed Chrome cannot be remote-controlled)

On the test VM all of this is installed by `npm run vm:setup` under `~/tools` (Node tarball and yt-dlp, no Homebrew, no sudo, no ffmpeg).

## macOS

The real-screen checks in `visual/` use `screencapture`, `sips` and a JXA mouse nudge, all built in. The shell's app needs Screen Recording permission (on the VM it is granted to `sshd-keygen-wrapper`).

## Windows (unverified)

`winget install OpenJS.NodeJS.LTS yt-dlp.yt-dlp`. Run from PowerShell with `npm start`. Screen checks in `visual/` are skipped (macOS only).

## Ubuntu (unverified)

Install Node from NodeSource or nvm and `yt-dlp` with `pipx install yt-dlp` (apt's version is stale). If Chromium fails to start, run `sudo npx playwright install-deps chromium`. A desktop session is required because the browser runs headed. For a server use `xvfb-run npm start`.

## Manual verification checklist (Windows and Ubuntu)

1. `npm install && npm run setup`, then run the unit and fixture tests (set `YTLOOP_VM=1` on a throwaway machine only; see `scripts/require-vm.js`).
2. `npm run probe` reports every selector as matched (screen checks may be skipped).
3. `npm start` opens the browser, plays the last playlist entry and logs an ad skip or the next video.
4. Ctrl+C closes the browser cleanly.
5. Restart: the profile keeps the YouTube login.
