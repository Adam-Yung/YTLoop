#!/usr/bin/env bash
# Helpers for a Windows test VM: run PowerShell over ssh, and refuse to start when nobody is logged in at the VM display.
. "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

vm_ps() { vm_ssh powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command -; }

require_desktop() {
  local sessions
  sessions=$(vm_ssh quser 2> /dev/null || true)
  if ! grep -qi 'console.*Active' <<< "$sessions"; then
    echo "The VM has no active, unlocked console session. Log in at the VM display (and keep it unlocked), then rerun." >&2
    return 4
  fi
}
