import { Mixed } from '../../../foundation/types/Mixed';
import { ENUM_TRANSFER_STATUS } from './TransferEunRewards';

export default class TransferHistories {
  id: Mixed | null;
  seqNo: number;
  amount: number;
  blockHash: string;
  blockNo: string;
  confirmStatus: number;
  networkCode: string;
  onchainStatus: number;
  symbol: string;
  tag: string;
  txHash: string;
  transferStatus: ENUM_TRANSFER_STATUS | null;
  transferTxHash: string;
  errMsg: string;
  resend: boolean;
  resendTransferId: number;
  createTime: Date;
  updateTime: Date;

  constructor() {
    this.id = null;
    this.seqNo = 0;
    this.amount = 0;
    this.blockHash = '';
    this.blockNo = '';
    this.confirmStatus = 0;
    this.networkCode = '';
    this.onchainStatus = 0;
    this.symbol = '';
    this.tag = '';
    this.txHash = '';
    this.transferStatus = ENUM_TRANSFER_STATUS.PENDING;
    this.transferTxHash = '';
    this.errMsg = '';
    this.resend = false;
    this.resendTransferId = 0;
    this.createTime = new Date();
    this.updateTime = new Date();
  }
}
