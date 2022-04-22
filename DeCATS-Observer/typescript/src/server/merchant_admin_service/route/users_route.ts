import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/src/api/middlewares';
import { UsersController } from '../controller/0_index';
import CommonRoute from './common_route';

class Route extends CommonRoute {
  controller: UsersController = new UsersController();
  constructor() {
    super();
    this.prefix = 'users';
    this.setRoutes();
  }

  protected setRoutes() {
    this.setDefaultRoutes();
    this.router.post(
      `/${this.prefix}/importWallet`,
      makeHandlerAwareOfAsyncErrors(this.controller.importWallet),
    );
  }
}

export default Route;
