# scripts/require-vm.js

Guard at the front of `start`, `test`, `verify`, `verify:live` and `probe` in `package.json`. Exits 1 with a message unless `YTLOOP_VM=1`, which only `vm/run.sh` sets (on the VM). Effect: running a browser, the app or the tests on the developer Mac fails immediately. Setting `YTLOOP_VM=1` by hand on the Mac defeats the guard on purpose; do not. Lint (`npm run lint`) is read-only file checking and is allowed on the Mac.
