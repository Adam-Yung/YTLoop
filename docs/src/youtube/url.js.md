# src/youtube/url.js

- `videoId(url)`: 11-character id from `youtube.com/watch`, `m.`/`music.` hosts, `youtu.be` or `/live/`; otherwise `null`.
- `watchUrl(id)`: clean `https://www.youtube.com/watch?v=ID`. No `list` or `t`, so playlist autoplay and start offsets never apply (decision 0005).
- `channelVideosUrl({ url, id })`: the channel's `/videos` page for `@handle`, `/channel/`, `/c/` and `/user/` URLs on YouTube hosts, else `null`. Tab suffixes are stripped first.
- `CHANNEL_PATH`, `ID`: regexes reused by other modules.
