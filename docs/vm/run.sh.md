# vm/run.sh

`vm/run.sh [--bg] <npm script> [args]` (the `npm run vm:*` scripts call it).

On a Windows VM this dispatches to `vm/windows/run.sh` (`docs/vm/windows/run.sh.md`); the rest of this page is the macOS VM.

1. Takes the shared VM lease (`vm/lib.sh`).
2. `vm/sync.sh`.
3. Runs `npm run <script>` on the VM as the console user in the GUI session, with `YTLOOP_VM=1` (this unlocks `scripts/require-vm.js`), `BROWSER_CHANNEL` from the host `.env` (default `chromium`; `chrome` uses the VM's Google Chrome, which is what the VM setup uses, decision 0009), `NODE_OPTIONS=--use-system-ca` (the VM's TLS-inspecting proxy, see `vm/setup.sh`) and `~/tools` on `PATH`.
4. `vm/fetch.sh`, then exits with the script's exit status.

`--bg` is for runs longer than a few minutes (`vm:watch`, `vm:start`): the job is written to `~/ytloop/tmp/job.sh` and started detached, output goes to `~/ytloop/tmp/run.log`, and the host polls that log every 10 s, relaying new output, until a final `EXIT:<status>` line appears. This avoids the known problem of `ssh ... nohup ... &` leaving the local ssh hanging. A killed host session does not stop the VM job; stop it on the VM (`pkill -f "node src/main.js"` for the app).

Examples: `npm run vm:test`, `npm run vm:verify`, `npm run vm:probe`, `npm run vm:watch`, `npm run vm:login`.
