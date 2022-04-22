import { PriceHistoryController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: PriceHistoryController = new PriceHistoryController();
  constructor() {
    super(logger);
    this.prefix = 'priceHistories';
    this.setRoutes();
  }

  protected setRoutes(): void {
    //Non Token API
    this.router.get(
      `/${this.prefix}`,
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.get(
      `/${this.prefix}/getKLineData`,
      makeHandlerAwareOfAsyncErrors(this.controller.getKLineData, logger),
    );
    this.router.get(
      `/${this.prefix}/getKLineDataVolumeSum`,
      makeHandlerAwareOfAsyncErrors(
        this.controller.getKLineDataVolumeSum,
        logger,
      ),
    );
    this.router.get(
      `/${this.prefix}/getHistoryPrice`,
      makeHandlerAwareOfAsyncErrors(this.controller.getHistoryPrice, logger),
    );
  }
}

export default Route;
