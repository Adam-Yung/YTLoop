#!/usr/bin/env bash


function play_video() {
    delay=$(( 30 + RANDOM % 21 ))
    vid="$1"

    if [[ "$vid" == *"?"* ]]; then
        url="${vid}&autoplay=1"
    else
        url="${vid}?autoplay=1"
    fi
    
    eval "${BROWSER} ${url}" &
    browser_pid=$!
    
    printf "Playing video \"${vid}\"\n"
    sleep ${delay}

    win_id="$(xdotool search --pid ${browser_pid})"
    if [[ -z $win_id ]]; then 
        win_id=$(xdotool search --onlyvisible --class "$BROWSER" | tail -n 1)
    fi

    if [[ -z $win_id ]]; then
        kill $browser_pid
        wait $browser_pid
        return
    fi

    xdotool key --window "$win_id" --clearmodifiers ctrl+w
}

function worker() {
    readarray -t vids < <(yt-dlp --flat-playlist --no-warnings --print url "${playlist_url} | sort -R") 

    for v in ${vids[@]}; do 
        play_video "$v"
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

