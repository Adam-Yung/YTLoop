# 0006 Like policy

Decision: after the content has played a few seconds (never during an ad), like the video once if the Like button reports `aria-pressed="false"`.

Safety rules:
- Only an explicit `"false"` triggers a click. `"true"`, a missing attribute, a missing button or any error means no click, so a video can never be unliked by accident.
- A masthead sign-in link means signed out: skip, since the click would only open a sign-in dialog.
- Real mouse input through `humanClick`, once per video, with a try per video only (no retries).

Consequences: the Like selectors in `selectors.js` are unverified against live YouTube until `npm run probe` reports `likeButton` as ok. Liking every video is itself a recognizable pattern, which is a trade-off the operator accepts (see decision 0004).
