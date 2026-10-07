LoadEnv(path := ".env") {
    env := Map()

    if !FileExist(path)
        throw Error(".env file not found: " path)

    for line in StrSplit(FileRead(path), "`n", "`r") {
        line := Trim(line)

        ; Skip blank lines and comments
        if (line = "" || SubStr(line, 1, 1) = "#")
            continue

        pos := InStr(line, "=")
        if !pos
            continue

        key := Trim(SubStr(line, 1, pos - 1))
        value := Trim(SubStr(line, pos + 1))

        ; Remove surrounding quotes
        if ((SubStr(value, 1, 1) = '"' && SubStr(value, -1) = '"')
            || (SubStr(value, 1, 1) = "'" && SubStr(value, -1) = "'"))
            value := SubStr(value, 2, StrLen(value) - 2)

        env[key] := value
    }

    return env
}
