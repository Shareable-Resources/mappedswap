import { Mixed } from '../../../foundation/types/Mixed';
export enum AgentDailyReportStatus {
  StatusPending = 0,
  StatusUpsert = 2,
  StatusDirectUsedFee = 3,
  StatusInterest = 4,
  StatusTransactionFee = 5,
  StatusLumpSum = 6,
  StatusFinished = 7, //Generated
}

export enum AgentDailyReportType {
  M = 0,
  MST = 1,
}

export class AgentDailyReportRealTime {
  agentId: Mixed;
  parentAgentId: Mixed | null;
  token: string;
  feePercentage: Mixed;
  interestPercentage: Mixed;
  //Credit
  directUsedFee: Mixed | null; //the used amount borrow from the system of all direct customers. Sum of negative balances of this agent from table [t_decats_balances]
  allSubAgentDirectUsedFee: Mixed | null; //the used amount borrow from the system of customers from sub-agents. Sum of negative balances of this agent' s sub-agents from table [t_decats_balances]
  //Transaction fee
  turnOver: Mixed | null; //sum of sell_amount in table [t_decats_transactions] of this agent (當期M Token交易量)
  accumalativeUSDMAmt: Mixed; //all sub agent sell amount and buy amount of USDM (本期所有有關usdm的交易量)
  directFee: Mixed | null; //sum of sell_amount in table [t_decats_transactions] of this agent * 0.003 (txFeePercentage) （手續費）
  directFeeIncome: Mixed | null; //sum of sell_amount in table [t_decats_transactions] of this agent by the created_date * 0.003 * self feePercentage （手續費收入）
  allSubAgentFee: Mixed | null; //the sub agent fee belongs to this agent, may not use for calculation（屬於此代理的下代理的手續費）
  allSubAgentOwnedFee: Mixed | null; //the sub agent fee actually belongs to this agent and used for later calculation （根據分成比例高低，真正屬於此代理的下代理的手續費，由於mst 的分成比例有機會低層的分成比例高於高層的分成比例，故而必須重新排列樹狀結構，以獲得真正屬於此代理的下代理手續費）
  allSubAgentFeeIncome: Mixed | null; //sum of fee from (sub agents * self's feePercentage/100)  所有下代理的手續費乘以自己的利息分成比例
  allChildAgentFeeIncome: Mixed | null; ///sum of fee from (children+children sub agents * child's feePercentage/100)  所有直屬代理及其下代理的利息乘以直屬代理的利息分成比例
  //Interest
  directInterest: Mixed | null; //sum of interest in table [t_decats_interest_histories] of this agent
  directInterestIncome: Mixed | null; //sum of interest in table [t_decats_interest_histories] of this agent multiply self's interestPercentage/100
  allSubAgentInterest: Mixed | null; //the sub agent interest belongs to this agent, may not use for calculation（屬於此代理的下代理的利息）
  allSubAgentOwnedInterest: Mixed | null; //the sub agent interest actually belongs to this agent and used for later calculation （根據分成比例高低，真正屬於此代理的下代理的利息，由於mst 的分成比例有機會低層的分成比例高於高層的分成比例，故而必須重新排列樹狀結構，以獲得真正屬於此代理的下代理利息）
  allSubAgentInterestIncome: Mixed | null; //sum of interest from (sub agents * self's interestPercentage/100)  所有下代理的利息乘以自己的利息分成比例
  allChildAgentInterestIncome: Mixed | null; //sum of interest from (children+children sub agents * child's interestPercentage/100)  所有直屬代理及其下代理的利息乘以直屬代理的利息分成比例

  feeIncome: Mixed | null; //allSubAgentFeeIncome + directFeeIncome （所有代理的手續費收入+自己客人的手續費收入＝手續費收入）
  netFeeIncome: Mixed | null; //netAgentFeeIncome + directFeeIncome （從代理獲得的手續費收入+自己客人的手續費收入＝淨手續費收入）
  netAgentFeeIncome: Mixed | null; //allSubAgentFeeIncome – allChildAgentFeeIncome （所有代理的手續費收入－派給直屬代理的手續費收入＝從代理獲得的手續費收入）
  interestIncome: Mixed | null; //allSubAgentInterestIncome+directInterestIncome （所有代理的利息收入+自己客人的利息收入＝利息收入）
  netInterestIncome: Mixed | null; //netAgentInterestIncome+directInterestIncome （從代理獲得的利息收入+自己客人的利息收入＝淨利息收入）
  netAgentInterestIncome: Mixed | null; //allSubAgentInterestIncome – allChildAgentInterestIncome （所有代理的利息收入－派給直屬代理的收入＝從代理獲得的利息收入）
  totalIncome: Mixed | null; // netFeeIncome+netInterestIncome (總收入)
  distMTokenRate: number; //The percentage share from totalIncome for m token
  distMSTTokenRate: number; //The percentage share from totalIncome for mst token
  distTokenInUSDM: Mixed | null; //The dist token amount being distributed in usdm, for human read, need to divide by (10 ** USDM' s decimals);
  distType: Mixed | null; //0(M), 1(MST)
  distToken: Mixed | null; //The token being disted
  toUSDMExchangeRate: Mixed; //Token=>USDM rate, e.g. BTCM->USDM / ETHM->USDM
  mstToUSDMExchangeRate: Mixed | null; //MST=>USDM rate
  stakedMst: Mixed;
  txFeeGrade: number | null;
  stakedMSTGrade: number | null;
  grade: number | null;
  commissionRate: Mixed;
  dateEnd: Date;
  createdDate: Date;
  cronJobId: Mixed | null;
  status: AgentDailyReportStatus; //狀態
  constructor() {
    this.agentId = 0;
    this.parentAgentId = null;
    this.token = '';
    this.feePercentage = 0;
    this.interestPercentage = 0;
    //Direct used fee
    this.directUsedFee = null;
    this.allSubAgentDirectUsedFee = null;
    //Transaction fee
    this.turnOver = null;
    this.directFee = null;
    this.directFeeIncome = null;
    this.allSubAgentFee = null;
    this.allSubAgentOwnedFee = null;
    this.allSubAgentFeeIncome = null;
    this.allChildAgentFeeIncome = null;
    //Interest
    this.directInterest = null;
    this.directInterestIncome = null;
    this.allSubAgentInterest = null;
    this.allSubAgentOwnedInterest = null;
    this.allSubAgentInterestIncome = null;
    this.allChildAgentInterestIncome = null;
    //Lump Sum
    this.feeIncome = null;
    this.netFeeIncome = null;
    this.netAgentFeeIncome = null;
    this.interestIncome = null;
    this.netInterestIncome = null;
    this.netAgentInterestIncome = null;
    this.totalIncome = null;
    this.distMTokenRate = 0;
    this.distMSTTokenRate = 0;
    this.distTokenInUSDM = null;
    this.distType = null;
    this.distToken = null;
    this.toUSDMExchangeRate = 0;
    this.mstToUSDMExchangeRate = null;
    this.dateEnd = new Date();
    this.createdDate = new Date();
    this.status = AgentDailyReportStatus.StatusPending;
    this.accumalativeUSDMAmt = 0;
    this.stakedMst = 0;
    this.txFeeGrade = null;
    this.stakedMSTGrade = null;
    this.grade = null;
    this.commissionRate = 0;
    this.cronJobId = null;
  }
}

export default class AgentDailyReport extends AgentDailyReportRealTime {
  //Agent
  id: Mixed | null;
  constructor() {
    super();
    this.id = null;
  }
}
