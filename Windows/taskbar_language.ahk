
#Requires AutoHotkey v2.0
#SingleInstance Force

DetectHiddenWindows(true)

; Restore taskbar when the script exits
OnExit(RestoreTaskbar)

; ==========================================
; Win + Space: Toggle taskbar visibility
; ==========================================
$#Space::
{
    static taskbarHidden := false

    taskbarHidden := !taskbarHidden
    SetTaskbarVisible(!taskbarHidden)
}

; ==========================================
; Ctrl + Space: Cycle input languages
; ==========================================
^Space::
{
    ; Wait for Ctrl release to avoid modifier conflicts
    KeyWait("Ctrl")

    ; Windows' built-in language cycling shortcut
    Send("#{Space}")
}

; ==========================================
; Show/hide taskbars on all monitors
; ==========================================
SetTaskbarVisible(visible)
{
    for className in ["Shell_TrayWnd", "Shell_SecondaryTrayWnd"]
    {
        for hwnd in WinGetList("ahk_class " className)
        {
            try
            {
                if visible
                    WinShow("ahk_id " hwnd)
                else
                    WinHide("ahk_id " hwnd)
            }
        }
    }
}

; ==========================================
; Restore taskbar on script exit
; ==========================================
RestoreTaskbar(*)
{
    SetTaskbarVisible(true)
}

