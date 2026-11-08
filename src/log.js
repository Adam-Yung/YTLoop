'use strict';

// Console logger that also appends errors to <logDir>/errors.log.

const fs = require('node:fs');
const path = require('node:path');

function createLog(dir) {
  const file = path.join(dir, 'errors.log');
  const stamp = () => new Date().toISOString();
  const info = (...items) => console.log(stamp(), ...items);
  const error = (...items) => {
    console.error(stamp(), ...items);
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(file, `${stamp()} ${items.join(' ')}\n`);
    } catch { /* Logging must never crash the app. */ }
  };
  return { info, error, file };
}

module.exports = { createLog };
