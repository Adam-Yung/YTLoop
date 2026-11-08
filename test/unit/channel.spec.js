'use strict';

// Unit tests for the pure parts of src/youtube/channel.js.

const { test, expect } = require('@playwright/test');
const { sameChannel, pickSame, pickUpload } = require('../../src/youtube/channel');

const owner = { name: 'Channel A', url: 'https://www.youtube.com/@chana' };

test('same handle URL matches, different handle does not', () => {
  expect(sameChannel(owner, { url: 'https://www.youtube.com/@CHANA/' })).toBe(true);
  expect(sameChannel(owner, { name: 'Channel A', url: 'https://www.youtube.com/@other' })).toBe(false);
});

test('name matches when no comparable URL exists', () => {
  expect(sameChannel(owner, { name: '  channel   a ' })).toBe(true);
  expect(sameChannel(owner, { name: 'Channel B' })).toBe(false);
  expect(sameChannel({ name: '' }, { name: '' })).toBe(false);
});

test('pickSame returns the first unvisited same-channel card', () => {
  const cards = [
    { id: 'cur', channelName: 'Channel A' },
    { id: 'other', channelName: 'Channel B' },
    { id: 'seen', channelName: 'Channel A' },
    { id: 'want', channelName: 'Channel A' },
    { id: 'later', channelName: 'Channel A' },
  ];
  expect(pickSame(cards, owner, new Set(['seen']), 'cur').id).toBe('want');
  expect(pickSame(cards, owner, new Set(['seen', 'want', 'later']), 'cur')).toBeNull();
});

test('pickUpload prefers unvisited, then cycles, never the current video', () => {
  expect(pickUpload(['a', 'b', 'c'], new Set(['a']), 'x')).toEqual({ id: 'b', cycled: false });
  expect(pickUpload(['a', 'b'], new Set(['a', 'b']), 'a')).toEqual({ id: 'b', cycled: true });
  expect(pickUpload(['a'], new Set(['a']), 'a')).toBeNull();
  expect(pickUpload([], new Set(), 'a')).toBeNull();
});
