'use strict';

// Test projects: unit (no browser), fixture (system Chrome vs fake YouTube pages), live (opt-in, LIVE=1).

const { defineConfig } = require('@playwright/test');

const chrome = { channel: 'chrome', headless: !process.env.HEADED, launchOptions: { args: ['--disable-gpu', '--disable-software-rasterizer'] } };

module.exports = defineConfig({
  timeout: 30000,
  fullyParallel: true,
  retries: 2,
  reporter: [['list']],
  projects: [
    { name: 'unit', testDir: 'test/unit' },
    { name: 'fixture', testDir: 'test/fixture', use: chrome },
    { name: 'live', testDir: 'test/live', timeout: 300000, workers: 1, use: { ...chrome, headless: false } },
  ],
});
