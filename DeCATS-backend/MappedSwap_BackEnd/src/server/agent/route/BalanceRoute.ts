import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { BalanceController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: BalanceController = new BalanceController();
  constructor() {
    super(logger);
    this.prefix = 'balances';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getTotalBalance`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getTotalBalance, logger),
    );
  }
}

export default Route;
