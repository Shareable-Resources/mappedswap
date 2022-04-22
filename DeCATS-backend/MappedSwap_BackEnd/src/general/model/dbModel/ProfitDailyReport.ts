import { Mixed } from '../../../foundation/types/Mixed';
export enum ProfitDailyReportStatus {
  Created = 0,
  Finished = 1,
  Fail = 2,
}
export default class ProfitDailyReport {
  id: Mixed | null;
  token: string;
  rajReserveStart: Mixed;
  rajReserveEnd: Mixed;
  rajReserveAmtChange: Mixed; //rajReserveEnd-rajReserveStart

  depositAmt: Mixed;
  withdrawAmt: Mixed;
  poolStart: Mixed;
  poolEnd: Mixed;
  poolAmtChange: Mixed;
  poolDepositStart: Mixed;
  poolDepositEnd: Mixed;
  poolDebitStart: Mixed;
  poolDebitEnd: Mixed;
  balanceStart: Mixed;
  balanceEnd: Mixed;
  balanceChange: Mixed;
  botBalanceStart: Mixed;
  botBalanceEnd: Mixed;

  botSellAmt: Mixed;
  sellAmt: Mixed;

  interest: Mixed;
  unrealizedInterest: Mixed; //sum of unrealizedInterest in t_decats_snapshots
  netCashIn: Mixed; //depositAmt-withdrawAmt or pollAmtChange+reserveAmtChange
  customerProfit: Mixed;
  dateFrom: Date | string | null;
  dateTo: Date | string;
  createdDate: Date | string;
  lastModifiedDate: Date | string;

  constructor() {
    this.id = null;
    this.token = '';
    this.rajReserveStart = 0;
    this.rajReserveEnd = 0;
    this.rajReserveAmtChange = 0;
    this.depositAmt = 0;
    this.withdrawAmt = 0;
    this.poolStart = 0;
    this.poolEnd = 0;
    this.poolAmtChange = 0;
    this.poolDepositStart = 0; //from t_decats_balance_snapshot
    this.poolDepositEnd = 0; //from t_decats_balance_snapshot
    this.poolDebitStart = 0; //from t_decats_balance_snapshot
    this.poolDebitEnd = 0; //from t_decats_balance_snapshot
    this.balanceStart = 0; //from t_decats_balance_snapshot
    this.balanceEnd = 0; //from t_decats_balance_snapshot
    this.balanceChange = 0; //from t_decats_balance_snapshot
    this.botBalanceStart = 0; //from t_decats_balance_snapshot
    this.botBalanceEnd = 0; //from t_decats_balance_snapshot
    this.botSellAmt = 0;
    this.sellAmt = 0;

    this.interest = 0;
    this.unrealizedInterest = 0;
    this.netCashIn = 0;
    this.customerProfit = 0;
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
  }
}
