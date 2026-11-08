# Platforms

The same code runs on macOS, Windows and Ubuntu. Only macOS is tested on the development machine.

## Requirements (all platforms)

- Node.js 22 or newer
- Google Chrome stable
- `yt-dlp` on PATH
- `npm install`
- `.env` copied from `.env.example` with `PLAYLIST_URL` set

## macOS

`brew install node yt-dlp` and `brew install --cask google-chrome`.

## Windows (unverified)

`winget install OpenJS.NodeJS.LTS Google.Chrome yt-dlp.yt-dlp`. Run from PowerShell with `npm start`.

## Ubuntu (unverified)

Install Node from NodeSource or nvm, Chrome from Google's `.deb` (x86-64), and `yt-dlp` with `pipx install yt-dlp` (apt's version is stale). A desktop session is required because Chrome runs headed. For a server use `xvfb-run npm start`.

## Manual verification checklist (Windows and Ubuntu)

1. `npm install && npm test` passes.
2. `npm run probe` reports every selector as matched.
3. `npm start` opens Chrome, plays the last playlist entry and logs an ad skip or `no ad`.
4. Ctrl+C closes Chrome cleanly.
5. Restart: the profile keeps the YouTube login.
