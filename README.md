# YTLoop

Plays a YouTube playlist in a real browser using Playwright. For each playlist entry (last to first) it follows 10 to 20 videos from the same channel, clicking Skip Ad buttons like a person would and never touching the ad itself. Videos that are not liked yet get liked once.

Runs the same on macOS, Windows and Ubuntu. See `docs/platforms.md` for setup. The default browser is Playwright's Chromium; admin-managed Google Chrome cannot be remote-controlled (`docs/decisions/0007-bundled-chromium.md`).

## Quick start

```bash
npm install
npm run setup          # downloads Playwright's Chromium
cp .env.example .env   # set PLAYLIST_URL
npm run probe          # checks the real YouTube page against the selectors
npm start
```

Ctrl+C stops it. The profile in `.profile/chromium` keeps your login between runs; sign in once in the window it opens (liking needs a signed-in profile).

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | run the loop |
| `npm test` | unit and fixture tests (Playwright Chromium, headless) |
| `npm run verify` | real-screen checks on the fake YouTube: launch, ads, like, chain (macOS) |
| `npm run probe` | real YouTube: browser opens, page shows, every selector matches, playback advances |
| `npm run verify:live watch` | slow end-to-end run on real YouTube with a screen recording |
| `npm run lint` | style and docs-mirror checks (also run by the pre-commit hook) |

## Docs

Start at `docs/README.md` and `docs/visual.md`. Contributors and agents must read `AGENTS.md`: every code file has a mirrored doc under `docs/` that has to be updated with the code.
