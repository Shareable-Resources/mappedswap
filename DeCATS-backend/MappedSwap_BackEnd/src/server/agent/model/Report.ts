/* eslint-disable @typescript-eslint/no-empty-interface */
export interface TransactionTotalAmt {
  token: string;
  sellAmount: string;
}

export interface BalanceHistoriesStat {
  token: string;
  deposit: string;
  withdraw: string;
  netDeposit: string;
}

export interface TransactionStat {
  historyStat: TransactionTotalAmt;
  count: number;
}

export interface BalanceStat {}
