'use strict';

// One-time YouTube sign-in for the app's browser profile: opens plain Chrome (no automation, so Google accepts the login) on that profile and waits until it is quit.

const { spawn } = require('node:child_process');
const { loadEnvFile, load } = require('../src/config');

const LOGIN_URL = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2F';
const KEYCHAIN_FLAGS = ['--use-mock-keychain', '--password-store=basic'];
const WAIT_MS = 15 * 60 * 1000;

const chromeArgs = profileDir => [`--user-data-dir=${profileDir}`, ...KEYCHAIN_FLAGS, '--no-first-run', LOGIN_URL];

function openPlainChrome(profileDir, waitMs = WAIT_MS) {
  const child = spawn('open', ['-W', '-n', '-a', 'Google Chrome', '--args', ...chromeArgs(profileDir)], { stdio: 'ignore' });
  const done = new Promise(resolve => child.once('exit', resolve));
  const timer = setTimeout(() => child.kill(), waitMs);
  return done.finally(() => clearTimeout(timer));
}

async function main() {
  loadEnvFile();
  const cfg = load(process.env);
  if (cfg.browserChannel !== 'chrome') {
    console.log('Sign-in is only needed for BROWSER_CHANNEL=chrome. Set it in .env first.');
    return;
  }
  if (process.platform !== 'darwin') {
    console.log(`On this platform start Chrome yourself, sign in, then quit it:\n  chrome ${chromeArgs(cfg.profileDir).map(a => `"${a}"`).join(' ')}`);
    return;
  }
  console.log(`Sign in to YouTube in the Chrome window, then quit Chrome (Cmd+Q). Profile: ${cfg.profileDir}`);
  await openPlainChrome(cfg.profileDir);
  console.log('Done. Start the app with npm start.');
}

if (require.main === module) main();

module.exports = { chromeArgs, openPlainChrome, LOGIN_URL, WAIT_MS };
