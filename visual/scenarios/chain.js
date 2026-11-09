'use strict';

// A short chain run while the real screen is recorded and sampled: evidence video, samples checked, same-channel path verified.

const path = require('node:path');
const { openFake, capture } = require('../lib/ctx');
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
    const rec = capture.startRecording(path.join(ctx.dir, 'chain.mov'));
    const sampler = capture.startSampler(path.join(ctx.dir, 'chain-samples'), 1500);
    await ctx.sleep(1000);
    await capture.raiseWindow(page, cfg);
    const browser = { page: async () => page, close: async () => {} };
    const result = await runChain({ startId: ids.a1, length: 3, session: createSession(), ctx: { cfg, log: ctx.log, signal: new AbortController().signal }, browser });
    const samples = await sampler.stop();
    const recorded = await rec.stop();

    await ctx.check('chain.1', 'the chain watched 3 videos and ended normally', async () => result.reason === 'done' && result.watched === 3);
    await ctx.check('chain.2', 'the path stayed on Channel A, clicking each next video', async () => {
      const paths = site.site.visits.map(v => v.path);
      ctx.note('visited:', paths.join(' '));
      return paths.length === 3 && paths.every(p => p.includes('aaaaaaaaaa')) && site.site.visits.slice(1).every(v => v.referer);
    });
    if (!capture.supported) return ctx.skip('chain.3', 'the screen recording has moving content', 'no screen capture on this platform');
    await ctx.check('chain.3', 'a screen recording was made', async () => recorded);
    await ctx.check('chain.4', 'screen samples taken during the chain show changing, non-blank content', async () => {
      ctx.note('samples:', samples.length);
      if (samples.length < 4) return false;
      const pngs = samples.map(f => capture.readPng(f));
      const lively = pngs.filter(p => !looksBlank(regionStats(p, { x: 0, y: 0, w: p.width, h: p.height })));
      const looks = new Set(pngs.map(p => regionStats(p, { x: 0, y: p.height * 0.1, w: p.width * 0.5, h: p.height * 0.6 }).mean.join(','))).size;
      ctx.note('non-blank samples:', lively.length, 'distinct looks:', looks);
      return lively.length >= samples.length * 0.8 && looks >= 2;
    });
    await site.close();
  },
};
