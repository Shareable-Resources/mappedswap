import { Big } from 'big.js';
import { TransactionHistories } from './TransactionHistories';

export interface TransactionHistoriesWithCoins {
  rows: TransactionHistories[];
  count: Big;
  USDM: Big;
  ETHM: Big;
  BTCM: Big;
}
