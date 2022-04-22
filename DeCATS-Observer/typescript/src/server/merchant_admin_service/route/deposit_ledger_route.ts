import { makeHandlerAwareOfAsyncErrors } from '../../../foundation/src/api/middlewares';
import { DepositLedgerController } from '../controller/0_index';
import CommonRoute from './common_route';

class Route extends CommonRoute {
  controller: DepositLedgerController = new DepositLedgerController();
  constructor() {
    super();
    this.prefix = 'deposit-ledgers';
    this.setRoutes();
  }

  protected setRoutes() {
    this.setDefaultRoutes();
  }
}

export default Route;
