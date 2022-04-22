import { MerchantClientFactory } from '../SeqModel/merchant_clients';
import { MerchantAdminFactory } from '../SeqModel/merchant_admins';
import { DepositLedgerFactory } from '../SeqModel/deposit_ledgers';
//import { WithdrawLedgerFactory } from './withdraw_ledgers';
//import { WithdrawReqFactory } from './withdraw_reqs';

export enum name {
  MerchantClient = 'merchant_clients',
  MerchantAdmins = 'merchant_admins',
  DepositLedgers = 'deposit_ledgers',
  WithdrawLedgers = 'withdraw_ledgers',
  WithdrawReqs = 'withdraw_reqs',
}

export const factory = {
  MerchantAdminFactory,
  MerchantClientFactory,
  DepositLedgerFactory,
  //WithdrawLedgerFactory,
  //WithdrawReqFactory,
};

export default { name, factory };
