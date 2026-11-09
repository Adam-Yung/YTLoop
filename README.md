# YTLoop

Plays a YouTube playlist in a real browser using Playwright. For each playlist entry (last to first) it follows 10 to 20 videos from the same channel, clicking Skip Ad buttons like a person would and never touching the ad itself. Videos that are not liked yet get liked once.

Runs the same on macOS, Windows and Ubuntu, but this project is developed and tested only on a test VM: the browser, mouse and screen capture are real, so they are kept off the developer machine (`docs/decisions/0008-run-on-vm.md`). The default browser is Playwright's Chromium; admin-managed Google Chrome cannot be remote-controlled (`docs/decisions/0007-bundled-chromium.md`).

## Quick start (from the developer Mac)

```bash
cp .env.example .env      # set PLAYLIST_URL and VM_SSH (the VM's ssh alias)
npm run vm:setup          # once: Node, yt-dlp, deps and Chromium on the VM
npm run vm:probe          # real YouTube: selectors match, playback advances
npm run vm:start          # run the app on the VM
```

The profile on the VM (`~/ytloop/.profile/chromium`) keeps your login; sign in once in the window on the VM display (liking needs it).

## Commands

| Command | Where | Purpose |
| --- | --- | --- |
| `npm run vm:setup` | Mac, runs on VM | install the toolchain on the VM |
| `npm run vm:test` | Mac, runs on VM | unit and fixture tests |
| `npm run vm:verify` | Mac, runs on VM | real-screen checks on the fake YouTube: launch, ads, like, chain |
| `npm run vm:probe` | Mac, runs on VM | real YouTube: browser opens, page shows, every selector matches, playback advances |
| `npm run vm:watch` | Mac, runs on VM | slow end-to-end run on real YouTube with a screen recording |
| `npm run vm:start` | Mac, runs on VM | the real app |
| `npm run vm:fetch` | Mac | copy the VM's latest evidence into `tmp/vm-results` |
| `npm run lint` | Mac | style and docs-mirror checks (also run by the pre-commit hook) |

`npm test`, `start`, `verify`, `probe` refuse to run unless `YTLOOP_VM=1`, which only the VM scripts set.

## Docs

Start at `docs/README.md`, `docs/vm.md` and `docs/visual.md`. Contributors and agents must read `AGENTS.md`: every code file has a mirrored doc under `docs/` that has to be updated with the code.
