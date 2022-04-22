import MiningRewardsConfig from '../model/MiningRewardsServerConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
const globalVar: {
  miningRewardsConfig: MiningRewardsConfig;
  foundationConfig: FoundationConfig;
} = {
  miningRewardsConfig: new MiningRewardsConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
