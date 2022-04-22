import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
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
    //Non Token APIs
    this.router.get(
      `/${this.prefix}`,
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getPairInfo`,
      makeHandlerAwareOfAsyncErrors(this.controller.getPairInfo, logger),
    );
    this.router.get(
      `/${this.prefix}/getAllBlockPrice`,
      makeHandlerAwareOfAsyncErrors(this.controller.getAllBlockPrice, logger),
    );
  }
}

export default Route;
