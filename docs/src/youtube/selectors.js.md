# src/youtube/selectors.js

The only file allowed to contain YouTube selectors or wall-detection patterns (`docs/guidelines.md`).

- `player`, `video`, `playButton`, `autonavToggle`: the player and its controls.
- `skip`: a comma list of Skip Ad button selectors, all inside `#movie_player` so unrelated "Skip" buttons are never matched.
- `like`: the Like button inside the watch metadata; only matches buttons that carry `aria-pressed`. `signedOut`: masthead sign-in link, meaning likes are skipped.
- `ownerLink`: the channel link under the video title.
- `related`: sidebar cards, with old (`ytd-compact-video-renderer`) and new (`yt-lockup-view-model`) layouts, plus the title link, channel link and channel text selectors.
- `channelGrid`: card and link selectors for a channel's Videos page.
- `wall`: `text` regex for bot-check pages, `selectors` for CAPTCHA and consent elements, `hosts` for consent or sign-in redirects.

The new layout was verified against the real page on 2026-11-08: cards use `ytLockupViewModelContentImage` and `ytLockupMetadataViewModelTitle` links, have no channel link, and show the channel name in the first `ytContentMetadataViewModelMetadataText` span, so same-channel matching relies on names there. (An earlier guess with `-wiz__` class names matched nothing, which made every video fall back to the channel page.)
