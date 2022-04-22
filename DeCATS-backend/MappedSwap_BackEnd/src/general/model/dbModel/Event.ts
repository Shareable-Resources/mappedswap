import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';

export default class Event {
  id: Mixed | null;
  code: string | null;
  name: string | null;
  createdDate: Date | string;
  createdById: string;
  status: EventStatus;
  budget: Mixed | null;
  quota: Mixed | null;
  token: string;
  distType: EventDistType;
  lastModifiedById: string;
  lastModifiedDate: Date | string;
  constructor() {
    this.id = null;
    this.code = null;
    this.name = null;
    this.createdDate = new Date();
    this.createdById = new Big(0).toString();
    this.status = EventStatus.Inactive;
    this.budget = null;
    this.quota = null;
    this.token = '';
    this.distType = EventDistType.M;
    this.lastModifiedById = new Big(0).toString();
    this.lastModifiedDate = new Date();
  }
}
export enum EventStatus {
  Inactive = 0,
  Active = 1,
}

export enum EventDistType {
  M = 0,
  MST = 1,
}
