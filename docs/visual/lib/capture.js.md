# visual/lib/capture.js

Real-screen evidence, macOS only (`supported` is false elsewhere and every function degrades to a no-op or `false`).

- `screenshot(file)`: `screencapture -x -D 1`.
- `startRecording(file)` returns `{ stop() }`: `screencapture -v` video of display 1; `stop` sends SIGINT and waits up to 8 s.
- `extractFrames(video, dir, fps)`: ffmpeg to PNG frames; `[]` when ffmpeg is missing.
- `windowGeometry(page)`: `window.screenX/Y`, outer/inner size, `screen` size.
- `elementOnScreen(page, png, selector)`: element box in screen-PNG pixels. Scale is `png.width / screen.width` (2x on Retina); the top browser chrome height is `outerH - innerH`. The result was calibrated against real screenshots.
- `raiseWindow(page, channel)`: `page.bringToFront()` plus `open -a "Google Chrome for Testing"` (or "Google Chrome"). Does not use System Events, which would raise a permission prompt.
- `readPng(file)`.
