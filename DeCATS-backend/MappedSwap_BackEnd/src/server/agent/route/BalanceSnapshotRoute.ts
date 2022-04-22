import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { BalanceSnapshotController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../../agent/util/ServiceLogger';
class Route extends CommonRoute {
  controller: BalanceSnapshotController = new BalanceSnapshotController();
  constructor() {
    super(logger);
    this.prefix = 'balanceSnapshots';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get(
      `/${this.prefix}`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.getAll),
    );
  }
}

export default Route;
