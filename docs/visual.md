# Visual verification

Real-screen checks, modeled on prisma-encryptor's `automation/`: scenarios with named checks, a results TSV, evidence files, and an agent skill (`.cursor/skills/visual-verify/SKILL.md`).

```
npm run verify [scenario ...]        fixture scenarios: fake YouTube, real headed browser, real screen
npm run verify:live [scenario ...]   scenarios against real YouTube (needs network and a signed-in profile)
npm run probe                        = verify:live probe: are the selectors in selectors.js still right?
```

## What "visual" means here

Two views of every check:
1. The page view: Playwright's own screenshot and DOM state.
2. The real screen: macOS `screencapture` of display 1 (and `screencapture -v` video), so what the owner would see. The page's element boxes are mapped to screen pixels, and the pixel colors there are asserted (red ad player, yellow Skip button, blue Like button, dark player).

A blank window passes the page view but fails the screen view. That is the bug that started this (decision 0007).

## Results

- `visual/results/results.tsv`: `check id`, `pass|fail|skip`, name. Git-ignored.
- `visual/results/<timestamp>/`: `*.page.png`, `*.screen.png`, `chain.mov`, extracted `frames/`, `logs/errors.log`. Look at them when a check fails.

## Scenarios

| Scenario | Kind | Covers |
| --- | --- | --- |
| `launch` | fixture | browser opens and shows the page (not blank), seen on the real screen |
| `ads` | fixture | red ad player, delayed Skip button, trusted clicks through a pod, dark player after, no tampering |
| `like` | fixture | unliked gets liked (blue), no second click, already liked untouched |
| `chain` | fixture | 3-video same-channel chain with a screen recording, frames checked for non-blank, changing content |
| `probe` | live | real YouTube page loads, selectors match, player is visible, wall detection |
| `watch` | live, manual | not run by default: `npm run verify:live watch`, plays a real video for a short time and checks the screen and the ad and like paths when they occur |

## Keeping the Mac awake

The owner's screensaver starts after 15 minutes and cannot be changed. `visual/lib/awake.js` runs `caffeinate` and nudges the mouse by 1 px every 45 s (verified to reset the HID idle time). Do not move the mouse or type during a run; the suite drives the visible browser.

## Platform notes

Screen capture, recording and the mouse nudge are macOS only. On Windows and Ubuntu the runner prints a note and the screen checks are skipped; the page-view checks still run. Add `gnome-screenshot`/`ffmpeg` or PowerShell equivalents in `visual/lib/capture.js` when those platforms can be tested.

## Needs

- macOS Screen Recording permission for the app that runs the shell (already granted here).
- `ffmpeg` on PATH for frame extraction (`brew install ffmpeg`).
- Playwright Chromium (`npm run setup`).
- No Automation permission: raising the window uses `open -a`, not System Events.
