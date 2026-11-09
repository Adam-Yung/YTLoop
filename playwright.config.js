'use strict';

// Test projects: unit (no browser) and fixture (Playwright Chromium vs fake YouTube pages). Real-screen and live checks are in visual/.

const { defineConfig } = require('@playwright/test');

const channel = process.env.BROWSER_CHANNEL === 'chrome' ? { channel: 'chrome' } : {};
const chrome = { ...channel, headless: !process.env.HEADED };

module.exports = defineConfig({
  timeout: 30000,
  fullyParallel: true,
  workers: 3,
  reporter: [['list']],
  projects: [
    { name: 'unit', testDir: 'test/unit' },
    { name: 'fixture', testDir: 'test/fixture', use: chrome },
  ],
});
