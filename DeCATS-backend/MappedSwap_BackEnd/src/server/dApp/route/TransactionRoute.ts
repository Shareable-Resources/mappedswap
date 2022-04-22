import { TransactionController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: TransactionController = new TransactionController();
  constructor() {
    super(logger);
    this.prefix = 'transactions';
    this.setRoutes();
  }

  protected setRoutes(): void {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getAllBurnTranscation`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllBurnTranscation),
    );
    this.router.get(
      `/${this.prefix}/getAllBuyBackTranscation`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllBuyBackTranscation),
    );
  }
}

export default Route;
