import { Mixed } from '../../../foundation/types/Mixed';
export enum AgentStatus {
  StatusPending = 0,
  StatusInactive = 10,
  StatusActive = 20,
}
export enum AgentType {
  Normal = 0,
  FixedLevel = 1,
  MST = 2, //MST Token
}
export enum AgentLevel {
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
  LastLevel = 4,
}

export default class Agent {
  id: Mixed | null;
  address: string;
  name: string;
  password: string;
  email: string;
  parentAgentId: Mixed | null;
  interestPercentage: number;
  feePercentage: number;
  agentType: AgentType | null;
  agentLevel: AgentLevel | null;
  referralCodeId: Mixed | null;
  fundingCodeId: Mixed | null;
  createdDate: Date;
  createdById: Mixed | null;
  lastModifiedDate: Date;
  lastModifiedById: Mixed | null;
  status: AgentStatus;
  role: string | null;
  signData: string | null;
  allowViewAgent: boolean;
  parentTree: Mixed[] | null;

  constructor() {
    this.id = null;
    this.address = '';
    this.name = '';
    this.password = '';
    this.email = '';
    this.parentAgentId = 0;
    this.interestPercentage = 0;
    this.feePercentage = 0;
    this.agentType = AgentType.Normal;
    this.agentLevel = AgentLevel.Level1;
    this.referralCodeId = null;
    this.fundingCodeId = null;
    this.createdDate = new Date();
    this.createdById = null;
    this.lastModifiedDate = new Date();
    this.lastModifiedById = null;
    this.status = AgentStatus.StatusPending;
    this.role = null;
    this.signData = '';
    this.allowViewAgent = false;
    this.parentTree = null;
  }
}
