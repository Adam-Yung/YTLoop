#!/usr/bin/env bash
# Runs an npm script of this repo on the VM, in the console user's GUI session, under the shared VM lease.
# Usage: vm/run.sh [--bg] <npm script> [args]   (--bg detaches on the VM and polls its log, for runs longer than a few minutes)
. "$(dirname "$0")/lib.sh"

background=0
[ "${1:-}" = "--bg" ] && { background=1; shift; }
script=${1:?usage: vm/run.sh [--bg] <npm script> [args]}
shift

lease_acquire "ytloop $script"
"$ROOT/vm/sync.sh"

job=$(cat << EOF
cd ~/$REMOTE
export YTLOOP_VM=1 PATH="\$HOME/tools/node/bin:\$HOME/tools/bin:\$PATH"
npm run $script -- $*
EOF
)

status=0
if [ "$background" = 0 ]; then
  as_console_user <<< "$job" || status=$?
else
  vm_ssh "mkdir -p ~/$REMOTE/tmp && cat > ~/$REMOTE/tmp/job.sh" <<< "$job; echo EXIT:\$?"
  vm_ssh "rm -f ~/$REMOTE/tmp/run.log; u=\$(stat -f%Su /dev/console); nohup sudo launchctl asuser \"\$(id -u \$u)\" sudo -u \$u -H bash ~/$REMOTE/tmp/job.sh > ~/$REMOTE/tmp/run.log 2>&1 < /dev/null &"
  seen=0
  until vm_ssh "grep -q '^EXIT:' ~/$REMOTE/tmp/run.log" 2> /dev/null; do
    sleep 10
    total=$(vm_ssh "wc -c < ~/$REMOTE/tmp/run.log" 2> /dev/null || echo "$seen")
    [ "$total" -gt "$seen" ] && vm_ssh "tail -c +$((seen + 1)) ~/$REMOTE/tmp/run.log" 2> /dev/null && seen=$total
  done
  vm_ssh "tail -c +$((seen + 1)) ~/$REMOTE/tmp/run.log"
  status=$(vm_ssh "sed -n 's/^EXIT://p' ~/$REMOTE/tmp/run.log" | tail -1)
fi

"$ROOT/vm/fetch.sh" || true
exit "${status:-0}"
