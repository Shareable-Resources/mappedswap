import loggerHelper from '../../foundation/utils/logger';
import { serverName } from '../const/index';
import serverConfigJson from '../../config/DecatsServerConfig.json';

const serverConfig =
  serverConfigJson[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const logger = loggerHelper.createRotateLogger(
  serverName,
  undefined,
  serverConfig.winston.console,
);

export default logger;
