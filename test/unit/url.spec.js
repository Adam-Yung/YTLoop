'use strict';

// Unit tests for src/youtube/url.js.

const { test, expect } = require('@playwright/test');
const { videoId, watchUrl, channelVideosUrl } = require('../../src/youtube/url');

test('videoId reads watch, short and live URLs', () => {
  expect(videoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5&list=PL1')).toBe('dQw4w9WgXcQ');
  expect(videoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  expect(videoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
});

test('videoId rejects other hosts, bad ids and junk', () => {
  expect(videoId('https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  expect(videoId('https://www.youtube.com/watch?v=short')).toBeNull();
  expect(videoId('not a url')).toBeNull();
});

test('watchUrl has no list or time parameters', () => {
  expect(watchUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

test('channelVideosUrl normalizes handle, id and tab URLs', () => {
  expect(channelVideosUrl({ url: 'https://www.youtube.com/@chan/featured' })).toBe('https://www.youtube.com/@chan/videos');
  expect(channelVideosUrl({ url: 'https://www.youtube.com/@chan/' })).toBe('https://www.youtube.com/@chan/videos');
  expect(channelVideosUrl({ id: 'UC123' })).toBe('https://www.youtube.com/channel/UC123/videos');
});

test('channelVideosUrl refuses foreign or non-channel URLs', () => {
  expect(channelVideosUrl({ url: 'https://evil.example/@chan' })).toBeNull();
  expect(channelVideosUrl({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBeNull();
  expect(channelVideosUrl(null)).toBeNull();
});
