import { Mixed } from '../../../foundation/types/Mixed';
import MiningRewardsDistribution from './MiningRewardsDistribution';

export enum BuyBackDetailsStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class BuyBackDetails {
  id: Mixed | null;
  txHash: string;
  mstAmount: Mixed;
  usdPrice: Mixed;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date | null;
  lastModifiedById: Mixed | null;
  status: BuyBackDetailsStatus;

  constructor() {
    this.id = null;
    this.txHash = '';
    this.mstAmount = 0;
    this.usdPrice = 0;
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = null;
    this.lastModifiedById = null;
    this.status = BuyBackDetailsStatus.StatusActive;
  }
}
