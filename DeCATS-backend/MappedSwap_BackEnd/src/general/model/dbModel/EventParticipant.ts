import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class EventParticipant {
  id: Mixed | null;
  eventId: string | null;
  approvalId: string | null;
  createdDate: Date | string;
  address: string;
  amt: Mixed;
  txHash: string;
  status: EventParticipantStatus;
  distedDate: Date | string;
  distedById: string | null;
  lastModifiedDate: Date | string;
  constructor() {
    this.id = null;
    this.eventId = null;
    this.approvalId = null;
    this.createdDate = new Date();
    this.address = '';
    this.amt = new Big(0).toString();
    this.txHash = '';
    this.status = EventParticipantStatus.Pending;
    this.distedDate = new Date();
    this.distedById = new Big(0).toString();
    this.lastModifiedDate = new Date();
  }
}
export enum EventParticipantStatus {
  Pending = 0,
  Distributing = 1,
  Disted = 2,
}
