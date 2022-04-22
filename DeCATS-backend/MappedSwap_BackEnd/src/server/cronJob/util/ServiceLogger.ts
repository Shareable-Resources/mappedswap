import loggerHelper from '../../../foundation/utils/logger';

import globalVar from '../const/globalVar';

const logger = loggerHelper.createRotateLogger(
  globalVar.cronJobConfig.name,
  undefined,
  globalVar.cronJobConfig.winston.console,
);

export default logger;
