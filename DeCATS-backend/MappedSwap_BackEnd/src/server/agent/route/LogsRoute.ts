import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { LogController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
class Route extends CommonRoute {
  controller: LogController = new LogController();
  constructor() {
    super(logger);
    this.prefix = 'logs';
    this.setRoutes();
  }

  protected setRoutes() {
    /*
    this.router.get(
      `/${this.prefix}/read`,
         validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.read, logger),
    );*/
  }
}

export default Route;
