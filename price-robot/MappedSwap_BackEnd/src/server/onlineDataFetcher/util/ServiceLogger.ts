import loggerHelper from '../../../foundation/utils/logger';
import serverConfigJSON from '../../../config/OnlineDataFetcherConfig.json';
import { serverName } from '../const/index';
const serverConfig =
  serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const logger = loggerHelper.createRotateLogger(
  serverName,
  undefined,
  serverConfig.winston.console,
);

export default logger;
