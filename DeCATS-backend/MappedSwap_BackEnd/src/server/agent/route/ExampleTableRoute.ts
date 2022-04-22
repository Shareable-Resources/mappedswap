import { ExampleTableController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
class Route extends CommonRoute {
  controller: ExampleTableController = new ExampleTableController();
  constructor() {
    super(logger);
    this.prefix = 'exampleTables';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger), //If validateToken middleware is added, it will validate jwt token
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  }
}
export default Route;
