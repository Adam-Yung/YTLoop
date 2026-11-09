#!/usr/bin/env bash
# Copies the evidence of VM runs (screenshots, recordings, results.tsv, logs) to <repo>/tmp/vm-results so it can be looked at here.
. "$(dirname "$0")/lib.sh"

mkdir -p "$ROOT/tmp/vm-results"
rsync -az -e "ssh -o BatchMode=yes" "$VM_SSH:$REMOTE/visual/results/" "$ROOT/tmp/vm-results/"
echo "evidence: $ROOT/tmp/vm-results (newest run folder is last by name)"
