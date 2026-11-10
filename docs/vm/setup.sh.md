# vm/setup.sh

`npm run vm:setup`. Idempotent install of the toolchain on the VM, entirely under the console user's home (nothing system-wide, no Homebrew, no sudo), so the shared VM and prisma-encryptor are not affected:

- Node 22 (latest v22 darwin-arm64 tarball from nodejs.org, checked against the published `SHASUMS256.txt`) in `~/tools/node`.
- `yt-dlp_macos` (checked against the release `SHA2-256SUMS`) in `~/tools/bin/yt-dlp`.
- `npm ci --ignore-scripts` (the `prepare` hook only sets git hooks, and the VM has no git repo) and `npx playwright install chromium` in `~/ytloop`. If the host has a Playwright browser cache (`~/Library/Caches/ms-playwright`), it is copied to the VM first, so Playwright finds the browsers already installed and downloads nothing. The cache is optional: a Mac that never ran Playwright (the normal case, decision 0008) downloads from `cdn.playwright.dev`, which stalled behind the corporate proxy on 2026-11-08; the workaround is to copy a cache from another machine into `~/Library/Caches/ms-playwright` on the host before running setup.
- Google Chrome is not installed by this script. `BROWSER_CHANNEL=chrome` needs it on the VM already (decision 0009); the Playwright Chromium is then only used by `BROWSER_CHANNEL=chromium`.
- `NODE_OPTIONS=--use-system-ca`: the VM sits behind a TLS-inspecting proxy whose certificate is in the macOS keychain but not in Node's built-in list, so without this Node downloads fail with `SELF_SIGNED_CERT_IN_CHAIN`. Certificate checking stays on; never use `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- The VM screensaver idle time is set to 0 (never), so a run cannot be hidden by a screensaver. If the VM also locks the screen, turn off the lock and enable auto-login once in the VM's System Settings.

ffmpeg is deliberately not installed; frame checks in `visual/` use periodic screenshots instead (decision 0008). Re-run after changing `package-lock.json` or to update Node and yt-dlp: delete `~/tools/node` or `~/tools/bin/yt-dlp` on the VM first to force a re-download.
