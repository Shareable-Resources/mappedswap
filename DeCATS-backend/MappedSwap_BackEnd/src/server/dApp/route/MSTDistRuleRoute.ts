import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { MSTDistRuleController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: MSTDistRuleController = new MSTDistRuleController();
  constructor() {
    super(logger);
    this.prefix = 'mstDistRules';
    this.setRoutes();
  }
  protected setRoutes() {
    //this.setDefaultRoutes();
    this.router.get(
      `/${this.prefix}`,
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  }
}
export default Route;
