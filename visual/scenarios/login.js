'use strict';

// One-time sign-in: opens plain Chrome (no automation, so Google accepts the login) on the app's profile, waits for it to be quit, then checks the session in the automated browser.

const { spawn } = require('node:child_process');
const S = require('../../src/youtube/selectors');
const { launch } = require('../../src/browser');

const LOGIN_URL = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2F';
const WAIT_MS = 15 * 60 * 1000;

function openPlainChrome(profileDir) {
  const child = spawn('open', ['-W', '-n', '-a', 'Google Chrome', '--args', `--user-data-dir=${profileDir}`, '--no-first-run', LOGIN_URL], { stdio: 'ignore' });
  const done = new Promise(resolve => child.once('exit', resolve));
  const timer = setTimeout(() => child.kill(), WAIT_MS);
  return done.finally(() => clearTimeout(timer));
}

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
