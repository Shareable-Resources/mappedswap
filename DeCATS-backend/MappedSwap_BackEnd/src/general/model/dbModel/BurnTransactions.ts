import { Mixed } from '../../../foundation/types/Mixed';
import MiningRewardsDistribution from './MiningRewardsDistribution';

export enum BurnTransactionsStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class BurnTransactions {
  id: Mixed | null;
  txHash: string;
  mstAmount: Mixed;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date | null;
  lastModifiedById: Mixed | null;
  status: BurnTransactionsStatus;

  constructor() {
    this.id = null;
    this.txHash = '';
    this.mstAmount = 0;
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = null;
    this.lastModifiedById = null;
    this.status = BurnTransactionsStatus.StatusActive;
  }
}
