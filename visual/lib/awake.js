'use strict';

// Keeps the Mac awake during long runs: caffeinate for sleep, plus a 1 px mouse nudge that resets the idle timer so the screensaver never starts.

const { spawn, execFile } = require('node:child_process');

const NUDGE = `ObjC.import('ApplicationServices');
const p = $.CGEventGetLocation($.CGEventCreate(null));
const move = (x, y) => $.CGEventPost($.kCGHIDEventTap, $.CGEventCreateMouseEvent(null, $.kCGEventMouseMoved, { x, y }, 0));
move(p.x + 1, p.y);
move(p.x, p.y);`;

function startAwake(intervalMs = 45000) {
  if (process.platform !== 'darwin') return { stop: () => {} };
  const caffeinate = spawn('caffeinate', ['-d', '-i', '-u'], { stdio: 'ignore' });
  const nudge = () => execFile('osascript', ['-l', 'JavaScript', '-e', NUDGE], () => {});
  nudge();
  const timer = setInterval(nudge, intervalMs);
  return { stop: () => { clearInterval(timer); caffeinate.kill(); } };
}

module.exports = { startAwake };
