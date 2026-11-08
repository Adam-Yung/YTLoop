'use strict';

// Launches real Chrome with a persistent profile and the fewest automation tells.

const { chromium } = require('@playwright/test');

const ARGS = ['--disable-blink-features=AutomationControlled'];

async function launch(cfg, { headless = false } = {}) {
  const context = await chromium.launchPersistentContext(cfg.profileDir, {
    channel: 'chrome',
    headless,
    viewport: null,
    ignoreDefaultArgs: ['--enable-automation'],
    args: ARGS,
  });
  const page = context.pages().find(p => !p.isClosed()) || await context.newPage();
  page.setDefaultTimeout(3000);
  page.setDefaultNavigationTimeout(cfg.navigationTimeoutMs);
  return { context, page };
}

const isClosedError = err =>
  /target.*closed|browser.*closed|context.*closed|connection.*closed|browser.*disconnected/i.test(String(err?.message || ''));

module.exports = { launch, isClosedError };
