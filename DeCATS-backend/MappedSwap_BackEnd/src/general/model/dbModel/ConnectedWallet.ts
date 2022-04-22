import { Mixed } from '../../../foundation/types/Mixed';

export enum ConnectedType {
  customer = 0,
  agent = 1,
}

export default class ConnectedWallet {
  id: Mixed | null;
  address: string;
  connectedType: ConnectedType;
  createdDate: Date | string | null;
  constructor() {
    this.id = null;
    this.address = '';
    this.connectedType = ConnectedType.customer;
    this.createdDate = new Date();
  }
}
