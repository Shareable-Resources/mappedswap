import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CustomerController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: CustomerController = new CustomerController();
  constructor() {
    super(logger);
    this.prefix = 'customers';
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
      `/${this.prefix}/details/:id`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getById),
    );
    this.router.post(
      `/${this.prefix}/create`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.create, logger),
    );
    this.router.post(
      `/${this.prefix}/update`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.update, logger),
    );
    this.router.get(
      `/${this.prefix}/getCreditUpdates`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getCreditUpdates, logger),
    );
    this.router.post(
      `/${this.prefix}/genFundingCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.genFundingCode, logger),
    );
    this.router.get(
      `/${this.prefix}/getAllFundingCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllFundingCode, logger),
    );
    this.router.post(
      `/${this.prefix}/updateFundingCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.updateFundingCode, logger),
    );
  }
}

export default Route;
