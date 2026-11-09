'use strict';

// Watches one video: skips ads every poll, guards against walls and stalls, and leaves via a same-channel recommendation.

const { videoId, watchUrl } = require('./youtube/url');
const { mediaState, createSkipper, disableAutonav, likeIfNeeded, resumeIfPaused } = require('./youtube/player');
const { readOwner, listRelated, pickSame, followRelated } = require('./youtube/channel');
const { waitForHuman } = require('./guard');
const { sleep } = require('./sleep');

function createSession() {
  return { visited: new Set(), owner: null };
}

async function openVideo(page, id, ctx, fresh) {
  if (!fresh && videoId(page.url()) === id) return;
  await page.goto(watchUrl(id), { waitUntil: 'domcontentloaded', timeout: ctx.cfg.navigationTimeoutMs });
}

async function watchVideo(page, id, session, ctx, { fresh = false, last = false } = {}) {
  const { cfg, log, signal } = ctx;
  const skip = createSkipper(ctx);
  await openVideo(page, id, ctx, fresh);
  log.info('[video] Watching', watchUrl(id));
  session.visited.add(id);

  const startedAt = Date.now();
  let lastProgressAt = startedAt, lastPosition = -1, adStartedAt = 0, wasAd = false;
  let initialized = false, likeTried = false, lastWallAt = startedAt, lastOwnerAt = 0, lastAutonavAt = 0, lastPlayAt = 0, lastRecoAt = 0;

  while (!signal.aborted) {
    const now = Date.now();
    if (page.isClosed()) throw new Error('Chrome tab was closed');
    if (videoId(page.url()) !== id) return { reason: 'autoplay-switch' };
    if (now - lastWallAt > cfg.wallCheckMs) {
      lastWallAt = now;
      await waitForHuman(page, cfg, log, signal);
    }
    await skip(page);

    let media = null;
    try { media = await mediaState(page); } catch { /* Page is navigating; try again. */ }

    if (now - lastOwnerAt > 2500 && !session.owner?.id) {
      lastOwnerAt = now;
      const owner = await readOwner(page).catch(() => null);
      if (owner?.id || owner?.url) session.owner = owner;
    }

    if (!media) {
      if (now - startedAt > cfg.startupTimeoutMs) throw new Error('Video player never loaded');
      await sleep(cfg.pollMs, signal);
      continue;
    }
    if (media.duration === Infinity) throw new Error('Live or unbounded video');

    if (media.ad) {
      if (!adStartedAt || media.current > lastPosition + 0.1 || media.current < lastPosition - 1) adStartedAt = now;
      if (now - adStartedAt > cfg.stallTimeoutMs) throw new Error('Ad playback stalled');
      lastProgressAt = now;
      lastPosition = media.current;
      wasAd = true;
      await sleep(cfg.pollMs, signal);
      continue;
    }
    adStartedAt = 0;
    if (wasAd) { lastPosition = -1; wasAd = false; }

    if (!initialized && media.ready >= 2 && media.duration > 0) {
      initialized = true;
      lastProgressAt = now;
    }
    if (initialized && now - lastAutonavAt > cfg.autonavCheckMs) {
      lastAutonavAt = now;
      await disableAutonav(page, ctx);
    }

    if (media.ended) {
      log.info('[video] Finished', id);
      return { reason: 'ended' };
    }
    if (media.paused && media.ready >= 2 && now - lastPlayAt > 5000) {
      lastPlayAt = now;
      await resumeIfPaused(page, ctx);
    }
    if (media.current > lastPosition + 0.1) {
      lastProgressAt = now;
      lastPosition = media.current;
    }

    const left = media.duration - media.current;
    const played = media.current >= Math.min(5, media.duration / 2);
    if (initialized && played && !likeTried) {
      likeTried = true;
      await likeIfNeeded(page, ctx);
    }
    if (!last && initialized && played && session.owner?.name && left >= 0 && left <= cfg.endWindowSeconds && now - lastRecoAt > cfg.recommendationRetryMs) {
      lastRecoAt = now;
      const cards = await listRelated(page).catch(() => []);
      const next = pickSame(cards, session.owner, session.visited, id);
      if (!next) log.info(`[next] No unvisited same-channel card among ${cards.length} sidebar cards (${left.toFixed(0)} s left)`);
      if (next) {
        await followRelated(page, next, ctx);
        return { reason: 'recommended', nextId: next.id };
      }
    }

    if (now - lastProgressAt > cfg.stallTimeoutMs) throw new Error('Playback stalled');
    await sleep(cfg.pollMs, signal);
  }
  return { reason: 'stopped' };
}

module.exports = { watchVideo, createSession };
