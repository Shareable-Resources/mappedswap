import { Mixed } from '../../../foundation/types/Mixed';
export enum BlockPricesStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class BlockPrices {
  pairName: string;
  reserve0: Mixed;
  reserve1: Mixed;
  blockNo: Mixed;
  createdDate: Date;
  constructor() {
    this.pairName = '';
    this.reserve0 = 0;
    this.reserve1 = 0;
    this.blockNo = 0;
    this.createdDate = new Date();
  }
}
