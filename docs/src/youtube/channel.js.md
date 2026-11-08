# src/youtube/channel.js

Same-channel logic. `ctx` is `{ cfg, log, signal }`; `visited` is a `Set` of video ids.

## Pure

- `sameChannel(owner, candidate)`: compares `/@handle` or `/channel/ID` paths (case-insensitive) when both sides have a comparable URL of the same kind, otherwise compares normalized names. Empty names never match.
- `pickSame(cards, owner, visited, currentId)`: first card that is not the current video, not visited and from the same channel. Order follows the sidebar, so "first" means top-most.
- `pickUpload(ids, visited, currentId)`: first unvisited id; if all are visited, the first id other than the current one with `cycled: true`; otherwise `null`.

## Page reads and actions

- `readOwner(page)`: `{ name, id, url }` from `ytInitialPlayerResponse` with the owner link as fallback.
- `listRelated(page)`: `[{ index, id, channelName, channelUrl }]` for sidebar cards, both layouts. New-layout cards have no channel link, so matching falls back to names.
- `listUploads(page)`: video ids on a channel Videos page.
- `followRelated(page, card, ctx)`: `humanClick` on the card's link and wait for the URL to become that video, logging `[next] Clicked into <id>` on success. On failure it opens the same video by URL (never a different one). Returns true when the click path worked.
- `openChannelUpload(page, owner, visited, currentId, ctx)`: goes to the channel Videos page (direct URL, the one place `goto` is the normal path), picks an upload with `pickUpload`, clears `visited` when cycling, clicks it. Returns the chosen id or `null` when there is no channel URL or no upload.

Selectors come from `selectors.js`.
