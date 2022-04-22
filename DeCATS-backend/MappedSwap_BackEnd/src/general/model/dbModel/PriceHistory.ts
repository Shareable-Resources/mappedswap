import { Mixed } from '../../../foundation/types/Mixed';
export enum PriceHistoryStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class PriceHistory {
  id: Mixed | null;
  pairName: string;
  reserve0: Mixed;
  reserve1: Mixed;
  createdDate: Date;
  status: PriceHistoryStatus;
  open: Mixed;
  close: Mixed;
  low: Mixed;
  high: Mixed;
  volume: Mixed;
  interval: Mixed;
  constructor() {
    this.id = null;
    this.pairName = '';
    this.reserve0 = 0;
    this.reserve1 = 0;
    this.createdDate = new Date();
    this.status = PriceHistoryStatus.StatusPending;
    this.open = 0;
    this.close = 0;
    this.low = 0;
    this.high = 0;
    this.volume = 0;
    this.interval = 0;
  }
}
