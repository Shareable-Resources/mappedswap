import { AgentStatus, AgentType } from '../../general/model/dbModel/Agent';
import {
  CustomerContractStatus,
  CustomerStatus,
} from '../../general/model/dbModel/Customer';
import { Mixed } from './Mixed';

export class TokenEncryptedObject {
  loginId?: string;
  email?: string;
  id?: string;
  name?: string;
  type?: 'Customer' | 'Agent' | string;
  status?: number;
  constructor() {
    this.type = '';
  }
}

export class TokenEncryptedObjectAgent extends TokenEncryptedObject {
  status?: AgentStatus;
  role: string | null;
  parentAgentId?: Mixed;
  agentType?: AgentType | null;
  allowViewAgent?: boolean;
  isReadOnly?: boolean;
  constructor() {
    super();
    this.role = null;
  }
}

export class TokenEncryptedObjectCustomer extends TokenEncryptedObject {
  contractStatus?: CustomerContractStatus;
  status?: CustomerStatus;
  address?: string;
  walletAddress?: string;
  isAgent?: boolean;
  agentId?: string;
  agentType?: string | null;
  constructor() {
    super();
  }
}

export class FundingCodeEncryptedObject {
  // createdDate?: Date;
  expiry?: Date;
  // type?: 'FundingCode' | string;
  // constructor() {
  //   // this.type = '';
  //   // this.createdDate = new Date();
  // }
}
