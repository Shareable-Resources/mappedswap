import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { ProfitDailyReportController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: ProfitDailyReportController = new ProfitDailyReportController();
  constructor() {
    super(logger);
    this.prefix = 'profitAndLossReports';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}/getPNLUsersOver`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getPNLUsersOver),
    );
  }
}

export default Route;
