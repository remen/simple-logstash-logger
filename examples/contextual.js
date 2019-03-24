const {createLogger, LoggerConfig, LogFormat} = require('../dist');
LoggerConfig.format = LogFormat.YAML;

// Contextual information can be added globally on the LoggerConfig
LoggerConfig.context = {application: "my-application"};

// As part of the logger creation
const logger = createLogger(__filename, {loggerType: "request-logs"});

// And in each logger message
logger.info("Received request", {request: {path: "/hello", headers: {"content-type": "application/json"}}});