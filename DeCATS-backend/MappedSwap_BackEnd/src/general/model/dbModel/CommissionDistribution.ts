import { Mixed } from '../../../foundation/types/Mixed';

export enum CommissionDistributionStatus {
  Created = 0, //Written to contrsct
  NotAcquired = 10, //Waiting for agent to get
  Acquired = 20, //Agent already get
}

export default class CommissionDistribution {
  jobId: Mixed;
  agentId: Mixed;
  status: CommissionDistributionStatus;
  createdDate: Date;
  acquiredDate: Date | null;
  txHash: string | null;
  txDate: Date | null;
  address: string;
  constructor() {
    this.jobId = 0;
    this.agentId = '';
    this.status = 0;
    this.createdDate = new Date();
    this.acquiredDate = null;
    this.txHash = null;
    this.txDate = null;
    this.address = '';
  }
}
