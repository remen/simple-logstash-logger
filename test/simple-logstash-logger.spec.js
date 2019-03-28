const yaml = require('js-yaml');
const lolex = require('lolex');
const { LogFormat, LogLevel, LoggerConfig, Logger, createLogger } = require('../src/simple-logstash-logger');

describe('simple-logstash-logger', () => {
  const message = 'An event has occurred';

  /** @type {import('lolex').InstalledClock} */
  let clock;

  /** @type {string} */
  let output;

  let defaultLoggerConfig = {
    ...LoggerConfig
  };

  beforeEach(() => {
    clock = lolex.install({ now: Date.UTC(2018, 0, 2, 3, 4, 5, 678) });
    output = '';
    LoggerConfig.write = (s) => {
      output += s;
    };
  });

  afterEach(() => {
    clock.uninstall();
    // Reset LoggerConfig to original settings
    Object.assign(LoggerConfig, defaultLoggerConfig);
  });

  /**
   * @param logEvent {Object<string, any>}
   */
  function expectBasicFields(logEvent) {
    expect(logEvent['@timestamp']).toStrictEqual('2018-01-02T03:04:05.678Z');
    expect(logEvent['@version']).toStrictEqual(1);
    expect(logEvent.level).toStrictEqual('INFO');
    expect(logEvent.message).toStrictEqual(message);
  }

  describe('createLogEvent(INFO, message)', () => {
    /** @type {Object<string,any>} */
    let logEvent;

    beforeEach(() => {
      logEvent = createLogger().createLogEvent(LogLevel.INFO, message);
    });

    it('sets all basic fields (@timestamp, @version, level & message)', () => {
      expectBasicFields(logEvent);
    });
  });

  describe('createLogEvent(INFO, message, error)', () => {
    const error = new Error('An unexpected exception');

    /** @type {Object<string,any>} */
    let logEvent;
    beforeEach(() => {
      logEvent = createLogger().createLogEvent(LogLevel.INFO, message, error);
    });

    it('sets all basic fields (@timestamp, @version, level & message)', () => {
      expectBasicFields(logEvent);
    });

    it('sets stackTrace', () => {
      expect(logEvent.stackTrace).toEqual(error.stack);
    });
  });

  describe('createLogEvent(INFO, message, context)', () => {
    const context = {
      pages: [1, 2, 3],
      path: '/hello',
    };

    /** @type {Object<string,any>} */
    let logEvent;
    beforeEach(() => {
      logEvent = createLogger().createLogEvent(LogLevel.INFO, message, context);
    });

    it('sets all basic fields (@timestamp, @version, level & message)', () => {
      expectBasicFields(logEvent);
    });

    it('sets properties from context', () => {
      expect(logEvent.path).toStrictEqual(context.path);
      expect(logEvent.pages).toStrictEqual(context.pages);
    });
  });

  describe('createLogEvent(INFO, message, context, error)', () => {
    const context = {
      pages: [1, 2, 3],
      path: '/hello',
    };
    const error = new Error('An unexpected exception');

    /** @type {Object<string,any>} */
    let logEvent;
    beforeEach(() => {
      logEvent = createLogger().createLogEvent(LogLevel.INFO, message, context, error);
    });

    it('sets all basic fields (@timestamp, @version, level & message)', () => {
      expectBasicFields(logEvent);
    });

    it('sets properties from context', () => {
      expect(logEvent.path).toStrictEqual(context.path);
      expect(logEvent.pages).toStrictEqual(context.pages);
    });

    it('sets stackTrace', () => {
      expect(logEvent.stackTrace).toEqual(error.stack);
    });
  });

  describe('when LoggerConfig.level = LogLevel.TRACE', () => {
    /** @type {Logger} */
    let logger;
    beforeEach(() => {
      LoggerConfig.level = LogLevel.TRACE;
      logger = createLogger();
    });
    it('it can log on trace level', () => {
      logger.trace(message);
      let parsedOutput = JSON.parse(output);
      expect(parsedOutput.message).toStrictEqual(message);
      expect(parsedOutput.level).toStrictEqual('TRACE');
    });
    it('it can log on debug level', () => {
      logger.debug(message);
      let parsedOutput = JSON.parse(output);
      expect(parsedOutput.message).toStrictEqual(message);
      expect(parsedOutput.level).toStrictEqual('DEBUG');
    });
    it('it can log on info level', () => {
      logger.info(message);
      let parsedOutput = JSON.parse(output);
      expect(parsedOutput.message).toStrictEqual(message);
      expect(parsedOutput.level).toStrictEqual('INFO');
    });
    it('it can log on warn level', () => {
      logger.warn(message);
      let parsedOutput = JSON.parse(output);
      expect(parsedOutput.message).toStrictEqual(message);
      expect(parsedOutput.level).toStrictEqual('WARN');
    });
    it('it can log on error level', () => {
      logger.error(message);
      let parsedOutput = JSON.parse(output);
      expect(parsedOutput.message).toStrictEqual(message);
      expect(parsedOutput.level).toStrictEqual('ERROR');
    });
  });

  describe('when LoggerConfig.level = LogLevel.OFF', () => {
    /** @type {Logger} */
    let logger;
    beforeEach(() => {
      LoggerConfig.level = LogLevel.OFF;
      logger = createLogger();
    });
    it('all logs are discarded', () => {
      logger.trace(message);
      logger.debug(message);
      logger.info(message);
      logger.warn(message);
      logger.error(message);
      expect(output).toStrictEqual('');
    });
  });

  it('can output in json format', () => {
    LoggerConfig.format = LogFormat.JSON;
    createLogger().info(message);
    const parsedOutput = JSON.parse(output);
    expect(parsedOutput['@timestamp']).toStrictEqual('2018-01-02T03:04:05.678Z');
  });

  it('can output in yaml format', () => {
    LoggerConfig.format = LogFormat.YAML;
    createLogger().info(message);
    const parsedOutput = yaml.load(output);
    expect(parsedOutput['@timestamp']).toStrictEqual('2018-01-02T03:04:05.678Z');
  });

  it('filters logs below LoggerConfig.level', () => {
    LoggerConfig.level = LogLevel.INFO;
    createLogger().debug(message);
    expect(output).toStrictEqual('');
  });

  it('createLogger(__filename) adds file field', () => {
    createLogger(__filename).info(message);
    expect(JSON.parse(output).file).toStrictEqual('test/simple-logstash-logger.spec.js');
  });

  it('createLogger({name: "request-logs"}) adds name field', () => {
    createLogger({ name: 'request-logs' }).info(message);
    expect(JSON.parse(output).name).toStrictEqual('request-logs');
  });

  it('createLogger(__filename, {name: "request-logs"}) adds both file and name fields', () => {
    createLogger(__filename, { name: 'request-logs' }).info(message);
    expect(JSON.parse(output).file).toStrictEqual('test/simple-logstash-logger.spec.js');
    expect(JSON.parse(output).name).toStrictEqual('request-logs');
  });

  it('adds context from LoggerConfig', () => {
    LoggerConfig.context.application = 'my-application';
    createLogger().info(message);
    expect(JSON.parse(output).application).toStrictEqual('my-application');
  });
});
