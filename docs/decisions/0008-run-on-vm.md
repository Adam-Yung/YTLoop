# 0008 Everything runs on the test VM

Context: this project drives a real browser against a real site with real mouse input and screen capture. That is not trivial automation, and it already caused trouble on the developer Mac: it launched a managed Chrome that is locked down by the company, hit macOS permission prompts, recorded a screensaver, and left scratch files behind. The owner wants any damage confined to a disposable machine.

Decision:
- All runs (`npm start`, `test`, `verify`, `verify:live`, `probe`) happen only on `prisma-vm`, the UTM macOS VM that prisma-encryptor also uses. The Mac is for editing, git and read-only lint.
- Source is edited and committed on the Mac, copied to `~/ytloop` on the VM with rsync for every run (`vm/sync.sh`), and evidence is copied back to `<repo>/tmp/vm-results` (`vm/fetch.sh`) so it can be inspected.
- A guard (`scripts/require-vm.js`) makes the npm scripts fail on the Mac.
- Tools install under `~/tools` on the VM without sudo or Homebrew (Node tarball with checksum, standalone yt-dlp). ffmpeg is not installed on the VM; frame checks use periodic screenshots.
- The VM is shared with prisma-encryptor, which has one screen and one daemon, so both projects take the same host-side lease directory.
- The ssh alias is configuration (`VM_SSH` in the git-ignored `.env`); tracked files never name the VM.
- The VM screensaver is turned off, so the display never hides a run. The Mac's own 15 minute screensaver no longer matters because nothing is recorded on the Mac.

Consequences: supersedes the parts of earlier notes that said to run on the Mac. The Mac keeps no browser, no Playwright cache and no node_modules for this project. A powered-off VM must be started first (`utmctl start`).
