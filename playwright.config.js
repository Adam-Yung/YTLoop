'use strict';

// Test projects: unit (no browser), fixture (Playwright Chromium vs fake YouTube pages), live (opt-in, LIVE=1).

const { defineConfig } = require('@playwright/test');

const channel = process.env.BROWSER_CHANNEL === 'chrome' ? { channel: 'chrome' } : {};
const chrome = { ...channel, headless: !process.env.HEADED };

module.exports = defineConfig({
  timeout: 30000,
  fullyParallel: true,
  reporter: [['list']],
  projects: [
    { name: 'unit', testDir: 'test/unit' },
    { name: 'fixture', testDir: 'test/fixture', use: chrome },
    { name: 'live', testDir: 'test/live', timeout: 300000, workers: 1, use: { ...chrome, headless: false } },
  ],
});
