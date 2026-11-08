'use strict';

// Human-like pacing: random ranges, and clicks that move the mouse to a jittered point and pause first.

const { sleep } = require('./sleep');

const between = (min, max, rng = Math.random) => min + rng() * (max - min);

async function humanClick(page, locator, cfg, signal, { rng = Math.random, stillNeeded = async () => true } = {}) {
  await locator.scrollIntoViewIfNeeded({ timeout: cfg.clickTimeoutMs });
  const box = await locator.boundingBox();
  if (!box) throw new Error('Click target has no box');
  const x = box.width * between(0.3, 0.7, rng);
  const y = box.height * between(0.3, 0.7, rng);
  await page.mouse.move(box.x + x, box.y + y, { steps: Math.round(between(8, 15, rng)) });
  await sleep(between(...cfg.clickPauseMs, rng), signal);
  if (!(await stillNeeded())) return false;
  await locator.click({ position: { x, y }, timeout: cfg.clickTimeoutMs });
  return true;
}

module.exports = { between, humanClick };
