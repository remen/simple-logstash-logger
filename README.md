# simple-logstash-logger

A simple nodejs logger for synchronously writing json/yaml logs in logstash-format to stdout.

## Why would I use this instead of bunyan/winston/pino?

* You are running a nodejs service on kubernetes, and simply want to log to stdout and feed it to logstash using `filebeat`.
* It is simpler. Not faster (pino). Not more flexible (bunyan/winston). Not asynchronous (winston).

## Usage

```javascript
const {createLogger} = require('simple-logstash-logger');

 // Using __filename as the first argument is recommended.
 // This will set the `file` field in the output to the relative path of the current file.
const logger = createLogger(__filename);

logger.info("Hello World");
```
Output
```json
{"@timestamp":"2019-03-24T15:10:56.414Z","@version":1,"level":"INFO","file":"examples/simple.js","message":"Hello World"}
```

### Setting the log level

```javascript
const {createLogger, LoggerConfig, LogLevel} = require('simple-logstash-logger');

const logger = createLogger(__filename);

// LoggerConfig can be modified after logger instantiation, allowing for
// modification of log level during runtime.
LoggerConfig.level = LogLevel.DEBUG; // default: INFO

logger.debug("Hello World");

// Setting the log level to OFF effectively disables all logging
LoggerConfig.level = LogLevel.OFF;

logger.error("Even this will not be seen. Good while running tests, bad in production");
```

### Setting the output format to YAML

While developing, it is useful to use the YAML output format. Especially nice for
stack traces (see section below).

```javascript
const logger = createLogger(__filename);

// Order does not matter, you can set the format after instantiating the logger
LoggerConfig.format = LogFormat.YAML;

logger.info("Hello World");
```

Output

```yaml

---
'@timestamp': '2019-03-24T15:13:00.424Z'
'@version': 1
level: INFO
file: examples/yaml.js
message: Hello World
```

### Adding contextual information

```javascript
// Contextual information can be added 

// 1) globally on the LoggerConfig
LoggerConfig.context = {application: "my-application"};

// 2) as part of the logger creation
const logger = createLogger(__filename, {loggerType: "request-logs"});

// 3) and in each event
logger.info("Received request", {
    request: {
        path: "/hello",
        headers: {
            "content-type": "application/json"
        }
    }
}); 
```

Output

```yaml

---
'@timestamp': '2019-03-24T15:19:55.204Z'
'@version': 1
level: INFO
application: my-application
file: examples/contextual.js
loggerType: request-logs
message: Received request
request:
  path: /hello
  headers:
    content-type: application/json
```

### Adding stack traces

If an error object is given as the last argument to a logger method, the stack trace
for that object is added.

```javascript
try {
    throw new Error("Oops, my bad!");
} catch (err) {
    logger.error("Caught unexpected exception", err);
}
```

Output

```yaml

---
'@timestamp': '2019-03-24T15:25:51.014Z'
'@version': 1
level: ERROR
file: examples/errors.js
message: Caught unexpected exception
stackTrace: |-
  Error: Oops, my bad!
      at Object.<anonymous> (/.../examples/errors.js:6:11)
      at Module._compile (internal/modules/cjs/loader.js:701:30)
      at Object.Module._extensions..js (internal/modules/cjs/loader.js:712:10)
      at Module.load (internal/modules/cjs/loader.js:600:32)
      at tryModuleLoad (internal/modules/cjs/loader.js:539:12)
      at Function.Module._load (internal/modules/cjs/loader.js:531:3)
      at Function.Module.runMain (internal/modules/cjs/loader.js:754:12)
      at startup (internal/bootstrap/node.js:283:19)
      at bootstrapNodeJSCore (internal/bootstrap/node.js:622:3)
```

## FAQ

### Why synchronous?

Being synchronous means that any slowdown in stdout blocks the event loop,
forcing the application to slow down. The alternative is either:
* having log statements return promises, which would force any function that wants to log to
  become asynchronous too, or
* buffer unbounded in memory, which can lead to the process crashing loosing all buffered logs

However, being synchronized means that the application can stop responding if stdout
becomes a bottleneck. This library was built with the philosophy that, in the event
of a overloaded service, logging properly is *more important* than being able to serve
incoming http requests.

In practice, this should only be a problem if you are logging a *lot* of events.
A small throughput test when redirecting to file on a modern laptop yielded a
throughput of ~50k log events per second.

## Development Guide

### Setting up
```bash
git clone https://github.com/remen/node-simple-logstash-logger
cd node-simple-logstash-logger
npm install
```

### Running tests
```bash
npm test
```
