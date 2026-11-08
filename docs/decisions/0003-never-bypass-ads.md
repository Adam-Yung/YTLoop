# 0003 Never bypass ads

Decision: the app only clicks a visible, enabled Skip button, polled every 500 ms (covers ad pods and mid-rolls). It never seeks, mutes, changes playback rate, blocks requests or hides ad elements. Non-skippable ads play to the end.

Consequences: the legacy `auto-skip-ads.js` (16x acceleration) was deleted. Tests assert that `playbackRate`, `muted` and `currentTime` are untouched during ads.
