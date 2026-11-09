# Working with the test VM

```
npm run vm:setup     once: install Node, yt-dlp, deps and Chromium on the VM
npm run vm:test      unit and fixture tests on the VM
npm run vm:verify    real-screen checks against the fake YouTube
npm run vm:probe     real YouTube: page, selectors, playback
npm run vm:watch     8 minute end-to-end run on real YouTube with a screen recording (background mode)
npm run vm:start     the real app (background mode; Ctrl+C here does not stop it on the VM)
npm run vm:fetch     copy the latest evidence from the VM to tmp/vm-results
npm run lint         on the Mac: style and docs-mirror checks (read only)
```

Set `VM_SSH` in `.env` to the ssh alias of the VM. See decision 0008 for why, `docs/vm/*.md` for each script.

## Before the first run

1. Start the VM: `/Applications/UTM.app/Contents/MacOS/utmctl start macOS` (if UTM does not list it, open the `.utm` bundle once).
2. In the VM, make sure the screen cannot lock: turn off the screen lock and enable auto-login for the console user. `vm:setup` already turns the screensaver off.
3. Sign in to YouTube once in the browser window on the VM display (needed for likes; the profile `~/ytloop/.profile/chromium` keeps it).

## Rules

- Never run a browser, the tests or the app on the Mac. The npm scripts refuse.
- The VM has one screen: do not use it while a run is in progress, and never run two things at once (the lease enforces it, and also protects prisma-encryptor's runs).
- Scratch and fetched evidence go to `<repo>/tmp/`; delete them when finished.
