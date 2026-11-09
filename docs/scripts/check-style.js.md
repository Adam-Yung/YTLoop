# scripts/check-style.js

Enforces the comment rule from `docs/guidelines.md` on every covered `.js` and `.sh` file.

- Anything before the first code line is the header and is allowed to be multi-line. In shell files the shebang and leading `#` lines are the header.
- After the header, `/* */` comments (JS only) and two or more consecutive comment lines (`//` in JS, `#` in shell) are errors.
- Single comment lines are allowed but should be rare.

Run with `npm run lint`. The pre-commit hook runs it too. Exit code is 1 when any problem is found.
