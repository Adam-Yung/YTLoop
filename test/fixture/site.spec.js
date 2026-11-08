'use strict';

// Checks the fake YouTube itself: skip button timing, trusted-click recording, and tamper detection.

const { test, expect } = require('@playwright/test');
const { createSite } = require('../helpers/youtube-site');

const channels = { a: { id: 'UCa', name: 'Channel A', handle: '@chana', uploads: ['aaaaaaaaaaa', 'bbbbbbbbbbb'] } };
const videos = {
  aaaaaaaaaaa: { id: 'aaaaaaaaaaa', title: 'A one', channel: 'a', duration: 30, related: ['bbbbbbbbbbb'], breaks: [{ at: 0, ads: [{ length: 6, skipAfter: 1 }] }] },
  bbbbbbbbbbb: { id: 'bbbbbbbbbbb', title: 'A two', channel: 'a', duration: 30, related: [] },
};

test('ad shows a skip button that a real click ends', async ({ context, page }) => {
  await createSite(context, { videos, channels });
  await page.goto('https://www.youtube.com/watch?v=aaaaaaaaaaa');
  await expect(page.locator('#movie_player.ad-showing')).toHaveCount(1);
  const skip = page.locator('.ytp-skip-ad-button');
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator('#movie_player.ad-showing')).toHaveCount(0);
  const log = await page.evaluate(() => window.__yt.log);
  expect(log).toContainEqual(expect.objectContaining({ t: 'skip-click', trusted: true }));
});

test('content runs to the end and records tampering attempts', async ({ context, page }) => {
  await createSite(context, { videos, channels });
  await page.goto('https://www.youtube.com/watch?v=bbbbbbbbbbb');
  await page.evaluate(() => { document.querySelector('video').playbackRate = 16; });
  await expect.poll(() => page.evaluate(() => window.__yt.log.some(l => l.t === 'ended'))).toBe(true);
  const log = await page.evaluate(() => window.__yt.log);
  expect(log).toContainEqual({ t: 'tamper', name: 'playbackRate', v: 16 });
});
