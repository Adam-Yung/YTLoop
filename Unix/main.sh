#!/usr/bin/env bash


function get_delay() {
    echo $(( WATCH_DURATION_BASE + RANDOM % WATCH_DURATION_VARIANCE ))
}

function play_video_linux() {
    vid="$1"
    
    if ! command -v "$BROWSER"; then
        return 1
    fi

    if [[ "$vid" == *"?"* ]]; then
        url="${vid}&autoplay=1"
    else
        url="${vid}?autoplay=1"
    fi
    
    front_window=$(xdotool getactivewindow)

    eval "${BROWSER} ${url}" &
    browser_pid=$!
    
    sleep 1
    wmctrl -r :ACTIVE: -e 0,0,0,600,400

    printf "Playing video \"${vid}\"\n"
    sleep $(get_delay)

    win_id="$(xdotool search --pid ${browser_pid})"
    if [[ -z $win_id ]]; then 
        win_id=$(xdotool search --onlyvisible --class "$BROWSER" | tail -n 1)
    fi

    if [[ -z $win_id ]]; then
        kill $browser_pid
        wait $browser_pid
        return 0
    fi

    xdotool key --window "$win_id" --clearmodifiers ctrl+w
    xdotool windowactivate "$front_window"

    return 0
}

play_video_mac() {
    url="$1"
    tab_current="$( [[ "$BROWSER" == "Safari" ]] && echo "current" || echo "active" )"

    if ! osascript << EOF
    if not (application "$BROWSER" exists) then
        error "Application '$BROWSER' not found" number 1
    end if
    
    tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
    end tell

    tell application "$BROWSER"
        activate
        open location "$url"

        if (count of windows) > 0 then
            set bounds of front window to {0, 0, 600, 400}
        end if
    end tell

    delay $(get_delay)

    tell application "$BROWSER"
        if (count of windows) > 0 then
            close ${tab_type} tab of front window
        end if
    end tell

    tell application frontApp to activate
EOF
    then
        return 1
    else
        return 0
    fi
}

worker() {
    playlist_url="$PLAYLIST_URL"
    vids="$(yt-dlp -i --flat-playlist --no-warnings --print url "${playlist_url}" | sort -R)"


    for url in ${vids}; do
        printf "Now playing: $url\n"
        case "$(uname)" in
            *Darwin*)
                play_video_mac "$url"
            ;;
            *)
                play_video_linux "$url"
            ;;
        esac

        if [[ $? -ne 0 ]]; then
            exit 1
        fi
    done
}

main() {
    SCRIPT_DIR="$(dirname -- "${BASH_SOURCE[0]}")"
    ENV="${SCRIPT_DIR}/../.env"
    if [[ -f "${ENV}" ]]; then
        source "${ENV}" 
    fi

    if [[ -z "$BROWSER" || -z "$PLAYLIST_URL" ]]; then
        printf "Please configure .env\n"
        exit 1
    fi

    while true; do
        worker
    done
}
main
