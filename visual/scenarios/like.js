'use strict';

// Like handling seen on the real screen: unliked gets liked (button turns blue), liked stays liked.

const { openFake, colorOnScreen, near, capture } = require('../lib/ctx');
const { world, ids, watch } = require('../lib/world');
const { likeIfNeeded } = require('../../src/youtube/player');

const BLUE = [0, 102, 255];

module.exports = {
  name: 'like',
  async run(ctx) {
    const site = await openFake(ctx, world({ a2: { liked: true } }));
    const { page } = site;
    const pctx = { cfg: ctx.cfg, log: ctx.log, signal: new AbortController().signal };
    await page.goto(watch(ids.a1), { waitUntil: 'domcontentloaded' });
    await capture.raiseWindow(page, ctx.cfg.browserChannel);

    await ctx.check('like.1', 'an unliked video is liked and the button turns blue on the real screen', async () => {
      const before = await ctx.evidence(page, 'like-before');
      const clicked = await likeIfNeeded(page, pctx);
      await ctx.sleep(500);
      const after = await ctx.evidence(page, 'like-after');
      if (!after.os) return clicked;
      const color = await colorOnScreen(page, after, 'like-button-view-model button');
      ctx.note('before:', await colorOnScreen(page, before, 'like-button-view-model button'), 'after:', color);
      return clicked && near(color, BLUE, 80);
    });

    await ctx.check('like.2', 'a second call does nothing (no un-like)', async () => !(await likeIfNeeded(page, pctx)));

    await ctx.check('like.3', 'an already liked video is not clicked', async () => {
      await page.goto(watch(ids.a2), { waitUntil: 'domcontentloaded' });
      const clicked = await likeIfNeeded(page, pctx);
      const log = await page.evaluate(() => window.__yt.log);
      return !clicked && log.filter(l => l.t === 'like-click').length === 0;
    });
    await site.close();
  },
};
