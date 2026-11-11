# vm/lib.sh

Sourced by the other `vm/` scripts. Not run directly.

- Loads `<repo>/.env` and requires `VM_SSH` (the ssh alias of the test VM). The alias lives only in the git-ignored `.env`, never in tracked files.
- `vm_ssh ...`: `ssh -o BatchMode=yes -o ConnectTimeout=10 -o ServerAliveInterval=15 -o LogLevel=ERROR $VM_SSH ...`, so a dead VM fails in 10 s instead of hanging and the post-quantum key exchange warning of a newer ssh client does not clutter the output.
- VM type: `VM_OS` (`mac` or `windows`) is read from the environment or detected once with `uname -s` over ssh (`Darwin` means mac, anything else, such as PowerShell failing on `uname`, means windows) and exported. `use_windows_vm "$@"`, called at the top of `run.sh`, `setup.sh`, `sync.sh` and `fetch.sh`, replaces the script with its twin in `vm/windows/` when the VM is Windows and does nothing on a Mac VM, so the Mac flow is unchanged (decision 0010).
- `as_console_user`: runs a script read from stdin as the VM's console user inside the GUI session (`sudo launchctl asuser <uid> sudo -u <user>`). A headed browser and `screencapture` only work there. Needs the VM's passwordless sudo.
- Lease: `lease_acquire [name]`, released on exit. Same convention as prisma-encryptor's `scripts/lib-vm-lease.sh` (lock directory `/tmp/prisma-vm-lease` on a Mac host, `<repo>/tmp/vm-lease` on a Windows host so nothing is written outside the repo, `PRISMA_VM_LEASE_DIR` overrides both; `holder` file with pid, name, start time) so both projects wait for each other instead of fighting over the one VM screen. A holder whose pid is gone is reclaimed. Waits up to `VM_LEASE_WAIT` seconds (default 3600) and prints who holds it every 30 s.

The remote working copy is `~/ytloop` on the VM and tools live in `~/tools` (see `vm/setup.sh`).
