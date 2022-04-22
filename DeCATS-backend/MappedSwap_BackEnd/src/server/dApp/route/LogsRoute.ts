import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import { LogsController } from '../controller/0_index';
class Route extends CommonRoute {
  controller: LogsController = new LogsController();
  constructor() {
    super(logger);
    this.prefix = 'logs';
    this.setRoutes();
  }

  protected setRoutes(): void {
    /*
    this.router.get(
      `/${this.prefix}/read`,
      makeHandlerAwareOfAsyncErrors(this.controller.read, logger),
    );*/
  }
}

export default Route;
