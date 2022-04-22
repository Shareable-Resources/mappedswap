import { Mixed } from '../../../foundation/types/Mixed';
import Agent from './Agent';
export enum CustomerStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}

export enum CustomerContractStatus {
  StatusDisabled = 0,
  StatusEnabled = 1,
  StatusTradeDisabled = 2,
}

export enum CustomerCreditModeStatus {
  StatusDisabled = 0,
  StatusEnabled = 1,
}

export enum CustomerDefaultDetails {
  maxFunding = 2000000000 * 1000000,
  leverage = 10000,
  riskLevel = 800000,
}

export enum CustomerType {
  normal = 0,
  centralized = 1,
}

export default class Customer {
  id: string | null;
  address: string;
  name: string | null;
  agentId: Mixed;
  leverage: Mixed;
  maxFunding: Mixed;
  creditMode: CustomerCreditModeStatus;
  contractStatus: CustomerContractStatus;
  riskLevel: number;
  fundingCodeId: Mixed | null;
  type: CustomerType;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date;
  lastModifiedById: Mixed | null;
  status: CustomerStatus;
  agent?: Agent;
  constructor() {
    this.id = null;
    this.address = '';
    this.name = null;
    this.agentId = 0;
    this.leverage = 0;
    this.maxFunding = 0;
    this.creditMode = CustomerCreditModeStatus.StatusDisabled;
    this.contractStatus = CustomerContractStatus.StatusDisabled;
    this.riskLevel = 0;
    this.fundingCodeId = 0;
    this.type = CustomerType.normal;
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = new Date();
    this.lastModifiedById = null;
    this.status = CustomerStatus.StatusPending;
  }
}
