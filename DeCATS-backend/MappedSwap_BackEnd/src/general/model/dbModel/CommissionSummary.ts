import { Mixed } from '../../../foundation/types/Mixed';

export default class CommissionSummary {
  jobId: Mixed;
  token: string;
  distTotalCommission: Mixed;
  distTotalCommissionInUSDM: Mixed;
  constructor() {
    this.jobId = 0;
    this.token = '';
    this.distTotalCommission = 0;
    this.distTotalCommissionInUSDM = 0;
  }
}
