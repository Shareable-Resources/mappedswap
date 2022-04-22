import { Big } from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export interface TransactionHistories {
  tx_hash: string;
  address: string;
  name: string;
  sellToken: string | null;
  sellAmount: Mixed;
  buyToken: string | null;
  buyAmount: Mixed;
  txHash: string;
  txTime: Date;
  txStatus: number;
  USDM: Big;
  ETHM: Big;
  BTCM: Big;
}
