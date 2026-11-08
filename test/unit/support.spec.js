'use strict';

// Unit tests for src/sleep.js, src/log.js and src/human.js (pure parts).

const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { sleep } = require('../../src/sleep');
const { createLog } = require('../../src/log');
const { between } = require('../../src/human');
const { tmpDir, removeDir } = require('../helpers/tmp');

test('sleep ends early when aborted', async () => {
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), 20);
  const start = Date.now();
  await sleep(5000, ctl.signal);
  expect(Date.now() - start).toBeLessThan(1000);
});

test('sleep returns immediately for an aborted signal', async () => {
  const start = Date.now();
  await sleep(5000, AbortSignal.abort());
  expect(Date.now() - start).toBeLessThan(200);
});

test('log.error appends to errors.log, info does not', () => {
  const dir = tmpDir('log');
  const log = createLog(dir);
  const quiet = [console.log, console.error];
  console.log = console.error = () => {};
  log.info('hello');
  log.error('bad thing');
  [console.log, console.error] = quiet;
  const text = fs.readFileSync(log.file, 'utf8');
  expect(text).toContain('bad thing');
  expect(text).not.toContain('hello');
  removeDir(dir);
});

test('between stays within range', () => {
  expect(between(300, 900, () => 0)).toBe(300);
  expect(between(300, 900, () => 0.5)).toBe(600);
  expect(between(300, 900, () => 0.999999)).toBeLessThan(900);
});

test('launch errors are explained, including the Chrome admin policy block', () => {
  const { explainLaunchError } = require('../../src/browser');
  const cfg = { browserChannel: 'chrome' };
  expect(explainLaunchError(new Error('x\nDevTools remote debugging is disallowed by the system admin.'), cfg)).toContain('BROWSER_CHANNEL=chromium');
  expect(explainLaunchError(new Error("Executable doesn't exist at /x"), { browserChannel: 'chromium' })).toContain('npm run setup');
  expect(explainLaunchError(new Error('boom\nmore'), cfg)).toBe('boom');
});
