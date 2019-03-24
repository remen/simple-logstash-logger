const {createLogger, LoggerConfig, LogFormat, LogLevel} = require('../dist');

// Using __filename as the first argument is recommended.
// This will set the `file` field in the output to the relative path of the current file.
const logger = createLogger(__filename);

logger.info("Hello World");
// {"@timestamp": "2018-01-02T03:04:05.678Z", "@version": 1, "level": "INFO", "file": "src/foobar.js", "message": "Hello World"}
