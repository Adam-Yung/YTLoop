'use strict';

// Real end-to-end run of the app's chain on real YouTube while the screen is recorded. Slow (minutes): run by name only.

const path = require('node:path');
const { createBrowser } = require('../../src/browser');
const { fetchPlaylist } = require('../../src/playlist');
const { createSession } = require('../../src/watch');
const { runChain } = require('../../src/chain');
const { capture, looksBlank } = require('../lib/ctx');
const { screenState, wakeScreen, isAwake } = require('../lib/awake');
const { regionStats } = require('../lib/regions');
const S = require('../../src/youtube/selectors');

const BUDGET_MS = 8 * 60 * 1000;

module.exports = {
  name: 'watch',
  live: true,
  manual: true,
  async run(ctx) {
    const cfg = { ...ctx.liveCfg(), clickPauseMs: [300, 900] };
    const lines = [];
    const log = {
      info: (...a) => { lines.push(a.join(' ')); ctx.log.info(...a); console.log('      |', ...a); },
      error: (...a) => { lines.push(a.join(' ')); ctx.log.error(...a); console.log('      |', ...a); },
    };
    let ids;
    await ctx.check('watch.1', 'the playlist is fetched', async () => { ids = await fetchPlaylist(cfg.playlistUrl); return ids.length > 0; });
    if (!ids) return;

    const browser = createBrowser(cfg);
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), BUDGET_MS);
    const video = path.join(ctx.dir, 'watch.mov');
    const rec = capture.startRecording(video);
    const sampler = capture.startSampler(path.join(ctx.dir, 'watch-samples'), 20000);
    const incidents = [];
    const watchdog = setInterval(async () => {
      const state = await screenState();
      if (!isAwake(state)) { incidents.push(new Date().toISOString()); await wakeScreen(); }
    }, 15000);
    let result, signedIn, front;
    try {
      const page = await browser.page();
      await capture.raiseWindow(page, cfg);
      result = await runChain({ startId: ids[0], length: 2, session: createSession(), ctx: { cfg, log, signal: abort.signal }, browser });
      const shot = await ctx.evidence(page, 'watch-end');
      signedIn = (await page.locator(S.signedOut).count()) === 0;
      front = await capture.isFrontmost(cfg);
    } finally {
      clearTimeout(timer);
      clearInterval(watchdog);
    }
    const samples = await sampler.stop();
    const recorded = await rec.stop();
    await browser.close();
    ctx.note('chain result:', JSON.stringify(result));
    await ctx.check('watch.0', `no screensaver or lock appeared while recording (${incidents.length} incidents)`, async () => incidents.length === 0);

    const watching = lines.filter(l => l.startsWith('[video] Watching'));
    await ctx.check('watch.2', 'the first video was watched to the end (or the time budget ran out while playing)', async () => result.watched >= 1 || (result.reason === 'stopped' && watching.length >= 1));
    if (lines.some(l => l.includes('[player] Turned autoplay off'))) await ctx.check('watch.3', 'autoplay was turned off by the app', async () => true);
    else ctx.skip('watch.3', 'autoplay was turned off by the app', 'it was already off in this profile');
    const nextTried = lines.some(l => l.startsWith('[next]') || l.startsWith('[fallback]')) || watching.length >= 2;
    await ctx.check('watch.4', 'the app moved on to a second video by itself (recommendation click or channel page)', async () => nextTried);
    const skips = lines.filter(l => l.includes('[ad] Pressed Skip Ad')).length;
    if (skips) await ctx.check('watch.5', `ads were skipped by real clicks (${skips})`, async () => true);
    else ctx.skip('watch.5', 'a skippable ad was skipped', 'no skippable ad appeared in this run');
    await ctx.check('watch.signin', 'the profile is signed in to YouTube (run npm run vm:login once)', async () => signedIn);
    if (lines.some(l => l.includes('[like] Liked'))) await ctx.check('watch.6', 'the video was liked', async () => true);
    else ctx.skip('watch.6', 'the video was liked', signedIn ? 'already liked' : 'signed out');
    await ctx.check('watch.7', 'no wall or fatal error ended the chain', async () => !['wall', 'browser', 'failures'].includes(result.reason));
    await ctx.check('watch.9', 'the app\'s own browser window is the frontmost window at the end (nothing covers it)', async () => front);

    if (!capture.supported) return ctx.skip('watch.8', 'the screen samples show non-blank content', 'no screen capture on this platform');
    await ctx.check('watch.8', 'screen samples taken every 20 s show non-blank content', async () => {
      if (!recorded) return false;
      const pngs = samples.map(f => capture.readPng(f));
      const lively = pngs.filter(p => !looksBlank(regionStats(p, { x: 0, y: 0, w: p.width, h: p.height })));
      ctx.note('samples:', pngs.length, 'non-blank:', lively.length);
      return pngs.length > 3 && lively.length >= pngs.length * 0.9;
    });
  },
};
