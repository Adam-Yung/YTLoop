# test/fixtures

Static pieces used by `test/helpers/youtube-site.js`. They are not code, so each file has no mirror doc.

- `watch.html`: watch page template. States are visually distinct for screen checks: dark `#222` player, red `#c00` while `ad-showing`, yellow Skip button, green progress bar along the bottom of the player, blue pressed Like button, the video title as an `h1`. Placeholders use `{{KEY}}`. Contains `#movie_player`, the play, autoplay and skip buttons, owner link and the `#related` sidebar.
- `watch-client.js` also handles the Like button (`aria-pressed` toggle, `like-click` log entries): runs inside the page. Fake timeline (content, ads, pods), fake `video` element, event logging in `window.__yt.log`.
- `channel.html`: channel Videos page with `ytd-rich-grid-media` items.
- `bot-wall.html`: "Sign in to confirm you're not a bot" page.

The markup is a best guess at YouTube's DOM. Real YouTube can differ; `npm run probe` checks the real selectors.
