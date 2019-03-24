const {createLogger, LoggerConfig, LogFormat} = require('../dist');

const logger = createLogger(__filename);

// Order does not matter, you can set the format after instantiating the logger
LoggerConfig.format = LogFormat.YAML;

logger.info("Hello World");
logger.error("I caught an exception", new Error("My bad!"));