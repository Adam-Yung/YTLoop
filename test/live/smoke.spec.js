'use strict';

// Opt-in smoke test against real YouTube (LIVE=1, uses .env PLAYLIST_URL and a human-visible Chrome). Watches one video for a short time.

const { test, expect } = require('@playwright/test');
const { load, loadEnvFile } = require('../../src/config');
const { createBrowser } = require('../../src/browser');
const { fetchPlaylist } = require('../../src/playlist');
const { createSession } = require('../../src/watch');
const { runChain } = require('../../src/chain');
const { createLog } = require('../../src/log');

test.skip(!process.env.LIVE, 'Set LIVE=1 to run against real YouTube');

test('plays the first playlist entry and follows one more video', async () => {
  loadEnvFile();
  const cfg = load({}, { profileDir: '.profile-live' });
  const [startId] = await fetchPlaylist(cfg.playlistUrl);
  const browser = createBrowser(cfg);
  const ctx = { cfg, log: createLog(cfg.logDir), signal: new AbortController().signal };
  try {
    const result = await runChain({ startId, length: 1, session: createSession(), ctx, browser });
    expect(result).toEqual({ reason: 'done', watched: 1 });
  } finally {
    await browser.close();
  }
});
