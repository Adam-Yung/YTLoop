# visual/scenarios/watch.js

Live and `manual` (run by name: `npm run verify:live watch`; minutes long, budget 8 minutes). Runs the app's real `runChain` (length 2) from the first walk-order playlist video with the real profile while `screencapture -v` records the screen. The chain's log lines are collected and asserted.

| Id | What |
| --- | --- |
| `watch.0` | no screensaver or lock appeared while recording (checked every 15 s; each incident also wakes the screen) |
| `watch.1` | playlist fetched |
| `watch.2` | the first video was watched to the end (or the budget ran out while it was playing) |
| `watch.3` | autoplay turned off by the app (skipped when the profile already had it off) |
| `watch.4` | the app moved to a second video by itself (recommendation click or channel page) |
| `watch.5` | ads skipped by real clicks (skipped when no skippable ad appeared) |
| `watch.6` | the video was liked (skipped when signed out or already liked) |
| `watch.7` | the chain did not end with `wall`, `browser` or `failures` |
| `watch.8` | frames from the recording are non-blank |

Evidence in the run folder: `watch.mov`, `watch-frames/`, `watch-end.*.png`, `logs/errors.log`.
