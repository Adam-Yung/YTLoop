# vm/setup.sh

`npm run vm:setup`. Idempotent install of the toolchain on the VM, entirely under the console user's home (nothing system-wide, no Homebrew, no sudo), so the shared VM and prisma-encryptor are not affected:

- Node 22 (latest v22 darwin-arm64 tarball from nodejs.org, checked against the published `SHASUMS256.txt`) in `~/tools/node`.
- `yt-dlp_macos` (checked against the release `SHA2-256SUMS`) in `~/tools/bin/yt-dlp`.
- `npm ci` and `npx playwright install chromium` in `~/ytloop`.
- The VM screensaver idle time is set to 0 (never), so a run cannot be hidden by a screensaver. If the VM also locks the screen, turn off the lock and enable auto-login once in the VM's System Settings.

ffmpeg is deliberately not installed; frame checks in `visual/` use periodic screenshots instead (decision 0008). Re-run after changing `package-lock.json` or to update Node and yt-dlp: delete `~/tools/node` or `~/tools/bin/yt-dlp` on the VM first to force a re-download.
