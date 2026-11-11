# vm/windows/fetch.sh

Copies `~\ytloop\visual\results` from the Windows VM to `<repo>/tmp/vm-results` (git-ignored): the VM packs it with `tar`, the host fetches it with `scp` and unpacks it. Same purpose and cleanup rule as `vm/fetch.sh`.
