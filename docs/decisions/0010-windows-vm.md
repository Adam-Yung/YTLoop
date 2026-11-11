# 0010 The test VM can be Windows, and the host can be Windows

Context: decision 0008 put development on a macOS VM driven from a Mac, with every script written for that pair (`launchctl asuser`, `screencapture`, `sips`, JXA, rsync, `stat -f`). The owner now also develops from a Windows PC against a Windows VM (the shared enforcer test VM, 2 CPUs, 4 GB, 69 GB disk) and wants both setups to work, equally polished.

Decision:
- The VM type is detected, not configured: `vm/lib.sh` asks the VM for `uname -s` and sets `VM_OS` (`mac` or `windows`; set `VM_OS` in the environment to skip the check). The four entry scripts `vm/run.sh`, `setup.sh`, `sync.sh` and `fetch.sh` hand over to the same-named script in `vm/windows/` for a Windows VM. For a Mac VM the old code runs untouched, so the Mac flow cannot regress through the new one.
- The host is Git Bash on Windows (or any bash, as before). The Windows scripts use only `ssh`, `scp` and `tar` on the host, so they also work from a Mac. The lease directory is `<repo>/tmp/vm-lease` on a Windows host.
- Jobs run in the logged-in user's desktop as a scheduled task (`/IT`), because an ssh session on Windows has no desktop. The host polls a log file and an exit-code file on the VM. Output of the job is never piped through ssh, so a dropped connection cannot kill a run.
- Screen checks keep one implementation per platform behind the same `capture.js` and `awake.js` API: PowerShell with `System.Drawing` for screenshots, one persistent PowerShell for speed (`visual/lib/win.js`), `ffmpeg gdigrab` for recordings, Win32 calls for focus, lock and keep-awake. macOS code paths are unchanged.
- Tools install per user under `~\tools` (Node zip, yt-dlp, ffmpeg, MinGit, each checksum-verified), nothing system-wide, because the VM is shared with enforcer work. The browser is Playwright's Chromium unless Chrome is installed (`vm/windows/run.sh` falls back when `BROWSER_CHANNEL=chrome` has no Chrome to use).
- Fixture tests run with 1 worker on the Windows VM (`YTLOOP_WORKERS`); the Mac VM keeps 3.

Consequences: two implementations of the VM glue and the screen helpers to keep in step. A change to a `vm/` or `visual/lib/` script has to be run on both VM types when one exists. The Windows VM needs an unlocked, logged-in console session (`require_desktop` and `screen.1` say so). Firefox is not supported: the app, its launch flags, the login flow and the checks are Chromium specific.
