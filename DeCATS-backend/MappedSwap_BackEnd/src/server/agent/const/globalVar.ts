import AgentConfig from '../model/AgentServerConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
const globalVar: {
  agentConfig: AgentConfig;
  foundationConfig: FoundationConfig;
} = {
  agentConfig: new AgentConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
