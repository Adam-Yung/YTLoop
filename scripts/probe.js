'use strict';

// Opens a real YouTube video and reports which selectors match, to catch YouTube DOM changes early.

const { load, loadEnvFile } = require('../src/config');
const { launch } = require('../src/browser');
const { fetchPlaylist } = require('../src/playlist');
const { watchUrl } = require('../src/youtube/url');
const { waitForHuman } = require('../src/guard');
const { sleep } = require('../src/sleep');
const S = require('../src/youtube/selectors');

const count = (page, selector) => page.locator(selector).count();

async function report(page) {
  const checks = {
    player: S.player,
    video: S.video,
    playButton: S.playButton,
    autonavToggle: S.autonavToggle,
    ownerLink: S.ownerLink,
    relatedCards: S.related.cards,
    relatedLinks: `${S.related.cards} >> ${S.related.link}`,
  };
  const rows = [];
  for (const [name, selector] of Object.entries(checks)) rows.push([name, await count(page, selector)]);
  return rows;
}

async function main() {
  loadEnvFile();
  const cfg = load();
  const arg = process.argv[2];
  const id = arg || (await fetchPlaylist(cfg.playlistUrl))[0];
  const log = { info: console.log, error: console.error };
  const { context, page } = await launch(cfg);
  try {
    await page.goto(arg?.startsWith('http') ? arg : watchUrl(id), { waitUntil: 'domcontentloaded' });
    await waitForHuman(page, cfg, log);
    await sleep(8000);
    const rows = await report(page);
    rows.forEach(([name, n]) => console.log(`${n > 0 ? 'ok     ' : 'MISSING'} ${name} (${n})`));
    console.log('skip button: only visible during a skippable ad, so it is not probed');
    process.exitCode = rows.some(([, n]) => n === 0) ? 1 : 0;
  } finally {
    await context.close();
  }
}

main().catch(err => { console.error('[probe]', String(err.message).split('\n')[0]); process.exitCode = 1; });
