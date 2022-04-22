import CommonServerConfig from '../../../foundation/model/CommonServerConfig';
export default class MiningRewardsServerConfig extends CommonServerConfig {
  rewardsJob: {
    miningRewards: string;
    comment: string;
    fromTime: string;
    minusMinteus: string;
    minusMinteusComment: string;
  };
  rewardsObserver: {
    rewardsObserver: string;
  };
  stakeReward: {
    unlockInterval: string;
    division: string;
    minMstTransferValue: number;
  };
  constructor() {
    super();
    this.rewardsJob = {
      miningRewards: '',
      comment: '',
      fromTime: '',
      minusMinteus: '',
      minusMinteusComment: '',
    };
    this.rewardsObserver = {
      rewardsObserver: '',
    };
    this.stakeReward = {
      unlockInterval: '',
      division: '',
      minMstTransferValue: 0,
    };
  }
}
