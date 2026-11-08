# scripts/lib.js

Shared helpers for the repo checks.

- `sourceFiles()`: tracked and untracked (non-ignored) files that are covered by the docs mirror rule.
- `stagedFiles()`: staged added, modified or renamed files.
- `covered(file)`: true for `src/`, `scripts/`, `test/`, `.githooks/` and `playwright.config.js`. `test/fixtures/` is excluded and documented in `docs/test/fixtures/README.md`.
- `bodyOf(text)`: skips the header (shebang, `'use strict'`, leading comments and blank lines) and returns the remaining lines plus how many lines were skipped.

Edit the covered roots here when a new top-level code directory is added.
