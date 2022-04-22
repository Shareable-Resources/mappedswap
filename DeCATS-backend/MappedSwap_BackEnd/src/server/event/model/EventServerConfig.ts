import CommonServerConfig from '../../../foundation/model/CommonServerConfig';

export default class EventServerConfig extends CommonServerConfig {
  event: {
    comment: string;
    distributeToken: string;
    writeTop20Leaderboards: string;
    writeTradeVolume: string;
  };
  chunk: number;
  top20Leaderboards: {
    dateFrom: string;
    dateTo: string;
  };
  eventTradeVolume: {
    dateFrom: string;
    dateTo: string;
    fixedTradeVolumeOfUSDM: string;
  };
  constructor() {
    super();
    this.event = {
      comment: '',
      distributeToken: '',
      writeTop20Leaderboards: '',
      writeTradeVolume: '',
    };
    this.chunk = 0;
    this.top20Leaderboards = {
      dateFrom: '',
      dateTo: '',
    };
    this.eventTradeVolume = {
      dateFrom: '',
      dateTo: '',
      fixedTradeVolumeOfUSDM: '',
    };
  }
}
