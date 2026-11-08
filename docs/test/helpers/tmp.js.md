# test/helpers/tmp.js

`tmpDir(prefix)` makes a scratch directory under `<repo>/tmp/` (git-ignored); `removeDir(dir)` deletes it; `ROOT` is the folder. Used instead of the system temp dir, which triggers allowlist prompts for the owner. Always remove what you create.
