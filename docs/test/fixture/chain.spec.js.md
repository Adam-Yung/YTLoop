# test/fixture/chain.spec.js

End-to-end tests of `watchVideo` and `runChain` on the fake site with scaled time:

- Recommendation chain of 3: other-channel card ignored, same-channel cards clicked (referer present), the last video does not click onward.
- No same-channel card: video ends, channel Videos page used, no other-channel video visited.
- Forced autoplay switch to another channel: rejected.
- Stalled playback: abandoned for another upload.
- Stale media state (previous video's position and id carried over by the reused `<video>` for a moment): not a stall and not read as the end of the video.
- Missing video: three consecutive failures end the chain with `failures`.
- Bot wall: chain ends with `wall`, no extra navigation.
- Like: the last video of a chain is liked exactly once.
- Abort: chain returns `stopped` promptly.

The fake site runs at `timeScale: 5` (1 s of video takes 200 ms; the 20 s videos last 4 s). Faster clocks made the last-10-seconds window shorter than one watch-loop iteration in real Chrome (each Play, autoplay and Like click costs a few hundred ms), so the recommendation was missed and the test fell back to the channel page about a third of the time.
