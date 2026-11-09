# test/unit/style.spec.js

Covers `scripts/lib.js` and `scripts/check-style.js`: where the header ends for JS and shell files, which paths are covered (`vm/` yes, fixtures and results no), and an end-to-end check in a scratch git repo under `<repo>/tmp/` that a shell file with a multi-line comment after its header fails with `file:line multi-line comment outside header` while header comments and single comments pass.
