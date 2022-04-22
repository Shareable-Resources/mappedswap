import { Mixed } from '../../../foundation/types/Mixed';
export enum PricesStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}
export enum crytoDecimalPlace {
  USDM = 6,
  BTCM = 18,
  ETHM = 18,
  MST = 18,
}
export enum crytoDecimalNumber {
  USDM = 10 ** 6,
  BTCM = 10 ** 18,
  ETHM = 10 ** 18,
  MST = 10 ** 18,
}
export const cryptoName = ['USDM', 'ETHM', 'BTCM', 'MST'];

export default class Prices {
  pairName: string;
  reserve0: Mixed;
  reserve1: Mixed;
  createdDate: Date;
  constructor() {
    this.pairName = '';
    this.reserve0 = 0;
    this.reserve1 = 0;
    this.createdDate = new Date();
  }
}
