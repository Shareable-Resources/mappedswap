import EventServerConfig from '../model/EventServerConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
const globalVar: {
  eventConfig: EventServerConfig;
  foundationConfig: FoundationConfig;
} = {
  eventConfig: new EventServerConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
