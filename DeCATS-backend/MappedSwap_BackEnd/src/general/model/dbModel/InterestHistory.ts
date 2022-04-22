import { Mixed } from '../../../foundation/types/Mixed';
export enum InterestHistoryStatus {
  // StatusPending = 0,
  // StatusInactive = 10,
  // StatusActive = 20,
  StatusActive = 1,
}

export default class InterestHistory {
  id: Mixed | null;
  address: string;
  customerId: Mixed;
  agentId: Mixed;
  fromTime: Date;
  toTime: Date;
  token: string;
  amount: Mixed;
  rate: Mixed;
  interest: Mixed;
  totalInterest: Mixed;
  createdDate: Date;
  lastModifiedDate: Date;
  status: InterestHistoryStatus;

  constructor() {
    this.id = null;
    this.address = '';
    this.customerId = 0;
    this.agentId = 0;
    this.fromTime = new Date();
    this.toTime = new Date();
    this.token = '';
    this.amount = 0;
    this.rate = 0;
    this.interest = 0;
    this.totalInterest = 0;
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
    this.status = InterestHistoryStatus.StatusActive;
  }
}
