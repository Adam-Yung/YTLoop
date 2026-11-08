# src/human.js

- `between(min, max, rng)`: random float in range; `rng` injectable.
- `humanClick(page, locator, cfg, signal, rng)`: scroll into view, move the mouse in 8 to 15 steps to a random point in the middle 40% of the element, pause `cfg.clickPauseMs`, then `locator.click` at that point.

`locator.click` keeps Playwright's actionability checks, so hidden, disabled or covered elements throw instead of being clicked. This is what keeps "never click what a human could not click" true (decision 0004).
