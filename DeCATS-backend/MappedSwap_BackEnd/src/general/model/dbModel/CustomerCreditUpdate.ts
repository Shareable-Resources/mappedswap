import { Mixed } from '../../../foundation/types/Mixed';
export enum CustomerCreditUpdateStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class CustomerCreditUpdate {
  id: Mixed | null;
  address: string;
  customerId: Mixed;
  agentId: Mixed;
  origCredit: Mixed;
  credit: Mixed;
  txHash: string;
  txStatus: number;
  gasFee: Mixed;
  txTime: Date;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date;
  lastModifiedById: Mixed | null;
  status: CustomerCreditUpdateStatus;
  constructor() {
    this.id = null;
    this.address = '';
    this.customerId = 0;
    this.agentId = 0;
    this.origCredit = 0;
    this.credit = 0;
    this.txHash = '';
    this.txStatus = 0;
    this.gasFee = 0;
    this.txTime = new Date();
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = new Date();
    this.lastModifiedById = null;
    this.status = CustomerCreditUpdateStatus.StatusPending;
  }
}
