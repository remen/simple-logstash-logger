const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * @enum {string}
 */
const LogFormat = {
  JSON: 'json',
  YAML: 'yaml',
};

/**
 * @readonly
 * @enum {number}
 */
const LogLevel = {
  // tslint:disable:object-literal-sort-keys
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  OFF: 5,
  // tslint:enable
};
const LogLevelNames = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

/**
 * @typedef {Object} ILoggerConfig
 * @property {object} context
 * @property {LogFormat} format
 * @property {LogLevel} level
 * @property {(function(string): *)} write
 */

/**
 * @type {ILoggerConfig}
 */
const LoggerConfig = {
  context: {},
  format: LogFormat.JSON,
  level: LogLevel.INFO,
  write: s => fs.writeSync(1, s, null, 'utf-8'),
};

/**
 *
 * Creates a logger
 *
 * @param {string | object} [fileOrContext]
 * @param {object} [context]
 * @returns {Logger}
 */
function createLogger(fileOrContext, context) {
  let newContext;

  if (!fileOrContext) {
    newContext = {}
  } else if (typeof fileOrContext === 'string') {
    newContext = {
      file: path.relative('', fileOrContext),
      ...context,
    };
  } else {
    newContext = {
      ...fileOrContext,
    };
  }

  return new Logger(newContext, LoggerConfig);
}

/**
 * @param {object} context
 * @param {ILoggerConfig} config
 * @constructor
 * @example
 *    const logger = new Logger({}, LoggerConfig);
 */
function Logger(context, config) {
  /**
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */
  this.trace = (messageOrContext, errOrContext, err) => {
    this.log(LogLevel.TRACE, messageOrContext, errOrContext, err);
  };

  /**
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */
  this.debug = (messageOrContext, errOrContext, err) => {
    this.log(LogLevel.DEBUG, messageOrContext, errOrContext, err);
  };

  /**
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */
  this.info = (messageOrContext, errOrContext, err) => {
    this.log(LogLevel.INFO, messageOrContext, errOrContext, err);
  };

  /**
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */
  this.warn = (messageOrContext, errOrContext, err) => {
    this.log(LogLevel.WARN, messageOrContext, errOrContext, err);
  };

  /**
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */
  this.error = (messageOrContext, errOrContext, err) => {
    this.log(LogLevel.ERROR, messageOrContext, errOrContext, err);
  };

  /**
   * @param {LogLevel} level
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */
  this.log = (level, messageOrContext, errOrContext, err) => {
    if (level < config.level) {
      return;
    }
    const logEvent = this.createLogEvent(level, messageOrContext, errOrContext, err);
    switch (config.format) {
      case LogFormat.YAML:
        write('---\n' + yaml.safeDump(logEvent, { skipInvalid: true }));
        break;
      case LogFormat.JSON:
        write(JSON.stringify(logEvent) + '\n');
        break;
    }
  };

  /**
   * @callback LoggerFunction
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object} [errOrContext]
   * @param {Error} [err]
   */

  /**
   * @param {LogLevel} level
   * @param {string | Object<string, any>} messageOrContext
   * @param {Error | Object<string, any>} [errOrContext]
   * @param {Error} [err]
   * @returns {Object<string, any>}
   */
  this.createLogEvent = function createLogEvent(level, messageOrContext, errOrContext, err) {
    const logEvent = {
      '@timestamp': new Date().toISOString(),
      '@version': 1,
      level: LogLevelNames[level],
      ...config.context,
      ...context,
    };

    if (typeof messageOrContext === 'string') {
      logEvent.message = messageOrContext;
    } else {
      Object.assign(logEvent, messageOrContext);
    }

    if (errOrContext) {
      if (errOrContext instanceof Error) {
        logEvent.stackTrace = errOrContext.stack;
      } else {
        Object.assign(logEvent, errOrContext);
        if (err) {
          logEvent.stackTrace = err.stack;
        }
      }
    }
    return logEvent;
  };

  /**
   * @param {string} s
   */
  function write(s) {
    config.write(s);
  }
}

module.exports = {
  LogFormat,
  LogLevel,
  Logger,
  LoggerConfig,
  createLogger,
};
