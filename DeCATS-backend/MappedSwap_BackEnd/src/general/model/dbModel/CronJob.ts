import { Mixed } from '../../../foundation/types/Mixed';
import logger from '../../util/ServiceLogger';
import Agent from './Agent';
import CustomerCreditUpdate from './CustomerCreditUpdate';
export enum CronJobStatus {
  Created = 0,
  Processing = 10,
  Finished = 20,
  Fail = 30,
}

export enum CronJobType {
  DailySettlement = 0,
  CommissionJob = 1,
  ProfitDailyReport = 2,
}

export default class CronJob {
  id: string | null;
  desc: string | null;
  type?: CronJobType;
  extra: string;
  status: CronJobStatus;
  dateFrom: string | Date;
  dateTo: string | Date;
  mstToUSDMExchangeRate: Mixed | null;
  lastModifiedDate: Date | null;
  lastModifiedById: Mixed | null;
  createdDate: Date;
  constructor() {
    this.id = null;
    this.desc = '';
    this.extra = '';
    this.status = CronJobStatus.Created;
    this.dateFrom = '';
    this.dateTo = '';
    this.mstToUSDMExchangeRate = null;
    this.lastModifiedDate = null;
    this.lastModifiedById = null;
    this.createdDate = new Date();
  }
}
