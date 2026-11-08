# Coding guidelines

## Style

- Minimal and readable. Prefer small functions with one job.
- A multi-line comment is allowed only at the top of a file (purpose in a few lines). Everywhere else, avoid comments and put the explanation in `docs/`.
- Names carry the meaning. No dead code and no commented-out code.
- CommonJS, `'use strict'`, no dependencies beyond `@playwright/test` unless a decision note justifies it.
- Selectors live only in `src/youtube/selectors.js`. Timings and limits live only in `src/config.js`.
- Paths use `node:path` and `node:os`. No shell commands, no platform `if` branches unless unavoidable (document them).

## Docs

- Every code file `X` has `docs/X.md` covering: purpose, inputs and outputs, behavior and edge cases, and links to relevant decisions.
- Update the doc in the same commit as the code. `npm run lint` and the pre-commit hook enforce that a doc exists and is staged with its code.
- Decisions go in `docs/decisions/NNNN-title.md`: context, decision, consequences.

## Testing

- Pure logic: `unit` project. Browser behavior against fake YouTube pages: `fixture` project. Real YouTube: `live` project, opt-in with `LIVE=1`.
- A bug fix starts with a failing test.
- Fixtures cannot detect YouTube DOM changes. `npm run probe` can.

## Behavior rules (never break)

- Never seek, mute, change speed, hide or block ads. Only click a visible, enabled Skip button.
- Never try to solve or bypass bot checks. Pause for a human.
- Prefer clicking links over `page.goto`.
