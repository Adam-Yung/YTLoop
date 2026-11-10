'use strict';

// Refuses to run the development checks (tests, real-screen verification, live probe) on this machine: they run on the test VM (npm run vm:<script>), where any damage stays isolated. The app itself (npm start) is not guarded; it runs anywhere.

if (process.env.YTLOOP_VM === '1') process.exit(0);

console.error([
  'Blocked: development checks run on the test VM, not on this machine.',
  'Use npm run vm:test, vm:verify, vm:probe or vm:watch (see docs/vm.md).',
].join('\n'));
process.exit(1);
