import loggerHelper from '../../foundation/utils/logger';
// import { serverName } from '../const/index';
import serverConfigJSON from '../../config/FoundationConfig.json';
const serverConfig =
  serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const logger = loggerHelper.createRotateLogger(
  'foundation',
  undefined,
  serverConfig.winston.console,
);

export default logger;
