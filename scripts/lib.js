'use strict';

// Shared helpers for repo checks: lists covered source files and splits off the header comment.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const ROOTS = ['src/', 'scripts/', 'test/', '.githooks/'];
const ROOT_FILES = ['playwright.config.js'];
const SKIP = ['test/fixtures/'];

const covered = file => !SKIP.some(s => file.startsWith(s)) &&
  (ROOT_FILES.includes(file) || ROOTS.some(r => file.startsWith(r)));

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);

const sourceFiles = () =>
  git('ls-files', '--cached', '--others', '--exclude-standard').filter(f => covered(f) && fs.existsSync(f));

const stagedFiles = () => git('diff', '--cached', '--name-only', '--diff-filter=AMR');

const bodyOf = text => {
  const lines = text.split('\n');
  let i = 0;
  let inBlock = false;
  for (; i < lines.length; i++) {
    const t = lines[i].trim();
    if (inBlock) { if (t.includes('*/')) inBlock = false; continue; }
    if (t.startsWith('#!') || t.startsWith('//') || t === '' || t === "'use strict';") continue;
    if (t.startsWith('/*')) { inBlock = !t.includes('*/'); continue; }
    break;
  }
  return { offset: i, lines: lines.slice(i) };
};

module.exports = { sourceFiles, stagedFiles, bodyOf, covered };
