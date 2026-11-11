'use strict';

// Test projects: unit (no browser) and fixture (Playwright Chromium vs fake YouTube pages). Real-screen and live checks are in visual/.

const { defineConfig } = require('@playwright/test');

const channel = process.env.BROWSER_CHANNEL === 'chrome' ? { channel: 'chrome' } : {};
const chrome = { ...channel, headless: !process.env.HEADED };

module.exports = defineConfig({
  timeout: 30000,
  fullyParallel: true,
  workers: Number(process.env.YTLOOP_WORKERS) || 3,
  retries: Number(process.env.YTLOOP_RETRIES) || 0,
  reporter: [['list']],
  projects: [
    { name: 'unit', testDir: 'test/unit' },
    { name: 'fixture', testDir: 'test/fixture', use: chrome },
  ],
});
