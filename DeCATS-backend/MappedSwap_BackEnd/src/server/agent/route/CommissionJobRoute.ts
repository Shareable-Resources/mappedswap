import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CommissionJobController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: CommissionJobController = new CommissionJobController();
  constructor() {
    super(logger);
    this.prefix = 'commissionJobs';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getAllSummary`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllSummary, logger),
    );
    this.router.post(
      `/${this.prefix}/approve`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.approve, logger),
    );
    this.router.post(
      `/${this.prefix}/enterMSTRate`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.enterMSTRate, logger),
    );
  }
}

export default Route;
