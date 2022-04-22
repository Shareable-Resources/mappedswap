import { AgentDailyReportType } from '../../../general/model/dbModel/AgentDailyReport';

export class CronJobReq {
  createdDate: string;
  distHour?: string;
  constructor() {
    this.createdDate = '';
  }
}

export class CronJobReqDailySettlement extends CronJobReq {
  constructor() {
    super();
  }
}
