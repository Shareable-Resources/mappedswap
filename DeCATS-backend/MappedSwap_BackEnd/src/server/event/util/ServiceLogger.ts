import loggerHelper from '../../../foundation/utils/logger';

import globalVar from '../const/globalVar';

const logger = loggerHelper.createRotateLogger(
  globalVar.eventConfig.name,
  undefined,
  globalVar.eventConfig.winston.console,
);

export default logger;
