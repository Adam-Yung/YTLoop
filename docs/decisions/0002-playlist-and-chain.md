# 0002 Playlist walk and chains

Decision:
- Fetch the playlist with `yt-dlp --flat-playlist` (as the legacy script did) and walk it from the last entry to the first.
- For each entry, follow a random `CHAIN_MIN` to `CHAIN_MAX` videos (default 10 to 20), preferring the same channel.
- A chain ends early on catastrophic failure: 3 consecutive videos failed, the browser died twice in a row, or a bot wall was not cleared by a human in time.
- Then move to the next entry. When all entries are done, refetch the playlist.
- The playlist is the safety net: playlist errors are logged to `logs/errors.log`, backed off and retried, never fatal.

Consequences: `WATCH_DURATION_*` and `BROWSER` env keys are obsolete.
