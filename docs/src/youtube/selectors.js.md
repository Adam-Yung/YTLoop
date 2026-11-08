# src/youtube/selectors.js

The only file allowed to contain YouTube selectors or wall-detection patterns (`docs/guidelines.md`).

- `player`, `video`, `playButton`, `autonavToggle`: the player and its controls.
- `skip`: a comma list of Skip Ad button selectors, all inside `#movie_player` so unrelated "Skip" buttons are never matched.
- `ownerLink`: the channel link under the video title.
- `related`: sidebar cards, with old (`ytd-compact-video-renderer`) and new (`yt-lockup-view-model`) layouts, plus the title link, channel link and channel text selectors.
- `channelGrid`: card and link selectors for a channel's Videos page.
- `wall`: `text` regex for bot-check pages, `selectors` for CAPTCHA and consent elements, `hosts` for consent or sign-in redirects.

The new-layout selectors are best guesses until verified with `npm run probe`.
