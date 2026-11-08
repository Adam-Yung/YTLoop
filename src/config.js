'use strict';

// Settings: .env keys plus tunable timings. Every timing and limit lives here.

const path = require('node:path');

const ROOT = path.join(__dirname, '..');

const DEFAULTS = {
  pollMs: 500,
  endWindowSeconds: 10,
  skipCooldownMs: 1100,
  clickTimeoutMs: 2000,
  clickPauseMs: [300, 900],
  navigationTimeoutMs: 25000,
  startupTimeoutMs: 60000,
  stallTimeoutMs: 120000,
  retryDelayMs: 15000,
  playlistRetryMs: 60000,
  botWaitMs: 600000,
  wallCheckMs: 4000,
  recommendationRetryMs: 2000,
  maxVideoFailures: 3,
  maxBrowserFailures: 2,
  chainMin: 10,
  chainMax: 20,
};

const int = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

function load(env = process.env, overrides = {}) {
  const chainMin = int(env.CHAIN_MIN, DEFAULTS.chainMin);
  const chainMax = Math.max(chainMin, int(env.CHAIN_MAX, DEFAULTS.chainMax));
  return {
    ...DEFAULTS,
    playlistUrl: (env.PLAYLIST_URL || '').trim(),
    chainMin,
    chainMax,
    profileDir: env.PROFILE_DIR || path.join(ROOT, '.profile'),
    logDir: env.LOG_DIR || path.join(ROOT, 'logs'),
    ...overrides,
  };
}

function loadEnvFile(file = path.join(ROOT, '.env')) {
  try { process.loadEnvFile(file); } catch { return false; }
  return true;
}

module.exports = { DEFAULTS, load, loadEnvFile };
