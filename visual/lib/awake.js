'use strict';

// Keeps the Mac awake and visible: wakes the display, dismisses a running screensaver, and nudges the mouse so the idle timer never reaches it.

const { spawn, execFile } = require('node:child_process');
const { promisify } = require('node:util');

const run = promisify(execFile);
const supported = process.platform === 'darwin';

const NUDGE = `ObjC.import('ApplicationServices');
const p = $.CGEventGetLocation($.CGEventCreate(null));
const move = (x, y) => $.CGEventPost($.kCGHIDEventTap, $.CGEventCreateMouseEvent(null, $.kCGEventMouseMoved, { x, y }, 0));
move(p.x + 1, p.y);
move(p.x, p.y);`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const nudge = () => run('osascript', ['-l', 'JavaScript', '-e', NUDGE]).catch(() => {});

async function screenState() {
  if (!supported) return { saver: false, locked: false };
  const saver = await run('pgrep', ['-x', 'ScreenSaverEngine']).then(() => true, () => false);
  const { stdout } = await run('ioreg', ['-n', 'Root', '-d1', '-a'], { maxBuffer: 10 * 1024 * 1024 }).catch(() => ({ stdout: '' }));
  const locked = /CGSSessionScreenIsLocked<\/key>\s*<true\/>/.test(stdout);
  return { saver, locked };
}

async function wakeScreen() {
  if (!supported) return { saver: false, locked: false };
  await run('caffeinate', ['-u', '-t', '1']).catch(() => {});
  for (let attempt = 0; attempt < 5; attempt++) {
    const state = await screenState();
    if (!state.saver || state.locked) return state;
    await run('killall', ['ScreenSaverEngine']).catch(() => {});
    await nudge();
    await sleep(1000);
  }
  return screenState();
}

const isAwake = state => !state.saver && !state.locked;

function startAwake(intervalMs = 45000) {
  if (!supported) return { stop: () => {} };
  const caffeinate = spawn('caffeinate', ['-d', '-i', '-u'], { stdio: 'ignore' });
  nudge();
  const timer = setInterval(nudge, intervalMs);
  return { stop: () => { clearInterval(timer); caffeinate.kill(); } };
}

module.exports = { startAwake, wakeScreen, screenState, isAwake };
