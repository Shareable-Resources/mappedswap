import { Mixed } from '../../../foundation/types/Mixed';
import CommissionDistribution from './CommissionDistribution';
import CommissionLedger from './CommissionLedger';
import CommissionSummary from './CommissionSummary';

export enum CommissionJobStatus {
  Created = 0,
  Fail = 10,
  Approved = 30,
  NotApproved = 31,
}

export default class CommissionJob {
  id?: Mixed;
  dateFrom: Date;
  dateTo: Date;
  approvedById: Mixed | null;
  approvedDate: Date | null;
  lastModifiedById: Mixed | null;
  lastModifiedDate: Date | null;
  createdDate: Date;
  status: CommissionJobStatus;
  roundId: Mixed | null;
  remark: string;
  cronJobId: Mixed;
  ledgers?: CommissionLedger[];
  distributions?: CommissionDistribution[];
  summaries?: CommissionSummary[];
  constructor() {
    this.createdDate = new Date();
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.approvedById = null;
    this.approvedDate = null;
    this.lastModifiedById = null;
    this.lastModifiedDate = null;
    this.status = CommissionJobStatus.Created;
    this.roundId = null;
    this.remark = '';
    this.cronJobId = '';
  }
}
