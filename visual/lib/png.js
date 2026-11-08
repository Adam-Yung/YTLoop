'use strict';

// Minimal PNG reader and writer (8-bit RGB or RGBA, no interlacing): enough for screenshots, no dependencies.

const zlib = require('node:zlib');

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 2: 3, 6: 4 };

const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

function unfilter(raw, width, height, bpp) {
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const type = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? out[y * stride + x - bpp] : 0;
      const up = y ? out[(y - 1) * stride + x] : 0;
      const upLeft = y && x >= bpp ? out[(y - 1) * stride + x - bpp] : 0;
      const predictor = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)][type];
      if (predictor === undefined) throw new Error(`Bad PNG filter ${type}`);
      out[y * stride + x] = (raw[src + x] + predictor) & 255;
    }
  }
  return out;
}

function decode(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('Not a PNG');
  let width, height, colorType, depth, interlace;
  const data = [];
  for (let pos = 8; pos < buffer.length;) {
    const length = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const body = buffer.subarray(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4);
      depth = body[8]; colorType = body[9]; interlace = body[12];
    } else if (type === 'IDAT') data.push(body);
    else if (type === 'IEND') break;
    pos += 12 + length;
  }
  if (depth !== 8 || !CHANNELS[colorType] || interlace) throw new Error(`Unsupported PNG (depth ${depth}, type ${colorType}, interlace ${interlace})`);
  const bpp = CHANNELS[colorType];
  const pixels = unfilter(zlib.inflateSync(Buffer.concat(data)), width, height, bpp);
  return { width, height, channels: bpp, pixels };
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buf => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, body) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0);
  return Buffer.concat([head, body, crc]);
};

function encode({ width, height, channels, pixels }) {
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = channels === 4 ? 6 : 2;
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function solid(width, height, [r, g, b]) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixels.length; i += 3) { pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; }
  return { width, height, channels: 3, pixels };
}

module.exports = { decode, encode, solid };
