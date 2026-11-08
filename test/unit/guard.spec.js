'use strict';

// Unit tests for src/guard.js waiting logic with a scripted fake page (no browser needed).

const { test, expect } = require('@playwright/test');
const { waitForHuman, WallError } = require('../../src/guard');
const { quiet } = require('../helpers/ctx');

const WALL_TEXT = 'Sign in to confirm you are not a bot';
const cfg = { botWaitMs: 5000, wallPollMs: 1 };

const fakePage = steps => {
  let i = 0;
  const next = () => steps[Math.min(i++, steps.length - 1)];
  return {
    url: () => 'https://www.youtube.com/watch?v=aaaaaaaaaaa',
    evaluate: async () => { const s = next(); if (s === 'error') throw new Error('navigating'); return s === 'wall' ? WALL_TEXT : 'Play Like'; },
    locator: () => ({ count: async () => 0 }),
  };
};

test('no wall returns false without waiting', async () => {
  expect(await waitForHuman(fakePage(['ok']), cfg, quiet)).toBe(false);
});

test('waits until the wall is gone', async () => {
  expect(await waitForHuman(fakePage(['wall', 'wall', 'ok']), cfg, quiet)).toBe(true);
});

test('an evaluation error is not treated as cleared', async () => {
  const page = fakePage(['wall', 'error', 'error', 'wall', 'ok']);
  expect(await waitForHuman(page, cfg, quiet)).toBe(true);
});

test('a wall that never clears throws WallError', async () => {
  await expect(waitForHuman(fakePage(['wall']), { botWaitMs: 50, wallPollMs: 1 }, quiet)).rejects.toBeInstanceOf(WallError);
});
