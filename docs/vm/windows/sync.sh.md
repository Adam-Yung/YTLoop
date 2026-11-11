# vm/windows/sync.sh

Copies the working tree to `~\ytloop` on the Windows VM. Windows has no rsync, so the tree is packed with `tar` into `tmp/sync.tgz`, sent with `scp`, and unpacked on the VM with the built-in `tar.exe`.

- Excluded, as in the macOS `sync.sh`: `.git`, `node_modules`, `.profile`, `tmp`, `visual/results`, `test-results`, `Unix/`, `Windows/`, `youtube_auto_watch_bundle/`. Also excluded: `logs` and every `.env.*` and `*.bak` file (old copies of `.env` can hold secrets).
- Before unpacking, everything in `~\ytloop` is deleted except `node_modules`, `.profile`, `tmp`, `logs`, `test-results` and `visual\results`, which is what `rsync --delete` did on the Mac: files removed here disappear on the VM and generated state stays.
- `.env` is copied, so `PLAYLIST_URL` reaches the VM.
