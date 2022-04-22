import { ProfitDailyReportController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: ProfitDailyReportController = new ProfitDailyReportController();
  constructor() {
    super(logger);
    this.prefix = 'profitDailyReports';
    this.setRoutes();
  }

  protected setRoutes() {
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/create`,
        makeHandlerAwareOfAsyncErrors(this.controller.create, logger),
      );
      this.router.post(
        `/${this.prefix}/createMany`,
        makeHandlerAwareOfAsyncErrors(this.controller.createMany, logger),
      );
    }
  }
}

export default Route;
