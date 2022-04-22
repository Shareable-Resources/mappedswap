import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class EventTradeVolume {
  id: Mixed | null;
  customerId: Mixed;
  address: string;
  amt: Mixed;
  acheivedDate: Date | string | null;
  firstTxDate: Date | string;
  lastTxDate: Date | string;
  lastScannedId: Mixed;
  constructor() {
    this.id = null;
    this.customerId = new Big(0).toString();
    this.address = '';
    this.amt = new Big(0).toString();
    this.acheivedDate = null;
    this.firstTxDate = new Date();
    this.lastTxDate = new Date();
    this.lastScannedId = '';
  }
}
