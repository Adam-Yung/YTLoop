# playwright.config.js

Defines three test projects:

| Project | Dir | Browser | Run with |
| --- | --- | --- | --- |
| `unit` | `test/unit` | none | `npm test` |
| `fixture` | `test/fixture` | system Chrome, headless | `npm test` |
| `live` | `test/live` | system Chrome, headed, real YouTube | `npm run test:live` (sets `LIVE=1`) |

Set `HEADED=1` to watch fixture tests in a visible Chrome. Fixture tests run in parallel; the live project runs serially with a 5 minute timeout.

## Stability settings (important on this machine)

- Fixture and live projects launch Chrome with `--disable-gpu --disable-software-rasterizer`. Without them the headless system Chrome here loses its GPU process and the whole browser exits every few tests (even a trivial test that only opens a blank page), which shows up as "Target page, context or browser has been closed".
- `retries: 2`: some browser exits still happen under load, and a retried test gets a fresh browser. A real failure still fails all three attempts. If a test only passes on retry, investigate; the list reporter marks it flaky.
