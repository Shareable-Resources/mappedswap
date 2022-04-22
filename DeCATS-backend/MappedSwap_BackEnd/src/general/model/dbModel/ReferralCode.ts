import { Mixed } from '../../../foundation/types/Mixed';
import { AgentType } from './Agent';
export enum ReferralCodeStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}
export enum ReferralCodeCodeStatus {
  StatusActive = 1,
  StatusInactive = 0,
}
export enum ReferralCodeType {
  ForeverUse = 1,
  OneTimeUse = 0,
}

export default class ReferralCode {
  id: Mixed | null;
  referralCode: string;
  type: ReferralCodeType;
  agentId: Mixed | null;
  agentName: string | null;
  hashString: string;
  feePercentage: Mixed;
  interestPercentage: Mixed;
  isUsed: boolean;
  codeStatus: ReferralCodeCodeStatus;
  agentType: AgentType;
  expiryDate: Date | null;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date;
  lastModifiedById: Mixed | null;
  status: ReferralCodeStatus;

  constructor() {
    this.id = null;
    this.referralCode = '';
    this.type = ReferralCodeType.OneTimeUse;
    this.agentId = null;
    this.agentName = null;
    this.hashString = '';
    this.feePercentage = 0;
    this.interestPercentage = 0;
    this.isUsed = false;
    this.codeStatus = 0;
    this.agentType = AgentType.FixedLevel;
    this.expiryDate = new Date();
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = new Date();
    this.lastModifiedById = null;
    this.status = ReferralCodeStatus.StatusPending;
  }
}
