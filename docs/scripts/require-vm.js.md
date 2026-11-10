# scripts/require-vm.js

Guard at the front of `test`, `verify`, `verify:live` and `probe` in `package.json`: the development checks. Exits 1 with a message unless `YTLOOP_VM=1`, which only `vm/run.sh` sets (on the VM). Effect: the tests, the real-screen verification and the live probe fail immediately on the developer Mac, where they would drive a real browser, mouse and screen. Setting `YTLOOP_VM=1` by hand on the Mac defeats the guard on purpose; do not.

Not guarded: `npm start` and `npm run login` (the app itself runs on any machine, decision 0008) and `npm run lint` (read-only file checking).
