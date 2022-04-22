import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class BalanceSnapshot {
  id: Mixed | null;
  token: string;
  customerId: Mixed;
  balance: Mixed;
  unrealizedInterest: Mixed;
  dateFrom: Date | string | null;
  dateTo: Date | string;
  updateTime: Date | string;
  createdDate: Date | string;
  lastModifiedDate: Date | string;
  constructor() {
    this.id = null;
    this.token = '';
    this.customerId = '';
    this.balance = new Big(0).toString();
    this.unrealizedInterest = new Big(0).toString();
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.updateTime = new Date();
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
  }
}

export class BalanceSnapShotWithUSDM extends BalanceSnapshot {
  inUSDM: Mixed;
  excRate: Mixed;
  constructor() {
    super();
    this.excRate = new Big(0).toString();
    this.inUSDM = new Big(0).toString();
  }
}
