# scripts/check-docs.js

Enforces the docs mirror rule: `<path>` is documented in `docs/<path>.md`.

- Default mode: every covered source file must have its mirror doc.
- `--staged` mode (used by `.githooks/pre-commit`): every staged covered file must also have its mirror doc staged. This forces the author to open the doc and confirm it is not stale.

The check cannot tell whether doc content is correct. Reviewing the doc is the author's job (see `AGENTS.md`).
