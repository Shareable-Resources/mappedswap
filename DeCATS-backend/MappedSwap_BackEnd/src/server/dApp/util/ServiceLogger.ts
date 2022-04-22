import loggerHelper from '../../../foundation/utils/logger';
import { serverName } from '../const/index';
import globalVar from '../const/globalVar';
const logger = loggerHelper.createRotateLogger(
  serverName,
  undefined,
  globalVar.dAppConfig.winston.console,
);

export default logger;
