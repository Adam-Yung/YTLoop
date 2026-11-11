'use strict';

// One long-lived PowerShell for the Windows screen checks: a line goes in, the result lines and a @@DONE marker come out. Starting PowerShell and compiling the Win32 helper for every call took over a second, too slow for the 1.5 s sampler.

const { spawn } = require('node:child_process');

const INIT = String.raw`
Add-Type -ReferencedAssemblies System.Drawing,System.Windows.Forms -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class Y {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, int x, int y, uint d, UIntPtr e);
  [DllImport("user32.dll")] public static extern void keybd_event(byte k, byte s, uint f, UIntPtr e);
  [DllImport("user32.dll")] public static extern IntPtr OpenInputDesktop(uint f, bool i, uint a);
  [DllImport("user32.dll")] public static extern bool CloseDesktop(IntPtr h);
  [DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);
}
'@
[void][Y]::SetProcessDPIAware()
function Shot($f, $w) {
  $b = [Windows.Forms.Screen]::PrimaryScreen.Bounds
  $bmp = New-Object Drawing.Bitmap $b.Width, $b.Height
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($b.Location, [Drawing.Point]::Empty, $b.Size)
  $g.Dispose()
  if ($w -gt 0) { $s = New-Object Drawing.Bitmap $bmp, $w, ([int]($b.Height * $w / $b.Width)); $bmp.Dispose(); $bmp = $s }
  $bmp.Save($f, [Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
function BrowserPid($dir) {
  $p = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine.Contains('--user-data-dir=' + $dir) -and -not $_.CommandLine.Contains('--type=') } | Select-Object -First 1
  if ($p) { $p.ProcessId } else { 'none' }
}
function Raise($id) {
  $h = (Get-Process -Id $id).MainWindowHandle
  if ($h -eq 0) { return }
  if ([Y]::IsIconic($h)) { [void][Y]::ShowWindow($h, 9) }
  [Y]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero)
  [Y]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)
  [void][Y]::SetForegroundWindow($h)
}
function FrontPid { $p = [uint32]0; [void][Y]::GetWindowThreadProcessId([Y]::GetForegroundWindow(), [ref]$p); $p }
function Nudge { [Y]::mouse_event(1, 1, 0, 0, [UIntPtr]::Zero); [Y]::mouse_event(1, -1, 0, 0, [UIntPtr]::Zero) }
function Locked { $h = [Y]::OpenInputDesktop(0, $false, 0x100); if ($h -eq [IntPtr]::Zero) { 'true' } else { [void][Y]::CloseDesktop($h); 'false' } }
function Saver { if (@(Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*.scr' }).Count) { 'true' } else { 'false' } }
function KillSaver { Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*.scr' } | Stop-Process -Force }
function Awake($on) { if ($on) { [void][Y]::SetThreadExecutionState(0x80000003) } else { [void][Y]::SetThreadExecutionState(0x80000000) } }
while ($true) {
  $line = [Console]::In.ReadLine()
  if ($null -eq $line) { break }
  try { Invoke-Expression $line; '@@DONE' } catch { '@@ERR ' + $_.Exception.Message }
}
`;

const TIMEOUT_MS = 90000;
let proc = null;
let queue = Promise.resolve();

const quote = text => `'${String(text).replace(/'/g, "''")}'`;

function ensure() {
  if (proc && proc.exitCode === null) return proc;
  proc = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', Buffer.from(INIT, 'utf16le').toString('base64')], {
    stdio: ['pipe', 'pipe', 'ignore'],
    windowsHide: true,
  });
  proc.stdout.setEncoding('utf8');
  proc.stdin.on('error', () => {});
  proc.unref();
  proc.stdout.unref();
  proc.stdin.unref();
  return proc;
}

function exchange(line) {
  const child = ensure();
  return new Promise((resolve, reject) => {
    let out = '';
    const finish = (fn, value) => {
      clearTimeout(timer);
      child.stdout.off('data', onData);
      child.off('exit', onExit);
      fn(value);
    };
    const onData = chunk => {
      out += chunk;
      const at = out.search(/^@@(DONE|ERR)/m);
      if (at < 0) return;
      const status = out.slice(at).trim();
      if (status === '@@DONE') finish(resolve, out.slice(0, at).trim());
      else finish(reject, new Error(status.slice(6)));
    };
    const onExit = () => finish(reject, new Error('PowerShell helper exited'));
    const timer = setTimeout(() => { child.kill(); finish(reject, new Error(`PowerShell helper timed out on: ${line}`)); }, TIMEOUT_MS);
    child.stdout.on('data', onData);
    child.once('exit', onExit);
    child.stdin.write(`${line}\n`);
  });
}

const call = line => {
  const next = queue.then(() => exchange(line));
  queue = next.catch(() => {});
  return next;
};

process.on('exit', () => { if (proc) proc.kill(); });

module.exports = { call, quote };
