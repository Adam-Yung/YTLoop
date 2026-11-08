# Platforms

The same code runs on macOS, Windows and Ubuntu. Only macOS is tested on the development machine.

## Requirements (all platforms)

- Node.js 22 or newer
- `yt-dlp` on PATH
- `npm install`, then `npm run setup` (downloads Playwright's Chromium, about 150 MB)
- `.env` copied from `.env.example` with `PLAYLIST_URL` set
- Optional: Google Chrome stable, only if you set `BROWSER_CHANNEL=chrome` (see decision 0007; admin-managed Chrome cannot be remote-controlled)

## macOS

`brew install node yt-dlp ffmpeg`. `ffmpeg` is only needed for frame checks in `npm run verify`. Screen Recording permission for the app that runs your shell is needed for `npm run verify`.

## Windows (unverified)

`winget install OpenJS.NodeJS.LTS yt-dlp.yt-dlp`. Run from PowerShell with `npm start`. Screen checks in `npm run verify` are skipped (macOS only).

## Ubuntu (unverified)

Install Node from NodeSource or nvm and `yt-dlp` with `pipx install yt-dlp` (apt's version is stale). If Chromium fails to start, run `sudo npx playwright install-deps chromium`. A desktop session is required because the browser runs headed. For a server use `xvfb-run npm start`.

## Manual verification checklist (Windows and Ubuntu)

1. `npm install && npm run setup && npm test` passes.
2. `npm run probe` reports every selector as matched (screen checks may be skipped).
3. `npm start` opens the browser, plays the last playlist entry and logs an ad skip or the next video.
4. Ctrl+C closes the browser cleanly.
5. Restart: the profile keeps the YouTube login.
