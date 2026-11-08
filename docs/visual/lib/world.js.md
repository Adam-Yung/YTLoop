# visual/lib/world.js

The fake YouTube for scenarios. `world(overrides)` returns `{ channels, videos }`: Channel A with `aaaaaaaaaa1` (related: a Channel Z video, then `aaaaaaaaaa2`), `aaaaaaaaaa2` (related `aaaaaaaaaa3`), `aaaaaaaaaa3`, and Channel Z with `zzzzzzzzzz1`. `overrides.<key>` merges into a video (see `docs/test/helpers/youtube-site.js.md` for fields). `ids` and `watch(id)` are shortcuts.
