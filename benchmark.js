// Executes the Node.js server and benchmarks it.

const Monitor = require('monitor');
// Set the probe to push changes every 10 seconds
const processMonitor = new Monitor({
  hostName: 'localhost',
  probeClass: 'Process',
  initParams: {
    pollInterval: 10000
  }
});

// Attach the change listener
processMonitor.on('change', () => {
  console.log('Free memory: ' + processMonitor.get('freemem'));
});

// Now connect the monitor
processMonitor.connect((error) => {
  if (error) {
    console.error('Error connecting with the process probe: ', error);
    process.exit(1);
  }
});

// Run the app
require("./server/app").run();