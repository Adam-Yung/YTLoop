'use strict';

// Real YouTube smoke: the app's browser opens, the first playlist video loads and plays, every selector matches, the screen shows it.

const S = require('../../src/youtube/selectors');
const { launch } = require('../../src/browser');
const { fetchPlaylist } = require('../../src/playlist');
const { hasWall } = require('../../src/guard');
const { mediaState, resumeIfPaused } = require('../../src/youtube/player');
const { watchUrl } = require('../../src/youtube/url');
const { statsOnScreen, looksBlank, capture } = require('../lib/ctx');

const SELECTORS = {
  player: S.player,
  video: S.video,
  playButton: S.playButton,
  autonavToggle: S.autonavToggle,
  likeButton: S.like,
  ownerLink: S.ownerLink,
  relatedCards: S.related.cards,
  relatedLinks: `${S.related.cards} >> ${S.related.link}`,
};

module.exports = {
  name: 'probe',
  live: true,
  async run(ctx) {
    const cfg = ctx.liveCfg();
    let ids;
    await ctx.check('probe.1', 'the playlist is fetched with yt-dlp', async () => { ids = await fetchPlaylist(cfg.playlistUrl); return ids.length > 0; });
    if (!ids) return;

    let handle;
    await ctx.check('probe.2', `the ${cfg.browserChannel} browser launches headed within ${cfg.launchTimeoutMs} ms`, async () => { handle = await launch(cfg); return true; });
    if (!handle) return;
    const { context, page } = handle;
    try {
      await ctx.check('probe.3', 'the first playlist video loads (not about:blank)', async () => {
        await page.goto(watchUrl(ids[0]), { waitUntil: 'domcontentloaded', timeout: 30000 });
        await capture.raiseWindow(page, cfg.browserChannel);
        return page.url().includes('watch');
      });
      await ctx.sleep(6000);
      const shot = await ctx.evidence(page, 'probe');

      const wall = await hasWall(page);
      await ctx.check('probe.4', 'no bot check, consent or sign-in wall is showing', async () => !wall);
      if (wall) return ctx.note('wall on screen: see probe.screen.png; resolve it by hand in the browser window, then rerun');

      for (const [name, selector] of Object.entries(SELECTORS)) {
        await ctx.check(`probe.sel.${name}`, `selector ${name} matches`, async () => (await page.locator(selector).count()) > 0);
      }

      await ctx.check('probe.signedout', 'sign-in detection agrees with the page (a Sign in link is visible exactly when signed out is detected)', async () => {
        const linkVisible = (await page.getByRole('link', { name: /^sign in$/i }).count()) > 0;
        const detected = (await page.locator(S.signedOut).count()) > 0;
        ctx.note('Sign in link visible:', linkVisible, 'detected:', detected);
        return linkVisible === detected;
      });

      if (!shot.os) ctx.skip('probe.5', 'the real screen shows the player with content', 'no screen capture on this platform');
      else {
        await ctx.check('probe.5', 'the real screen shows the player with content (not blank)', async () => {
          const stats = await statsOnScreen(page, shot, S.player);
          ctx.note('player region colors:', stats?.colors, 'luma std:', stats?.lumaStd?.toFixed(1));
          return Boolean(stats) && !looksBlank(stats);
        });
      }

      await ctx.check('probe.6', 'playback advances after the app presses Play if needed (content or ad)', async () => {
        const pctx = { cfg, log: ctx.log, signal: new AbortController().signal };
        const before = await mediaState(page);
        ctx.note('paused at start:', before?.paused);
        if (before?.paused) await resumeIfPaused(page, pctx);
        const first = await mediaState(page);
        await ctx.sleep(4000);
        const second = await mediaState(page);
        ctx.note('time', first?.current?.toFixed(1), '->', second?.current?.toFixed(1), second?.ad ? '(ad)' : '');
        await ctx.evidence(page, 'probe-playing');
        return Boolean(first && second) && (second.current > first.current + 1 || second.ended);
      });
    } finally {
      await context.close().catch(() => {});
    }
  },
};
