#Requires AutoHotkey v2.0

#Requires AutoHotkey v2.0

/**
 * Re-reads the system and user PATH keys from the registry and updates
 * the current AutoHotkey process's environment block.
 */
RefreshEnvPath() {
    regSystemPath := RegRead(
        "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment", 
        "Path", 
        ""
    )
    
    regUserPath := RegRead(
        "HKEY_CURRENT_USER\Environment", 
        "Path", 
        ""
    )
    
    combinedPath := regSystemPath (regUserPath != "" ? ";" regUserPath : "")
    if (combinedPath != "") {
        EnvSet("PATH", combinedPath)
    }
}
