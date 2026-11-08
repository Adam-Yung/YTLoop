'use strict';

// Launches a persistent-profile browser (Playwright Chromium, or installed Chrome) with the fewest automation tells.

const { chromium } = require('@playwright/test');

const ARGS = ['--disable-blink-features=AutomationControlled'];

function explainLaunchError(err, cfg) {
  const text = String(err?.message || err);
  if (/disallowed by the system admin/i.test(text)) {
    return `Chrome is blocked from remote control by an admin policy (cloud management). Use BROWSER_CHANNEL=chromium (default) and run npm run setup. Browser channel was: ${cfg.browserChannel}`;
  }
  if (/Executable doesn't exist|browserType\.launch.*install/i.test(text)) {
    return `Browser not installed for channel ${cfg.browserChannel}. Run npm run setup (or install Google Chrome for BROWSER_CHANNEL=chrome).`;
  }
  return text.split('\n')[0];
}

async function launch(cfg, { headless = false } = {}) {
  let context;
  try {
    context = await chromium.launchPersistentContext(cfg.profileDir, {
      ...(cfg.browserChannel === 'chrome' ? { channel: 'chrome' } : {}),
      headless,
      viewport: null,
      chromiumSandbox: true,
      timeout: cfg.launchTimeoutMs,
      ignoreDefaultArgs: ['--enable-automation'],
      args: ARGS,
      ...(cfg.recordVideoDir ? { recordVideo: { dir: cfg.recordVideoDir } } : {}),
    });
  } catch (err) {
    throw new Error(explainLaunchError(err, cfg));
  }
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

module.exports = { launch, createBrowser, isClosedError, explainLaunchError };
