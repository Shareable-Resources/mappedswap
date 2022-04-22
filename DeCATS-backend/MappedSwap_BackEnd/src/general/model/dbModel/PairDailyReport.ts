import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class PairDailyReport {
  id: Mixed | null;
  token: string;
  buyAmount: Mixed;
  sellAmount: Mixed;
  usdmBuyAmount: Mixed;
  usdmSellAmount: Mixed;
  price: Mixed | null;
  dateFrom: Date | string | null;
  dateTo: Date | string;
  createdDate: string | Date;
  lastModifiedDate: string | Date;

  constructor() {
    this.id = null;
    this.token = '';
    this.buyAmount = new Big(0).toString();
    this.sellAmount = new Big(0).toString();
    this.usdmBuyAmount = new Big(0).toString();
    this.usdmSellAmount = new Big(0).toString();
    this.price = null;
    this.dateFrom = null;
    this.dateTo = new Date();
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
  }
}
