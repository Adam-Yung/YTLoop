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

function createBrowser(cfg, opts) {
  let handle = null;
  const close = async () => {
    try { await handle?.context.close(); } catch { /* Already disconnected. */ }
    handle = null;
  };
  const page = async () => {
    if (!handle || handle.page.isClosed()) {
      await close();
      handle = await launch(cfg, opts);
    }
    return handle.page;
  };
  return { page, close };
}

module.exports = { launch, createBrowser, isClosedError };
