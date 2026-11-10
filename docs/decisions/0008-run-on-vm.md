# 0008 Development and testing run on a test VM; the app runs anywhere

Context: this project drives a real browser against a real site with real mouse input and screen capture. That is not trivial automation, and during development it already caused trouble on the developer Mac: it launched a managed Chrome that is locked down by the company, hit macOS permission prompts, recorded a screensaver, and left scratch files behind. The owner wants any damage from developing and testing it confined to a disposable machine.

The product itself is a normal app: it is meant to run directly on a Mac, a Windows PC or an Ubuntu machine (`npm start`), not in a VM.

Decision:
- **Development** (the tests, the real-screen verification, the live probe and watch scenarios) runs only on `prisma-vm`, the UTM macOS VM that prisma-encryptor also uses. The developer Mac is for editing, git and read-only lint.
- **The app** (`npm start`, `npm run login`) is not restricted. A user installs Node, yt-dlp and Chrome on their own machine and runs it there (`README.md`, `docs/platforms.md`).
- Source is edited and committed on the Mac, copied to `~/ytloop` on the VM with rsync for every run (`vm/sync.sh`), and evidence is copied back to `<repo>/tmp/vm-results` (`vm/fetch.sh`) so it can be inspected.
- A guard (`scripts/require-vm.js`) makes the development npm scripts (`test`, `verify`, `verify:live`, `probe`) fail on the developer machine. `vm:start` exists so the real app can also be run on the VM for end-to-end checks.
- Tools install under `~/tools` on the VM without sudo or Homebrew (Node tarball with checksum, standalone yt-dlp). ffmpeg is not installed on the VM; frame checks use periodic screenshots.
- The VM is shared with prisma-encryptor, which has one screen and one daemon, so both projects take the same host-side lease directory.
- The ssh alias is configuration (`VM_SSH` in the git-ignored `.env`); tracked files never name the VM.
- The VM screensaver is turned off, so the display never hides a run. The Mac's own 15 minute screensaver no longer matters because nothing is recorded on the Mac.

Consequences: supersedes the parts of earlier notes that said to run on the Mac. The developer Mac keeps no browser, no Playwright cache and no node_modules for this project. A powered-off VM must be started first (`utmctl start`). An earlier version of this note, and the guard, also blocked `npm start` outside the VM; that was a mistake and was removed.
