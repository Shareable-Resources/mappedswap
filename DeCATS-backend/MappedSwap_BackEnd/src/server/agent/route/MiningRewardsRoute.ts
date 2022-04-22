import CommonRoute from '../../../foundation/server/CommonRoute';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import MiningRewardsController from '../controller/MiningRewardsController';
import logger from '../util/ServiceLogger';

class Route extends CommonRoute {
  controller: MiningRewardsController = new MiningRewardsController();
  constructor() {
    super(logger);
    this.prefix = 'miningRewards';
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
    this.router.get(
      `/${this.prefix}/getAllLedger`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllLedger, logger),
    );
    this.router.post(
      `/${this.prefix}/updateMstPrice`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.updateMstPrice, logger),
    );
  }
}
export default Route;
