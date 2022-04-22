import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class ProfitAndLossReport {
  id: Mixed | null;
  customerId: Mixed;
  equityStart: Mixed;
  equityEnd: Mixed;
  netCashInUSDM: Mixed;
  profitAndLoss: Mixed;
  dateFrom: string | Date;
  dateTo: string | Date;
  createdDate: string | Date;
  constructor() {
    this.id = null;
    this.customerId = '';
    this.equityStart = new Big(0).toString();
    this.equityEnd = new Big(0).toString();
    this.netCashInUSDM = new Big(0).toString();
    this.profitAndLoss = new Big(0).toString();
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.createdDate = new Date();
  }
}
