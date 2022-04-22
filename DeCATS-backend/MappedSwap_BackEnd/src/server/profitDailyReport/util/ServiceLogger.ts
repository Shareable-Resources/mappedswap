import loggerHelper from '../../../foundation/utils/logger';

import globalVar from '../const/globalVar';

const logger = loggerHelper.createRotateLogger(
  globalVar.profitDailyReportConfig.name,
  undefined,
  globalVar.profitDailyReportConfig.winston.console,
);

export default logger;
