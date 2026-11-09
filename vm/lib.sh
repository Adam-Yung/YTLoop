#!/usr/bin/env bash
# Shared settings and helpers for the host-side VM scripts: .env loading, ssh, and the VM lease shared with prisma-encryptor.
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
[ -f "$ROOT/.env" ] && { set -a; . "$ROOT/.env"; set +a; }
: "${VM_SSH:?Set VM_SSH in .env to the ssh alias of the test VM}"

REMOTE=ytloop
LEASE_DIR=${PRISMA_VM_LEASE_DIR:-/tmp/prisma-vm-lease}

vm_ssh() { ssh -o BatchMode=yes -o ConnectTimeout=10 "$VM_SSH" "$@"; }

as_console_user() {
  vm_ssh 'u=$(stat -f%Su /dev/console); sudo launchctl asuser "$(id -u "$u")" sudo -u "$u" -H bash -s'
}

lease_field() { sed -n "$1p" "$LEASE_DIR/holder" 2> /dev/null; }
lease_alive() { [ -n "${1:-}" ] && kill -0 "$1" 2> /dev/null; }

lease_reclaim() {
  mkdir "$LEASE_DIR.guard" 2> /dev/null || return 0
  local pid
  pid=$(lease_field 1)
  if [ -n "$pid" ] && ! lease_alive "$pid"; then rm -rf "$LEASE_DIR"; fi
  rmdir "$LEASE_DIR.guard"
}

lease_release() { [ "$(lease_field 1)" = "$$" ] && rm -rf "$LEASE_DIR"; return 0; }

lease_acquire() {
  local name=${1:-ytloop} waited=0 pid
  until mkdir "$LEASE_DIR" 2> /dev/null; do
    pid=$(lease_field 1)
    if [ -n "$pid" ] && ! lease_alive "$pid"; then lease_reclaim; continue; fi
    if [ "$waited" -ge "${VM_LEASE_WAIT:-3600}" ]; then echo "vm lease: gave up; held by $(lease_field 2)" >&2; return 3; fi
    [ $((waited % 30)) -eq 0 ] && echo "vm lease: waiting for $(lease_field 2) (pid $pid)" >&2
    sleep 1; waited=$((waited + 1))
  done
  printf '%s\n%s\n%s\n' "$$" "$name" "$(date +%s)" > "$LEASE_DIR/holder"
  trap lease_release EXIT
}
