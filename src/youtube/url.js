'use strict';

// YouTube URL helpers: extract video ids, build watch URLs, derive a channel's Videos page.

const HOSTS = ['youtube.com', 'm.youtube.com', 'music.youtube.com'];
const CHANNEL_PATH = /^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)$/;
const ID = /^[\w-]{11}$/;

function videoId(value) {
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    let id;
    if (host === 'youtu.be') id = u.pathname.split('/')[1];
    else if (HOSTS.includes(host)) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else if (u.pathname.startsWith('/live/')) id = u.pathname.split('/')[2];
    }
    return ID.test(id || '') ? id : null;
  } catch {
    return null;
  }
}

const watchUrl = id => `https://www.youtube.com/watch?v=${id}`;

function channelVideosUrl(owner) {
  const raw = owner?.url || (owner?.id ? `https://www.youtube.com/channel/${owner.id}` : '');
  try {
    const u = new URL(raw);
    if (!['www.youtube.com', 'youtube.com', 'm.youtube.com'].includes(u.hostname)) return null;
    const p = decodeURIComponent(u.pathname).replace(/\/(videos|featured|streams|playlists)\/?$/, '').replace(/\/$/, '');
    return CHANNEL_PATH.test(p) ? `https://www.youtube.com${p}/videos` : null;
  } catch {
    return null;
  }
}

module.exports = { videoId, watchUrl, channelVideosUrl, CHANNEL_PATH, ID };
