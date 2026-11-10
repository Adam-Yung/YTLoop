# 0001 Playwright with a real browser

Context: the Tampermonkey script calls `HTMLElement.click()`, which produces untrusted events. Playwright `locator.click()` checks that the element is visible and clickable and sends real browser-level mouse input.

Decision: one Node.js app using `@playwright/test`'s `chromium` with a persistent profile. Originally installed Chrome; decision 0007 made Playwright's own Chromium the default and decision 0009 uses Chrome again on the test VM.

Consequences: the same JS runs on macOS, Windows and Ubuntu. With `BROWSER_CHANNEL=chrome`, Chrome must be installed; Ubuntu then needs a display and an x86-64 Chrome.
