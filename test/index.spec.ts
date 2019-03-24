import { createLogger, LogFormat, LoggerConfig } from '../src';

describe('module smoke tests', () => {
  LoggerConfig.write = s => {
    // console.log(s);
  };

  it('the json logger does not throw', () => {
    LoggerConfig.format = LogFormat.JSON;
    const logger = createLogger(__filename, {});

    logger.info('Hello world');
    logger.error('This is an error message');
    logger.debug('This is a debug message');
    logger.error('This is an error message with a stack trace', new Error('Unexpected exception'));
    logger.error('This is an error message with some context', { path: '/test' });
    logger.error(
      'This is an error message with some context and an stack trace',
      { path: '/test' },
      new Error('Unexpected exception'),
    );
  });

  it('the yaml logger does not throw', () => {
    LoggerConfig.format = LogFormat.YAML;
    const logger = createLogger(__filename, {});

    logger.info('Hello world');
    logger.error('This is an error message');
    logger.debug('This is a debug message');
    logger.error('This is an error message with a stack trace', new Error('Unexpected exception'));
    logger.error('This is an error message with some context', { path: '/test' });
    logger.error(
      'This is an error message with some context and an stack trace',
      { path: '/test' },
      new Error('Unexpected exception'),
    );
  });
});
