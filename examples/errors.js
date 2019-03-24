const {createLogger, LoggerConfig, LogFormat} = require('../dist');
LoggerConfig.format = LogFormat.YAML;
const logger = createLogger(__filename);

try {
    throw new Error("Oops, my bad!");
} catch (err) {
    logger.error("Caught unexpected exception", err);
}