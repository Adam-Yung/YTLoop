'use strict';

// Abortable sleep: resolves early when the signal aborts, so Ctrl+C never waits out a long delay.

const sleep = (ms, signal) => new Promise(resolve => {
  if (signal?.aborted) return resolve();
  const done = () => { clearTimeout(timer); signal?.removeEventListener('abort', done); resolve(); };
  const timer = setTimeout(done, ms);
  signal?.addEventListener('abort', done);
});

module.exports = { sleep };
