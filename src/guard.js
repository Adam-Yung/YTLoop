'use strict';

// Detects bot checks, CAPTCHAs, consent and sign-in walls. Never solves them: waits for a human, then gives up.

const S = require('./youtube/selectors');
const { sleep } = require('./sleep');

class WallError extends Error {}

const onWallHost = url => S.wall.hosts.some(h => url.includes(h));

const visibleText = () => {
  const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);
  const walker = document.createTreeWalker(document.body || document, NodeFilter.SHOW_TEXT);
  let out = '';
  for (let n = walker.nextNode(); n && out.length < 4000; n = walker.nextNode()) {
    if (!skip.has(n.parentElement?.tagName)) out += `${n.nodeValue} `;
  }
  return out;
};

async function probeWall(page) {
  if (onWallHost(page.url())) return true;
  try {
    const text = await page.evaluate(visibleText);
    if (S.wall.text.test(text)) return true;
    return (await page.locator(S.wall.selectors).count()) > 0;
  } catch {
    return null;
  }
}

const hasWall = async page => (await probeWall(page)) === true;

async function waitForHuman(page, cfg, log, signal) {
  if (!(await hasWall(page))) return false;
  log.error('[guard] Bot check, consent or sign-in wall detected. Resolve it in the Chrome window; waiting.');
  const until = Date.now() + cfg.botWaitMs;
  while (!signal?.aborted && Date.now() < until) {
    await sleep(cfg.wallPollMs, signal);
    if ((await probeWall(page)) === false) {
      log.info('[guard] Wall cleared');
      return true;
    }
  }
  if (signal?.aborted) return true;
  throw new WallError('Wall not cleared in time');
}

module.exports = { hasWall, waitForHuman, WallError };
