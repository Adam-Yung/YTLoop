# test/fixture/channel.spec.js

Covers `src/youtube/channel.js` on the fake site, for the old and new sidebar layouts:

- Owner read, sidebar listed, other-channel card ignored, first same-channel card clicked, navigation has a referer (it was a click).
- Visited recommendation skipped.
- Videos page: unvisited upload clicked; all visited cycles and clears the set; uploads listed.
