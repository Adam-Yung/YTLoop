'use strict';

// The fake YouTube used by fixture scenarios: one channel with a chain of related videos, plus another channel.

const ids = { a1: 'aaaaaaaaaa1', a2: 'aaaaaaaaaa2', a3: 'aaaaaaaaaa3', z1: 'zzzzzzzzzz1' };
const channels = {
  a: { id: 'UCa', name: 'Channel A', handle: '@chana', uploads: [ids.a1, ids.a2, ids.a3] },
  z: { id: 'UCz', name: 'Channel Z', handle: '@chanz', uploads: [ids.z1] },
};

const video = (key, channel, extra = {}) => ({ id: ids[key], title: `Video ${key}`, channel, duration: 30, ...extra });

function world(overrides = {}) {
  return {
    channels,
    videos: {
      [ids.a1]: video('a1', 'a', { related: [ids.z1, ids.a2], ...overrides.a1 }),
      [ids.a2]: video('a2', 'a', { related: [ids.a3], ...overrides.a2 }),
      [ids.a3]: video('a3', 'a', overrides.a3),
      [ids.z1]: video('z1', 'z', overrides.z1),
    },
  };
}

const watch = id => `https://www.youtube.com/watch?v=${id}`;

module.exports = { ids, world, watch };
