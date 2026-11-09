# visual/lib/capture.js

Real-screen evidence, macOS only (`supported` is false elsewhere and every function degrades to a no-op or `false`). Runs on the test VM (decision 0008).

- `screenshot(file)`: `screencapture -x -D 1`.
- `startRecording(file)` returns `{ stop() }`: `screencapture -v` video of display 1; `stop` sends SIGINT and waits up to 8 s.
- `startSampler(dir, everyMs)` returns `{ stop() }` that resolves to the list of sample files: a screenshot every `everyMs`, downscaled to 640 px wide with the built-in `sips`. Replaces ffmpeg frame extraction (no ffmpeg on the VM). A missed sample is skipped; a slow screenshot never overlaps the next.
- `windowGeometry(page)`: `window.screenX/Y`, outer/inner size, `screen` size.
- `elementOnScreen(page, png, selector)`: element box in screen-PNG pixels. Scale is `png.width / screen.width`; the top browser chrome height is `outerH - innerH`. Calibrated against real screenshots on the Mac (2x); the VM scale differs and is re-verified by `launch.4`.
- `raiseWindow(page, channel)`: `page.bringToFront()` plus `open -a "Google Chrome for Testing"` (or "Google Chrome"). Does not use System Events, which would raise a permission prompt.
- `readPng(file)`.
