# test/fixture/chain.spec.js

End-to-end tests of `watchVideo` and `runChain` on the fake site with scaled time:

- Recommendation chain of 3: other-channel card ignored, same-channel cards clicked (referer present), the last video does not click onward.
- No same-channel card: video ends, channel Videos page used, no other-channel video visited.
- Forced autoplay switch to another channel: rejected.
- Stalled playback: abandoned for another upload.
- Missing video: three consecutive failures end the chain with `failures`.
- Bot wall: chain ends with `wall`, no extra navigation.
- Like: the last video of a chain is liked exactly once.
- Abort: chain returns `stopped` promptly.
