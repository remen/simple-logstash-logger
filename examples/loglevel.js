const {createLogger, LoggerConfig, LogLevel} = require('../dist');

const logger = createLogger(__filename);

// LoggerConfig can be modified after logger instantiation, allowing for
// modification of log level during runtime
LoggerConfig.level = LogLevel.DEBUG; // default: INFO

logger.debug("Hello World");