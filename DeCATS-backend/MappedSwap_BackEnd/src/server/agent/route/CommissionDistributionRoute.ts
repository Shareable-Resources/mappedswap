import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CommissionDistributionController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: CommissionDistributionController =
    new CommissionDistributionController();
  constructor() {
    super(logger);
    this.prefix = 'commissionDistributions';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.post(
      `/${this.prefix}/acquireSuccess`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.acquireSuccess, logger),
    );

    this.router.get(
      `/${this.prefix}/getActiveAgents`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getActiveAgents, logger),
    );
  }
}

export default Route;
