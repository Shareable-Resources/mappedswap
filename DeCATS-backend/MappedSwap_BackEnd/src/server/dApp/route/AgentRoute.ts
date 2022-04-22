import CommonRoute from '../../../foundation/server/CommonRoute';
import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { AgentController } from '../controller/0_index';
import logger from '../util/ServiceLogger';

class Route extends CommonRoute {
  controller: AgentController = new AgentController();
  constructor() {
    super(logger);
    this.prefix = 'agents';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );

    this.router.get(
      `/${this.prefix}/getMstToUsdRate`,
      // validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getMstToUsdRate),
    );
  }
}
export default Route;
