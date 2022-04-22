import { Mixed } from '../../../foundation/types/Mixed';
import { AgentType } from './Agent';
export enum FundingCodeStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}
export enum FundingCodeCodeStatus {
  StatusActive = 1,
  StatusInactive = 0,
}
export enum FundingCodeTypeStatus {
  ForeverUse = 1,
  OneTimeUse = 0,
}

export default class FundingCode {
  id: Mixed | null;
  fundingCode: string;
  type: FundingCodeTypeStatus;
  agentId: Mixed | null;
  customerName: string;
  hashString: string;
  isUsed: boolean;
  codeStatus: FundingCodeCodeStatus;
  expiryDate: Date;
  agentType: AgentType;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date;
  lastModifiedById: Mixed | null;
  status: FundingCodeStatus;

  constructor() {
    this.id = null;
    this.fundingCode = '';
    this.type = 0;
    this.agentId = null;
    this.customerName = '';
    this.hashString = '';
    this.isUsed = false;
    this.codeStatus = 0;
    this.expiryDate = new Date();
    this.agentType = AgentType.MST;
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = new Date();
    this.lastModifiedById = null;
    this.status = FundingCodeStatus.StatusPending;
  }
}
