# test/unit/require-vm.spec.js

Covers `scripts/require-vm.js`: it exits 1 and says the project only runs on the test VM when `YTLOOP_VM` is unset, `0` or `true`, and exits 0 only for `1`.
