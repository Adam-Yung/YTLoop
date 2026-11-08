# test/fixture/player.spec.js

Covers `src/youtube/player.js` against the fake site:

- Skippable ad: one click, `isTrusted: true`.
- Ad pod (two ads) plus a later mid-roll: three clicks in total.
- Skip button covered by an overlay: Playwright refuses the click, nothing is recorded.
- Unskippable ad: no click, no tampering, ad plays out.
- Full ad plus content run: zero `tamper` events (no seek, mute or speed change).
- Autoplay toggle: switched off once, second call does nothing.
- Like: unliked video gets one trusted click and a second call does nothing; already liked or signed out gets no click.
- Paused video: resumed by a trusted click.
- Races: if the video starts by itself, or becomes liked, during the human-like pause before the click, `resumeIfPaused` and `likeIfNeeded` click nothing (`humanClick`'s `stillNeeded` re-check). This is the bug where a Play press paused a video that had just started.
