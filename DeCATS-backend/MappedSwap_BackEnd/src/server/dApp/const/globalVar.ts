import DAppConfig from '../model/DAppServerConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
const globalVar: {
  dAppConfig: DAppConfig;
  foundationConfig: FoundationConfig;
} = {
  dAppConfig: new DAppConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
