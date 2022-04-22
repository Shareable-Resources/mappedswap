import { Mixed } from '../../../foundation/types/Mixed';

export enum MiningRewardsDistributionStatus {
  Created = 0, //Written to contrsct
  NotAcquired = 10, //Waiting for agent to get
  Acquired = 20, //Agent already get
}

export default class MiningRewardsDistribution {
  id?: Mixed;
  jobId: Mixed;
  status: MiningRewardsDistributionStatus;
  poolToken: string;
  address: string;
  amount: Mixed | null;
  UsdcAmount: Mixed | null;
  acquiredDate: Mixed;
  createdDate: Date;

  constructor() {
    this.jobId = 0;
    this.status = MiningRewardsDistributionStatus.Created;
    this.poolToken = '';
    this.address = '';
    this.amount = null;
    this.UsdcAmount = null;
    this.acquiredDate = 0;
    this.createdDate = new Date();
  }
}
