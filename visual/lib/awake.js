'use strict';

// Keeps the machine awake and visible: wakes the display, dismisses a running screensaver, and nudges the mouse so the idle timer never reaches it. macOS and Windows.

const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const win = require('./win');

const run = promisify(execFile);
const mac = process.platform === 'darwin';
const windows = process.platform === 'win32';
const supported = mac || windows;

const NUDGE = `ObjC.import('ApplicationServices');
const p = $.CGEventGetLocation($.CGEventCreate(null));
const move = (x, y) => $.CGEventPost($.kCGHIDEventTap, $.CGEventCreateMouseEvent(null, $.kCGEventMouseMoved, { x, y }, 0));
move(p.x + 1, p.y);
move(p.x, p.y);`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const nudge = () => (windows ? win.call('Nudge') : run('osascript', ['-l', 'JavaScript', '-e', NUDGE])).catch(() => {});

async function screenState() {
  if (!supported) return { saver: false, locked: false };
  if (windows) {
    const [saver, locked] = await Promise.all([win.call('Saver'), win.call('Locked')]).catch(() => ['false', 'false']);
    return { saver: saver === 'true', locked: locked === 'true' };
  }
  const saver = await run('pgrep', ['-x', 'ScreenSaverEngine']).then(() => true, () => false);
  const { stdout } = await run('ioreg', ['-n', 'Root', '-d1', '-a'], { maxBuffer: 10 * 1024 * 1024 }).catch(() => ({ stdout: '' }));
  const locked = /CGSSessionScreenIsLocked<\/key>\s*<true\/>/.test(stdout);
  return { saver, locked };
}

const stopSaver = () => (windows ? win.call('KillSaver') : run('killall', ['ScreenSaverEngine'])).catch(() => {});

async function wakeScreen() {
  if (!supported) return { saver: false, locked: false };
  if (mac) await run('caffeinate', ['-u', '-t', '1']).catch(() => {});
  for (let attempt = 0; attempt < 5; attempt++) {
    const state = await screenState();
    if (!state.saver || state.locked) return state;
    await stopSaver();
    await nudge();
    await sleep(1000);
  }
  return screenState();
}

const isAwake = state => !state.saver && !state.locked;

function startAwake(intervalMs = 45000) {
  if (!supported) return { stop: () => {} };
  const caffeinate = mac ? spawn('caffeinate', ['-d', '-i', '-u'], { stdio: 'ignore' }) : null;
  if (windows) win.call('Awake $true').catch(() => {});
  nudge();
  const timer = setInterval(nudge, intervalMs);
  return {
    stop: () => {
      clearInterval(timer);
      if (caffeinate) caffeinate.kill();
      if (windows) win.call('Awake $false').catch(() => {});
    },
  };
}

module.exports = { startAwake, wakeScreen, screenState, isAwake };
