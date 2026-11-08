# src/log.js

`createLog(dir)` returns `{ info, error, file }`.

- `info` prints an ISO-timestamped line to stdout.
- `error` prints to stderr and appends to `<dir>/errors.log`. File failures are swallowed so logging never crashes the app.

`logs/` is git-ignored.
