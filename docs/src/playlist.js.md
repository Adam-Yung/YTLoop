# src/playlist.js

- `fetchPlaylist(url, runner)`: runs `yt-dlp -i --flat-playlist --no-warnings --print url <url>` and returns video ids in walk order, last playlist entry first (decision 0002). `runner` is injectable for tests.
- `parsePlaylist(stdout)`: parse, dedupe, drop non-video lines, reverse.

Errors thrown (callers log and back off, see `src/main.js`): missing `PLAYLIST_URL`, `yt-dlp` not on PATH, yt-dlp failure (first line of its message), empty or private playlist. yt-dlp has a 60 s timeout.
