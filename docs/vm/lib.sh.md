# vm/lib.sh

Sourced by the other `vm/` scripts. Not run directly.

- Loads `<repo>/.env` and requires `VM_SSH` (the ssh alias of the test VM). The alias lives only in the git-ignored `.env`, never in tracked files.
- `vm_ssh ...`: `ssh -o BatchMode=yes -o ConnectTimeout=10 $VM_SSH ...`, so a dead VM fails in 10 s instead of hanging.
- `as_console_user`: runs a script read from stdin as the VM's console user inside the GUI session (`sudo launchctl asuser <uid> sudo -u <user>`). A headed browser and `screencapture` only work there. Needs the VM's passwordless sudo.
- Lease: `lease_acquire [name]`, released on exit. Same convention as prisma-encryptor's `scripts/lib-vm-lease.sh` (lock directory `/tmp/prisma-vm-lease`, `holder` file with pid, name, start time) so both projects wait for each other instead of fighting over the one VM screen. A holder whose pid is gone is reclaimed. Waits up to `VM_LEASE_WAIT` seconds (default 3600) and prints who holds it every 30 s.

The remote working copy is `~/ytloop` on the VM and tools live in `~/tools` (see `vm/setup.sh`).
