
#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent
DetectHiddenWindows True

global manager := 0
global lv := 0
global includeBtn := 0
global statusText := 0
global includeSelf := false
global rowInfo := Map()

; Alt + Shift + S
!+s::ShowManager()

ShowManager(*) {
    global manager, lv, includeBtn, statusText

    if IsObject(manager) {
        RefreshScripts()
        manager.Show()
        WinActivate("ahk_id " manager.Hwnd)
        return
    }

    manager := Gui(, "AutoHotkey Script Manager")
    manager.BackColor := "F7F9FC"
    manager.SetFont("s10", "Segoe UI")

    manager.AddText("x18 y15 w740",
        "Running AutoHotkey Scripts")

    manager.SetFont("s9", "Segoe UI")
    manager.AddText("x18 y43 w740",
        "Check the scripts to control, then choose an action.")

    lv := manager.AddListView(
        "x18 y75 w754 h300 Checked Grid NoSortHdr",
        ["Script", "Status", "PID", "Path"]
    )

    lv.ModifyCol(1, 190)
    lv.ModifyCol(2, 90)
    lv.ModifyCol(3, 70)
    lv.ModifyCol(4, 380)

    manager.AddButton("x18 y389 w90 h32", "Refresh")
        .OnEvent("Click", (*) => RefreshScripts())

    manager.AddButton("x118 y389 w95 h32", "Select All")
        .OnEvent("Click", SelectAll)

    manager.AddButton("x223 y389 w95 h32", "Clear")
        .OnEvent("Click", ClearAll)

    statusText := manager.AddText(
        "x335 y397 w430", "")

    includeBtn := manager.AddButton(
        "x18 y440 w185 h34",
        "Include this script"
    )
    includeBtn.OnEvent("Click", ToggleSelf)

    manager.AddButton("x455 y440 w95 h34", "Pause")
        .OnEvent("Click", (*) => RunAction("Pause"))

    manager.AddButton("x560 y440 w95 h34", "Resume")
        .OnEvent("Click", (*) => RunAction("Resume"))

    manager.AddButton("x665 y440 w107 h34", "Exit")
        .OnEvent("Click", (*) => RunAction("Exit"))

    manager.OnEvent("Close", HideManager)
    manager.OnEvent("Escape", HideManager)

    RefreshScripts()
    manager.Show("w790 h490")
}

HideManager(*) {
    global manager
    manager.Hide()
}

SelectAll(*) {
    global lv
    lv.Modify(0, "Check")
}

ClearAll(*) {
    global lv
    lv.Modify(0, "-Check")
}

ToggleSelf(*) {
    global includeSelf, includeBtn

    includeSelf := !includeSelf
    includeBtn.Text := includeSelf
        ? "✓ Include this script"
        : "Include this script"
}

GetSelectedScripts() {
    global lv, rowInfo

    selected := []
    row := 0

    while (row := lv.GetNext(row, "Checked")) {
        if rowInfo.Has(row)
            selected.Push(rowInfo[row])
    }

    return selected
}

RefreshScripts(*) {
    global lv, rowInfo, statusText

    ; Preserve checked scripts across refreshes.
    previous := Map()
    for script in GetSelectedScripts()
        previous[script.hwnd] := script.pid

    lv.Delete()
    rowInfo := Map()

    for hwnd in WinGetList("ahk_class AutoHotkey") {
        ; Never list the manager itself.
        if (hwnd = A_ScriptHwnd)
            continue

        try {
            title := WinGetTitle("ahk_id " hwnd)
            pid := WinGetPID("ahk_id " hwnd)

            path := RegExReplace(
                title, " - AutoHotkey v.*$")

            if (path = "")
                path := title

            SplitPath(path, &name)

            if (name = "")
                name := "(Unknown script)"

            paused := GetPausedState(hwnd)

            state := paused = 1 ? "Paused"
                : paused = 0 ? "Running"
                : "Unknown"

            checked := previous.Has(hwnd)
                && previous[hwnd] = pid

            row := lv.Add(
                checked ? "Check" : "",
                name, state, pid, path
            )

            rowInfo[row] := {
                hwnd: hwnd,
                pid: pid,
                name: name
            }
        }
    }

    statusText.Text :=
        rowInfo.Count " other script(s) found"
}

; Returns 1 = paused, 0 = running, -1 = unknown.
GetPausedState(hwnd) {
    try {
        ; Update the target script's menu checkmarks.
        SendMessage(0x211, 0, 0,,
            "ahk_id " hwnd,,,, 700)

        SendMessage(0x212, 0, 0,,
            "ahk_id " hwnd,,,, 700)

        mainMenu := DllCall(
            "GetMenu", "Ptr", hwnd, "Ptr")

        if !mainMenu
            return -1

        fileMenu := DllCall(
            "GetSubMenu", "Ptr", mainMenu,
            "Int", 0, "Ptr")

        if !fileMenu
            return -1

        ; 65403 = Pause Script menu command.
        state := DllCall(
            "GetMenuState",
            "Ptr", fileMenu,
            "UInt", 65403,
            "UInt", 0,
            "UInt"
        )

        if (state = 0xFFFFFFFF)
            return -1

        ; MF_CHECKED = 0x8
        return (state & 0x8) ? 1 : 0

    } catch {
        return -1
    }
}

RunAction(action) {
    global includeSelf, manager

    scripts := GetSelectedScripts()

    if (scripts.Length = 0
        && !(action = "Exit" && includeSelf)) {
        MsgBox("No scripts selected.",
            "Script Manager", "Icon!")
        return
    }

    if (action = "Exit") {
        message := "Exit " scripts.Length " selected script(s)?"

        if includeSelf
            message .= "`n`nThe manager will also exit LAST."

        if (MsgBox(message, "Confirm Exit",
            "YesNo Icon! Default2") != "Yes")
            return
    }

    failures := []

    for script in scripts {
        hwnd := script.hwnd

        ; Extra protection against self-targeting.
        if (hwnd = A_ScriptHwnd)
            continue

        try {
            target := "ahk_id " hwnd

            ; Verify the window still belongs to this PID.
            if !WinExist(target)
                throw Error("Script no longer exists.")

            if (WinGetPID(target) != script.pid)
                throw Error("Script process has changed.")

            if (action = "Exit") {
                ; Try a graceful exit first.
                WinClose(target, , 1)

                ; Force close if it did not exit.
                if WinExist(target)
                    WinKill(target)

                continue
            }

            current := GetPausedState(hwnd)

            if (current = -1)
                throw Error("Could not read pause state.")

            desired := action = "Pause" ? 1 : 0

            ; Only toggle when a change is needed.
            if (current != desired) {
                SendMessage(
                    0x111, 65403, 0,,
                    target,,,, 1000
                )
            }

        } catch as err {
            failures.Push(script.name ": " err.Message)
        }
    }

    if (failures.Length > 0) {
        msg := ""
        for failure in failures
            msg .= failure "`n"

        MsgBox(msg, "Action Errors", "Icon!")
    }

    ; Always exit ourselves last, if requested.
    if (action = "Exit" && includeSelf) {
        manager.Hide()
        ExitApp()
    }

    RefreshScripts()
}
