# test/unit/guard.spec.js

Covers the waiting logic of `src/guard.js` with a scripted fake page, so it needs no browser and is not timing sensitive: no wall, wall that clears, evaluation errors in between (not treated as cleared), and a wall that never clears (`WallError`).
