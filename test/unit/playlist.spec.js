'use strict';

// Unit tests for src/playlist.js.

const { test, expect } = require('@playwright/test');
const { fetchPlaylist, parsePlaylist } = require('../../src/playlist');

const out = ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc', 'bbbbbbbbbbb']
  .map(id => `https://www.youtube.com/watch?v=${id}`).join('\n') + '\nnot-a-url\n';

test('parsePlaylist dedupes, drops junk and puts the last entry first', () => {
  expect(parsePlaylist(out)).toEqual(['ccccccccccc', 'bbbbbbbbbbb', 'aaaaaaaaaaa']);
});

test('fetchPlaylist passes the URL to yt-dlp', async () => {
  let call;
  const ids = await fetchPlaylist('https://pl', async (cmd, args) => { call = [cmd, args]; return out; });
  expect(call[0]).toBe('yt-dlp');
  expect(call[1].at(-1)).toBe('https://pl');
  expect(ids[0]).toBe('ccccccccccc');
});

test('fetchPlaylist reports a missing yt-dlp', async () => {
  const runner = async () => { throw Object.assign(new Error('spawn'), { code: 'ENOENT' }); };
  await expect(fetchPlaylist('https://pl', runner)).rejects.toThrow('yt-dlp not found on PATH');
});

test('fetchPlaylist rejects empty playlists and missing URL', async () => {
  await expect(fetchPlaylist('https://pl', async () => '\n')).rejects.toThrow('empty or private');
  await expect(fetchPlaylist('')).rejects.toThrow('PLAYLIST_URL');
});
