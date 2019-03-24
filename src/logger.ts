import yaml from 'js-yaml';
import { ILogger, ILoggerConfig, LogFormat, LogLevel } from './types';

export class Logger implements ILogger {
  private readonly loggerContext: object;
  private readonly config: ILoggerConfig;

  constructor(loggerContext: object = {}, config: ILoggerConfig) {
    this.loggerContext = loggerContext;
    this.config = config;
  }

  public trace(message: string, contextOrError?: object | Error, error?: Error): void {
    this.log(LogLevel.TRACE, message, contextOrError, error);
  }

  public debug(message: string, contextOrError?: object | Error, error?: Error): void {
    this.log(LogLevel.DEBUG, message, contextOrError, error);
  }

  public info(message: string, errOrContext?: Error | object, error?: Error) {
    this.log(LogLevel.INFO, message, errOrContext, error);
  }

  public warn(message: string, contextOrError?: object | Error, error?: Error): void {
    this.log(LogLevel.WARN, message, contextOrError, error);
  }

  public error(message: string, contextOrError?: object | Error, error?: Error): void {
    this.log(LogLevel.ERROR, message, contextOrError, error);
  }

  public log(level: LogLevel, message: string, errOrContext?: Error | object, err?: Error) {
    if (level < this.config.level) {
      return;
    }
    const logEvent = this.createLogEvent(level, message, errOrContext, err);
    switch (this.config.format) {
      case LogFormat.YAML:
        this.write('---\n' + yaml.safeDump(logEvent, { skipInvalid: true }));
        break;
      case LogFormat.JSON:
        this.write(JSON.stringify(logEvent) + '\n');
        break;
    }
  }

  public createLogEvent(level: LogLevel, message: string, errOrContext?: Error | object, err?: Error) {
    const logEvent: any = {
      '@timestamp': new Date().toISOString(),
      '@version': 1,
      level: LogLevel[level],
      ...this.config.context,
      ...this.loggerContext,
      message,
    };

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
  }

  private write(s: string) {
    this.config.write(s);
  }
}
