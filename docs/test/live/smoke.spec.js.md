# test/live/smoke.spec.js

Opt-in (`npm run test:live`, which sets `LIVE=1`; otherwise skipped). Runs one real chain of length 1 from the first playlist entry using the real `.env`, a visible Chrome and a separate `.profile-live` profile (git-ignored), and expects `{ reason: 'done', watched: 1 }`.

The timeout is 5 minutes, so the video must be shorter than that or you will see a timeout. It can pause for a human if YouTube shows a consent or sign-in wall. Not part of `npm test`.
