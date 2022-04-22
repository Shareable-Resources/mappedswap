import loggerHelper from '../../foundation/utils/logger';
import globalVar from '../const/globalVar';
import { serverName } from '../const/index';
const logger = loggerHelper.createRotateLogger(
  serverName,
  undefined,
  globalVar.decatsConfig.winston.console,
);

export default logger;
