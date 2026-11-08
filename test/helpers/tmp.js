'use strict';

// Scratch directories live in <repo>/tmp (git-ignored), never in the system temp dir.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', 'tmp');

function tmpDir(prefix) {
  fs.mkdirSync(ROOT, { recursive: true });
  return fs.mkdtempSync(path.join(ROOT, `${prefix}-`));
}

const removeDir = dir => fs.rmSync(dir, { recursive: true, force: true });

module.exports = { tmpDir, removeDir, ROOT };
