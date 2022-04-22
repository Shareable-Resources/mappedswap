import { Big } from 'big.js';
import { InterestHistories } from './InterestHistories';

export interface InterestHistoriesWithCoins {
  rows: InterestHistories[];
  count: number;
  USDM: Big;
  ETHM: Big;
  BTCM: Big;
}
