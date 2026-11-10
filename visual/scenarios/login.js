'use strict';

// The VM version of `npm run login`: the same sign-in (scripts/login.js), then checks the session in the automated browser.

const S = require('../../src/youtube/selectors');
const { launch } = require('../../src/browser');
const { openPlainChrome, WAIT_MS } = require('../../scripts/login');

module.exports = {
  name: 'login',
  live: true,
  manual: true,
  async run(ctx) {
    const cfg = ctx.liveCfg();
    if (cfg.browserChannel !== 'chrome') return ctx.skip('login.0', 'sign-in is only needed for the Chrome channel', `channel is ${cfg.browserChannel}`);
    console.log(`      .. Sign in to YouTube in the Chrome window on the VM display, then quit Chrome (Cmd+Q). Waiting up to ${WAIT_MS / 60000} minutes.`);
    await openPlainChrome(cfg.profileDir);

    const { context, page } = await launch(cfg);
    try {
      await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await ctx.sleep(4000);
      await ctx.check('login.1', 'the profile is signed in to YouTube (no Sign in link)', async () => (await page.locator(S.signedOut).count()) === 0);
      await ctx.evidence(page, 'login');
    } finally {
      await context.close().catch(() => {});
    }
  },
};
