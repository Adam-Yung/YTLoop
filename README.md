# YTLoop

Plays a YouTube playlist in real Chrome using Playwright. For each playlist entry (last to first) it follows 10 to 20 videos from the same channel, clicking Skip Ad buttons like a person would and never touching the ad itself.

Runs the same on macOS, Windows and Ubuntu. See `docs/platforms.md` for setup.

## Quick start

```bash
npm install
cp .env.example .env   # set PLAYLIST_URL
npm run probe          # optional: checks YouTube selectors still match
npm start
```

Ctrl+C stops it. The Chrome profile in `.profile/` keeps your login between runs; sign in once in the window it opens.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | run the loop |
| `npm test` | unit and fixture tests (system Chrome, headless) |
| `npm run test:live` | one real-YouTube smoke run (opt-in) |
| `npm run probe` | report which real-YouTube selectors match |
| `npm run lint` | style and docs-mirror checks (also run by the pre-commit hook) |

## Docs

Start at `docs/README.md`. Contributors and agents must read `AGENTS.md`: every code file has a mirrored doc under `docs/` that has to be updated with the code.

## Legacy

`Unix/` and `Windows/` hold the previous shell and AutoHotkey loops and are being retired.
