#!/usr/bin/env bash
# Copies the evidence of VM runs (screenshots, recordings, results.tsv, logs) from the Windows VM to <repo>/tmp/vm-results so it can be looked at here.
. "$(dirname "$0")/lib.sh"

mkdir -p "$ROOT/tmp/vm-results"
cd "$ROOT/tmp"
vm_ps << 'POWERSHELL'
$r = Join-Path $HOME 'ytloop\visual\results'
$t = Join-Path $HOME 'ytloop-results.tgz'
Remove-Item $t -ErrorAction SilentlyContinue
if (Test-Path $r) { tar -czf $t -C $r . }
POWERSHELL
if scp -q -o BatchMode=yes -o LogLevel=ERROR "$VM_SSH:ytloop-results.tgz" vm-results.tgz 2> /dev/null; then
  tar -xzf vm-results.tgz -C vm-results
  rm -f vm-results.tgz
fi
echo "evidence: $ROOT/tmp/vm-results (newest run folder is last by name)"
