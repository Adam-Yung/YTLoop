# YTLoop

Plays a YouTube playlist in a real, visible Chrome using Playwright. For each playlist entry (last to first) it follows 10 to 20 videos from the same channel: near the end of a video it clicks the first unvisited recommendation from that channel, and falls back to the channel's Videos page when there is none. It clicks Skip Ad buttons with a real mouse click and never seeks, mutes or hides an ad. A video that is not liked yet gets liked once (when signed in). A bot check or sign-in wall pauses the app until a person clears it.

It is plain Node and is meant to run directly on macOS, Windows and Ubuntu. Only macOS is tested so far (`docs/platforms.md`).

## Run it on your machine

### 1. Install

| | macOS | Windows | Ubuntu |
| --- | --- | --- | --- |
| Node.js 22 or newer | `brew install node` | `winget install OpenJS.NodeJS.LTS` | NodeSource or nvm |
| yt-dlp | `brew install yt-dlp` | `winget install yt-dlp.yt-dlp` | `pipx install yt-dlp` |
| Google Chrome | installed normally | installed normally | installed normally |

Then, in the project folder:

```bash
git clone https://github.com/Adam-Yung/YTLoop.git
cd YTLoop
npm install
```

If you do not want to use Chrome, run `npm run setup` once to download Playwright's own Chromium (about 150 MB) and leave `BROWSER_CHANNEL` unset.

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env`:

```
PLAYLIST_URL="https://youtube.com/playlist?list=..."
BROWSER_CHANNEL=chrome       # your installed Google Chrome; omit it for Playwright's Chromium
CHAIN_MIN=10                 # videos per playlist entry, random between MIN and MAX
CHAIN_MAX=20
```

All keys are in `docs/src/config.js.md`. A Chrome that your employer manages may refuse remote control ("DevTools remote debugging is disallowed by the system admin"); use Chromium there (decision 0007).

### 3. Sign in to YouTube (once, optional)

Liking videos needs a signed-in browser profile. Without it everything else still works.

```bash
npm run login
```

A Chrome window opens on the app's own profile (`.profile/chrome` in the project folder) at the Google sign-in page. Sign in, then quit that Chrome (Cmd+Q on macOS). The app keeps the login between runs. It uses its own profile, separate from the Chrome you normally use, because Chrome 136 and newer do not allow automation on the default profile. On Windows and Ubuntu the command prints the Chrome command to run by hand.

### 4. Start

```bash
npm start
```

A Chrome window opens and starts playing. Leave the window alone: the app uses the real mouse and the real window. Ctrl+C in the terminal stops it and closes the browser.

### While it runs

- The machine must stay awake and unlocked. Turn off the screensaver and sleep, or the page stops playing.
- Errors are written to `logs/errors.log`; progress goes to the terminal.
- A bot check, CAPTCHA or sign-in wall: the app logs it, pauses and waits (up to 10 minutes) for you to clear it in the window. It never tries to solve or bypass one.
- Do not run two copies on one profile; Chrome locks the profile directory. Quit the login window from step 3 before starting.

### Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| "Browser not installed for channel ..." | `BROWSER_CHANNEL=chrome` without Chrome installed, or Chromium not downloaded: install Chrome or run `npm run setup` |
| "Chrome is blocked from remote control by an admin policy" | managed Chrome; set `BROWSER_CHANNEL=chromium` and run `npm run setup` |
| "profile is already in use" | another Chrome is open on `.profile/chrome`; quit it |
| Not liking anything | the profile is signed out; run `npm run login` |
| Chrome shows an "unsupported command-line flag" bar | expected: `--disable-blink-features=AutomationControlled` is set on purpose; cosmetic |
| `yt-dlp` not found or no videos | install yt-dlp and check `PLAYLIST_URL`; errors are in `logs/errors.log` |

## Development

Developing and testing this project is done on a test VM, not on your own machine, because the tests and checks drive a real browser, the real mouse and the real screen (decision `docs/decisions/0008-run-on-vm.md`). Do this only if you are changing the code.

- The machine you edit on (a Mac, or a Windows PC with Git Bash) is the controller: edit, git, `npm run lint`, and the `npm run vm:*` commands. It needs no browser and no `node_modules`. The VM can be macOS or Windows; the scripts detect which (decision 0010).
- The VM runs everything else. Each `vm:*` command copies the working tree to `~/ytloop` on the VM, runs there in the logged-in desktop session, and copies the evidence back to `tmp/vm-results`.
- `npm test`, `verify` and `probe` refuse to run without `YTLOOP_VM=1`, which only the VM scripts set. Never set it by hand on your own machine.

Quick start, after the VM exists and is reachable over ssh without a password (requirements in `docs/vm.md`):

```bash
cp .env.example .env     # set PLAYLIST_URL, VM_SSH (the ssh alias) and BROWSER_CHANNEL=chrome
npm run vm:setup         # once: Node, yt-dlp and deps on the VM
npm run vm:test          # unit and fixture tests
npm run vm:verify        # real-screen checks against a fake YouTube
npm run vm:login         # once: sign in at the VM display
npm run vm:probe         # real YouTube: selectors match, playback advances
npm run vm:watch         # about 8 min end-to-end run with a screen recording
```

| Command | Runs | Purpose |
| --- | --- | --- |
| `npm start` | your machine | the app |
| `npm run login` | your machine | one-time YouTube sign-in |
| `npm run setup` | your machine | download Playwright's Chromium |
| `npm run lint` | any | style and docs-mirror checks (also the pre-commit hook) |
| `npm run vm:setup` | acts on the VM | install the toolchain on the VM (once) |
| `npm run vm:test` | acts on the VM | unit and fixture tests |
| `npm run vm:verify` | acts on the VM | real-screen checks on the fake YouTube: launch, ads, like, chain |
| `npm run vm:login` | acts on the VM | one-time sign-in at the VM display |
| `npm run vm:probe` | acts on the VM | real YouTube: browser opens, selectors match, playback advances |
| `npm run vm:watch` | acts on the VM | end-to-end run on real YouTube with a screen recording |
| `npm run vm:start` | acts on the VM | the real app, on the VM (an end-to-end check) |
| `npm run vm:fetch` | controller | copy the VM's latest evidence into `tmp/vm-results` |

On a fresh clone also run `git config core.hooksPath .githooks` (the pre-commit hook; `npm install` does it too).

## Docs

Start at `docs/README.md`. Contributors and agents must read `AGENTS.md`: every code file has a mirrored doc under `docs/` that has to be updated in the same commit as the code.
