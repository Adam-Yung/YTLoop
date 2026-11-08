# 0001 Playwright with system Chrome

Context: the Tampermonkey script calls `HTMLElement.click()`, which produces untrusted events. Playwright `locator.click()` checks that the element is visible and clickable and sends real browser-level mouse input.

Decision: one Node.js app using `@playwright/test`'s `chromium` with `channel: 'chrome'` and a persistent profile. No bundled browser download.

Consequences: Chrome must be installed on every platform. The same JS runs on macOS, Windows and Ubuntu. Ubuntu needs a display and an x86-64 Chrome.
