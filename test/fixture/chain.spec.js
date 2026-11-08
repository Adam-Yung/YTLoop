'use strict';

// Fixture tests for src/watch.js and src/chain.js: recommendations, fallbacks, autoplay switches, stalls, walls, failure limits.

const { test, expect } = require('@playwright/test');
const { createSite } = require('../helpers/youtube-site');
const { makeCtx } = require('../helpers/ctx');
const { runChain } = require('../../src/chain');
const { createSession } = require('../../src/watch');

const ids = { a1: 'aaaaaaaaaa1', a2: 'aaaaaaaaaa2', a3: 'aaaaaaaaaa3', a4: 'aaaaaaaaaa4', z1: 'zzzzzzzzzz1' };
const channels = {
  a: { id: 'UCa', name: 'Channel A', handle: '@chana', uploads: [ids.a1, ids.a2, ids.a3, ids.a4] },
  z: { id: 'UCz', name: 'Channel Z', handle: '@chanz', uploads: [ids.z1] },
};
const vid = (key, channel, extra = {}) => ({ id: ids[key], title: key, channel, duration: 20, ...extra });
const catalog = extra => ({
  [ids.a1]: vid('a1', 'a', extra.a1), [ids.a2]: vid('a2', 'a', extra.a2),
  [ids.a3]: vid('a3', 'a', extra.a3), [ids.a4]: vid('a4', 'a', extra.a4), [ids.z1]: vid('z1', 'z', extra.z1),
});
const cfg = { timeScale: 40, stallTimeoutMs: 800, startupTimeoutMs: 600, retryDelayMs: 50, botWaitMs: 400, wallCheckMs: 100, recommendationRetryMs: 100, navigationTimeoutMs: 5000 };

async function run({ context, page }, extra, { length = 3, start = ids.a1, setup, ctxExtra = {} } = {}) {
  const site = await createSite(context, { videos: catalog(extra), channels });
  setup?.(site);
  const session = createSession();
  const ctx = makeCtx({ ...cfg, ...ctxExtra });
  const browser = { page: async () => page, close: async () => {} };
  const result = await runChain({ startId: start, length, session, ctx, browser });
  return { result, session, site };
}

const watchedPaths = site => site.visits.map(v => v.path);

test('follows same-channel recommendations by clicking, for N videos', async ({ context, page }) => {
  const { result, session, site } = await run({ context, page }, {
    a1: { related: [ids.z1, ids.a2] }, a2: { related: [ids.a3] }, a3: { related: [ids.a4] },
  });
  expect(result).toEqual({ reason: 'done', watched: 3 });
  expect([...session.visited]).toEqual([ids.a1, ids.a2, ids.a3]);
  expect(watchedPaths(site)).toEqual([`/watch?v=${ids.a1}`, `/watch?v=${ids.a2}`, `/watch?v=${ids.a3}`]);
  expect(site.visits.slice(1).every(v => v.referer)).toBe(true);
});

test('with no same-channel recommendation it finishes the video and uses the channel Videos page', async ({ context, page }) => {
  const { result, session, site } = await run({ context, page }, { a1: { related: [ids.z1] } }, { length: 2 });
  expect(result).toEqual({ reason: 'done', watched: 2 });
  expect(watchedPaths(site)[1]).toBe('/@chana/videos');
  expect(session.visited.has(ids.z1)).toBe(false);
  expect(session.visited.size).toBe(2);
});

test('an unexpected autoplay switch to another channel is rejected', async ({ context, page }) => {
  const { result, session } = await run({ context, page }, {
    a1: { autonavStuck: true, autoplayTo: ids.z1, autoplayDelayMs: 0 },
  }, { length: 2 });
  expect(result.reason).toBe('done');
  expect(session.visited.has(ids.z1)).toBe(false);
});

test('a stalled video is abandoned for another upload', async ({ context, page }) => {
  const { result, session } = await run({ context, page }, { a1: { stallAt: 3 } }, { length: 1 });
  expect(result).toEqual({ reason: 'done', watched: 1 });
  expect(session.visited.size).toBe(2);
});

test('three consecutive failures end the chain', async ({ context, page }) => {
  const { result } = await run({ context, page }, {}, { start: 'missingvid1', length: 5 });
  expect(result).toEqual({ reason: 'failures', watched: 0 });
});

test('an uncleared bot wall ends the chain without clicking', async ({ context, page }) => {
  const { result, site } = await run({ context, page }, {}, { setup: s => s.botWall.add(ids.a1) });
  expect(result).toEqual({ reason: 'wall', watched: 0 });
  expect(site.visits).toHaveLength(1);
});

test('aborting stops the chain promptly', async ({ context, page }) => {
  const site = await createSite(context, { videos: catalog({}), channels });
  const ctl = new AbortController();
  const ctx = { ...makeCtx(cfg), signal: ctl.signal };
  setTimeout(() => ctl.abort(), 300);
  const result = await runChain({ startId: ids.a1, length: 5, session: createSession(), ctx, browser: { page: async () => page, close: async () => {} } });
  expect(result.reason).toBe('stopped');
  expect(site.visits.length).toBeLessThan(3);
});
