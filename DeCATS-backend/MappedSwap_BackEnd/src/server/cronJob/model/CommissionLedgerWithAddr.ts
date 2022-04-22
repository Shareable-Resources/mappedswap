import { Mixed } from '../../../foundation/types/Mixed';

export default interface CommissionLedgerWithAddr {
  job_id: Mixed | null;
  token: string;
  agent_id: Mixed;
  address: string;
  sign_data: string;
  dist_commission: Mixed;
  balance: Mixed;
  created_date: Date;
}
