import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { InterestController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: InterestController = new InterestController();
  constructor() {
    super(logger);
    this.prefix = 'interests';
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
      `/${this.prefix}/getTotalInterest`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getTotalInterest, logger),
    );
  }
}
export default Route;
