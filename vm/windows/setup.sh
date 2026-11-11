#!/usr/bin/env bash
# One-time (and idempotent) toolchain install on the Windows VM, under ~\tools of the logged-in user: Node, yt-dlp, ffmpeg, npm deps, Playwright Chromium.
# No installer, no admin rights, nothing outside the user's home. Downloads are verified against the publishers' checksums.
. "$(dirname "$0")/lib.sh"

lease_acquire "ytloop setup"
"$ROOT/vm/windows/sync.sh"

vm_ps << 'POWERSHELL'
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$T = Join-Path $HOME 'tools'
$dl = "$T\dl"
New-Item -ItemType Directory -Force "$T\bin", $dl | Out-Null

function Get-Checked($url, $file, $expected) {
  Invoke-WebRequest $url -OutFile $file -UseBasicParsing
  if ((Get-FileHash $file -Algorithm SHA256).Hash -ne $expected.ToUpper()) { throw "checksum mismatch for $url" }
}

if (-not (Test-Path "$T\node\node.exe")) {
  $base = 'https://nodejs.org/dist/latest-v22.x'
  Invoke-WebRequest "$base/SHASUMS256.txt" -OutFile "$dl\SHASUMS256.txt" -UseBasicParsing
  $hash, $name = (Get-Content "$dl\SHASUMS256.txt" | Where-Object { $_ -match 'win-x64\.zip$' } | Select-Object -First 1) -split '\s+'
  Get-Checked "$base/$name" "$dl\$name" $hash
  Remove-Item "$dl\node-x" -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory "$dl\node-x" | Out-Null
  tar -xf "$dl\$name" -C "$dl\node-x"
  Remove-Item "$T\node" -Recurse -Force -ErrorAction SilentlyContinue
  Move-Item (Get-ChildItem "$dl\node-x" | Select-Object -First 1).FullName "$T\node"
}

if (-not (Test-Path "$T\bin\yt-dlp.exe")) {
  $base = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download'
  Invoke-WebRequest "$base/SHA2-256SUMS" -OutFile "$dl\SHA2-256SUMS" -UseBasicParsing
  $hash = ((Get-Content "$dl\SHA2-256SUMS" | Where-Object { $_ -match ' \*?yt-dlp\.exe$' } | Select-Object -First 1) -split '\s+')[0]
  Get-Checked "$base/yt-dlp.exe" "$T\bin\yt-dlp.exe" $hash
}

if (-not (Test-Path "$T\bin\ffmpeg.exe")) {
  try {
    $base = 'https://www.gyan.dev/ffmpeg/builds'
    $hash = ((Invoke-WebRequest "$base/ffmpeg-release-essentials.zip.sha256" -UseBasicParsing).Content.ToString().Trim() -split '\s+')[0]
    Get-Checked "$base/ffmpeg-release-essentials.zip" "$dl\ffmpeg.zip" $hash
    Remove-Item "$dl\ffmpeg-x" -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory "$dl\ffmpeg-x" | Out-Null
    tar -xf "$dl\ffmpeg.zip" -C "$dl\ffmpeg-x"
    Copy-Item (Get-ChildItem "$dl\ffmpeg-x" -Recurse -Filter ffmpeg.exe | Select-Object -First 1).FullName "$T\bin\ffmpeg.exe"
  } catch { Write-Warning "ffmpeg not installed, screen recordings will be missing: $($_.Exception.Message)" }
}

if (-not (Test-Path "$T\git\cmd\git.exe")) {
  $tag = ((Invoke-WebRequest 'https://github.com/git-for-windows/git/releases/latest' -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue).Headers.Location) -replace '.*/tag/', ''
  $html = (Invoke-WebRequest "https://github.com/git-for-windows/git/releases/expanded_assets/$tag" -UseBasicParsing).Content
  $m = [regex]::Match($html, 'href="([^"]*/MinGit-[\d.]+-64-bit\.zip)"[\s\S]{0,3000}?sha256:([0-9a-f]{64})')
  if (-not $m.Success) { throw 'MinGit asset not found on the git-for-windows release page' }
  Get-Checked ('https://github.com' + $m.Groups[1].Value) "$dl\mingit.zip" $m.Groups[2].Value
  Remove-Item "$T\git" -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory "$T\git" | Out-Null
  tar -xf "$dl\mingit.zip" -C "$T\git"
}

$env:PATH = "$T\node;$T\bin;$T\git\cmd;$env:PATH"
$env:NODE_OPTIONS = '--use-system-ca'
Set-Location (Join-Path $HOME 'ytloop')
npm ci --no-audit --no-fund --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
npx playwright install chromium
if ($LASTEXITCODE -ne 0) { throw 'playwright install failed' }
Set-ItemProperty 'HKCU:\Control Panel\Desktop' -Name ScreenSaveActive -Value '0'
Remove-Item "$dl\*" -Recurse -Force -ErrorAction SilentlyContinue
"node $(node -v)  npm $(npm -v)  yt-dlp $(yt-dlp --version)  ffmpeg $(if (Test-Path "$T\bin\ffmpeg.exe") { 'yes' } else { 'no' })"
POWERSHELL
