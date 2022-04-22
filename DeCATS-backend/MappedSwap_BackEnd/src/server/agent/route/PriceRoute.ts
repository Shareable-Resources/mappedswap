import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { PriceController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: PriceController = new PriceController();
  constructor() {
    super(logger);
    this.prefix = 'prices';
    this.setRoutes();
  }

  protected setRoutes() {
    //this.setDefaultRoutes();
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.post(
      `/${this.prefix}/addMstPrice`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.addMstPrice, logger),
    );
    //this.setDefaultRoutes();
    this.router.get(
      `/${this.prefix}/getMstPrice`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getMstPrice),
    );
  }
}

export default Route;
