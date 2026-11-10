'use strict';

// Unit tests for scripts/require-vm.js: the local-run guard.

const { execFileSync, spawnSync } = require('node:child_process');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const guard = path.join(__dirname, '..', '..', 'scripts', 'require-vm.js');
const run = env => spawnSync(process.execPath, [guard], { env: { PATH: process.env.PATH, ...env }, encoding: 'utf8' });

test('refuses to run without YTLOOP_VM', () => {
  const result = run({});
  expect(result.status).toBe(1);
    expect(result.stderr).toContain('run on the test VM');
});

test('refuses for any other value', () => {
  expect(run({ YTLOOP_VM: '0' }).status).toBe(1);
  expect(run({ YTLOOP_VM: 'true' }).status).toBe(1);
});

test('allows YTLOOP_VM=1', () => {
  expect(run({ YTLOOP_VM: '1' }).status).toBe(0);
  expect(() => execFileSync(process.execPath, [guard], { env: { YTLOOP_VM: '1' } })).not.toThrow();
});
