import CommonServerConfig from '../../../foundation/model/CommonServerConfig';
export default class OnlineDataFetcherConfig extends CommonServerConfig {
  fetcherTimeInterval: number;
  priceTolerancePercentage: number;
  constructor() {
    super();
    this.fetcherTimeInterval = 5000;
    this.priceTolerancePercentage = 0;
  }
}
