import CommonRoute from '../../../foundation/server/CommonRoute';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import MiningRewardsController from '../controller/MiningRewardsController';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';

class Route extends CommonRoute {
  controller: MiningRewardsController = new MiningRewardsController();
  constructor() {
    super(logger);
    this.prefix = 'miningRewards';
    this.setRoutes();
  }
  protected setRoutes() {
    //The below route only can be visible in dev debug mode (Open by vs debugger)
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/regenerateMiningRewards`,
        validateToken(logger),
        makeHandlerAwareOfAsyncErrors(this.controller.regenerateMiningRewards),
      );
    }
  }
}
export default Route;
