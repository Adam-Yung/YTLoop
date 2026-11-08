'use strict';

// Fixture tests for src/youtube/channel.js against old and new sidebar layouts and the channel Videos page.

const { test, expect } = require('@playwright/test');
const { createSite } = require('../helpers/youtube-site');
const { makeCtx } = require('../helpers/ctx');
const { readOwner, listRelated, pickSame, followRelated, openChannelUpload, listUploads } = require('../../src/youtube/channel');

const channels = {
  a: { id: 'UCa', name: 'Channel A', handle: '@chana', uploads: ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc'] },
  z: { id: 'UCz', name: 'Channel Z', handle: '@chanz', uploads: ['zzzzzzzzzzz'] },
};
const v = (id, channel, extra = {}) => ({ id, title: `Video ${id}`, channel, duration: 30, ...extra });
const videos = layout => ({
  aaaaaaaaaaa: v('aaaaaaaaaaa', 'a', { layout, related: ['zzzzzzzzzzz', 'bbbbbbbbbbb', 'ccccccccccc'] }),
  bbbbbbbbbbb: v('bbbbbbbbbbb', 'a'),
  ccccccccccc: v('ccccccccccc', 'a'),
  zzzzzzzzzzz: v('zzzzzzzzzzz', 'z'),
});
const start = 'https://www.youtube.com/watch?v=aaaaaaaaaaa';

for (const layout of ['old', 'new']) {
  test(`${layout} layout: owner is read and the first same-channel card is clicked`, async ({ context, page }) => {
    const site = await createSite(context, { videos: videos(layout), channels });
    await page.goto(start);
    const owner = await readOwner(page);
    expect(owner).toMatchObject({ name: 'Channel A', id: 'UCa' });
    const cards = await listRelated(page);
    expect(cards.map(c => c.id)).toEqual(['zzzzzzzzzzz', 'bbbbbbbbbbb', 'ccccccccccc']);
    const pick = pickSame(cards, owner, new Set(['aaaaaaaaaaa']), 'aaaaaaaaaaa');
    expect(pick.id).toBe('bbbbbbbbbbb');
    expect(await followRelated(page, pick, makeCtx())).toBe(true);
    expect(page.url()).toContain('v=bbbbbbbbbbb');
    expect(site.visits.at(-1).referer).not.toBeNull();
  });
}

test('a visited recommendation is skipped', async ({ context, page }) => {
  await createSite(context, { videos: videos('old'), channels });
  await page.goto(start);
  const pick = pickSame(await listRelated(page), await readOwner(page), new Set(['bbbbbbbbbbb']), 'aaaaaaaaaaa');
  expect(pick.id).toBe('ccccccccccc');
});

test('channel Videos page: unvisited upload is clicked', async ({ context, page }) => {
  await createSite(context, { videos: videos('old'), channels });
  await page.goto(start);
  const owner = await readOwner(page);
  const visited = new Set(['aaaaaaaaaaa', 'bbbbbbbbbbb']);
  const id = await openChannelUpload(page, owner, visited, 'aaaaaaaaaaa', makeCtx());
  expect(id).toBe('ccccccccccc');
  expect(page.url()).toContain('v=ccccccccccc');
});

test('channel Videos page: when all are visited it cycles and clears the set', async ({ context, page }) => {
  await createSite(context, { videos: videos('old'), channels });
  await page.goto(start);
  const owner = await readOwner(page);
  const visited = new Set(['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']);
  const id = await openChannelUpload(page, owner, visited, 'ccccccccccc', makeCtx());
  expect(id).toBe('aaaaaaaaaaa');
  expect(visited.size).toBe(0);
});

test('uploads are listed from the grid', async ({ context, page }) => {
  await createSite(context, { videos: videos('old'), channels });
  await page.goto('https://www.youtube.com/@chana/videos');
  expect(await listUploads(page)).toEqual(['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']);
});
