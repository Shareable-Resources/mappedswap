import CommonServerConfig from '../../../foundation/model/CommonServerConfig';
import RajPair from './RajPair';
export default class CronJobServerConfig extends CommonServerConfig {
  cronJob: {
    comment: string;
    dailySettlement: {
      distWeekDays: number[][];
      cronFormat: {
        realTime: string;
        monitorCronJob: string;
      };
    };
    chunks: number;
  };
  rajSwap: RajPair[];
  constructor() {
    super();
    this.cronJob = {
      comment: '',
      dailySettlement: {
        distWeekDays: [],
        cronFormat: {
          realTime: '',
          monitorCronJob: '',
        },
      },
      chunks: 1000,
    };
    this.rajSwap = [];
  }
}
