# test/unit/walk.spec.js

Covers `walk` in `src/main.js` with fake `fetch` and `chain`: order and length range, refetch after exhaustion, playlist errors contained and retried, a crashing chain does not stop the walk, visited set cleared per round.
