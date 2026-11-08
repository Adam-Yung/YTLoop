'use strict';

// Test context: fast timings, silent log, and a poller that mimics the 500 ms loop.

const { load } = require('../../src/config');

const quiet = { info: () => {}, error: () => {} };
const fastCfg = (extra = {}) => load({}, { pollMs: 50, skipCooldownMs: 100, clickPauseMs: [5, 15], clickTimeoutMs: 800, ...extra });
const makeCtx = (extra = {}) => ({ cfg: fastCfg(extra), log: quiet, signal: new AbortController().signal });

const until = async (fn, timeoutMs = 10000, stepMs = 25) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise(r => setTimeout(r, stepMs));
  }
  return false;
};

module.exports = { makeCtx, until, quiet };
