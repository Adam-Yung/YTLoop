'use strict';

// Unit tests for src/main.js walk(): playlist order, chain lengths, refetch, and error containment, with fakes.

const { test, expect } = require('@playwright/test');
const { walk, randomInt } = require('../../src/main');
const { createSession } = require('../../src/watch');
const { makeCtx } = require('../helpers/ctx');

const quietCfg = { chainMin: 10, chainMax: 20, retryDelayMs: 1, playlistRetryMs: 1 };

function setup(extra = {}) {
  const ctl = new AbortController();
  const ctx = { ...makeCtx({ ...quietCfg, playlistUrl: 'pl' }), signal: ctl.signal };
  const errors = [];
  ctx.log = { info: () => {}, error: (...a) => errors.push(a.join(' ')) };
  return { ctl, ctx, errors, session: createSession(), ...extra };
}

test('randomInt covers both ends of the range', () => {
  expect(randomInt(10, 20, () => 0)).toBe(10);
  expect(randomInt(10, 20, () => 0.999999)).toBe(20);
});

test('chains run in playlist order with lengths in range, then the playlist is refetched', async () => {
  const { ctl, ctx, session } = setup();
  const starts = [];
  let fetches = 0;
  const fetch = async () => { fetches += 1; return ['c', 'b', 'a']; };
  const chain = async ({ startId, length }) => {
    starts.push([startId, length]);
    if (starts.length === 6) ctl.abort();
    return { reason: 'done', watched: length };
  };
  await walk({ ctx, browser: {}, session, fetch, chain });
  expect(starts.map(s => s[0])).toEqual(['c', 'b', 'a', 'c', 'b', 'a']);
  expect(starts.every(([, n]) => n >= 10 && n <= 20)).toBe(true);
  expect(fetches).toBe(2);
});

test('playlist errors are logged and retried, not fatal', async () => {
  const { ctl, ctx, errors, session } = setup();
  let calls = 0;
  const fetch = async () => {
    calls += 1;
    if (calls < 3) throw new Error('network down');
    ctl.abort();
    return [];
  };
  await walk({ ctx, browser: {}, session, fetch });
  expect(calls).toBe(3);
  expect(errors.filter(e => e.includes('network down'))).toHaveLength(2);
});

test('a crashing chain is logged and the next entry still runs', async () => {
  const { ctl, ctx, errors, session } = setup();
  const seen = [];
  const chain = async ({ startId }) => {
    seen.push(startId);
    if (startId === 'b') ctl.abort();
    if (startId === 'c') throw new Error('boom');
    return { reason: 'done', watched: 1 };
  };
  await walk({ ctx, browser: {}, session, fetch: async () => ['c', 'b'], chain });
  expect(seen).toEqual(['c', 'b']);
  expect(errors.some(e => e.includes('boom'))).toBe(true);
});

test('visited ids are cleared on each playlist refetch', async () => {
  const { ctl, ctx, session } = setup();
  session.visited.add('old');
  await walk({ ctx, browser: {}, session, fetch: async () => ['a'], chain: async () => { ctl.abort(); return { reason: 'done', watched: 1 }; } });
  expect(session.visited.size).toBe(0);
});
