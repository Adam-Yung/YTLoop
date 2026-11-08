'use strict';

// Playlist access via yt-dlp. Ids come back in walk order: last playlist entry first.

const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { videoId } = require('./youtube/url');

const exec = promisify(execFile);
const run = (cmd, args) => exec(cmd, args, { timeout: 60000, maxBuffer: 10 * 1024 * 1024 }).then(r => r.stdout);

function parsePlaylist(stdout) {
  const ids = stdout.split('\n').map(l => videoId(l.trim())).filter(Boolean);
  return [...new Set(ids)].reverse();
}

async function fetchPlaylist(url, runner = run) {
  if (!url) throw new Error('PLAYLIST_URL is not set');
  let stdout;
  try {
    stdout = await runner('yt-dlp', ['-i', '--flat-playlist', '--no-warnings', '--print', 'url', url]);
  } catch (err) {
    const why = err.code === 'ENOENT' ? 'yt-dlp not found on PATH' : String(err.message).split('\n')[0];
    throw new Error(`Playlist fetch failed: ${why}`);
  }
  const ids = parsePlaylist(stdout);
  if (!ids.length) throw new Error('Playlist is empty or private');
  return ids;
}

module.exports = { fetchPlaylist, parsePlaylist };
