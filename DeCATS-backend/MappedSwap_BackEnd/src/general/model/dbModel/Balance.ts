import { Mixed } from '../../../foundation/types/Mixed';
import Customer from './Customer';

export enum BalanceStatus {
  StatusCreated = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class Balance {
  id: Mixed | null;
  address: string;
  customerId: Mixed;
  agentId: Mixed;
  token: string;
  balance: Mixed;
  interest: Mixed;
  updateTime: Date;
  status: BalanceStatus;
  customer?: Customer;

  constructor() {
    this.id = null;
    this.address = '';
    this.customerId = 0;
    this.agentId = 0;
    this.token = '';
    this.balance = 0;
    this.interest = 0;
    this.updateTime = new Date();
    this.status = BalanceStatus.StatusCreated;
  }
}
