# visual/run.js

Entry for `npm run verify`, `npm run verify:live` and `npm run probe`.

- Loads every `visual/scenarios/*.js`, keeps those whose `live` flag matches `--live`. With no names it skips scenarios marked `manual`. Names given on the command line run even when `manual`.
- Creates `visual/results/<timestamp>/`, starts the keep-awake helper (macOS and Windows; other platforms print a note and skip the screen checks), then wakes the screen (dismisses a running screensaver). Check `screen.1` must pass or the run aborts with a message: recording a screensaver or a lock screen would make every pixel check meaningless.
- Runs scenarios in name order, one at a time. After each one, check `<name>.screen` confirms the display stayed awake (no screensaver or lock appeared).
- A scenario that throws becomes a failed check `<name>.crash`; the run continues.
- Prints `PASS/FAIL/SKIP  id  name`, writes `visual/results/results.tsv`, and exits 1 when any check failed.
- Removes the scratch browser profile in `<repo>/tmp/` at the end.
