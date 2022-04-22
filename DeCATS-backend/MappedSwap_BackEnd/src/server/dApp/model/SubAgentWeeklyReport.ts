import { Mixed } from '../../../foundation/types/Mixed';

export default interface SubAgentWeeklyReport {
  agentId: Mixed;
  address: string;
  parentAgnetId: Mixed;
  name: string;
  customerId: string;
  riskLevel: string;
  weeklyVolume: string;
}
