import { Mixed } from '../../../foundation/types/Mixed';

export default class CommissionLedger {
  jobId: Mixed;
  token: string;
  agentId: Mixed;
  distCommission: Mixed; // commission to be distributed
  distCommissionInUSDM: Mixed; //commission in USDM to be distributed
  createdDate: Date;
  constructor() {
    this.jobId = 0;
    this.token = '';
    this.agentId = 0;
    this.distCommission = 0;
    this.distCommissionInUSDM = 0;
    this.createdDate = new Date();
  }
}
