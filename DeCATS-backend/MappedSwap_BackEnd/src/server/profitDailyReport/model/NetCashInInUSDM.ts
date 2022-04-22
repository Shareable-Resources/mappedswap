import Big from 'big.js';

export default class NetCashInInUSDM {
  token: string;
  depositAmtInUSDM: string;
  withdrawAmtInUSDM: string;
  netCashInUSDM: string;
  constructor() {
    this.token = '';
    this.depositAmtInUSDM = new Big(0).toString();
    this.withdrawAmtInUSDM = new Big(0).toString();
    this.netCashInUSDM = new Big(0).toString();
  }
}
