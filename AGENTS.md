# Agent instructions

Applies to every agent and contributor.

## Development runs only on the VM

The product is a normal app that runs on a user's own Mac, Windows or Ubuntu machine (`npm start`). Developing and testing it is different: the tests and checks drive real browsers, the real mouse and the real screen, so they run only on the test VM (`VM_SSH` in `.env`), never on the developer Mac. Use `npm run vm:setup | vm:test | vm:verify | vm:login | vm:probe | vm:watch | vm:start` (see `docs/vm.md`, decision 0008). The plain `npm test`, `verify`, `probe` scripts refuse to run without `YTLOOP_VM=1`; never set that by hand on the Mac. The Mac is for editing, git and `npm run lint` (read-only checks). Do not install browsers, Playwright or project dependencies on the Mac to develop or test.

## Docs must stay in sync with code

- Documentation lives in `docs/` and mirrors the code path: `src/watch.js` is documented in `docs/src/watch.js.md`, `scripts/check-docs.js` in `docs/scripts/check-docs.js.md`.
- Before editing any code file, read its mirrored doc.
- After editing, update the doc in the same commit: fix stale statements and add anything new (behavior, config, edge cases, decisions).
- New code file means new doc file. Deleted code file means deleted doc file.
- Design decisions go in `docs/decisions/` as short numbered notes.
- `npm run lint` and the pre-commit hook check that mirror docs exist and are staged with their code.

## Scratch files

Never write to `/tmp` or the system temp dir (it triggers allowlist prompts for the owner). Use `<repo>/tmp/` (git-ignored; `test/helpers/tmp.js` has `tmpDir`/`removeDir`). Delete what you create there when you are done. Fetched VM evidence lands in `tmp/vm-results`. Delete files with the Delete tool, not `rm` in a chained command.

## Visual verification

Anything that changes what the browser does must also pass `npm run vm:verify` (real screen checks). `npm run vm:probe` checks the real YouTube DOM. See `docs/visual.md` and the `visual-verify` skill.

## Style

See `docs/guidelines.md`. In short: minimal and readable, a multi-line comment only at the top of a file, all other explanation goes in `docs/`.

## Workflow

- Run `npm run lint` on the Mac and `npm run vm:test` before every commit.
- One logical change per commit.
