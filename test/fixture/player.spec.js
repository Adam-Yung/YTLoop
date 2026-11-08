'use strict';

// Fixture tests for src/youtube/player.js: real skip clicks, pods, covered buttons, no tampering, autoplay, resume.

const { test, expect } = require('@playwright/test');
const { createSite } = require('../helpers/youtube-site');
const { makeCtx, until } = require('../helpers/ctx');
const { mediaState, createSkipper, disableAutonav, resumeIfPaused } = require('../../src/youtube/player');

const channels = { a: { id: 'UCa', name: 'Channel A', handle: '@chana', uploads: ['aaaaaaaaaaa'] } };
const one = extra => ({ aaaaaaaaaaa: { id: 'aaaaaaaaaaa', title: 'A', channel: 'a', duration: 20, ...extra } });
const url = 'https://www.youtube.com/watch?v=aaaaaaaaaaa';
const logOf = page => page.evaluate(() => window.__yt.log);
const kinds = (log, t) => log.filter(l => l.t === t);

async function open(context, page, video) {
  await createSite(context, { videos: one(video), channels });
  await page.goto(url);
}

test('skips a skippable ad with a trusted click', async ({ context, page }) => {
  await open(context, page, { breaks: [{ at: 0, ads: [{ length: 10, skipAfter: 1 }] }] });
  const skip = createSkipper(makeCtx());
  expect(await until(async () => skip(page))).toBe(true);
  expect(kinds(await logOf(page), 'skip-click')).toEqual([expect.objectContaining({ trusted: true })]);
});

test('skips every ad in a pod and a later mid-roll', async ({ context, page }) => {
  await open(context, page, {
    duration: 20,
    breaks: [
      { at: 0, ads: [{ length: 10, skipAfter: 1 }, { length: 10, skipAfter: 1 }] },
      { at: 5, ads: [{ length: 10, skipAfter: 1 }] },
    ],
  });
  const skip = createSkipper(makeCtx());
  await until(async () => { await skip(page); return kinds(await logOf(page), 'skip-click').length >= 3; }, 15000);
  expect(kinds(await logOf(page), 'skip-click')).toHaveLength(3);
});

test('a covered skip button is never clicked', async ({ context, page }) => {
  await open(context, page, { skipCovered: true, breaks: [{ at: 0, ads: [{ length: 10, skipAfter: 1 }] }] });
  const skip = createSkipper(makeCtx());
  await until(async () => (await page.locator('.ytp-skip-ad-button:visible').count()) > 0);
  expect(await skip(page)).toBe(false);
  expect(kinds(await logOf(page), 'skip-click')).toHaveLength(0);
});

test('an unskippable ad is left alone and untouched', async ({ context, page }) => {
  await open(context, page, { breaks: [{ at: 0, ads: [{ length: 3, skipAfter: null }] }] });
  const skip = createSkipper(makeCtx());
  const adSeen = await until(async () => { await skip(page); return (await mediaState(page)).ad; });
  expect(adSeen).toBe(true);
  await until(async () => !(await mediaState(page)).ad, 8000);
  const log = await logOf(page);
  expect(kinds(log, 'skip-click')).toHaveLength(0);
  expect(kinds(log, 'tamper')).toHaveLength(0);
});

test('a whole ad and content run never seeks, mutes or changes speed', async ({ context, page }) => {
  await open(context, page, { breaks: [{ at: 0, ads: [{ length: 10, skipAfter: 1 }] }] });
  const ctx = makeCtx();
  const skip = createSkipper(ctx);
  await until(async () => { await skip(page); await disableAutonav(page, ctx); return (await mediaState(page)).ended; }, 15000);
  expect(kinds(await logOf(page), 'tamper')).toHaveLength(0);
});

test('autoplay is switched off once', async ({ context, page }) => {
  await open(context, page, {});
  const ctx = makeCtx();
  expect(await disableAutonav(page, ctx)).toBe(true);
  expect(await disableAutonav(page, ctx)).toBe(false);
  expect(kinds(await logOf(page), 'autonav-click')).toEqual([expect.objectContaining({ trusted: true })]);
});

test('a paused video is resumed with a real click', async ({ context, page }) => {
  await open(context, page, { startPaused: true });
  expect((await mediaState(page)).paused).toBe(true);
  expect(await resumeIfPaused(page, makeCtx())).toBe(true);
  expect(await until(async () => !(await mediaState(page)).paused)).toBe(true);
  expect(kinds(await logOf(page), 'play-click')).toEqual([expect.objectContaining({ trusted: true })]);
});
