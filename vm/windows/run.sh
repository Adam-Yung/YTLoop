#!/usr/bin/env bash
# Runs an npm script of this repo on the Windows VM, in the logged-in desktop session (a scheduled task with /IT), under the VM lease, streaming its log back.
# Usage: vm/run.sh [--bg] <npm script> [args]   (--bg is accepted and changes nothing: every run is detached on the VM and polled)
. "$(dirname "$0")/lib.sh"

[ "${1:-}" = "--bg" ] && shift
script=${1:?usage: vm/run.sh [--bg] <npm script> [args]}
shift

TASK=ytloop-run
POLL=${VM_POLL_SECONDS:-5}
TIMEOUT=${VM_RUN_TIMEOUT:-2400}

require_desktop
lease_acquire "ytloop $script"
"$ROOT/vm/windows/sync.sh"

cat > "$ROOT/tmp/job.ps1" << EOF
Set-Location (Join-Path \$HOME 'ytloop')
\$log = 'tmp\\run.log'
\$env:YTLOOP_VM = '1'
\$env:NODE_OPTIONS = '--use-system-ca'
\$env:YTLOOP_WORKERS = '${YTLOOP_WORKERS:-1}'
\$env:YTLOOP_TEST_SLOW = '${YTLOOP_TEST_SLOW:-5}'
\$env:YTLOOP_RETRIES = '${YTLOOP_RETRIES:-1}'
\$env:PATH = "\$HOME\\tools\\node;\$HOME\\tools\\bin;\$HOME\\tools\\git\\cmd;\$env:PATH"
\$channel = '${BROWSER_CHANNEL:-chromium}'
\$chrome = @('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe') | Where-Object { Test-Path \$_ }
if (\$channel -eq 'chrome' -and -not \$chrome) { \$channel = 'chromium'; 'note: Google Chrome is not installed on the VM, using Chromium' | Add-Content \$log }
\$env:BROWSER_CHANNEL = \$channel
cmd /c "npm run $script -- $* >> \$log 2>&1"
\$LASTEXITCODE | Set-Content 'tmp\exit.code'
EOF
scp -q -o BatchMode=yes -o LogLevel=ERROR "$ROOT/tmp/job.ps1" "$VM_SSH:ytloop/tmp/job.ps1"
rm -f "$ROOT/tmp/job.ps1"

vm_ps << POWERSHELL
\$ErrorActionPreference = 'Stop'
Remove-Item (Join-Path \$HOME 'ytloop\\tmp\\run.log'), (Join-Path \$HOME 'ytloop\\tmp\\exit.code') -ErrorAction SilentlyContinue
\$job = Join-Path \$HOME 'ytloop\\tmp\\job.ps1'
schtasks /Create /TN $TASK /TR "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File \$job" /SC ONCE /ST 00:00 /RU \$env:USERNAME /IT /F | Out-Null
schtasks /Run /TN $TASK | Out-Null
POWERSHELL

seen=0
status=
waited=0
while [ -z "$status" ]; do
  sleep "$POLL"
  waited=$((waited + POLL))
  chunk=$(vm_ps << POWERSHELL || true
\$p = Join-Path \$HOME 'ytloop\\tmp\\run.log'
if (Test-Path \$p) { Get-Content \$p | Select-Object -Skip $seen }
\$e = Join-Path \$HOME 'ytloop\tmp\exit.code'
if (Test-Path \$e) { '@@EXIT:' + (Get-Content \$e) }
POWERSHELL
)
  if [ -n "$chunk" ]; then
    printf '%s\n' "$chunk" | grep -v '^@@EXIT:' || true
    seen=$((seen + $(printf '%s\n' "$chunk" | grep -vc '^@@EXIT:' || true)))
    status=$(sed -n 's/^@@EXIT:\([0-9-]*\).*/\1/p' <<< "$chunk" | tail -1 | tr -d '\r')
  fi
  if [ -z "$status" ] && [ "$waited" -ge "$TIMEOUT" ]; then
    echo "vm run: gave up after ${TIMEOUT}s; stopping the task" >&2
    vm_ps << POWERSHELL || true
schtasks /End /TN $TASK | Out-Null
POWERSHELL
    status=124
  fi
done

vm_ps << POWERSHELL || true
schtasks /Delete /TN $TASK /F | Out-Null
POWERSHELL
"$ROOT/vm/windows/fetch.sh" || true
exit "${status:-0}"
