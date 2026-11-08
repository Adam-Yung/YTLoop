'use strict';

// Unit tests for src/sleep.js, src/log.js and src/human.js (pure parts).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { sleep } = require('../../src/sleep');
const { createLog } = require('../../src/log');
const { between } = require('../../src/human');

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ytloop-'));
  const log = createLog(dir);
  const quiet = [console.log, console.error];
  console.log = console.error = () => {};
  log.info('hello');
  log.error('bad thing');
  [console.log, console.error] = quiet;
  const text = fs.readFileSync(log.file, 'utf8');
  expect(text).toContain('bad thing');
  expect(text).not.toContain('hello');
});

test('between stays within range', () => {
  expect(between(300, 900, () => 0)).toBe(300);
  expect(between(300, 900, () => 0.5)).toBe(600);
  expect(between(300, 900, () => 0.999999)).toBeLessThan(900);
});
