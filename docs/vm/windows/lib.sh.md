# vm/windows/lib.sh

Sourced by the other `vm/windows/` scripts (it sources `vm/lib.sh` first, so `.env`, `VM_SSH`, `vm_ssh` and the lease come from there).

- `vm_ps`: runs the PowerShell script read from stdin on the VM (`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command -`). Stdin avoids the three layers of quoting that a script in an ssh argument needs. The VM's ssh login shell is PowerShell 5.1.
- `require_desktop`: fails with exit 4 and a message unless `quser` shows an Active console session. The headed browser and the screen checks need a logged-in, unlocked desktop; without one the scheduled task would start and the browser would have no screen. A locked screen is still caught later by `screen.1`.
