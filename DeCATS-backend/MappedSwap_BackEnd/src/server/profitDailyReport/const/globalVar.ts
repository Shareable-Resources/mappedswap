import ProfitDailyReportConfig from '../model/ProfitDailyReportConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
const globalVar: {
  profitDailyReportConfig: ProfitDailyReportConfig;
  foundationConfig: FoundationConfig;
} = {
  profitDailyReportConfig: new ProfitDailyReportConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
