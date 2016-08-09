// Forks the Node.js server into threads.

const cluster = require('cluster');
const numCPUs = Math.ceil(require('os').cpus().length / 2);

if (!process.env.SECURE && cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    cluster.fork();
  });
  
} else {
  // Each child runs main app
  require("./server/app").run();
}