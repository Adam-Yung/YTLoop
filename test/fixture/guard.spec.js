'use strict';

// Fixture tests for src/guard.js and the launch flags in src/browser.js.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { createSite } = require('../helpers/youtube-site');
const { hasWall, waitForHuman, WallError } = require('../../src/guard');
const { launch } = require('../../src/browser');
const { load } = require('../../src/config');

const channels = { a: { id: 'UCa', name: 'Channel A', handle: '@chana', uploads: ['aaaaaaaaaaa'] } };
const videos = { aaaaaaaaaaa: { id: 'aaaaaaaaaaa', title: 'A', channel: 'a', duration: 30 } };
const quiet = { info: () => {}, error: () => {} };
const cfg = load({}, { botWaitMs: 400, wallPollMs: 50 });
const url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa';

test('a normal watch page is not a wall', async ({ context, page }) => {
  await createSite(context, { videos, channels });
  await page.goto(url);
  expect(await hasWall(page)).toBe(false);
  expect(await waitForHuman(page, cfg, quiet)).toBe(false);
});

test('a bot-check page is detected', async ({ context, page }) => {
  const site = await createSite(context, { videos, channels });
  site.botWall.add('aaaaaaaaaaa');
  await page.goto(url);
  expect(await hasWall(page)).toBe(true);
});

test('an uncleared wall throws WallError and nothing is clicked', async ({ context, page }) => {
  const site = await createSite(context, { videos, channels });
  site.botWall.add('aaaaaaaaaaa');
  await page.goto(url);
  await expect(waitForHuman(page, cfg, quiet)).rejects.toBeInstanceOf(WallError);
  expect(site.visits).toHaveLength(1);
});

test('launch hides automation flags and keeps a persistent profile', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ytloop-profile-'));
  const { context, page } = await launch(load({}, { profileDir: dir }), { headless: true });
  try {
    expect(await page.evaluate(() => navigator.webdriver)).toBe(false);
    expect(fs.readdirSync(dir).length).toBeGreaterThan(0);
  } finally {
    await context.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
