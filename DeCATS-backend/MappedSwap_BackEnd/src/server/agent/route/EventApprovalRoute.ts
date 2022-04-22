import { EventApprovalController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: EventApprovalController = new EventApprovalController();
  constructor() {
    super(logger);
    this.prefix = 'eventApprovals';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
    this.router.post(
      `/${this.prefix}/approve`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.approve),
    );
    this.router.post(
      `/${this.prefix}/distribute`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.distribute),
    );
  }
}
export default Route;
