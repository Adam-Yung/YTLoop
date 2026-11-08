# visual/lib/awake.js

Keeps the Mac awake and the screen visible. The owner's screensaver starts after 15 minutes and cannot be changed.

- `startAwake(intervalMs = 45000)` returns `{ stop() }`: `caffeinate -d -i -u` plus a 1 px mouse nudge and back every 45 s through `CGEventPost` (JXA via `osascript`). Checked: `HIDIdleTime` goes from seconds to 0.1 s after a nudge. No-op on other platforms.
- `screenState()` returns `{ saver, locked }`: `saver` is true when `ScreenSaverEngine` is running; `locked` reads `CGSSessionScreenIsLocked` from the IO registry.
- `wakeScreen()`: declares user activity (`caffeinate -u`), then up to 5 times: if the screensaver is running, `killall ScreenSaverEngine` and nudge the mouse. Returns the final state. It never tries to unlock a locked screen.
- `isAwake(state)`: no saver and not locked.

Why it exists: a live run recorded a 5 minute video of the macOS screensaver (a lake photo) instead of YouTube, and every "non-blank" check passed because the screensaver is a colorful image. `visual/run.js` now wakes the screen first and checks `screen.1`, and after each scenario checks `<scenario>.screen`.
