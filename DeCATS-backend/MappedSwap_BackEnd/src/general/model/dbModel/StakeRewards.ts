import { Mixed } from '../../../foundation/types/Mixed';

export enum StakeRewardsStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class StakeRewards {
  id: Mixed | null;
  address: string;
  poolToken: string;
  stakeAmount: Mixed;
  stakeRewardsAmount: Mixed;
  stakeTime: Mixed;
  nodeID: string;
  stakeHash: string;
  blockNumber: string;
  status: StakeRewardsStatus;
  createdDate: Date;
  lastModifiedDate: Date;

  constructor() {
    this.id = null;
    this.address = '';
    this.poolToken = '';
    this.stakeAmount = 0;
    this.stakeRewardsAmount = 0;
    this.stakeTime = 0;
    this.nodeID = '';
    this.stakeHash = '';
    this.blockNumber = '';
    this.status = StakeRewardsStatus.StatusActive;
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
  }
}
