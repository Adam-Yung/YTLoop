# visual/lib/win.js

The Windows side of the real-screen checks. One long-lived `powershell.exe` is started on first use; `call(line)` sends it one line and resolves with the lines printed before its `@@DONE` marker (an error line `@@ERR <message>` rejects, 90 s timeout, which a full-size screenshot of the 3838x1881 VM display can need while the 2 CPU VM decodes video; the helper is killed when node exits). `quote(text)` makes a PowerShell single-quoted string. Starting PowerShell and compiling the Win32 helper (`Add-Type`) per call cost over a second, which the 1.5 s screenshot sampler cannot afford.

Functions it defines (called by `capture.js` and `awake.js`): `Shot file width` (primary display, optional downscale, PNG), `BrowserPid dir` (main `chrome.exe` whose command line has `--user-data-dir=<dir>` and no `--type=`), `Raise pid` (restore if minimized, a tap of Alt so Windows allows the focus change, `SetForegroundWindow`), `FrontPid`, `Nudge` (1 px mouse move and back), `Locked` (`OpenInputDesktop` fails while the lock screen or a UAC prompt owns the input desktop), `Saver` and `KillSaver` (processes whose path ends in `.scr`), `Awake` (`SetThreadExecutionState`, which is per thread: the helper runs every command on its main thread so the setting persists).

The helper and its pipes are `unref`'d so they never keep node alive: without that, `npm run verify` finished its checks and then never exited, and the job on the VM hung.

The helper marks itself DPI aware so screenshots are in physical pixels; `capture.js` divides by the page's `screen.width` to get the scale.
