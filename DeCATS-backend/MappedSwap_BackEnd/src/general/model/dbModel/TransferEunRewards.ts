import { Mixed } from '../../../foundation/types/Mixed';

export enum ENUM_TRANSFER_STATUS {
  PENDING = 1,
  COMPLETED = 2,
  REVERTED = -1,
  FAIL = -2,
}

export default class TransferEunRewards {
  id: Mixed | null;
  address: string;
  amount: number;
  transferStatus: ENUM_TRANSFER_STATUS | null;
  transferTxHash: string;
  errMsg: string;
  resend: boolean;
  resendTransferId: number;
  createTime: Date;
  updateTime: Date;

  constructor() {
    this.id = null;
    this.address = '';
    this.amount = 0;
    this.transferStatus = ENUM_TRANSFER_STATUS.PENDING;
    this.transferTxHash = '';
    this.errMsg = '';
    this.resend = false;
    this.resendTransferId = 0;
    this.createTime = new Date();
    this.updateTime = new Date();
  }
}
