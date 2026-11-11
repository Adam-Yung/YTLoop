#!/usr/bin/env bash
# Copies the working tree to the Windows VM (~\ytloop) as one tar archive. Generated state on the VM (node_modules, profile, logs, results) is left alone; synced files that no longer exist here are removed.
. "$(dirname "$0")/lib.sh"

mkdir -p "$ROOT/tmp"
cd "$ROOT"
tar -czf tmp/sync.tgz --exclude=./.git --exclude=./node_modules --exclude=./.profile --exclude=./tmp --exclude=./logs \
  --exclude=./visual/results --exclude=./test-results --exclude=./Unix --exclude=./Windows --exclude=./youtube_auto_watch_bundle \
  --exclude='./.env.*' --exclude='*.bak' .
scp -q -o BatchMode=yes -o LogLevel=ERROR tmp/sync.tgz "$VM_SSH:ytloop-sync.tgz"
rm -f tmp/sync.tgz

vm_ps << 'POWERSHELL'
$ErrorActionPreference = 'Stop'
$d = Join-Path $HOME 'ytloop'
New-Item -ItemType Directory -Force $d, "$d\tmp", "$d\visual\results" | Out-Null
$keep = 'node_modules', '.profile', 'tmp', 'logs', 'test-results'
Get-ChildItem $d -Force | Where-Object { $keep -notcontains $_.Name -and $_.Name -ne 'visual' } | Remove-Item -Recurse -Force
if (Test-Path "$d\visual") { Get-ChildItem "$d\visual" -Force | Where-Object { $_.Name -ne 'results' } | Remove-Item -Recurse -Force }
tar -xzf (Join-Path $HOME 'ytloop-sync.tgz') -C $d
if ($LASTEXITCODE -ne 0) { throw 'tar extract failed' }
Remove-Item (Join-Path $HOME 'ytloop-sync.tgz')
POWERSHELL
