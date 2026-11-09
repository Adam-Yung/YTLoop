'use strict';

// Unit tests for scripts/lib.js bodyOf and the comment rules in scripts/check-style.js.

const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { bodyOf, covered } = require('../../scripts/lib');
const { tmpDir, removeDir } = require('../helpers/tmp');

test('js header ends at the first code line', () => {
  const { offset } = bodyOf("'use strict';\n\n// header\n\nconst a = 1;\n");
  expect(offset).toBe(4);
});

test('shell header ends at the first command, shebang included', () => {
  const { offset, lines } = bodyOf('#!/usr/bin/env bash\n# header one\n# header two\nset -e\necho hi\n', 'sh');
  expect(offset).toBe(3);
  expect(lines[0]).toBe('set -e');
});

test('covered files include vm scripts and exclude fixtures and results', () => {
  expect(covered('vm/run.sh')).toBe(true);
  expect(covered('test/fixtures/watch.html')).toBe(false);
  expect(covered('visual/results/x.js')).toBe(false);
});

test('check-style flags a multi-line comment in a shell file but allows its header', () => {
  const dir = tmpDir('style');
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(path.join(repo, 'vm'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'scripts'));
  for (const f of ['lib.js', 'check-style.js']) fs.copyFileSync(path.join(__dirname, '..', '..', 'scripts', f), path.join(repo, 'scripts', f));
  const git = (...a) => execFileSync('git', a, { cwd: repo, stdio: 'ignore' });
  git('init', '-q');
  const run = () => spawnSync(process.execPath, ['scripts/check-style.js'], { cwd: repo, encoding: 'utf8' });

  fs.writeFileSync(path.join(repo, 'vm', 'ok.sh'), '#!/usr/bin/env bash\n# header\n# more header\nset -e\n# one\necho hi\n');
  expect(run().status).toBe(0);

  fs.writeFileSync(path.join(repo, 'vm', 'bad.sh'), '#!/usr/bin/env bash\n# header\nset -e\n# first\n# second\necho hi\n');
  const bad = run();
  expect(bad.status).toBe(1);
  expect(bad.stderr).toContain('vm/bad.sh:4 multi-line comment outside header');
  removeDir(dir);
});
