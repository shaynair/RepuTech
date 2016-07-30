// Executes the Node.js server and benchmarks it.

const memwatch = require('memwatch');

const Monitor = require('monitor');
// Set the probe to push changes every 10 seconds
const processMonitor = new Monitor({
  hostName: 'localhost',
  probeClass: 'Process',
  initParams: {
    pollInterval: 10000
  }
});

// Memory leak detection
memwatch.on('leak', (info) => {
    console.log("Memory leak detected: grown " + info.growth + " on " 
                + info.end + ": " + info.reason);
});
memwatch.on('stats', (stats) => {
    if (stats.usage_trend > 0) {
        // Using more and more memory
        console.log("Potential leak: trend " + stats.usage_trend 
                +  ", heap compactions: " + stats.heap_compactions);
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