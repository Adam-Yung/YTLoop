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

async function extractFrames(video, dir, fps = 2) {
  fs.mkdirSync(dir, { recursive: true });
  try {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vf', `fps=${fps}`, path.join(dir, 'frame_%03d.png')]);
  } catch {
    return [];
  }
  return fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort().map(f => path.join(dir, f));
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

const APP_NAMES = { chromium: 'Google Chrome for Testing', chrome: 'Google Chrome' };

async function raiseWindow(page, channel) {
  await page.bringToFront().catch(() => {});
  if (!supported) return;
  try {
    await run('open', ['-a', APP_NAMES[channel] || APP_NAMES.chromium]);
  } catch { /* Raising is best effort; the checks will say if the window is hidden. */ }
}

const readPng = file => decode(fs.readFileSync(file));

module.exports = { supported, screenshot, startRecording, extractFrames, elementOnScreen, windowGeometry, raiseWindow, readPng };
