import CronJobServerConfig from '../model/CronJobServerConfig';
import FoundationConfig from '../../../foundation/model/FoundationConfig';
const globalVar: {
  cronJobConfig: CronJobServerConfig;
  foundationConfig: FoundationConfig;
} = {
  cronJobConfig: new CronJobServerConfig(),
  foundationConfig: new FoundationConfig(),
};

export default globalVar;
