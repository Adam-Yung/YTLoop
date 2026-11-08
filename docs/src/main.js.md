# src/main.js

Entry point (`npm start`). Needs `PLAYLIST_URL` in `.env`; without it the process logs a message and exits with code 1.

## `walk({ ctx, browser, session, fetch, chain, rng })`

Loop until the abort signal fires:

1. `fetchPlaylist` (ids in walk order, last entry first). On error: log to `errors.log`, wait `playlistRetryMs`, retry. Never fatal (decision 0002).
2. Clear `session.visited` (a fresh round).
3. For each id: pick a chain length, a random integer from `chainMin` to `chainMax`, and run `runChain`. A result other than `done` or `stopped` is followed by a `retryDelayMs` pause. A thrown error is logged and the walk continues with the next id.
4. If a whole pass watched zero videos, wait `playlistRetryMs` before refetching, so a permanently broken setup never spins.

`fetch`, `chain` and `rng` are injectable for tests.

## `main()`

Loads `.env`, builds the log and a lazy `createBrowser`, installs `SIGINT` and `SIGTERM` handlers that abort the shared `AbortController` (every sleep and loop observes it), then runs `walk`. Chrome is closed in `finally`.
