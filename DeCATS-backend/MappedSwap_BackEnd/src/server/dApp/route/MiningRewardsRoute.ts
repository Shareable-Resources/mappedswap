import CommonRoute from '../../../foundation/server/CommonRoute';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { MiningRewardsController } from '../controller/0_index';
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
      `/${this.prefix}/getRewardByAddress`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getRewardByAddress),
    );
    this.router.post(
      `/${this.prefix}/updateRewardById`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.updateRewardById),
    );
    this.router.get(
      `/${this.prefix}/getClaimSummary`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getClaimSummary),
    );
  }
}
export default Route;
