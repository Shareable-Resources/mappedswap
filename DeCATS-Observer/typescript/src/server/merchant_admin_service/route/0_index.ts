/* eslint-disable @typescript-eslint/camelcase */
import Route from './common_route';
import UserRoute from './users_route';
import MerchantAdminRoute from './merchant_admins_route';
import DepositLedgerRoute from './deposit_ledger_route';
const router: Array<Route> = [
  new UserRoute(),
  new MerchantAdminRoute(),
  new DepositLedgerRoute(),
];

export default router;
