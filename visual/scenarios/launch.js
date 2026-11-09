'use strict';

// Regression for the blank-page bug: the real headed browser must open and show the page, seen on the real screen.

const { openFake, colorOnScreen, statsOnScreen, looksBlank, near, capture } = require('../lib/ctx');
const { decode } = require('../lib/png');
const { regionStats } = require('../lib/regions');
const { world, ids, watch } = require('../lib/world');

module.exports = {
  name: 'launch',
  async run(ctx) {
    let site;
    await ctx.check('launch.1', 'headed browser launches and returns a page within the launch timeout', async () => {
      site = await openFake(ctx, world());
      return Boolean(site.page);
    });
    if (!site) return;
    const { page } = site;
    await ctx.check('launch.2', 'the watch page loads and is not about:blank', async () => {
      await page.goto(watch(ids.a1), { waitUntil: 'domcontentloaded' });
      return page.url().includes('watch') && (await page.title()) === 'Video a1';
    });
    await capture.raiseWindow(page, ctx.cfg);
    await ctx.sleep(800);
    const shot = await ctx.evidence(page, 'launch');
    await ctx.check('launch.3', 'the page itself renders content (page screenshot is not blank)', async () => {
      const png = decode(await page.screenshot());
      return !looksBlank(regionStats(png, { x: 0, y: 0, w: png.width, h: png.height }));
    });
    if (!shot.os) ctx.skip('launch.4', 'the real screen shows the player where the page says it is', 'no screen capture on this platform');
    else {
      await ctx.check('launch.4', 'the real screen shows the dark player where the page says it is', async () => {
        const color = await colorOnScreen(page, shot, '#movie_player');
        ctx.note('player pixel on screen:', color);
        return near(color, [34, 34, 34], 20);
      });
      await ctx.check('launch.5', 'the real screen region of the page is not blank', async () => {
        const stats = await statsOnScreen(page, shot, 'ytd-app');
        ctx.note('ytd-app region colors:', stats.colors, 'luma std:', stats.lumaStd.toFixed(1));
        return !looksBlank(stats);
      });
    }
    await site.close();
  },
};
