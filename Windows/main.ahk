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
    activeHwnd := WinExist("A")

    groupName := "OldEdgeWindows"
    static knownHwnds := Map()
    
    existingEdgeWindows := WinGetList("ahk_exe msedge.exe")
    for hwnd in existingEdgeWindows {
        if !knownHwnds.Has(hwnd) {
            GroupAdd(groupName, "ahk_id " hwnd)
            knownHwnds[hwnd] := true
        }
    }
    
    Run('msedge.exe --new-window "' url '"')   ; Run new minimized Edge Window
    
    MaxWaitTimeOut := 10
    newEdgeHwnd := WinWait("ahk_exe msedge.exe", , MaxWaitTimeOut, , "ahk_group " groupName)
    
    if (!newEdgeHwnd) {
        return
    }
    knownHwnds[newEdgeHwnd] := true
    GroupAdd(groupName, "ahk_id " newEdgeHwnd)
    WinRestore("ahk_id " newEdgeHwnd)
    WinMove(0, 0, 600, 400, "ahk_id " newEdgeHwnd)
    
    ; WinMinimize("ahk_id " newEdgeHwnd)
    ; if (activeHwnd) {
    ;     WinActivate("ahk_id " activeHwnd)
    ; }
 
    CloseWindow() {
        if WinExist("ahk_id " newEdgeHwnd) {
            WinClose("ahk_id " newEdgeHwnd)
        }
    }
       
    delayMin := 40000
    delayMax := 60000
    delayMs := Random(delayMin, delayMax)
    Sleep(delayMs)
    CloseWindow
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
    urls := RetrieveYouTubePlaylist(YuetYumUrl)

    Loop urls.Length {
        OpenEdgeBackground(urls[A_Index])
    }
}

while true {
    main
}
