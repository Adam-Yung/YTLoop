# test/fixture/site.spec.js

Tests the fake YouTube itself so later failures can be blamed on app code:

- An ad pod shows `.ytp-skip-ad-button` after `skipAfter`, and a Playwright click on it is recorded with `isTrusted: true` and ends the ad.
- Writing `playbackRate` is recorded as tampering, and content reaches its end.
