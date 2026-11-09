'use strict';

// Refuses to run browsers, tests or the app on this Mac: everything runs on the test VM (npm run vm:<script>), where it is isolated.

if (process.env.YTLOOP_VM === '1') process.exit(0);

console.error([
  'Blocked: this project only runs on the test VM, never on this machine.',
  'Use npm run vm:test, vm:verify, vm:probe, vm:watch or vm:start (see docs/vm.md).',
].join('\n'));
process.exit(1);
