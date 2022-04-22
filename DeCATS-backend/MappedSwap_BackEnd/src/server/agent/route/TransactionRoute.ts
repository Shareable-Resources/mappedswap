import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { TransactionController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: TransactionController = new TransactionController();
  constructor() {
    super(logger);
    this.prefix = 'transactions';
    this.setRoutes();
  }

  protected setRoutes() {
    //this.setDefaultRoutes();
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
    this.router.post(
      `/${this.prefix}/addNewBurnTranscation`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.addNewBurnTranscation),
    );
    this.router.get(
      `/${this.prefix}/getAllBurnTranscation`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllBurnTranscation),
    );
    this.router.post(
      `/${this.prefix}/addNewBuyBackTranscation`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.addNewBuyBackTranscation),
    );
    this.router.get(
      `/${this.prefix}/getAllBuyBackTranscation`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllBuyBackTranscation),
    );
    this.router.get(
      `/${this.prefix}/getTotalVolume`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getTotalVolume, logger),
    );
    this.router.get(
      `/${this.prefix}/getActiveCustomers`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getActiveCustomers, logger),
    );
  }
}
export default Route;
