# test/helpers/ctx.js

- `fastCfg(extra)`: config with short timings (50 ms poll, 100 ms skip cooldown, 5 to 15 ms click pause).
- `makeCtx(extra)`: `{ cfg, log, signal }` with a silent log, for module calls.
- `until(fn, timeoutMs, stepMs)`: polls an async predicate; returns whether it became true.
- `quiet`: a log whose methods do nothing.
