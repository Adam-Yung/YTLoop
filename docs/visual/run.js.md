# visual/run.js

Entry for `npm run verify`, `npm run verify:live` and `npm run probe`.

- Loads every `visual/scenarios/*.js`, keeps those whose `live` flag matches `--live`. With no names it skips scenarios marked `manual`. Names given on the command line run even when `manual`.
- Creates `visual/results/<timestamp>/`, runs scenarios in name order, one at a time, with the keep-awake helper on.
- A scenario that throws becomes a failed check `<name>.crash`; the run continues.
- Prints `PASS/FAIL/SKIP  id  name`, writes `visual/results/results.tsv`, and exits 1 when any check failed.
- Removes the scratch browser profile in `<repo>/tmp/` at the end.
