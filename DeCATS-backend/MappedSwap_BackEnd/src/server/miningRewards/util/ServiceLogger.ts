import loggerHelper from '../../../foundation/utils/logger';
import globalVar from '../const/globalVar';
import { serverName } from '../const/index';
const logger = loggerHelper.createRotateLogger(
  serverName,
  undefined,
  globalVar.miningRewardsConfig.winston.console,
);

export default logger;
