#!/usr/bin/env bash
# Copies the working tree to the VM (~/ytloop). Generated state on the VM (node_modules, profile, results) is left alone.
. "$(dirname "$0")/lib.sh"
use_windows_vm "$@"

rsync -az --delete -e "ssh -o BatchMode=yes" \
  --exclude .git --exclude node_modules --exclude .profile --exclude tmp --exclude visual/results \
  --exclude test-results --exclude Unix --exclude Windows --exclude youtube_auto_watch_bundle \
  "$ROOT/" "$VM_SSH:$REMOTE/"
