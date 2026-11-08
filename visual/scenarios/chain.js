'use strict';

// A short chain run while the real screen is recorded: evidence video, frames extracted and checked, same-channel path verified.

const path = require('node:path');
const { openFake, capture, near } = require('../lib/ctx');
const { world, ids } = require('../lib/world');
const { runChain } = require('../../src/chain');
const { createSession } = require('../../src/watch');
const { regionStats, looksBlank } = require('../lib/regions');

module.exports = {
  name: 'chain',
  async run(ctx) {
    const cfg = { ...ctx.cfg, stallTimeoutMs: 15000, retryDelayMs: 200, wallCheckMs: 500, pollMs: 200, recommendationRetryMs: 300 };
    const site = await openFake({ ...ctx, cfg }, world({ a1: { timeScale: 3 }, a2: { timeScale: 3 }, a3: { timeScale: 3 } }));
    const { page } = site;
    const video = path.join(ctx.dir, 'chain.mov');
    const rec = capture.startRecording(video);
    await ctx.sleep(1000);
    await capture.raiseWindow(page, cfg.browserChannel);
    const browser = { page: async () => page, close: async () => {} };
    const result = await runChain({ startId: ids.a1, length: 3, session: createSession(), ctx: { cfg, log: ctx.log, signal: new AbortController().signal }, browser });
    const recorded = await rec.stop();

    await ctx.check('chain.1', 'the chain watched 3 videos and ended normally', async () => result.reason === 'done' && result.watched === 3);
    await ctx.check('chain.2', 'the path stayed on Channel A, clicking each next video', async () => {
      const paths = site.site.visits.map(v => v.path);
      ctx.note('visited:', paths.join(' '));
      return paths.length === 3 && paths.every(p => p.includes('aaaaaaaaaa')) && site.site.visits.slice(1).every(v => v.referer);
    });
    if (!capture.supported) return ctx.skip('chain.3', 'the screen recording has moving content', 'no screen capture on this platform');
    await ctx.check('chain.3', 'a screen recording was made', async () => recorded);
    await ctx.check('chain.4', 'frames extracted from the recording show changing, non-blank content', async () => {
      const frames = await capture.extractFrames(video, path.join(ctx.dir, 'frames'), 2);
      ctx.note('frames:', frames.length);
      if (frames.length < 4) return false;
      const lumas = frames.map(f => regionStats(capture.readPng(f), { x: 0, y: 0, w: 4000, h: 4000 })).filter(s => !looksBlank(s));
      const distinct = new Set(frames.map(f => regionStats(capture.readPng(f), { x: 0, y: 100, w: 1000, h: 800 }).mean.join(','))).size;
      ctx.note('non-blank frames:', lumas.length, 'distinct looks:', distinct);
      return lumas.length >= frames.length * 0.8 && distinct >= 2;
    });
    await site.close();
  },
};
