'use strict';

// Same-channel logic: read the owner, match recommendations, click them, and fall back to the channel's Videos page.

const S = require('./selectors');
const { videoId, watchUrl, channelVideosUrl, CHANNEL_PATH } = require('./url');
const { humanClick } = require('../human');

const norm = v => (v || '').replace(/\s+/g, ' ').trim().toLowerCase();

const pathKey = raw => {
  try {
    const p = decodeURIComponent(new URL(raw, 'https://www.youtube.com').pathname).replace(/\/$/, '').toLowerCase();
    return CHANNEL_PATH.test(p) ? p : '';
  } catch { return ''; }
};

function sameChannel(owner, candidate) {
  const a = pathKey(owner?.url), b = pathKey(candidate?.url);
  if (a && b && a.startsWith('/@') === b.startsWith('/@')) return a === b;
  return Boolean(norm(owner?.name) && norm(owner.name) === norm(candidate?.name));
}

function pickSame(cards, owner, visited, currentId) {
  return cards.find(c => c.id !== currentId && !visited.has(c.id) && sameChannel(owner, { name: c.channelName, url: c.channelUrl })) || null;
}

function pickUpload(ids, visited, currentId) {
  const fresh = ids.find(id => id !== currentId && !visited.has(id));
  if (fresh) return { id: fresh, cycled: false };
  const other = ids.find(id => id !== currentId);
  return other ? { id: other, cycled: true } : null;
}

const readOwner = (page) => page.evaluate(sel => {
  const details = window.ytInitialPlayerResponse?.videoDetails || {};
  const link = document.querySelector(sel);
  const id = details.channelId || '';
  return {
    name: String(details.author || link?.textContent || '').trim(),
    id,
    url: link?.href || (id ? `https://www.youtube.com/channel/${id}` : ''),
  };
}, S.ownerLink);

const listRelated = page => page.evaluate(sel => {
  const idOf = href => { try { return new URL(href, location.href).searchParams.get('v') || ''; } catch { return ''; } };
  return [...document.querySelectorAll(sel.cards)].map((card, index) => {
    const link = card.querySelector(sel.link);
    const channel = card.querySelector(sel.channelLink);
    const text = card.querySelector(sel.channelText);
    return {
      index,
      id: idOf(link?.href),
      channelName: (channel?.textContent || text?.textContent || '').trim(),
      channelUrl: channel?.href || '',
    };
  }).filter(c => c.id);
}, S.related);

const listUploads = page => page.evaluate(sel => {
  const ids = [...document.querySelectorAll(sel.cards)].map(card => {
    const a = card.querySelector(sel.link);
    try { return new URL(a.href, location.href).searchParams.get('v'); } catch { return null; }
  });
  return ids.filter(Boolean);
}, S.channelGrid);

async function clickToVideo(page, link, id, ctx) {
  try {
    await humanClick(page, link, ctx.cfg, ctx.signal);
    await page.waitForURL(u => videoId(u.toString()) === id, { timeout: 6000 });
    ctx.log.info('[next] Clicked into', id);
    return true;
  } catch (err) {
    ctx.log.info('[next] Click failed, opening the same video by URL:', err.message.split('\n')[0]);
    await page.goto(watchUrl(id), { waitUntil: 'domcontentloaded', timeout: ctx.cfg.navigationTimeoutMs });
    return false;
  }
}

async function followRelated(page, card, ctx) {
  const link = page.locator(S.related.cards).nth(card.index).locator(S.related.link).first();
  return clickToVideo(page, link, card.id, ctx);
}

async function openChannelUpload(page, owner, visited, currentId, ctx) {
  const url = channelVideosUrl(owner);
  if (!url) return null;
  ctx.log.info('[fallback] Looking at channel uploads:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: ctx.cfg.navigationTimeoutMs });
  await page.waitForSelector(S.channelGrid.cards, { timeout: 16000 }).catch(() => {});
  const choice = pickUpload(await listUploads(page), visited, currentId);
  if (!choice) return null;
  if (choice.cycled) {
    ctx.log.info('[fallback] All uploads visited; starting another cycle');
    visited.clear();
  }
  const link = page.locator(S.channelGrid.cards).locator(`a[href*="v=${choice.id}"]`).first();
  await clickToVideo(page, link, choice.id, ctx);
  return choice.id;
}

module.exports = { sameChannel, pickSame, pickUpload, readOwner, listRelated, listUploads, followRelated, openChannelUpload };
