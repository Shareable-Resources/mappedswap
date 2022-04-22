import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CustomerCreditUpdateController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: CustomerCreditUpdateController =
    new CustomerCreditUpdateController();
  constructor() {
    super(logger);
    this.prefix = 'customerCreditUpdates';
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
