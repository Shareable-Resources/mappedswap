import OnlineDataFetcherConfig from '../model/OnlineDataFetcherConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
import EthereumConfig from '../../../foundation/model/EthereumConfig';
const globalVar: {
  onlineDataFetcherConfig: OnlineDataFetcherConfig;
  foundationConfig: FoundationConfig;
  ethereumConfig: EthereumConfig;
} = {
  onlineDataFetcherConfig: new OnlineDataFetcherConfig(),
  foundationConfig: new FoundationConfig(),
  ethereumConfig: new EthereumConfig(),
};

export default globalVar;
