import CommonRoute from '../../../foundation/server/CommonRoute';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import TransferController from '../controller/TransferController';
import logger from '../util/ServiceLogger';

class Route extends CommonRoute {
  controller: TransferController = new TransferController();
  constructor() {
    super(logger);
    this.prefix = 'transfer';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}/getTransferEunRewards`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getTransferEunRewards),
    );
    this.router.get(
      `/${this.prefix}/getTransferHistories`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getTransferHistories),
    );
  }
}
export default Route;
