import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CommissionLedgerController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: CommissionLedgerController = new CommissionLedgerController();
  constructor() {
    super(logger);
    this.prefix = 'commissionLedgers';
    this.setRoutes();
  }

  protected setRoutes() {
    //this.setDefaultRoutes();
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  }
}

export default Route;
