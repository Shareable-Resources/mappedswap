import path from 'path';
import winston, { createLogger, format } from 'winston';
import 'winston-daily-rotate-file';
const { colorize, combine, timestamp, label, printf, json } = winston.format;
export const folderPath = {
  dist: path.join(__dirname, '../../../logs'),
  proj: 'logs',
};

const custom = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    //Anything less than debug will log in console
    verbose: 5,
  },
  //Only those exists in colors npm package
  colors: {
    error: 'red bold',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'magenta bold',
    verbose: 'blue italic',
  },
};
winston.addColors(custom.colors);

function retriveSymbolLevel(info: winston.Logform.TransformableInfo) {
  const symbolLevel: any = Object.getOwnPropertySymbols(info).find(function (
    s,
  ) {
    return String(s) === 'Symbol(level)';
  });
  const level = info[symbolLevel];
  return level;
}

const infoDebugWarnFilter = winston.format((info, opts) => {
  const level = retriveSymbolLevel(info);
  const levelToBeLogged = ['info', 'warn', 'debug', 'http', 'verbose'];
  const includeLevel = levelToBeLogged.includes(level);
  return includeLevel ? info : false;
});

const customFormat = winston.format.printf((info) => {
  const level = retriveSymbolLevel(info);
  return `[${level.toUpperCase()}]: [${info.timestamp}] [${info.message}]`;
});

const errorFormat = winston.format.printf((info) => {
  const level = retriveSymbolLevel(info);
  return `[${level.toUpperCase()}]: [${info.timestamp}] [${info.message}] [${
    info.stack
  }]`;
});

const loggerHelper = {
  createRotateLogger(
    filename: string,
    timeInterval?: string,
    logInConsole?: boolean,
  ): winston.Logger {
    timeInterval = timeInterval ? timeInterval : '14d';
    const transports: winston.transport | winston.transport[] | undefined = [
      //Only error log will be log in /error/xxxxx.log
      new winston.transports.DailyRotateFile({
        filename: `${folderPath.dist}/error/${filename}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '128m',
        maxFiles: '14d',
        json: true,
        level: 'error',
        createSymlink: true,
        symlinkName: `${filename}.log`,
        format: winston.format.combine(winston.format.timestamp(), errorFormat),
      }),
      //http and lower level will log in /info/xxxxx.log
      new winston.transports.DailyRotateFile({
        filename: `${folderPath.dist}/info/${filename}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '128m',
        maxFiles: '14d',
        level: 'verbose', //log all logs which is below level of this (verbose) in info.log
        json: true,
        createSymlink: true,
        symlinkName: `${filename}.log`,
        format: winston.format.combine(
          infoDebugWarnFilter(),
          winston.format.timestamp(),
          customFormat,
        ),
      }),
    ];
    if (logInConsole) {
      //only use console to log level below debug
      transports.push(
        new winston.transports.Console({
          format: winston.format.simple(),
          level: 'debug',
        }),
      );
    }
    return winston.createLogger({
      levels: custom.levels,
      exitOnError: false,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        customFormat,
        winston.format.errors({ stack: true }),
      ),
      transports: transports,
    });
  },
};

export default loggerHelper;
