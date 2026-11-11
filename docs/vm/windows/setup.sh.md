# vm/windows/setup.sh

`npm run vm:setup` on a Windows VM. Idempotent; everything lives under `~\tools` of the logged-in user (no installer, no admin rights, nothing system-wide, so the other things on the VM are unaffected). Each download is checked against the publisher's SHA-256:

- Node 22 (`win-x64.zip`, `SHASUMS256.txt` from nodejs.org) in `~\tools\node`.
- `yt-dlp.exe` (release `SHA2-256SUMS`) in `~\tools\bin`.
- ffmpeg (gyan.dev release essentials build and its `.sha256`) in `~\tools\bin`. The Windows screen recorder uses it (`gdigrab`); without it `chain.3` fails. A failed download only warns.
- MinGit in `~\tools\git` (tests such as `style.spec.js` run `git init`). The asset and its SHA-256 are read from the release's `expanded_assets` HTML, not the GitHub API: the API allows 60 unauthenticated requests per hour per IP, which a shared corporate address uses up.
- `npm ci --ignore-scripts` and `npx playwright install chromium` in `~\ytloop`. Chrome is not installed; the run falls back to Chromium (`vm/windows/run.sh`).
- The user's screensaver is turned off (`HKCU\Control Panel\Desktop`). Power settings are not changed; the keep-awake helper (`visual/lib/awake.js`) holds the display on during a run.
- The download cache `~\tools\dl` is emptied at the end. The disk of the VM is small (69 GB).

Archives are unpacked with the built-in `tar.exe`, which is much faster than `Expand-Archive` for Node's 30 000 files. Requires the VM's `tar`, web access, and PowerShell 5.1.
