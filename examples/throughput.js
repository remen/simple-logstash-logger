const {createLogger} = require('../dist');

// Using __filename as the first argument is recommended.
// This will set the `file` field in the output to the relative path of the current file.
const logger = createLogger(__filename);

let before = Date.now();
let logMessages = 1000000;
for (let i = 0; i < logMessages; i++) {
    logger.info("Hello World");
}
let millis = Date.now() - before;
process.stderr.write(`Throughput: ${(logMessages * 1000 / millis)} logs/s`);