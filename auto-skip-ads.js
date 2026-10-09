// ==UserScript==
// @name         YouTube Ad Accelerator
// @namespace    local.youtube.autoskip
// @version      3.0
// @description  Accelerate each YouTube ad and verify actual playback progress
// @match        https://www.youtube.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // Prevent duplicate timers if the userscript is injected twice.
    if (window.__ytAdAcceleratorV3) return;
    window.__ytAdAcceleratorV3 = true;

    // ===== SETTINGS =====
    const SPEEDS = [16, 8, 4, 2];
    const START_DELAY_MS = [500, 1500];
    const CHECK_MS = 250;
    const VERIFY_MS = 1400;
    const MIN_EFFECTIVE_SPEED = 1.8;
    const REAPPLY_MS = 800;
    const DEBUG = true;
    // ====================

    const TAG = '[YT AdAccelerator]';
    const log = (...args) => DEBUG && console.log(TAG, ...args);
    const warn = (...args) => console.warn(TAG, ...args);
    const now = () => performance.now();
    const finite = n => Number.isFinite(n) && n >= 0;
    const playerSelector = '.html5-video-player';
    const videoSelector = 'video.html5-main-video';

    let player = null;
    let video = null;
    let observer = null;
    let ad = null;
    let adNumber = 0;
    let contentSpeed = 1;
    let contentCheck = null;
    const loadVersions = new WeakMap();

    function setRate(v, speed) {
        try {
            v.playbackRate = speed;
            return Math.abs(v.playbackRate - speed) < 0.01;
        } catch (err) {
            warn('Playback rate rejected:', speed, err);
            return false;
        }
    }

    function onLoadStart() {
        loadVersions.set(this, (loadVersions.get(this) || 0) + 1);
        tick();
    }

    function observeVideo(next) {
        if (video === next) return;

        if (video) {
            video.removeEventListener('loadstart', onLoadStart);
            video.removeEventListener('ratechange', tick);
            video.removeEventListener('playing', tick);
        }

        video = next;

        if (video) {
            video.addEventListener('loadstart', onLoadStart);
            video.addEventListener('ratechange', tick);
            video.addEventListener('playing', tick);
        }
    }

    function observePlayer(next) {
        if (player === next) return;

        if (observer) observer.disconnect();
        player = next;

        if (player) {
            observer = new MutationObserver(tick);
            observer.observe(player, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    function endAd(reason) {
        if (!ad) return;

        log(`Ad #${ad.number} finished: ${reason}`, {
            elapsedWallSeconds: +((now() - ad.startedAt) / 1000).toFixed(2),
            accelerationVerified: ad.verified,
            lastMediaTime: +ad.lastTime.toFixed(2)
        });

        ad = null;
    }

    function startAd(v, reason) {
        endAd(`next ad detected (${reason})`);

        // A new ad can reuse the same video element,
        // including its previous playback rate.
        if (v.playbackRate > 2) setRate(v, 1);

        const t = now();

        ad = {
            number: ++adNumber,
            video: v,
            src: v.currentSrc || '',
            loadVersion: loadVersions.get(v) || 0,
            duration: v.duration,
            startedAt: t,

            accelerateAt: t + START_DELAY_MS[0] +
                Math.random() * (START_DELAY_MS[1] - START_DELAY_MS[0]),

            lastTime: v.currentTime,
            lastProgressAt: t,
            index: 0,
            rateSetAt: -Infinity,
            probe: null,
            verified: false,
            abandoned: false,
            endWarning: false
        };

        log(`Ad #${ad.number} detected (${reason})`, {
            duration: v.duration,
            startTime: v.currentTime
        });
    }

    function changedAd(v) {
        if (!ad) return 'first ad';

        if (ad.video !== v)
            return 'new video element';

        if ((loadVersions.get(v) || 0) !== ad.loadVersion)
            return 'media reloaded';

        if (ad.src && v.currentSrc && ad.src !== v.currentSrc)
            return 'media source changed';

        // Detect the second ad when the same element
        // and media source are reused.
        if (
            finite(v.currentTime) &&
            v.currentTime < ad.lastTime - 1.5
        ) {
            return 'playhead restarted';
        }

        if (
            finite(v.duration) &&
            finite(ad.duration) &&
            Math.abs(v.duration - ad.duration) > 2 &&
            v.currentTime < 2
        ) {
            return 'duration changed near start';
        }

        return null;
    }

    function tryAcceleration(v, t) {
        if (!ad || ad.abandoned) return;
        if (ad.probe || t < ad.accelerateAt) return;

        for (; ad.index < SPEEDS.length; ad.index++) {
            const speed = SPEEDS[ad.index];

            if (!setRate(v, speed)) continue;

            ad.rateSetAt = t;
            ad.probe = {
                wall: t,
                media: v.currentTime
            };

            log(`Ad #${ad.number}: trying ${speed}x`);
            return;
        }

        ad.abandoned = true;
        setRate(v, 1);

        warn(
            `Ad #${ad.number}: no supported acceleration rate; letting ad play normally`
        );
    }

    function checkAcceleration(v, t) {
        if (!ad || !ad.probe || ad.abandoned) return;

        // Don't count buffering or seeking time
        // against the acceleration test.
        if (v.paused || v.seeking || v.readyState < 2) {
            ad.probe = {
                wall: t,
                media: v.currentTime
            };
            return;
        }

        const atEnd =
            finite(v.duration) &&
            v.duration > 0 &&
            v.currentTime >= v.duration - 0.35;

        const wallSeconds = (t - ad.probe.wall) / 1000;

        const mediaSeconds = Math.max(
            0,
            v.currentTime - ad.probe.media
        );

        const effectiveSpeed = wallSeconds > 0
            ? mediaSeconds / wallSeconds
            : 0;

        // Verify early: at 16x, a short ad may finish
        // before the full verification window.
        if (
            !ad.verified &&
            wallSeconds >= 0.35 &&
            effectiveSpeed >= MIN_EFFECTIVE_SPEED
        ) {
            ad.verified = true;

            log(`Ad #${ad.number}: acceleration verified`, {
                effectiveSpeed: +effectiveSpeed.toFixed(1),
                requestedSpeed: SPEEDS[ad.index]
            });
        }

        // Don't repeatedly accelerate an already-finished
        // ad while YouTube transitions.
        if (atEnd || v.ended) {
            if (
                !ad.endWarning &&
                t - ad.lastProgressAt > 2500
            ) {
                ad.endWarning = true;

                warn(
                    `Ad #${ad.number}: media ended, waiting for YouTube to advance the ad break`
                );
            }

            return;
        }

        // YouTube may reset playbackRate between ticks.
        // Reapply at a limited frequency.
        if (
            v.playbackRate < SPEEDS[ad.index] - 0.01 &&
            t - ad.rateSetAt >= REAPPLY_MS
        ) {
            setRate(v, SPEEDS[ad.index]);
            ad.rateSetAt = t;
        }

        if (
            ad.verified ||
            t - ad.probe.wall < VERIFY_MS
        ) {
            return;
        }

        warn(
            `Ad #${ad.number}: ${SPEEDS[ad.index]}x did not produce fast progress`,
            {
                effectiveSpeed: +effectiveSpeed.toFixed(1)
            }
        );

        ad.index++;
        ad.probe = null;

        // Try the next lower speed, or stop
        // after bounded attempts.
        tryAcceleration(v, t);
    }

    function tick() {
        try {
            const p = document.querySelector(playerSelector);
            observePlayer(p);

            const v = p?.querySelector(videoSelector) || null;
            observeVideo(v);

            const showingAd = !!p?.classList.contains('ad-showing');
            const t = now();

            if (!showingAd) {
                if (ad) {
                    const oldAdVideo = ad.video;

                    endAd('ad-showing cleared');

                    // Do not let accelerated ad playback
                    // leak into the real video.
                    if (oldAdVideo) {
                        setRate(oldAdVideo, contentSpeed);
                    }

                    if (v && v !== oldAdVideo) {
                        setRate(v, contentSpeed);
                    }

                    contentCheck = {
                        since: t,
                        video: v,
                        media: v?.currentTime ?? 0,
                        warned: false
                    };

                    adNumber = 0;

                } else if (
                    v &&
                    !contentCheck &&
                    finite(v.playbackRate) &&
                    v.playbackRate > 0
                ) {
                    // Remember user-selected content speed.
                    contentSpeed = v.playbackRate;
                }

                // Verify that the main content actually
                // progresses after the ad disappears.
                if (contentCheck && v) {
                    if (contentCheck.video !== v) {
                        contentCheck.video = v;
                        contentCheck.media = v.currentTime;
                        contentCheck.since = t;

                    } else if (
                        v.currentTime > contentCheck.media + 0.25
                    ) {
                        log('Main video progressing after ad');
                        contentCheck = null;

                    } else if (
                        !contentCheck.warned &&
                        t - contentCheck.since > 3000
                    ) {
                        contentCheck.warned = true;

                        warn(
                            'Ad overlay cleared, but main video has not progressed for 3s',
                            {
                                paused: v.paused,
                                readyState: v.readyState
                            }
                        );
                    }
                }

                return;
            }

            contentCheck = null;

            if (!v || !finite(v.currentTime)) return;

            const reason = changedAd(v);

            if (reason) {
                startAd(v, reason);
            }

            if (!ad.src && v.currentSrc) {
                ad.src = v.currentSrc;
            }

            if (finite(v.duration)) {
                ad.duration = v.duration;
            }

            if (v.currentTime > ad.lastTime + 0.05) {
                ad.lastProgressAt = t;
            }

            ad.lastTime = v.currentTime;

            tryAcceleration(v, t);
            checkAcceleration(v, t);

        } catch (err) {
            console.error(TAG, err);
        }
    }

    setInterval(tick, CHECK_MS);
    tick();
})();
