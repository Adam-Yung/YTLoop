# playwright.config.js

Defines three test projects:

| Project | Dir | Browser | Run with |
| --- | --- | --- | --- |
| `unit` | `test/unit` | none | `npm test` |
| `fixture` | `test/fixture` | system Chrome, headless | `npm test` |
| `live` | `test/live` | system Chrome, headed, real YouTube | `npm run test:live` (sets `LIVE=1`) |

Set `HEADED=1` to watch fixture tests in a visible Chrome. Fixture tests run in parallel; the live project runs serially with a 5 minute timeout.
