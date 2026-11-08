# src/config.js

Single place for settings. `load(env, overrides)` returns a config object; `loadEnvFile()` loads `.env` from the repo root with `process.loadEnvFile` (returns false when absent).

## .env keys

| Key | Default | Meaning |
| --- | --- | --- |
| `PLAYLIST_URL` | none, required | playlist passed to yt-dlp |
| `CHAIN_MIN`, `CHAIN_MAX` | 10, 20 | videos per playlist entry is a random integer in this range; max is raised to min if lower |
| `PROFILE_DIR` | `<repo>/.profile` | dedicated Chrome profile |
| `LOG_DIR` | `<repo>/logs` | holds `errors.log` |

Obsolete: `BROWSER`, `WATCH_DURATION_BASE`, `WATCH_DURATION_VARIANCE` (see decision 0002).

## Timings (`DEFAULTS`)

`pollMs` 500, `endWindowSeconds` 10, `skipCooldownMs` 1100, `clickTimeoutMs` 2000, `clickPauseMs` [300, 900], `navigationTimeoutMs` 25000, `startupTimeoutMs` 60000, `stallTimeoutMs` 120000, `retryDelayMs` 15000, `playlistRetryMs` 60000, `botWaitMs` 600000, `maxVideoFailures` 3, `maxBrowserFailures` 2.

Tests pass `overrides` to shrink these.
