'use strict';

// Real-screen evidence on macOS and Windows: screenshots, screen recordings, window geometry, raising the window. Other platforms report unsupported.

const { execFile, spawn } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { decode } = require('./png');
const win = require('./win');

const run = promisify(execFile);
const windows = process.platform === 'win32';
const supported = process.platform === 'darwin' || windows;

async function screenshot(file, width = 0) {
  if (!supported) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (windows) await win.call(`Shot ${win.quote(file)} ${width}`);
  else {
    await run('screencapture', ['-x', '-D', '1', file]);
    if (width) await run('sips', ['--resampleWidth', String(width), file]);
  }
  return fs.existsSync(file);
}

function ffmpegPath() {
  const own = process.env.YTLOOP_FFMPEG || path.join(os.homedir(), 'tools', 'bin', 'ffmpeg.exe');
  return fs.existsSync(own) ? own : 'ffmpeg';
}

const RECORDERS = {
  darwin: file => spawn('screencapture', ['-v', '-x', '-D', '1', file], { stdio: 'ignore' }),
  win32: file => spawn(ffmpegPath(), ['-y', '-loglevel', 'error', '-f', 'gdigrab', '-framerate', '10', '-i', 'desktop', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'ignore', 'ignore'], windowsHide: true }),
};

function startRecording(file) {
  if (!supported) return { stop: async () => false };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const child = RECORDERS[process.platform](file);
  const exited = new Promise(resolve => { child.once('exit', resolve); child.once('error', resolve); });
  return {
    stop: async () => {
      if (windows) child.stdin?.end('q');
      else child.kill('SIGINT');
      await Promise.race([exited, new Promise(r => setTimeout(r, 8000))]);
      if (child.exitCode === null) child.kill();
      return fs.existsSync(file) && fs.statSync(file).size > 0;
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
      if (await screenshot(file, 640)) files.push(file);
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
  if (windows) {
    const pid = Number(await win.call(`BrowserPid ${win.quote(profileDir)}`));
    return pid || null;
  }
  const { stdout } = await run('ps', ['-axo', 'pid=,args=']);
  const main = stdout.split('\n').find(l => l.includes(`--user-data-dir=${profileDir}`) && l.includes('.app/Contents/MacOS/') && !l.includes('--type='));
  return main ? Number(main.trim().split(/\s+/)[0]) : null;
}

async function raiseWindow(page, cfg) {
  await page.bringToFront().catch(() => {});
  if (!supported) return;
  try {
    const pid = await browserPid(cfg.profileDir);
    if (!pid) return;
    if (windows) await win.call(`Raise ${pid}`);
    else await run('osascript', ['-l', 'JavaScript', '-e', ACTIVATE(pid)]);
  } catch { /* Raising is best effort; the checks will say if the window is hidden. */ }
}

const FRONT = `ObjC.import('AppKit'); $.NSWorkspace.sharedWorkspace.frontmostApplication.processIdentifier`;

async function isFrontmost(cfg) {
  if (!supported) return true;
  const pid = await browserPid(cfg.profileDir);
  const front = windows ? await win.call('FrontPid') : (await run('osascript', ['-l', 'JavaScript', '-e', FRONT])).stdout;
  return pid !== null && Number(front) === pid;
}

const readPng = file => decode(fs.readFileSync(file));

module.exports = { supported, screenshot, startRecording, startSampler, elementOnScreen, windowGeometry, raiseWindow, isFrontmost, readPng };
