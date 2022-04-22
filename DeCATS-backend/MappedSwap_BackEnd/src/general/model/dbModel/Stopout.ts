import { Mixed } from '../../../foundation/types/Mixed';
export enum StopoutStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class Stopout {
  id: Mixed | null;
  address: string;
  customerId: Mixed;
  agentId: Mixed;
  equity: Mixed;
  credit: Mixed;
  txHash: string;
  txTime: Date;
  txStatus: StopoutStatus;
  gasFee: Mixed;
  requestTime: Date;
  leverage: Mixed;
  fundingUsed: Mixed;
  riskLevel: Mixed;

  constructor() {
    this.id = null;
    this.address = '';
    this.customerId = 0;
    this.agentId = 0;
    this.equity = 0;
    this.credit = 0;
    this.txHash = '';
    this.txTime = new Date();
    this.txStatus = StopoutStatus.StatusPending;
    this.gasFee = 0;
    this.requestTime = new Date();
    this.leverage = 0;
    this.fundingUsed = 0;
    this.riskLevel = 0;
  }
}
