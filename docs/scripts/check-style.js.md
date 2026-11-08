# scripts/check-style.js

Enforces the comment rule from `docs/guidelines.md` on every covered `.js` file.

- Anything before the first code line is the header and is allowed to be multi-line.
- After the header, `/* */` comments and two or more consecutive `//` lines are errors.
- Single `//` lines are allowed but should be rare.

Run with `npm run lint`. The pre-commit hook runs it too. Exit code is 1 when any problem is found.
