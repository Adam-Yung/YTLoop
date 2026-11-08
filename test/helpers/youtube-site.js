'use strict';

// Fake YouTube for fixture tests: routes youtube.com requests to local HTML built from video and channel definitions.

const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'fixtures');
const read = name => fs.readFileSync(path.join(dir, name), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fill = (tpl, map) => Object.entries(map).reduce((t, [k, v]) => t.split(`{{${k}}}`).join(v), tpl);

const oldCard = (v, channel) => `<ytd-compact-video-renderer><a id="thumbnail" href="/watch?v=${v.id}">thumb</a>` +
  `<a id="video-title" href="/watch?v=${v.id}">${esc(v.title)}</a><ytd-channel-name id="channel-name"><div>${esc(channel.name)}</div></ytd-channel-name></ytd-compact-video-renderer>`;

const newCard = (v, channel) => `<yt-lockup-view-model><a class="yt-lockup-view-model-wiz__content-image" href="/watch?v=${v.id}">thumb</a>` +
  `<a class="yt-lockup-metadata-view-model-wiz__title" href="/watch?v=${v.id}">${esc(v.title)}</a>` +
  `<div class="yt-content-metadata-view-model-wiz__metadata-text">${esc(channel.name)}</div></yt-lockup-view-model>`;

const gridItem = v => `<ytd-rich-grid-media><a id="thumbnail" href="/watch?v=${v.id}">thumb</a>` +
  `<a id="video-title-link" href="/watch?v=${v.id}">${esc(v.title)}</a></ytd-rich-grid-media>`;

function createSite(context, { videos, channels, timeScale = 20 }) {
  const site = { visits: [], videos, channels, botWall: new Set() };
  const byId = id => videos[id];
  const channelOf = v => channels[v.channel];

  const watchPage = v => {
    const ch = channelOf(v);
    const card = v.layout === 'new' ? newCard : oldCard;
    const related = (v.related || []).map(id => card(byId(id), channelOf(byId(id)))).join('');
    const data = { duration: v.duration, breaks: v.breaks, startPaused: v.startPaused, autoplayTo: v.autoplayTo, autoplayDelayMs: v.autoplayDelayMs, autonavStuck: v.autonavStuck, stallAt: v.stallAt, timeScale: v.timeScale || timeScale };
    const cover = v.skipCovered ? '<div class="cover"></div>' : '';
    const masthead = v.signedOut ? '<ytd-masthead><a href="https://accounts.google.com/ServiceLogin?x=1">Sign in</a></ytd-masthead>' : '';
    return fill(read('watch.html'), {
      MASTHEAD: masthead, LIKE_PRESSED: v.liked ? 'true' : 'false',
      TITLE: esc(v.title), COVER: cover, CHANNEL_URL: `/${ch.handle}`, CHANNEL_NAME: esc(ch.name), RELATED: related,
      PLAYER_RESPONSE: JSON.stringify({ videoDetails: { author: ch.name, channelId: ch.id } }),
      DATA: JSON.stringify(data), CLIENT: read('watch-client.js'),
    });
  };

  const channelPage = ch => fill(read('channel.html'), {
    NAME: esc(ch.name), GRID: ch.uploads.map(id => gridItem(byId(id))).join(''),
  });

  const respond = (request, url) => {
    const watchId = url.pathname === '/watch' && url.searchParams.get('v');
    if (watchId && byId(watchId)) return site.botWall.has(watchId) ? read('bot-wall.html') : watchPage(byId(watchId));
    const handle = url.pathname.match(/^\/(@[^/]+)\/videos$/);
    const ch = handle && Object.values(channels).find(c => c.handle === handle[1]);
    return ch ? channelPage(ch) : null;
  };

  return context.route(/^https:\/\/(www\.)?youtube\.com\//, route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.isNavigationRequest()) site.visits.push({ path: url.pathname + url.search, referer: request.headers().referer || null });
    const body = respond(request, url);
    return body ? route.fulfill({ contentType: 'text/html', body }) : route.fulfill({ status: 404, body: 'not found' });
  }).then(() => site);
}

module.exports = { createSite };
