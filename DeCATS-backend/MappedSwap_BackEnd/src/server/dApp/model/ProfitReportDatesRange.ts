import ProfitDailyReport from '../../../general/model/dbModel/ProfitDailyReport';

export default class ProfitReportDatesRange {
  dateFrom: Date | string | null;
  dateTo: Date | string;
  yesterdayFrom: Date | string;
  yesterdayTo: Date | string;
  lastModifiedDate: Date | string;
  createdDate: Date | string;
  yesterdayCreatedDate: Date | string;
  constructor() {
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.yesterdayFrom = new Date();
    this.yesterdayTo = new Date();
    this.lastModifiedDate = new Date();
    this.createdDate = new Date();
    this.yesterdayCreatedDate = new Date();
  }
}
