# visual/scenarios/watch.js

Live and `manual` (run on the VM with `npm run vm:watch`; minutes long, budget 8 minutes). Runs the app's real `runChain` (length 2) from the first walk-order playlist video with the real profile while `screencapture -v` records the screen and a sampler takes a downscaled screenshot every 20 s. The chain's log lines are collected and asserted.

| Id | What |
| --- | --- |
| `watch.0` | no screensaver or lock appeared while recording (checked every 15 s; each incident also wakes the screen) |
| `watch.1` | playlist fetched |
| `watch.2` | the first video was watched to the end (or the budget ran out while it was playing) |
| `watch.3` | autoplay turned off by the app (skipped when the profile already had it off) |
| `watch.4` | the app moved to a second video by itself (recommendation click or channel page) |
| `watch.5` | ads skipped by real clicks (skipped when no skippable ad appeared) |
| `watch.signin` | the profile is signed in to YouTube (no Sign in link at the end); fails when signed out, run `npm run vm:login` |
| `watch.6` | the video was liked (skipped when already liked) |
| `watch.7` | the chain did not end with `wall`, `browser` or `failures` |
| `watch.9` | at least 5% of the pixels around the logo (`ytd-masthead #logo-icon`, box tripled) on the real screen are YouTube red, so another window (for example the person's own Chrome) is not covering the app |
| `watch.8` | at least 4 samples and 90% of them non-blank |

Evidence in the run folder: `watch.mov`, `watch-samples/`, `watch-end.*.png`, `logs/errors.log`. Look at the samples: a non-blank check alone cannot tell YouTube from a screensaver (that is what `watch.0` and `screen.1` guard).
