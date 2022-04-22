export enum WithdrawLedgerStatus {
  StatusError = -1,
  StatusCreated = 0,
  // StatusPendingApproval = 10,
  // StatusApproved = 20,
  // StatusRejected = 30,
  StatusBurnConfirming = 40,
  StatusBurned = 50,
  StatusConfirmingTransfer = 60,
  StatusTransferProcessing = 70,
  StatusCompleted = 80,
}

export default class WithdrawLedger {
  txHash: string; //Primary key
  reqId: bigint; //Association with WithdrawRequest
  fromWalletAddr: string;
  fromTokenAmt: bigint;
  toWalletAddr: string;
  toAssetId: string;
  toAssetAddr: string;
  toAssetAmt: bigint;
  rate: bigint;
  createdDate: Date;
  lastModifiedDate: Date;
  status: WithdrawLedgerStatus;
  gasFee: number;
  gasUsed: number;
  remarks: string;
  constructor() {
    this.txHash = '';
    this.reqId = BigInt(0);
    this.fromWalletAddr = '';
    this.fromTokenAmt = BigInt(0);
    this.toWalletAddr = '';
    this.toAssetId = '';
    this.toAssetAddr = '';
    this.toAssetAmt = BigInt(0);
    this.rate = BigInt(0);
    this.createdDate = new Date();
    this.lastModifiedDate = new Date();
    this.status = WithdrawLedgerStatus.StatusCreated;
    this.gasFee = 0;
    this.gasUsed = 0;
    this.remarks = '';
  }
}
