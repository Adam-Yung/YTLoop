# src/chain.js

`runChain({ startId, length, session, ctx, browser })` returns `{ reason, watched }`.

`browser` is `{ page(), close() }` (see `createBrowser`). Each loop: get the page, `watchVideo`, then decide the next video.

- Recommendation taken: continue with it.
- `ended` or `autoplay-switch`, or the video failed: `openChannelUpload` from the owner's channel.
- Counting: `watched` counts completed videos and stops the chain at `length`. `videoFailures` counts rounds where the video failed or no fallback video was found, and resets after any success.

## End reasons

| reason | when |
| --- | --- |
| `done` | `length` videos watched |
| `failures` | `maxVideoFailures` consecutive failed rounds |
| `browser` | `maxBrowserFailures` consecutive browser problems (closed tab, launch failure) |
| `wall` | `WallError`: a bot check, consent or sign-in wall was not cleared in `botWaitMs` |
| `stopped` | abort signal |

After a failed round the chain waits `retryDelayMs` and retries (`fresh` navigation). Every failure is written to `errors.log`. Nothing here throws; the caller (`main.js`) just moves on to the next playlist entry.
