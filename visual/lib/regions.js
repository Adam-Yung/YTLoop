'use strict';

// Pixel questions about a decoded PNG: color at a point, statistics of a region, "is this blank", "is this about that color".

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function pixelAt(png, x, y) {
  const i = (clamp(Math.round(y), 0, png.height - 1) * png.width + clamp(Math.round(x), 0, png.width - 1)) * png.channels;
  return [png.pixels[i], png.pixels[i + 1], png.pixels[i + 2]];
}

function regionStats(png, rect) {
  const x0 = clamp(Math.floor(rect.x), 0, png.width), y0 = clamp(Math.floor(rect.y), 0, png.height);
  const x1 = clamp(Math.ceil(rect.x + rect.w), 0, png.width), y1 = clamp(Math.ceil(rect.y + rect.h), 0, png.height);
  const colors = new Set();
  const sum = [0, 0, 0];
  let count = 0, lumaSum = 0, lumaSq = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const [r, g, b] = pixelAt(png, x, y);
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      sum[0] += r; sum[1] += g; sum[2] += b;
      lumaSum += luma; lumaSq += luma * luma; count += 1;
      colors.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
    }
  }
  if (!count) return { count: 0, mean: [0, 0, 0], luma: 0, lumaStd: 0, colors: 0 };
  const luma = lumaSum / count;
  return {
    count,
    mean: sum.map(v => Math.round(v / count)),
    luma,
    lumaStd: Math.sqrt(Math.max(0, lumaSq / count - luma * luma)),
    colors: colors.size,
  };
}

const looksBlank = stats => stats.count === 0 || stats.colors < 2 || stats.lumaStd < 2;

const near = (a, b, tolerance = 24) => a.every((v, i) => Math.abs(v - b[i]) <= tolerance);

function colorShare(png, rect, color, tolerance = 40) {
  const x0 = clamp(Math.floor(rect.x), 0, png.width), y0 = clamp(Math.floor(rect.y), 0, png.height);
  const x1 = clamp(Math.ceil(rect.x + rect.w), 0, png.width), y1 = clamp(Math.ceil(rect.y + rect.h), 0, png.height);
  let hits = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (near(pixelAt(png, x, y), color, tolerance)) hits += 1;
  const total = (x1 - x0) * (y1 - y0);
  return total ? hits / total : 0;
}

module.exports = { pixelAt, regionStats, looksBlank, near, colorShare };
