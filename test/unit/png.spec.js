'use strict';

// Unit tests for visual/lib/png.js and visual/lib/regions.js with synthetic images.

const { test, expect } = require('@playwright/test');
const { decode, encode, solid } = require('../../visual/lib/png');
const { pixelAt, regionStats, looksBlank, near, colorShare } = require('../../visual/lib/regions');

const paint = (png, rect, [r, g, b]) => {
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const i = (y * png.width + x) * png.channels;
      png.pixels[i] = r; png.pixels[i + 1] = g; png.pixels[i + 2] = b;
    }
  }
};

test('encode then decode returns the same pixels', () => {
  const img = solid(7, 5, [10, 20, 30]);
  paint(img, { x: 2, y: 1, w: 3, h: 2 }, [200, 100, 50]);
  const back = decode(encode(img));
  expect([back.width, back.height, back.channels]).toEqual([7, 5, 3]);
  expect(pixelAt(back, 0, 0)).toEqual([10, 20, 30]);
  expect(pixelAt(back, 3, 2)).toEqual([200, 100, 50]);
});

test('decode handles RGBA and every filter type', () => {
  const img = { width: 4, height: 4, channels: 4, pixels: Buffer.alloc(64) };
  for (let i = 0; i < 64; i++) img.pixels[i] = (i * 37) & 255;
  const back = decode(encode(img));
  expect(back.channels).toBe(4);
  expect(back.pixels.equals(img.pixels)).toBe(true);
});

test('decode rejects things that are not supported PNGs', () => {
  expect(() => decode(Buffer.from('nope nope nope'))).toThrow('Not a PNG');
});

test('a solid image is blank, a busy one is not', () => {
  const img = solid(40, 40, [34, 34, 34]);
  expect(looksBlank(regionStats(img, { x: 0, y: 0, w: 40, h: 40 }))).toBe(true);
  paint(img, { x: 10, y: 10, w: 20, h: 20 }, [200, 0, 0]);
  expect(looksBlank(regionStats(img, { x: 0, y: 0, w: 40, h: 40 }))).toBe(false);
});

test('regionStats mean and clamping', () => {
  const img = solid(10, 10, [100, 150, 200]);
  expect(regionStats(img, { x: -5, y: -5, w: 100, h: 100 }).mean).toEqual([100, 150, 200]);
  expect(regionStats(img, { x: 50, y: 50, w: 5, h: 5 }).count).toBe(0);
});

test('near compares colors within tolerance', () => {
  expect(near([34, 34, 34], [30, 40, 34], 10)).toBe(true);
  expect(near([34, 34, 34], [200, 0, 0], 10)).toBe(false);
});

test('colorShare is the fraction of pixels near a color', () => {
  const img = solid(10, 10, [255, 255, 255]);
  paint(img, { x: 0, y: 0, w: 5, h: 2 }, [250, 5, 5]);
  expect(colorShare(img, { x: 0, y: 0, w: 10, h: 10 }, [255, 0, 0])).toBeCloseTo(0.1);
  expect(colorShare(img, { x: 0, y: 5, w: 10, h: 5 }, [255, 0, 0])).toBe(0);
});
