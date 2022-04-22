import DecatsConfig from '../model/DecatsConfig';
import FoundationConfig from '../../foundation/model/FoundationConfig';
const globalVar: {
  decatsConfig: DecatsConfig;
  foundationConfig: FoundationConfig;
} = {
  decatsConfig: new DecatsConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
