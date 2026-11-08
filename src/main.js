'use strict';

// Entry point: walks the playlist from its last entry, running one random-length chain per entry, forever.

const { load, loadEnvFile } = require('./config');
const { createLog } = require('./log');
const { createBrowser } = require('./browser');
const { fetchPlaylist } = require('./playlist');
const { createSession } = require('./watch');
const { runChain } = require('./chain');
const { sleep } = require('./sleep');

const randomInt = (min, max, rng = Math.random) => min + Math.floor(rng() * (max - min + 1));
const brief = err => String(err?.message || err).split('\n')[0];

async function walk({ ctx, browser, session, fetch = fetchPlaylist, chain = runChain, rng = Math.random }) {
  const { cfg, log, signal } = ctx;
  while (!signal.aborted) {
    let ids;
    try {
      ids = await fetch(cfg.playlistUrl);
    } catch (err) {
      log.error('[playlist]', brief(err));
      await sleep(cfg.playlistRetryMs, signal);
      continue;
    }
    session.visited.clear();
    let watched = 0;
    for (const startId of ids) {
      if (signal.aborted) break;
      const length = randomInt(cfg.chainMin, cfg.chainMax, rng);
      log.info(`[playlist] Chain of ${length} from ${startId}`);
      try {
        const result = await chain({ startId, length, session, ctx, browser });
        log.info(`[playlist] Chain ended: ${result.reason}, watched ${result.watched}`);
        watched += result.watched;
        if (result.reason !== 'done' && result.reason !== 'stopped') await sleep(cfg.retryDelayMs, signal);
      } catch (err) {
        log.error('[playlist] Chain crashed:', brief(err));
        await sleep(cfg.retryDelayMs, signal);
      }
    }
    if (!watched && !signal.aborted) await sleep(cfg.playlistRetryMs, signal);
  }
}

async function main() {
  loadEnvFile();
  const cfg = load();
  const log = createLog(cfg.logDir);
  if (!cfg.playlistUrl) {
    log.error('Set PLAYLIST_URL in .env (see .env.example)');
    process.exitCode = 1;
    return;
  }
  const ctl = new AbortController();
  const stop = () => { log.info('[exit] Stopping'); ctl.abort(); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  const browser = createBrowser(cfg);
  try {
    await walk({ ctx: { cfg, log, signal: ctl.signal }, browser, session: createSession() });
  } finally {
    await browser.close();
    log.info('[exit] Stopped');
  }
}

if (require.main === module) {
  main().catch(err => { console.error('[fatal]', brief(err)); process.exitCode = 1; });
}

module.exports = { walk, randomInt };
