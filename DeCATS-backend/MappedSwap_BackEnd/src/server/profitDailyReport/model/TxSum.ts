import { Mixed } from 'web3/utils';

export default class TxSum {
  btcmBuyAmt: Mixed;
  btcmSellAmt: Mixed;
  ethmBuyAmt: Mixed;
  ethmSellAmt: Mixed;
  constructor() {
    this.btcmBuyAmt = 0;
    this.btcmSellAmt = 0;
    this.ethmBuyAmt = 0;
    this.ethmSellAmt = 0;
  }
}
