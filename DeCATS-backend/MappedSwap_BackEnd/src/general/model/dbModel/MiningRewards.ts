import { Mixed } from '../../../foundation/types/Mixed';
import MiningRewardsDistribution from './MiningRewardsDistribution';

export enum MiningRewardsStatus {
  Created = 0,
  Fail = 10,
  Approved = 30,
  NotApproved = 31,
  Processing = 20,
  Finished = 21,
}

export default class MiningRewards {
  id?: Mixed;
  dateFrom: Date;
  dateTo: Date;
  roundId: Mixed | null;
  poolToken: string;
  approvedById: Mixed | null;
  approvedDate: Date | null;
  createdDate: Date;
  lastModifiedDate: Date | null;
  lastModifiedById: Mixed | null;
  status: MiningRewardsStatus;
  distributions?: MiningRewardsDistribution[];
  exchangeRate: Mixed;
  mstExchangeRate: Mixed;

  constructor() {
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.roundId = null;
    this.poolToken = '';
    this.approvedById = null;
    this.approvedDate = null;
    this.createdDate = new Date();
    this.lastModifiedDate = null;
    this.lastModifiedById = null;
    this.status = MiningRewardsStatus.Created;
    this.exchangeRate = 0;
    this.mstExchangeRate = 0;
  }
}
