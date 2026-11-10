# vm/fetch.sh

Copies `~/ytloop/visual/results/` from the VM to `<repo>/tmp/vm-results/` (git-ignored) so screenshots, recordings, periodic screenshot samples, `results.tsv` and logs can be opened here. `vm/run.sh` calls it after every run; `npm run vm:fetch` runs it alone. Delete `tmp/vm-results` when done looking (scratch rule in `AGENTS.md`).
