// ==UserScript==
// @name         YouTube Auto Skip Ads
// @namespace    local.youtube.autoskip
// @version      2.1
// @description  Skip YouTube ads after a configurable delay
// @match        https://www.youtube.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  // ===== SETTINGS =====
  const SKIP_AFTER_SECONDS = Math.random() + 0.5;
  const CHECK_INTERVAL_MS = 250;
  const DEBUG = true;
  // ====================

  function skipAd() {
    try {
      const player = document.querySelector(".html5-video-player");

      if (!player?.classList.contains("ad-showing")) return;

      const video = player.querySelector("video.html5-main-video");

      if (!video || !Number.isFinite(video.duration)) return;

      if (video.duration <= 0 || video.currentTime < SKIP_AFTER_SECONDS) return;

      if (DEBUG) {
        console.log("[YT AutoSkip] Skipping ad", {
          currentTime: video.currentTime,
          duration: video.duration,
        });
      }

      video.currentTime = video.duration;
    } catch (err) {
      console.error("[YT AutoSkip]", err);
    }
  }

  setInterval(skipAd, CHECK_INTERVAL_MS);
})();
