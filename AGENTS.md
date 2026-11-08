# Agent instructions

Applies to every agent and contributor.

## Docs must stay in sync with code

- Documentation lives in `docs/` and mirrors the code path: `src/watch.js` is documented in `docs/src/watch.js.md`, `scripts/probe.js` in `docs/scripts/probe.js.md`.
- Before editing any code file, read its mirrored doc.
- After editing, update the doc in the same commit: fix stale statements and add anything new (behavior, config, edge cases, decisions).
- New code file means new doc file. Deleted code file means deleted doc file.
- Design decisions go in `docs/decisions/` as short numbered notes.
- `npm run lint` and the pre-commit hook check that mirror docs exist and are staged with their code.

## Style

See `docs/guidelines.md`. In short: minimal and readable, a multi-line comment only at the top of a file, all other explanation goes in `docs/`.

## Workflow

- Run `npm run lint` and `npm test` before every commit.
- One logical change per commit.
