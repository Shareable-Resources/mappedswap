import moment from 'moment';
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

/**
 * Generate all related dates for generation
 * @param cronJobDate － cron job date in YYYY-MM-DD hh:mm:ss
 */
export function getAllRelatedDate(cronJobDate: string): ProfitReportDatesRange {
  const allDates = {
    dateFrom: moment
      .utc(cronJobDate)
      .subtract(1, 'day')
      .startOf('day')
      .toDate(),
    dateTo: moment.utc(cronJobDate).subtract(1, 'day').endOf('day').toDate(),
    yesterdayFrom: moment
      .utc(cronJobDate)
      .subtract(2, 'day')
      .startOf('day')
      .toDate(),
    yesterdayTo: moment
      .utc(cronJobDate)
      .subtract(2, 'day')
      .endOf('day')
      .toDate(),
    lastModifiedDate: moment.utc().toDate(),
    createdDate: moment.utc(cronJobDate).toDate(),
    yesterdayCreatedDate: moment.utc(cronJobDate).subtract(1, 'day').toDate(),
  };
  return allDates;
}
