import CommonRoute from '../../../foundation/server/CommonRoute';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import DailyStatisticReportController from '../controller/DailyStatisticReportController';
import logger from '../util/ServiceLogger';

class Route extends CommonRoute {
  controller: DailyStatisticReportController =
    new DailyStatisticReportController();
  constructor() {
    super(logger);
    this.prefix = 'dailyStatisticReports';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  }
}
export default Route;
