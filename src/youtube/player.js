'use strict';

// Player actions: read media state, click a visible Skip Ad button, turn autoplay off, press Play. Never touches ad media.

const S = require('./selectors');
const { humanClick } = require('../human');

const readMedia = ({ selector, playerSelector }) => {
  const v = document.querySelector(selector);
  if (!v) return null;
  const p = document.querySelector(playerSelector);
  return {
    ad: Boolean(p?.classList.contains('ad-showing') || p?.classList.contains('ad-interrupting')),
    current: v.currentTime,
    duration: v.duration,
    paused: v.paused,
    ended: v.ended,
    ready: v.readyState,
  };
};

const mediaState = page => page.evaluate(readMedia, { selector: S.video, playerSelector: S.player });

const usable = async button =>
  (await button.isVisible()) && (await button.isEnabled()) &&
  !(await button.evaluate(el => Boolean(el.closest('[aria-hidden="true"]'))));

function createSkipper(ctx) {
  let lastClickAt = 0;
  return async function skipIfAvailable(page) {
    if (Date.now() - lastClickAt < ctx.cfg.skipCooldownMs) return false;
    try {
      const buttons = page.locator(S.skip);
      const count = Math.min(await buttons.count(), 8);
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        if (!(await usable(button))) continue;
        lastClickAt = Date.now();
        await humanClick(page, button, ctx.cfg, ctx.signal);
        ctx.log.info('[ad] Pressed Skip Ad');
        return true;
      }
    } catch (err) {
      ctx.log.info('[ad] Skip not accepted, will retry if still shown:', err.message.split('\n')[0]);
    }
    return false;
  };
}

async function disableAutonav(page, ctx) {
  try {
    const toggle = page.locator(S.autonavToggle).first();
    if (!(await toggle.count())) return false;
    const on = await toggle.evaluate(el =>
      (el.getAttribute('aria-checked') || el.querySelector('[aria-checked]')?.getAttribute('aria-checked')) === 'true');
    if (!on) return false;
    await humanClick(page, toggle, ctx.cfg, ctx.signal);
    ctx.log.info('[player] Turned autoplay off');
    return true;
  } catch {
    return false;
  }
}

async function likeIfNeeded(page, ctx) {
  try {
    if (await page.locator(S.signedOut).count()) return false;
    const like = page.locator(S.like).first();
    if (!(await like.isVisible())) return false;
    if ((await like.getAttribute('aria-pressed')) !== 'false') return false;
    await humanClick(page, like, ctx.cfg, ctx.signal);
    ctx.log.info('[like] Liked the video');
    return true;
  } catch (err) {
    ctx.log.info('[like] Could not like:', err.message.split('\n')[0]);
    return false;
  }
}

async function resumeIfPaused(page, ctx) {
  try {
    const play = page.locator(S.playButton).first();
    if (!(await play.isVisible())) return false;
    await humanClick(page, play, ctx.cfg, ctx.signal);
    ctx.log.info('[player] Pressed Play');
    return true;
  } catch {
    return false;
  }
}

module.exports = { mediaState, createSkipper, disableAutonav, likeIfNeeded, resumeIfPaused };
