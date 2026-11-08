'use strict';

// Unit tests for src/config.js.

const { test, expect } = require('@playwright/test');
const { load, DEFAULTS } = require('../../src/config');

test('defaults apply when env is empty', () => {
  const cfg = load({});
  expect(cfg.chainMin).toBe(10);
  expect(cfg.chainMax).toBe(20);
  expect(cfg.pollMs).toBe(DEFAULTS.pollMs);
  expect(cfg.playlistUrl).toBe('');
});

test('env values are parsed and chainMax never drops below chainMin', () => {
  const cfg = load({ PLAYLIST_URL: ' https://x ', CHAIN_MIN: '15', CHAIN_MAX: '5' });
  expect(cfg.playlistUrl).toBe('https://x');
  expect(cfg.chainMin).toBe(15);
  expect(cfg.chainMax).toBe(15);
});

test('invalid numbers fall back to defaults', () => {
  expect(load({ CHAIN_MIN: 'abc', CHAIN_MAX: '-3' }).chainMin).toBe(10);
});

test('overrides win', () => {
  expect(load({}, { pollMs: 20 }).pollMs).toBe(20);
});
