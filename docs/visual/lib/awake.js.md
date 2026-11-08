# visual/lib/awake.js

`startAwake(intervalMs = 45000)` returns `{ stop() }`. On macOS it runs `caffeinate -d -i -u` and moves the mouse 1 px and back every 45 s through `CGEventPost` (JXA via `osascript`). Checked: `HIDIdleTime` goes from seconds to 0.1 s after a nudge. The owner's 15 minute screensaver cannot be changed, so any run that may take a while uses this. No-op on other platforms.
