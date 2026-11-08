'use strict';

// Detects bot checks, CAPTCHAs, consent and sign-in walls. Never solves them: waits for a human, then gives up.

const S = require('./youtube/selectors');
const { sleep } = require('./sleep');

class WallError extends Error {}

const onWallHost = url => S.wall.hosts.some(h => url.includes(h));

async function hasWall(page) {
  if (onWallHost(page.url())) return true;
  try {
    const text = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) || '');
    if (S.wall.text.test(text)) return true;
    return (await page.locator(S.wall.selectors).count()) > 0;
  } catch {
    return false;
  }
}

async function waitForHuman(page, cfg, log, signal) {
  if (!(await hasWall(page))) return false;
  log.error('[guard] Bot check, consent or sign-in wall detected. Resolve it in the Chrome window; waiting.');
  const until = Date.now() + cfg.botWaitMs;
  while (!signal?.aborted && Date.now() < until) {
    await sleep(Math.max(cfg.pollMs, 2000), signal);
    if (!(await hasWall(page))) {
      log.info('[guard] Wall cleared');
      return true;
    }
  }
  if (signal?.aborted) return true;
  throw new WallError('Wall not cleared in time');
}

module.exports = { hasWall, waitForHuman, WallError };
