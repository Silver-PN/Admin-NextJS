var fs = require('node:fs');
var path = require('node:path');
var pino = require('pino');
var pretty = require('pino-pretty');

var logDir = 'lib/log';
var infoFile = path.join(logDir, 'info.stream.out');
var debugFile = path.join(logDir, 'debug.stream.out');
var fatalFile = path.join(logDir, 'fatal.stream.out');
var errorFile = path.join(logDir, 'error.stream.out');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

var streams = [
  { stream: fs.createWriteStream(infoFile, { flags: 'a' }) },
  { stream: pretty() },
  { level: 'debug', stream: fs.createWriteStream(debugFile, { flags: 'a' }) },
  { level: 'fatal', stream: fs.createWriteStream(fatalFile, { flags: 'a' }) },
  {
    level: 'error',
    stream: fs.createWriteStream(errorFile, { flags: 'a' })
  }
];

var log = pino(
  {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  },
  pino.multistream(streams)
);

export default log;
