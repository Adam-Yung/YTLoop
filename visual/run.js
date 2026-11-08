'use strict';

// Visual verification runner: npm run verify [scenario ...] and npm run verify:live [scenario ...]. Writes visual/results/.

const fs = require('node:fs');
const path = require('node:path');
const { createContext, capture } = require('./lib/ctx');
const { startAwake } = require('./lib/awake');

const RESULTS = path.join(__dirname, 'results');
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

function loadScenarios() {
  const dir = path.join(__dirname, 'scenarios');
  return fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort().map(f => require(path.join(dir, f)));
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes('--live');
  const wanted = args.filter(a => !a.startsWith('--'));
  const all = loadScenarios().filter(s => Boolean(s.live) === live);
  const chosen = wanted.length ? all.filter(s => wanted.includes(s.name)) : all.filter(s => !s.manual);
  if (!chosen.length) throw new Error(`No scenarios match: ${wanted.join(' ') || '(none)'}; available: ${all.map(s => s.name).join(', ')}`);

  const dir = path.join(RESULTS, stamp());
  fs.mkdirSync(dir, { recursive: true });
  const resultsFile = path.join(RESULTS, 'results.tsv');
  const ctx = createContext({ dir, live, resultsFile });
  console.log(`visual run: ${chosen.map(s => s.name).join(', ')}  evidence: ${dir}`);
  if (!capture.supported) console.log('NOTE  real-screen capture is macOS only here; screen checks are skipped');

  const awake = startAwake();
  for (const scenario of chosen) {
    console.log(`\n== ${scenario.name}`);
    try { await scenario.run(ctx); } catch (err) { await ctx.check(`${scenario.name}.crash`, `scenario ran to the end: ${String(err.message).split('\n')[0]}`, () => false); }
  }
  awake.stop();
  ctx.cleanup();
  const failed = ctx.rows.filter(r => r.split('\t')[1] === 'fail').length;
  const passed = ctx.rows.filter(r => r.split('\t')[1] === 'pass').length;
  console.log(`\nresult: ${passed} passed, ${failed} failed, ${ctx.rows.length - passed - failed} skipped; table: ${resultsFile}`);
  process.exitCode = failed ? 1 : 0;
}

main().catch(err => { console.error('[verify]', String(err.message).split('\n')[0]); process.exitCode = 1; });
