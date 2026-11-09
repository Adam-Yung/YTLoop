'use strict';

// Ad handling seen on the real screen: red ad player, yellow Skip button, trusted click, dark player after, untouched media.

const { openFake, colorOnScreen, near } = require('../lib/ctx');
const { world, ids, watch } = require('../lib/world');
const { createSkipper, mediaState } = require('../../src/youtube/player');
const { capture } = require('../lib/ctx');

const RED = [204, 0, 0], YELLOW = [255, 204, 0], DARK = [34, 34, 34];
const ads = [{ length: 40, skipAfter: 2 }, { length: 40, skipAfter: 2 }];

module.exports = {
  name: 'ads',
  async run(ctx) {
    const site = await openFake(ctx, world({ a1: { timeScale: 1, breaks: [{ at: 0, ads }] } }));
    const { page } = site;
    const skip = createSkipper({ cfg: { ...ctx.cfg, skipCooldownMs: 500 }, log: ctx.log, signal: new AbortController().signal });
    await page.goto(watch(ids.a1), { waitUntil: 'domcontentloaded' });
    await capture.raiseWindow(page, ctx.cfg);

    await ctx.check('ads.1', 'an ad is playing and the real screen shows the red ad player', async () => {
      if (!(await ctx.until(async () => (await mediaState(page)).ad, 8000))) return false;
      const shot = await ctx.evidence(page, 'ad-playing');
      if (!shot.os) return true;
      const color = await colorOnScreen(page, shot, '#movie_player');
      ctx.note('player on screen:', color);
      return near(color, RED, 80);
    });

    await ctx.check('ads.2', 'the Skip button appears after its delay and is yellow on the real screen', async () => {
      if (!(await ctx.until(async () => page.locator('.ytp-skip-ad-button').isVisible(), 8000))) return false;
      const shot = await ctx.evidence(page, 'ad-skip-visible');
      if (!shot.os) return true;
      const color = await colorOnScreen(page, shot, '.ytp-skip-ad-button');
      ctx.note('skip button on screen:', color);
      return near(color, YELLOW, 80);
    });

    await ctx.check('ads.3', 'both ads in the pod are skipped with real trusted clicks', async () => {
      const done = await ctx.until(async () => { await skip(page); return (await page.evaluate(() => window.__yt.log)).filter(l => l.t === 'skip-click').length >= 2; }, 20000, 150);
      const log = await page.evaluate(() => window.__yt.log);
      const clicks = log.filter(l => l.t === 'skip-click');
      ctx.note('skip clicks:', JSON.stringify(clicks));
      return done && clicks.every(c => c.trusted);
    });

    await ctx.check('ads.4', 'afterwards content plays and the real screen shows the dark player again', async () => {
      if (!(await ctx.until(async () => !(await mediaState(page)).ad, 5000))) return false;
      await ctx.sleep(600);
      const shot = await ctx.evidence(page, 'ad-after');
      if (!shot.os) return true;
      const color = await colorOnScreen(page, shot, '#movie_player');
      ctx.note('player on screen:', color);
      return near(color, DARK, 40);
    });

    await ctx.check('ads.5', 'no seek, mute or speed change happened to any media', async () => {
      const log = await page.evaluate(() => window.__yt.log);
      return log.filter(l => l.t === 'tamper').length === 0;
    });
    await site.close();
  },
};
