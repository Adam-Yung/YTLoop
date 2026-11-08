'use strict';

// Scenario context: check/skip/note recording to the results TSV, evidence shots (page and real screen), polling, and a fake-site browser.

const fs = require('node:fs');
const path = require('node:path');
const { load } = require('../../src/config');
const { createLog } = require('../../src/log');
const { launch } = require('../../src/browser');
const { createSite } = require('../../test/helpers/youtube-site');
const { tmpDir, removeDir } = require('../../test/helpers/tmp');
const capture = require('./capture');
const { regionStats, looksBlank, pixelAt, near } = require('./regions');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function until(fn, timeoutMs = 15000, stepMs = 100) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (await fn().catch(() => false)) return true;
    await sleep(stepMs);
  }
  return false;
}

function createContext({ dir, live, resultsFile }) {
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  const record = (id, status, name) => {
    rows.push(`${id}\t${status}\t${name}`);
    fs.writeFileSync(resultsFile, `${rows.join('\n')}\n`);
  };
  const note = (...items) => console.log('      ..', ...items);
  const check = async (id, name, fn) => {
    let ok = false;
    try { ok = (await fn()) !== false; } catch (err) { note(String(err.message).split('\n')[0]); }
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${name}`);
    record(id, ok ? 'pass' : 'fail', name);
    return ok;
  };
  const skip = (id, name, why) => { console.log(`SKIP  ${id}  ${name} (${why})`); record(id, 'skip', name); };
  const log = createLog(path.join(dir, 'logs'));
  const cfg = load({}, { profileDir: tmpDir('visual-profile'), logDir: path.join(dir, 'logs') });

  const evidence = async (page, name) => {
    const pw = path.join(dir, `${name}.page.png`);
    await page.screenshot({ path: pw }).catch(() => {});
    const osFile = path.join(dir, `${name}.screen.png`);
    const shown = (await capture.screenshot(osFile)) ? capture.readPng(osFile) : null;
    return { pw, os: shown };
  };

  const cleanup = () => removeDir(cfg.profileDir);
  return { dir, live, cfg, log, rows, check, skip, note, record, evidence, sleep, until, cleanup };
}

async function openFake(ctx, { videos, channels, timeScale }) {
  const { context, page } = await launch(ctx.cfg, { headless: false });
  const site = await createSite(context, { videos, channels, timeScale });
  const close = async () => { await context.close().catch(() => {}); };
  return { context, page, site, close };
}

async function colorOnScreen(page, shot, selector) {
  if (!shot.os) return null;
  const rect = await capture.elementOnScreen(page, shot.os, selector);
  if (!rect) return null;
  return pixelAt(shot.os, rect.x + rect.w * 0.9, rect.y + rect.h / 2);
}

async function statsOnScreen(page, shot, selector) {
  if (!shot.os) return null;
  const rect = await capture.elementOnScreen(page, shot.os, selector);
  return rect ? regionStats(shot.os, rect) : null;
}

module.exports = { createContext, openFake, colorOnScreen, statsOnScreen, until, sleep, looksBlank, near, capture };
