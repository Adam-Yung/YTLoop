'use strict';

// Follows up to `length` videos from one starting video. Ends early on catastrophic failure (see docs/decisions/0002).

const { watchVideo } = require('./watch');
const { openChannelUpload } = require('./youtube/channel');
const { isClosedError } = require('./browser');
const { WallError } = require('./guard');
const { sleep } = require('./sleep');

const brief = err => String(err?.message || err).split('\n')[0];

async function runChain({ startId, length, session, ctx, browser }) {
  const { cfg, log, signal } = ctx;
  let nextId = startId, fresh = true;
  let watched = 0, videoFailures = 0, browserFailures = 0;
  session.owner = null;

  const end = reason => ({ reason, watched });

  while (watched < length && !signal.aborted) {
    let page, failed = false;
    try {
      page = await browser.page();
      const outcome = await watchVideo(page, nextId, session, ctx, { fresh, last: watched + 1 >= length });
      if (outcome.reason === 'stopped') break;
      watched += 1;
      videoFailures = browserFailures = 0;
      fresh = false;
      if (watched >= length) break;
      if (outcome.nextId) { nextId = outcome.nextId; continue; }
    } catch (err) {
      if (err instanceof WallError) { log.error('[chain] Ending chain:', brief(err)); return end('wall'); }
      if (isClosedError(err) || !page) {
        log.error('[recovery] Browser problem:', brief(err));
        await browser.close();
        if (++browserFailures >= cfg.maxBrowserFailures) return end('browser');
        fresh = true;
        await sleep(cfg.retryDelayMs, signal);
        continue;
      }
      log.error('[recovery] Video failed:', brief(err));
      failed = true;
    }
    if (signal.aborted) break;

    let id = null;
    try {
      id = await openChannelUpload(page, session.owner, session.visited, nextId, ctx);
    } catch (err) {
      log.error('[recovery] Channel fallback failed:', brief(err));
      if (isClosedError(err)) await browser.close();
    }
    if (failed || !id) {
      if (++videoFailures >= cfg.maxVideoFailures) return end('failures');
    }
    fresh = !id;
    if (id) nextId = id;
    else await sleep(cfg.retryDelayMs, signal);
  }
  return end(signal.aborted ? 'stopped' : 'done');
}

module.exports = { runChain };
