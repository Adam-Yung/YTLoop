# src/sleep.js

`sleep(ms, signal)` resolves after `ms` or as soon as the `AbortSignal` aborts. All waits in the app use it, with the process-wide signal that Ctrl+C aborts, so shutdown is immediate.
