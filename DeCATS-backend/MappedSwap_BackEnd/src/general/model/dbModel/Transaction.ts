import { Mixed } from '../../../foundation/types/Mixed';
export enum TransactionStatus {
  // StatusPending = 0,
  // StatusInactive = 10,
  // StatusActive = 20,

  Created = 0,
  Accepted = 1,
  Confirmed = 2,
  Rejected = 3,
}

export default class Transaction {
  id: Mixed | null;
  address: string;
  customerId: Mixed;
  agentId: Mixed;
  sellToken: string | null;
  sellAmount: Mixed;
  buyToken: string | null;
  buyAmount: Mixed;
  txHash: string;
  txTime: Date | null;
  txStatus: number;
  gasFee: Mixed;
  blockHeight: Mixed;
  blockHash: string;
  stopout: boolean;
  createdDate: Date;
  lastModifiedDate: Date;
  constructor() {
    this.id = null;
    this.address = '';
    this.customerId = 0;
    this.agentId = 0;
    this.sellToken = '';
    this.sellAmount = 0;
    this.buyToken = '';
    this.buyAmount = 0;
    this.txHash = '';
    this.txTime = null;
    this.txStatus = TransactionStatus.Created;
    this.gasFee = 0;
    this.blockHeight = 0;
    this.blockHash = '';
    this.stopout = false;
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
  }
}
