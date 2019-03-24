import fs from 'fs';
import path from 'path';
import { Logger } from './logger';
import { ILogger, ILoggerConfig, LogFormat, LogLevel } from './types';

const LoggerConfig: ILoggerConfig = {
  context: {},
  format: LogFormat.JSON,
  level: LogLevel.INFO,
  write: (s: string) => {
    fs.writeSync(1, s, null, 'utf-8');
  },
};

function createLogger(fileOrContext: string | object = {}, context: object = {}) {
  let newContext;
  if (fileOrContext instanceof Object) {
    newContext = {
      ...fileOrContext,
    };
  } else {
    newContext = {
      file: path.relative('', fileOrContext),
      ...context,
    };
  }

  return new Logger(newContext, LoggerConfig);
}

export { LogFormat, LogLevel, LoggerConfig, ILogger, createLogger };
