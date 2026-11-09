#!/usr/bin/env bash
# One-time (and idempotent) toolchain install on the VM, under ~/tools of the console user: Node, yt-dlp, npm deps, Playwright Chromium.
# No Homebrew, no sudo, nothing outside the user's home. Downloads are verified against the publishers' checksums.
. "$(dirname "$0")/lib.sh"

lease_acquire "ytloop setup"
"$ROOT/vm/sync.sh"

CACHE=Library/Caches/ms-playwright
if [ -d "$HOME/$CACHE" ]; then
  vm_ssh "mkdir -p ~/Library/Caches"
  rsync -a -e "ssh -o BatchMode=yes" "$HOME/$CACHE/" "$VM_SSH:$CACHE/"
fi

vm_ssh 'bash -s' << 'REMOTE_SCRIPT'
set -euo pipefail
T=$HOME/tools
mkdir -p "$T/bin" "$T/dl"
cd "$T/dl"

if [ ! -x "$T/node/bin/node" ]; then
  base=https://nodejs.org/dist/latest-v22.x
  curl -fsSL -o SHASUMS256.txt "$base/SHASUMS256.txt"
  file=$(awk '/darwin-arm64\.tar\.gz$/ {print $2}' SHASUMS256.txt)
  curl -fsSL -O "$base/$file"
  grep " $file\$" SHASUMS256.txt | shasum -a 256 -c -
  rm -rf "$T/node"
  mkdir "$T/node"
  tar -xzf "$file" -C "$T/node" --strip-components=1
fi

if [ ! -x "$T/bin/yt-dlp" ]; then
  base=https://github.com/yt-dlp/yt-dlp/releases/latest/download
  curl -fsSL -o yt-dlp_macos "$base/yt-dlp_macos"
  curl -fsSL -o SHA2-256SUMS "$base/SHA2-256SUMS"
  grep ' yt-dlp_macos$' SHA2-256SUMS | shasum -a 256 -c -
  install -m 755 yt-dlp_macos "$T/bin/yt-dlp"
fi

export PATH="$T/node/bin:$T/bin:$PATH"
export NODE_OPTIONS=--use-system-ca
cd "$HOME/ytloop"
npm ci --no-audit --no-fund --ignore-scripts
npx playwright install chromium
defaults -currentHost write com.apple.screensaver idleTime 0
echo "node $(node -v)  npm $(npm -v)  yt-dlp $(yt-dlp --version)"
REMOTE_SCRIPT
