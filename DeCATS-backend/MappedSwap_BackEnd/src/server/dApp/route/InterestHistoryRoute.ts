import { InterestHistoryController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: InterestHistoryController = new InterestHistoryController();
  constructor() {
    super(logger);
    this.prefix = 'interestHistories';
    this.setRoutes();
  }

  protected setRoutes(): void {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  }
}

export default Route;
