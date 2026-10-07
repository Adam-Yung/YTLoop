#!/usr/bin/env bash

play_vid() {
    delay=$(( 30 + RANDOM % 21 ))
    url="$1"
osascript << EOF
    tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
    end tell

    tell application "$BROWSER"
        activate
        open location "$url"
    end tell

    delay ${delay:-1}

    tell application "$BROWSER"
        if (count of windows) > 0 then
            close active tab of front window
        end if
    end tell

    tell application frontApp to activate
EOF
}

worker() {
    playlist_url="$PLAYLIST_URL"
    vids="$(yt-dlp -i --flat-playlist --no-warnings --print url "${playlist_url}" | sort -R)"


    for url in ${vids}; do
        printf "Now playing: $url\n"
        play_vid "$url"
    done
}

main() {
    if [[ -z "$BROWSER" || -z "$PLAYLIST_URL" ]]; then
        printf "Please configure .env\n"
        return
    fi

    while true; do
        worker
    done
}
main
