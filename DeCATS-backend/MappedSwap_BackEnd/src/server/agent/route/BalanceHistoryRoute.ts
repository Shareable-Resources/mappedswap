import { BalanceHistoryController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: BalanceHistoryController = new BalanceHistoryController();
  constructor() {
    super(logger);
    this.prefix = 'balancesHistories';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getStat`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getStat),
    );
    this.router.get(
      `/${this.prefix}/getTotalDepositWithdrawAmount`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(
        this.controller.getTotalDepositWithdrawAmount,
        logger,
      ),
    );
    this.router.get(
      `/${this.prefix}/getActiveCustomers`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getActiveCustomers, logger),
    );
    this.router.get(
      `/${this.prefix}/getActiveAddresses`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getActiveAddresses, logger),
    );
  }
}

export default Route;
