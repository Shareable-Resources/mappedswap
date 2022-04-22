import {
  makeHandlerAwareOfAsyncErrors,
  validateToken,
} from '../../../foundation/server/Middlewares';
import { ConnectedWalletController } from '../controller/0_index';
import CommonRoute from '../../../foundation/server/CommonRoute';
import logger from '../util/ServiceLogger';
import inspector from 'inspector';
class Route extends CommonRoute {
  controller: ConnectedWalletController = new ConnectedWalletController();
  constructor() {
    super(logger);
    this.prefix = 'connectedWallets';
    this.setRoutes();
  }
  protected setRoutes() {
    this.router.post(
      `/${this.prefix}/create`,
      validateToken(logger),
      makeHandlerAwareOfAsyncErrors(this.controller.create, logger),
    );
  }
}
export default Route;
