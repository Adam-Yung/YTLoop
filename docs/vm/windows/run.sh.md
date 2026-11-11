# vm/windows/run.sh

`vm/run.sh [--bg] <npm script> [args]` on a Windows VM. Same contract as the macOS script: lease, sync, run, fetch, exit with the script's status.

How it differs:
- Needs an active console session on the VM (`require_desktop`).
- The VM's ssh session is not on the desktop (a browser started from it has no screen), so the job runs as a scheduled task with `/IT /RU <user>`, which starts it in the logged-in user's interactive session. The host writes `tmp\job.ps1` on the VM (`scp`), creates the task `ytloop-run` (`/SC ONCE`, the start time is never used; the harmless "start time is earlier" warning is expected), runs it with `schtasks /Run`, and deletes it at the end. The job window is hidden, so it cannot cover the browser.
- Every run is detached and polled, so `--bg` is accepted and ignored. The job appends output to `~ytloop	mp
un.log` and writes its exit status to `~ytloop	mpexit.code` (not into the log: a child that still holds the log open made that write fail once, and the host waited forever). The host reads the log every `VM_POLL_SECONDS` (default 5) with `Get-Content | Select-Object -Skip <lines seen>`, prints new lines, and stops when `exit.code` appears. `VM_RUN_TIMEOUT` (default 2400 s) ends the task and exits 124.
- The job sets `YTLOOP_VM=1`, `NODE_OPTIONS=--use-system-ca`, `YTLOOP_WORKERS` (default 1, `playwright.config.js`), `YTLOOP_TEST_SLOW` (default 5, `test/fixture/chain.spec.js`), `YTLOOP_RETRIES` (default 1, `playwright.config.js`) and puts `~\tools\node`, `~\tools\bin` and `~\tools\git\cmd` on `PATH`.
- `BROWSER_CHANNEL` comes from the host `.env`. If it is `chrome` and Google Chrome is not installed on the VM, the job logs a note and uses `chromium`, so the same `.env` works on a Mac VM and on a VM without Chrome.
- A killed host session does not stop the job on the VM: `schtasks /End /TN ytloop-run`.
