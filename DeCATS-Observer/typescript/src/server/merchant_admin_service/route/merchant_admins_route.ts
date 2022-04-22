import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/src/api/middlewares';
import { MerchantAdminsController } from '../controller/0_index';
import CommonRoute from './common_route';

class Route extends CommonRoute {
  controller: MerchantAdminsController = new MerchantAdminsController();
  constructor() {
    super();
    this.prefix = 'merchant-admins';
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.post(
      `/${this.prefix}/login`,
      makeHandlerAwareOfAsyncErrors(this.controller.login),
    );
  }
}

export default Route;
