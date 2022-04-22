import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class DailyStatisticReport {
  id: Mixed | null;
  noOfActiveAddresses: Mixed;
  noOfConnectedWallets: Mixed;
  dateFrom: Date | string | null;
  dateTo: Date | string;
  createdDate: Date | string;
  constructor() {
    this.id = null;
    this.noOfActiveAddresses = new Big(0).toString();
    this.noOfConnectedWallets = new Big(0).toString();
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.createdDate = new Date();
  }
}
