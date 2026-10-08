#Requires AutoHotkey v2.0
#SingleInstance Force

#Include shuffle.ahk
#Include RefreshEnvPath.ahk
#Include LoadEnv.ahk

RefreshEnvPath()
env :=LoadEnv(A_ScriptDir "\.." "\.env")

/**
 * Opens Edge in a new minimized window, waits 10-30 seconds, and closes it.
 * Uses an asynchronous timer so your main script never pauses.
 * 
 * @param url The website to open.
 */

OpenEdgeBackground(url) {
    try {
        oldWindows := Map()

        for hwnd in WinGetList("ahk_exe msedge.exe")
            oldWindows[hwnd] := true

        ; Launch Edge.
        Run('msedge.exe --new-window "' url '"')

        ; Look for a new HWND, with a 10-second timeout.
        newEdgeHwnd := 0
        deadline := A_TickCount + 10000

        while (A_TickCount < deadline) {
            for hwnd in WinGetList("ahk_exe msedge.exe") {
                if !oldWindows.Has(hwnd) {
                    newEdgeHwnd := hwnd
                    break
                }
            }

            if newEdgeHwnd
                break

            Sleep(100)
        }

        ; Exit if no new window was identified.
        if !newEdgeHwnd
            return

        target := "ahk_id " newEdgeHwnd

        ; Restore and resize the window.
        WinRestore(target)
        WinMove(0, 0, 600, 400, target)

        ; Wait 40–60 seconds.
        Sleep(Random(40000, 60000))

        ; Close only if the window still exists.
        if WinExist(target)
            WinClose(target)

    } catch {
        ; Silently return on any AHK exception.
        return
    }
}

YuetYumUrl := env["PLAYLIST_URL"]

RetrieveYouTubePlaylist(url) {
    ytDlpExe := "yt-dlp.exe"
    customArgs := "-i --flat-playlist --no-warnings --print url"
    tempFile := A_Temp "\yt_dlp_" A_TickCount ".txt"

    fullCommand := A_ComSpec ' /c ""' ytDlpExe '" ' customArgs ' "' url '" > "' tempFile '" 2>&1"'

    RunWait(fullCommand, A_ScriptDir, "Hide")

    commandOutput := ""
    urls := []
    if FileExist(tempFile) {
        commandOutput := FileRead(tempFile, "UTF-8")
        FileDelete(tempFile)

        urls := StrSplit(Trim(commandOutput, "`r`n"), "`n", "`r")
    }
    else {
        return []
    }

    return Shuffle_Array(urls)
}


main() {
    if (!YuetYumUrl) {
        MsgBox("Please set .env", "Configuration Error")
    }
    
    while true {
        urls := RetrieveYouTubePlaylist(YuetYumUrl)

        Loop urls.Length {
            OpenEdgeBackground(urls[A_Index])
        }
    }
}

main
