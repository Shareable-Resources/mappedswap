import CommonServerConfig from '../../../foundation/model/CommonServerConfig';
export default class DAppServerConfig extends CommonServerConfig {
  priceLoader: {
    interval: number;
  };
  FixedAgentLevel: {
    interestLevel: {
      level1: string;
      level2: string;
      level3: string;
      level4: string;
    };
    feeLevel: {
      level1: string;
      level2: string;
      level3: string;
      level4: string;
    };
    memberOnEachLevel: number;
  };
  constructor() {
    super();
    this.priceLoader = {
      interval: 0,
    };
    this.FixedAgentLevel = {
      interestLevel: {
        level1: '',
        level2: '',
        level3: '',
        level4: '',
      },
      feeLevel: {
        level1: '',
        level2: '',
        level3: '',
        level4: '',
      },
      memberOnEachLevel: 0,
    };
  }
}
