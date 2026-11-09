'use strict';

// Real-screen evidence on macOS: screenshots, screen recordings, window geometry, raising the window. Other platforms report unsupported.

const { execFile, spawn } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs');
const path = require('node:path');
const { decode } = require('./png');

const run = promisify(execFile);
const supported = process.platform === 'darwin';

async function screenshot(file) {
  if (!supported) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await run('screencapture', ['-x', '-D', '1', file]);
  return fs.existsSync(file);
}

function startRecording(file) {
  if (!supported) return { stop: async () => false };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const child = spawn('screencapture', ['-v', '-x', '-D', '1', file], { stdio: 'ignore' });
  const exited = new Promise(resolve => child.once('exit', resolve));
  return {
    stop: async () => {
      child.kill('SIGINT');
      await Promise.race([exited, new Promise(r => setTimeout(r, 8000))]);
      return fs.existsSync(file);
    },
  };
}

function startSampler(dir, everyMs) {
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  let busy = false;
  const timer = supported && setInterval(async () => {
    if (busy) return;
    busy = true;
    const file = path.join(dir, `sample_${String(files.length + 1).padStart(3, '0')}.png`);
    try {
      if (await screenshot(file)) {
        await run('sips', ['--resampleWidth', '640', file]);
        files.push(file);
      }
    } catch { /* A missed sample is fine; the checks require most of them. */ }
    busy = false;
  }, everyMs);
  return {
    stop: async () => {
      if (timer) clearInterval(timer);
      while (busy) await new Promise(r => setTimeout(r, 100));
      return files;
    },
  };
}

const windowGeometry = page => page.evaluate(() => ({
  x: window.screenX, y: window.screenY, outerW: window.outerWidth, outerH: window.outerHeight,
  innerW: window.innerWidth, innerH: window.innerHeight, screenW: screen.width, screenH: screen.height,
}));

async function toScreenPoint(page, png, localX, localY) {
  const g = await windowGeometry(page);
  const scale = png.width / g.screenW;
  const chromeTop = g.outerH - g.innerH;
  return { x: (g.x + (g.outerW - g.innerW) / 2 + localX) * scale, y: (g.y + chromeTop + localY) * scale, scale };
}

async function elementOnScreen(page, png, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return null;
  const g = await windowGeometry(page);
  const view = await page.evaluate(() => ({ vx: window.visualViewport?.offsetLeft || 0, vy: window.visualViewport?.offsetTop || 0 }));
  const origin = await toScreenPoint(page, png, box.x + view.vx, box.y + view.vy);
  const scale = png.width / g.screenW;
  return { x: origin.x, y: origin.y, w: box.width * scale, h: box.height * scale };
}

const ACTIVATE = pid => `ObjC.import('AppKit'); $.NSRunningApplication.runningApplicationWithProcessIdentifier(${pid}).activateWithOptions(3)`;

async function browserPid(profileDir) {
  const { stdout } = await run('ps', ['-axo', 'pid=,args=']);
  const main = stdout.split('\n').find(l => l.includes(`--user-data-dir=${profileDir}`) && l.includes('.app/Contents/MacOS/') && !l.includes('--type='));
  return main ? Number(main.trim().split(/\s+/)[0]) : null;
}

async function raiseWindow(page, cfg) {
  await page.bringToFront().catch(() => {});
  if (!supported) return;
  try {
    const pid = await browserPid(cfg.profileDir);
    if (pid) await run('osascript', ['-l', 'JavaScript', '-e', ACTIVATE(pid)]);
  } catch { /* Raising is best effort; the checks will say if the window is hidden. */ }
}

const FRONT = `ObjC.import('AppKit'); $.NSWorkspace.sharedWorkspace.frontmostApplication.processIdentifier`;

async function isFrontmost(cfg) {
  if (!supported) return true;
  const pid = await browserPid(cfg.profileDir);
  const { stdout } = await run('osascript', ['-l', 'JavaScript', '-e', FRONT]);
  return pid !== null && Number(stdout) === pid;
}

const readPng = file => decode(fs.readFileSync(file));

module.exports = { supported, screenshot, startRecording, startSampler, elementOnScreen, windowGeometry, raiseWindow, isFrontmost, readPng };
