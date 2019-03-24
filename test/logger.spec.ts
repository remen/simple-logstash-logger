import * as yaml from 'js-yaml';
import * as lolex from 'lolex';
import * as path from 'path';
import { LogFormat, LogLevel } from '../src';
import { Logger } from '../src/logger';
import { ILoggerConfig } from '../src/types';

describe('Logger', () => {
  const message = 'An event has occurred';

  let clock: lolex.InstalledClock<lolex.Clock>;
  let output: string;
  let config: ILoggerConfig;

  function createLogger() {
    return new Logger({ file: path.relative('', __filename) }, config);
  }

  beforeEach(() => {
    clock = lolex.install({ now: Date.UTC(2018, 0, 2, 3, 4, 5, 678) });
    output = '';
    config = {
      context: {
        application: 'my-application',
      },
      format: LogFormat.JSON,
      level: LogLevel.INFO,
      write: s => {
        output += s;
      },
    };
  });

  afterEach(() => {
    clock.uninstall();
  });

  function expectBasicFields(logEvent: any): void {
    expect(logEvent['@timestamp']).toStrictEqual('2018-01-02T03:04:05.678Z');
    expect(logEvent['@version']).toStrictEqual(1);
    expect(logEvent.level).toStrictEqual('INFO');
    expect(logEvent.message).toStrictEqual(message);
    expect(logEvent.application).toStrictEqual(config.context.application);
    expect(logEvent.file).toStrictEqual('test/logger.spec.ts');
  }

  describe('createLogEvent(INFO, message)', () => {
    let logEvent: any;

    beforeEach(() => {
      logEvent = createLogger().createLogEvent(LogLevel.INFO, message);
    });

    it('sets all basic fields (@timestamp, @version, level & message)', () => {
      expectBasicFields(logEvent);
    });
  });

  describe('createLogEvent(INFO, message, error)', () => {
    const error = new Error('An unexpected exception');

    let logEvent: any;
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

    let logEvent: any;
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

    let logEvent: any;
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

  describe('when using the json format', () => {
    beforeEach(() => {
      config.format = LogFormat.JSON;
    });

    it('outputs in json format', () => {
      createLogger().info(message);
      const parsedOutput = JSON.parse(output);
      expect(parsedOutput['@timestamp']).toStrictEqual('2018-01-02T03:04:05.678Z');
    });
  });

  describe('when using the yaml format', () => {
    beforeEach(() => {
      config.format = LogFormat.YAML;
    });

    it('outputs in yaml format', () => {
      createLogger().info(message);
      const parsedOutput = yaml.load(output);
      expect(parsedOutput['@timestamp']).toStrictEqual('2018-01-02T03:04:05.678Z');
    });
  });

  describe('when logging on level below default log level', () => {
    beforeEach(() => {
      config.level = LogLevel.INFO;
      createLogger().debug(message);
    });

    it('throws away the output', () => {
      expect(output).toStrictEqual('');
    });
  });
});
