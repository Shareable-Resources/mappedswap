import { Mixed } from '../../../foundation/types/Mixed';
import { AgentType } from '../../../general/model/dbModel/Agent';
import AgentDailyReport, {
  AgentDailyReportType,
} from '../../../general/model/dbModel/AgentDailyReport';
import Token from '../../../general/model/dbModel/Token';

export interface UpdateTruancateResult {
  isSuccess: boolean;
  reports: AgentDailyReport[];
}
export interface AccumalativeAmountResult {
  isSuccess: boolean;
  reports: AccumalativeAmount[];
}

export interface TempAgentAdjTreeInfo {
  root_agent_id: Mixed;
  node_agent_id: Mixed;
  root_agent_child_agent_id: Mixed;
  root_agent_child_agent_id_interest_percentage: number;
  root_agent_child_agent_id_fee_percentage: number;
}

export interface AccumalativeAmount {
  id: Mixed; //agent_id
  address: string;
  node: string;
  parentAgentId: string;
  agentType: AgentType;
  interestPercentage: Mixed;
  feePercentage: Mixed;
  name: string;
  amount: Mixed;
  accumalativeUSDMAmt: Mixed;
  mstAmount: Mixed;
  commissionRate: Mixed;
  distMTokenRate: Mixed;
  distMSTTokenRate: Mixed;
  toMSTExchangeRate: Mixed;
  toUSDMExchangeRate: Mixed;
  tokenAmts: TokenAmt[];
  accumulativeObj: any;
  stakedMst: Mixed;
  txFeeGrade: number;
  stakedMSTGrade: number;
  grade: number;
  distType: AgentDailyReportType;
  children: AccumalativeAmount[];
}

export interface TokenAmt {
  token: string;
  allSubAgentDirectUsedFee: Mixed | null;
  directUsedFee: Mixed | null; //Got
  //Transaction fee
  turnOver: Mixed | null; //Got
  directFee: Mixed | null; //Got
  directFeeIncome: Mixed | null; //Got
  allSubAgentFee: Mixed | null; //Got
  allSubAgentOwnedFee: Mixed | null;
  allSubAgentFeeIncome: Mixed | null;
  allChildAgentFeeIncome: Mixed | null;
  //Interest
  directInterest: Mixed | null; //Got
  directInterestIncome: Mixed | null; //Got
  allSubAgentInterest: Mixed | null; //Got
  allSubAgentOwnedInterest: Mixed | null;
  allSubAgentInterestIncome: Mixed | null;
  allChildAgentInterestIncome: Mixed | null;
  feeIncome: Mixed | null;
  netFeeIncome: Mixed | null;
  netAgentFeeIncome: Mixed | null;
  interestIncome: Mixed | null;
  netInterestIncome: Mixed | null;
  netAgentInterestIncome: Mixed | null;
  totalIncome: Mixed | null;
  toUSDMExchangeRate: Mixed;
  toMSTExchangeRate: Mixed;
}

export interface ReportDirectAmt {
  amt: Mixed;
  agentId: Mixed;
  token: string;
}

export interface ReportDirectFee extends ReportDirectAmt {
  turnOver: Mixed;
}

export class CronJobDaysRange {
  now: string;
  inTimeRange: number[];
  weekDayStartInRange: number | undefined; // Period starts at which weekday
  weekDayEndInRange: number | undefined; //Period end at which weekday
  dateStartInRange: string;
  dateEndInRange: string;
  dateStart: string;
  dateEnd: string;
  yesterday: string;
  todayWeekDay: number | undefined;

  constructor() {
    this.now = '';
    this.inTimeRange = [];
    this.weekDayStartInRange = undefined;
    this.weekDayEndInRange = undefined;
    this.dateStartInRange = '';
    this.dateEndInRange = '';
    this.dateStart = '';
    this.dateEnd = '';
    this.yesterday = '';
    this.todayWeekDay = undefined;
  }
}

export interface TokenWithMSTExchangeRate extends Token {
  toMSTExchangeRate: Mixed;
  toUSDMExchangeRate: Mixed;
}
