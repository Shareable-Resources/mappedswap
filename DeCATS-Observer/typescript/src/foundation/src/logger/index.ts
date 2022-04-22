import winston, { createLogger } from 'winston';
import 'winston-daily-rotate-file';

const { colorize, combine, timestamp, label, printf, json } = winston.format;
const custom = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    http: 5,
  },
  colors: {
    error: 'red',
    warn: 'orange',
    info: 'white bold yellow',
    verbose: 'blue',
    debug: 'green',
    http: 'pink',
  },
};
winston.addColors(custom.colors);
const myFormat = printf((info: any) => {
  return `[${info.timestamp}] [${info.level}] ${info.message} ${info.meta}`;
});

const loggerHelper = {
  createRotateLogger(filename: string, timeInterval?: string) {
    timeInterval = timeInterval ? timeInterval : '14d';
    const transport = new winston.transports.DailyRotateFile({
      filename: `${filename}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: timeInterval,
      symlinkName: filename,
    });
    transport.on('rotate', function (oldFilename, newFilename) {
      // do something fun
    });
    return winston.createLogger({
      levels: custom.levels,
      format: combine(
        label({ label: 'order-api errors' }),
        timestamp(),
        colorize({ colors: custom.colors }),
        json(),
        myFormat,
      ),

      transports: [transport],
    });
  },
};

export default loggerHelper;
