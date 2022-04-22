import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { CustomerController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';
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
    this.router.post(
      `/${this.prefix}/loadFundingCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.loadFundingCode, logger),
    );

    //Non jwt API
    this.router.post(
      `/${this.prefix}/login`,
      makeHandlerAwareOfAsyncErrors(this.controller.login, logger),
    );

    this.router.get(
      `/${this.prefix}/getAllFundingCode`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAllFundingCode, logger),
    );

    //The below route only can be visible in dev debug mode (Open by vs debugger)
    const isDebug = inspector.url();
    if (isDebug) {
      this.router.post(
        `/${this.prefix}/loginByDeveloper`,
        makeHandlerAwareOfAsyncErrors(this.controller.loginByDeveloper, logger),
      );
    }
  }
}
export default Route;
