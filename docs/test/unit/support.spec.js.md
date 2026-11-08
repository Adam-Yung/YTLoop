# test/unit/support.spec.js

Covers `src/sleep.js` (abort), `src/log.js` (errors reach `errors.log`, info does not) and `src/human.js` `between`. `explainLaunchError` messages in `src/browser.js`. The log test writes to a scratch dir under `<repo>/tmp/` and removes it. The click path of `humanClick` is covered in fixture tests.
