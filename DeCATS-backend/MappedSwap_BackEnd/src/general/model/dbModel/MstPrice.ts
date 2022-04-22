import { Mixed } from '../../../foundation/types/Mixed';

export enum MstPriceStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export default class MstPrice {
  id?: Mixed;
  mstPrice: Mixed;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date | null;
  lastModifiedById: Mixed | null;
  status: MstPriceStatus;

  constructor() {
    this.mstPrice = '';
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = null;
    this.lastModifiedById = null;
    this.status = MstPriceStatus.StatusActive;
  }
}
