'use strict';

// Fails when a source file has block comments or multi-line // comments outside its header.

const fs = require('node:fs');
const { sourceFiles, bodyOf } = require('./lib');

const isCode = f => /\.js$/.test(f);

const problems = file => {
  const { offset, lines } = bodyOf(fs.readFileSync(file, 'utf8'));
  const out = [];
  lines.forEach((line, i) => {
    const n = offset + i + 1;
    if (/^\s*\/\*/.test(line)) out.push(`${file}:${n} block comment outside header`);
    if (/^\s*\/\//.test(line) && /^\s*\/\//.test(lines[i + 1] || '')) out.push(`${file}:${n} multi-line // comment outside header`);
  });
  return out;
};

const found = sourceFiles().filter(isCode).flatMap(problems);
found.forEach(p => console.error(p));
if (found.length) process.exit(1);
console.log('style ok');
