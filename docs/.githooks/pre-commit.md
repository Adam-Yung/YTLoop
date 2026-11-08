# .githooks/pre-commit

Runs `scripts/check-style.js` and `scripts/check-docs.js --staged`. A failing check aborts the commit.

Enabled by `npm install` through the `prepare` script, which sets `core.hooksPath` to `.githooks`. If hooks seem inactive, run `git config core.hooksPath .githooks`.
