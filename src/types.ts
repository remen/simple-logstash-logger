export interface ILoggerConfig {
  level: LogLevel;
  format: LogFormat;
  context: any;
  write: (s: string) => any;
}

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  OFF,
}

export enum LogFormat {
  JSON,
  YAML,
}

export interface ILogger {
  trace(message: string, contextOrError?: object | Error, error?: Error): void;
  debug(message: string, contextOrError?: object | Error, error?: Error): void;
  info(message: string, contextOrError?: object | Error, error?: Error): void;
  warn(message: string, contextOrError?: object | Error, error?: Error): void;
  error(message: string, contextOrError?: object | Error, error?: Error): void;
  log(logLevel: LogLevel, message: string, contextOrError?: object | Error, error?: Error): void;
}
