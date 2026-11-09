# scripts/lib.js

Shared helpers for the repo checks.

- `sourceFiles()`: tracked and untracked (non-ignored) files that are covered by the docs mirror rule.
- `stagedFiles()`: staged added, modified or renamed files.
- `covered(file)`: true for `src/`, `scripts/`, `test/`, `visual/`, `vm/`, `.githooks/` and `playwright.config.js`. `test/fixtures/` and `visual/results/` are excluded and documented in `docs/test/fixtures/README.md`.
- `bodyOf(text, kind)`: skips the header and returns the remaining lines plus how many lines were skipped. `kind` is `js` (default: shebang, `'use strict'`, `//` and `/* */` comments, blank lines) or `sh` (shebang, `#` comments, blank lines).

Edit the covered roots here when a new top-level code directory is added.
