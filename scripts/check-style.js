'use strict';

// Fails when a source file has block comments or multi-line comments (// in JS, # in shell) outside its header.

const fs = require('node:fs');
const { sourceFiles, bodyOf } = require('./lib');

const SYNTAX = {
  js: { line: /^\s*\/\//, block: /^\s*\/\*/ },
  sh: { line: /^\s*#(?!!)/, block: null },
};

const kind = f => (/\.js$/.test(f) ? 'js' : /\.sh$/.test(f) ? 'sh' : null);

const problems = file => {
  const syntax = SYNTAX[kind(file)];
  const { offset, lines } = bodyOf(fs.readFileSync(file, 'utf8'), kind(file));
  const out = [];
  lines.forEach((line, i) => {
    const n = offset + i + 1;
    if (syntax.block && syntax.block.test(line)) out.push(`${file}:${n} block comment outside header`);
    if (syntax.line.test(line) && syntax.line.test(lines[i + 1] || '')) out.push(`${file}:${n} multi-line comment outside header`);
  });
  return out;
};

const found = sourceFiles().filter(kind).flatMap(problems);
found.forEach(p => console.error(p));
if (found.length) process.exit(1);
console.log('style ok');
