'use strict';

// Fails when a source file has no mirrored doc, or (with --staged) when it changes without its doc.

const fs = require('node:fs');
const { sourceFiles, stagedFiles, covered } = require('./lib');

const docFor = file => `docs/${file}.md`;
const staged = process.argv.includes('--staged');

const missing = sourceFiles().filter(f => !fs.existsSync(docFor(f))).map(f => `${f}: missing ${docFor(f)}`);

const changed = new Set(stagedFiles());
const unstaged = staged
  ? [...changed].filter(f => covered(f) && !changed.has(docFor(f))).map(f => `${f}: staged without ${docFor(f)}`)
  : [];

const found = [...missing, ...unstaged];
found.forEach(p => console.error(p));
if (found.length) process.exit(1);
console.log('docs ok');
