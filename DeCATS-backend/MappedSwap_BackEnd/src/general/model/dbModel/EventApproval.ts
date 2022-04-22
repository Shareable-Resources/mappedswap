import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class EventApproval {
  id: Mixed | null;
  eventId: string | null;
  createdDate: Date | string;
  createdById: string;
  amt: Mixed;
  txHash: string | null;
  status: EventApprovalStatus;
  lastModifiedById: string;
  lastModifiedDate: Date | string;
  roundId: Mixed | null;
  approvedById: Mixed | null;
  approvedDate: Date | string | null;

  constructor() {
    this.id = null;
    this.eventId = null;
    this.createdDate = new Date();
    this.createdById = new Big(0).toString();
    this.amt = new Big(0).toString();
    this.txHash = null;
    this.status = EventApprovalStatus.Approved;
    this.lastModifiedById = new Big(0).toString();
    this.lastModifiedDate = new Date();
    this.approvedById = new Big(0).toString();
    this.approvedDate = new Date();
    this.roundId = null;
  }
}
export enum EventApprovalStatus {
  Pending = 0, // After upload api success
  Approved = 1, // After approve api success
  Distributing = 2, // When distribute api starts
  Disted = 3, //When distribute api finish
}
