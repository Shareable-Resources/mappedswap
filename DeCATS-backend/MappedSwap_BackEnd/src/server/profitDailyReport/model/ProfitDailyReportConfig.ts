import CommonServerConfig from '../../../foundation/model/CommonServerConfig';
import RajPair from './RajPair';
export default class ProfitDailyReportConfig extends CommonServerConfig {
  profitSummary: {
    comment: string;
    cronFormat: string;
  };
  constructor() {
    super();
    this.profitSummary = {
      comment: '',
      cronFormat: '',
    };
  }
}
