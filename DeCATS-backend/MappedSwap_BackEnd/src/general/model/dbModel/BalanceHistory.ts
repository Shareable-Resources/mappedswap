import { Mixed } from '../../../foundation/types/Mixed';
import Customer from '../dbModel/Customer';
export enum BalanceHistoryStatus {
  StatusCreated = 0,
}

export enum BalanceHistoryTypes {
  Buy = 1,
  Sell = 2,
  Deposit = 3,
  Withdraw = 4,
  Interest = 5,
}

export default class BalanceHistory {
  id: Mixed | null;
  address: string;
  customerId: Mixed;
  agentId: Mixed;
  token: string;
  type: BalanceHistoryTypes;
  amount: Mixed;
  balance: Mixed;
  updateTime: Date;
  txHash: string;
  createdDate: Date;
  lastModifiedDate: Date;
  status: BalanceHistoryStatus;
  customer?: Customer;

  constructor() {
    this.id = null;
    this.address = '';
    this.customerId = 0;
    this.agentId = 0;
    this.token = '';
    this.type = BalanceHistoryTypes.Deposit;
    this.amount = 0;
    this.balance = 0;
    this.updateTime = new Date();
    this.txHash = '';
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
    this.status = BalanceHistoryStatus.StatusCreated;
  }
}
