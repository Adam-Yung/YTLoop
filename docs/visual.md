# Visual verification

Real-screen checks, modeled on prisma-encryptor's `automation/`: scenarios with named checks, a results TSV, evidence files, and an agent skill (`.cursor/skills/visual-verify/SKILL.md`). They run only on the test VM (decision 0008).

```
npm run vm:verify                    fixture scenarios: fake YouTube, real headed browser, real screen (on the VM)
npm run vm:probe                     real YouTube: browser, page, selectors, playback (on the VM)
npm run vm:watch                     8 minute end-to-end run on real YouTube with a recording (on the VM)
npm run vm:fetch                     copy the evidence to tmp/vm-results on the Mac
```

On the VM itself these are `npm run verify`, `npm run verify:live [scenario]` and `npm run probe`; they refuse to start without `YTLOOP_VM=1`.

## What "visual" means here

Two views of every check:
1. The page view: Playwright's own screenshot and DOM state.
2. The real screen: macOS `screencapture` of display 1 (and `screencapture -v` video, plus downscaled periodic samples), so what a person at the VM would see. The page's element boxes are mapped to screen pixels, and the pixel colors there are asserted (red ad player, yellow Skip button, blue Like button, dark player).

A blank window passes the page view but fails the screen view. That is the bug that started this (decision 0007).

## Results

- `visual/results/results.tsv` (on the VM, copied by `vm:fetch`): `check id`, `pass|fail|skip`, name.
- `visual/results/<timestamp>/`: `*.page.png`, `*.screen.png`, `chain.mov`, `chain-samples/`, `watch-samples/`, `logs/errors.log`. Look at them when a check fails.

## Scenarios

| Scenario | Kind | Covers |
| --- | --- | --- |
| `launch` | fixture | browser opens and shows the page (not blank), seen on the real screen |
| `ads` | fixture | red ad player, delayed Skip button, trusted clicks through a pod, dark player after, no tampering |
| `like` | fixture | unliked gets liked (blue), no second click, already liked untouched |
| `chain` | fixture | 3-video same-channel chain with a screen recording, samples checked for non-blank, changing content |
| `probe` | live | real YouTube page loads, selectors match, player is visible, playback advances |
| `watch` | live, manual | not run by default (`npm run vm:watch`): plays real videos for minutes and checks the screen and the ad and like paths when they occur |

## Keeping the screen awake

The VM must never show a screensaver or lock screen over a run. `vm:setup` turns the screensaver off; `visual/lib/awake.js` runs `caffeinate`, nudges the mouse by 1 px every 45 s, wakes the screen before a run and fails the run (`screen.1`) if it is locked. Do not touch the VM display or type during a run. If the VM locks, enable auto-login and turn off the lock in its System Settings once.

## Platform notes

Screen capture, recording and the mouse nudge are macOS only. On Windows and Ubuntu the runner prints a note and the screen checks are skipped; the page-view checks still run. Add `gnome-screenshot` or PowerShell equivalents in `visual/lib/capture.js` when those platforms can be tested.

## Needs (on the VM)

- Screen Recording permission for the process that runs the scripts (already granted to `sshd-keygen-wrapper` on prisma-vm).
- Playwright Chromium, Node and yt-dlp from `npm run vm:setup`.
- No ffmpeg and no Automation permission: samples use `sips`, and raising the window uses `open -a`, not System Events.
