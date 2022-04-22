import { Mixed } from '../../../foundation/types/Mixed';

export default interface TrueAgentData {
  agentId: Mixed;
  address: string;
  signData: string;
  isVerified: boolean;
}
