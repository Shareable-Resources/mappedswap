import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { ProfitAndLossReportController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: ProfitAndLossReportController =
    new ProfitAndLossReportController();
  constructor() {
    super(logger);
    this.prefix = 'profitAndLossReports';
    this.setRoutes();
  }

  protected setRoutes() {
    //Non Token APIs
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );

    this.router.get(
      `/${this.prefix}/getCurrentPNL`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getCurrentPNL),
    );
    this.router.get(
      `/${this.prefix}/getCurrentPNLTest`,
      makeHandlerAwareOfAsyncErrors(this.controller.getCurrentPNLTest),
    );
  }
}

export default Route;
