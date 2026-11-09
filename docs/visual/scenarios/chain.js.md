# visual/scenarios/chain.js

Runs `runChain` for 3 videos (time scaled 3x) while `screencapture -v` records the screen and a sampler takes a downscaled screenshot every 1.5 s. Checks: chain ended `done` with 3 watched; visits stayed on Channel A with referers (clicks); a recording exists; at least 4 samples, most of them non-blank, with at least 2 distinct looks (the screen changes as videos change). Evidence: `chain.mov` and `chain-samples/`.

Before screen checks it raises the app's own browser window with `capture.raiseWindow(page, cfg)` (by process id, see `docs/visual/lib/capture.js.md`).
