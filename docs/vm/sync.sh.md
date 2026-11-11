# vm/sync.sh

On a Windows VM this dispatches to `vm/windows/sync.sh` (`docs/vm/windows/sync.sh.md`); the rest of this page is the macOS VM.

`rsync -az --delete` of the working tree to `~/ytloop` on the VM. Excluded: `.git`, `node_modules`, `.profile`, `tmp`, `visual/results`, `test-results`, and the retired `Unix/`, `Windows/`, `youtube_auto_watch_bundle/`. Because those are excluded they are not deleted on the VM either, so the VM keeps its own `node_modules`, browser profile and results between runs. The `.env` file is copied (it is the app's config and holds only the playlist URL and local settings); `.git` is not, so no history reaches the VM.
