/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import AgentDailyReport, {
  AgentDailyReportStatus,
} from '../dbModel/AgentDailyReport';
import * as SeqModel from './0_index';
export default AgentDailyReport;

export interface AgentDailyReportModel
  extends Model<AgentDailyReport>,
    AgentDailyReport {}
export type AgentDailyReportStatic = typeof Model & {
  new (values?: any, options?: BuildOptions): AgentDailyReportModel;
};
export function AgentDailyReportFactory(sequelize: Sequelize) {
  return <AgentDailyReportStatic>sequelize.define(
    SeqModel.name.AgentDailyReport,
    {
      id: {
        field: 'id',
        allowNull: false,
        primaryKey: true,
        type: DataTypes.BIGINT,
        comment: 'id',
        autoIncrement: true,
      },
      //agent related
      agentId: {
        field: 'agent_id',
        allowNull: false,
        comment: 'which agent this report belongs to',
        type: DataTypes.BIGINT,
      },
      parentAgentId: {
        field: 'parent_agent_id',
        allowNull: true,
        comment: 'the parent agent id of this agent',
        type: DataTypes.BIGINT,
      },
      token: {
        field: 'token',
        allowNull: false,
        comment: 'token name (M Token)',
        type: DataTypes.STRING(64),
      },
      feePercentage: {
        field: 'fee_percentage',
        allowNull: true,
        comment:
          '[t_decats_agent].[fee_percentage] of this agent or [t_decats].[mst_dist_rules].[distMTokenRate] or [distMSTTokenRate] based on grade',
        type: DataTypes.DECIMAL(78, 3),
      },
      interestPercentage: {
        field: 'interest_percentage',
        allowNull: true,
        comment:
          '[t_decats_agent].[interest_percentage] of this agent or [t_decats].[mst_dist_rules].[distMTokenRate] or [distMSTTokenRate] based on grade',
        type: DataTypes.DECIMAL(78, 3),
      },
      //used balance
      directUsedFee: {
        field: 'direct_used_fee',
        allowNull: true,
        comment:
          'the used amount borrow from the system of all direct customers. Sum of negative balances of this agent from table [t_decats_balances]',
        type: DataTypes.DECIMAL(78, 0),
      },
      //sub agent used balance
      allSubAgentDirectUsedFee: {
        field: 'all_sub_agent_direct_used_fee',
        allowNull: true,
        comment:
          "the used amount borrow from the system of customers from sub-agents. Sum of negative balances of this agent' s sub-agents from table [t_decats_balances]",
        type: DataTypes.DECIMAL(78, 0),
      },
      // transaction/agent transactions
      turnOver: {
        field: 'turn_over',
        allowNull: true,
        comment:
          'all sell_amt(sell_amount_of_[t_decats_transactions]) of the token of this agent (本期m token賣出交易量)',
        type: DataTypes.DECIMAL(78, 0),
      },
      accumalativeUSDMAmt: {
        field: 'accumalative_usdm_amt',
        allowNull: true,
        comment:
          'all sub agent sell amount and buy amount of USDM (本期usdm的累計交易量，包括賣出和買入，並且包括子代理)',
        type: DataTypes.DECIMAL(78, 0),
      },
      directFee: {
        field: 'direct_fee',
        allowNull: true,
        comment:
          'sum of sell_amount in table [t_decats_transactions] of this agent * 0.003 (txFeePercentage) （手續費）',
        type: DataTypes.DECIMAL(78, 0),
      },
      directFeeIncome: {
        field: 'direct_fee_income',
        allowNull: true,
        comment:
          'sum of sell_amount in table [t_decats_transactions] of this agent by the created_date * 0.003 * self feePercentage （手續費收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      allSubAgentFee: {
        field: 'all_sub_agent_fee',
        allowNull: true,
        comment:
          'all sub agents direct_fee(turn_over x 0.003), then sum together) , may not use for calculation（屬於此代理的下代理的手續費）',
        type: DataTypes.DECIMAL(78, 0),
      },
      allSubAgentOwnedFee: {
        field: 'all_sub_agent_owned_fee',
        allowNull: true,
        comment:
          'the sub agent fee actually belongs to this agent and used for later calculation (after sort,all sub agents direct_fee(turn_over x 0.003), then sum together) （根據分成比例高低，真正屬於此代理的下代理的手續費，由於mst 的分成比例有機會低層的分成比例高於高層的分成比例，故而必須重新排列樹狀結構，以獲得真正屬於此代理的下代理手續費）',
        type: DataTypes.DECIMAL(78, 0),
      },
      allSubAgentFeeIncome: {
        field: 'all_sub_agent_fee_income',
        allowNull: true,
        comment: 'all_sub_agent_owned_fee*fee_percentage',
        type: DataTypes.DECIMAL(78, 0),
      },
      allChildAgentFeeIncome: {
        field: 'all_child_agent_fee_income',
        allowNull: true,
        comment:
          "sum of (sell_amount in table [t_decats_transactions] of this agent' s child-agents by the created_date * childAgentFeePercentage)",
        type: DataTypes.DECIMAL(78, 0),
      },
      // interest/agentInterest
      directInterest: {
        field: 'direct_interest',
        allowNull: true,
        comment:
          'sum of interest in table [t_decats_interest_histories] of this agent',
        type: DataTypes.DECIMAL(78, 0),
      },
      directInterestIncome: {
        field: 'direct_interest_income',
        allowNull: true,
        comment:
          "sum of interest in table [t_decats_interest_histories] of this agent multiply self's interestPercentage/100",
        type: DataTypes.DECIMAL(78, 0),
      },
      allSubAgentInterest: {
        field: 'all_sub_agent_interest',
        allowNull: true,
        comment:
          'all sub agents direct_fee(turn_over x 0.003), then sum together), the sub agent interest belongs to this agent, may not use for calculation（屬於此代理的下代理的利息）',
        type: DataTypes.DECIMAL(78, 0),
      },
      allSubAgentOwnedInterest: {
        field: 'all_sub_agent_owned_interest',
        allowNull: true,
        comment:
          'the sub agent interest actually belongs to this agent and used for later calculation,(after sort,all sub agents interests, then sum together) （根據分成比例高低，真正屬於此代理的下代理的利息，由於mst 的分成比例有機會低層的分成比例高於高層的分成比例，故而必須重新排列樹狀結構，以獲得真正屬於此代理的下代理利息）',
        type: DataTypes.DECIMAL(78, 0),
      },
      allSubAgentInterestIncome: {
        field: 'all_sub_agent_interest_income',
        allowNull: true,
        comment: 'all_sub_agent_owned_fee*interest_percentage',
        type: DataTypes.DECIMAL(78, 0),
      },
      allChildAgentInterestIncome: {
        field: 'all_child_agent_interest_income',
        allowNull: true,
        comment:
          "sum of interest from (children+children sub agents * child's interestPercentage/100)  所有直屬代理及其下代理的利息乘以直屬代理的利息分成比例",
        type: DataTypes.DECIMAL(78, 0),
      },
      feeIncome: {
        field: 'fee_income',
        allowNull: true,
        comment:
          'allSubAgentFeeIncome + directFeeIncome （所有代理的手續費收入+自己客人的手續費收入＝手續費收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      netFeeIncome: {
        field: 'net_fee_income',
        allowNull: true,
        comment:
          'netAgentFeeIncome + directFeeIncome （從代理獲得的手續費收入+自己客人的手續費收入＝淨手續費收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      netAgentFeeIncome: {
        field: 'net_agent_fee_income',
        allowNull: true,
        comment:
          'allSubAgentFeeIncome – allChildAgentFeeIncome （所有代理的手續費收入－派給直屬代理的手續費收入＝從代理獲得的手續費收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      interestIncome: {
        field: 'interest_income',
        allowNull: true,
        comment:
          'allSubAgentInterestIncome+directInterestIncome （所有代理的利息收入+自己客人的利息收入＝利息收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      netInterestIncome: {
        field: 'net_interest_income',
        allowNull: true,
        comment:
          'netAgentInterestIncome+directInterestIncome （從代理獲得的利息收入+自己客人的利息收入＝淨利息收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      netAgentInterestIncome: {
        field: 'net_agent_interest_income',
        allowNull: true,
        comment:
          'allSubAgentInterestIncome – allChildAgentInterestIncome （所有代理的利息收入－派給直屬代理的收入＝從代理獲得的利息收入）',
        type: DataTypes.DECIMAL(78, 0),
      },
      totalIncome: {
        field: 'total_income',
        allowNull: true,
        comment: 'netFeeIncome+netInterestIncome (總收入)',
        type: DataTypes.DECIMAL(78, 0),
      },
      distMTokenRate: {
        field: 'dist_m_token_rate',
        allowNull: true,
        comment: 'The percentage share from totalIncome for m token',
        type: DataTypes.DECIMAL,
      },
      distMSTTokenRate: {
        field: 'dist_mst_token_rate',
        allowNull: true,
        comment: 'The percentage share from totalIncome for mst token',
        type: DataTypes.DECIMAL,
      },
      distType: {
        field: 'dist_type',
        allowNull: false,
        comment: '0(M), 1(MST)',
        type: DataTypes.SMALLINT,
      },
      distToken: {
        field: 'dist_token',
        allowNull: true,
        comment:
          'For dist_type(0)=total_income (should divided by M token decimal), for dist_type(1)=total_income convert to USDM then convert to MST (should divided by MST token decimal)',
        type: DataTypes.DECIMAL(78, 0),
      },
      distTokenInUSDM: {
        field: 'dist_token_in_usdm',
        allowNull: true,
        comment:
          "The dist token amount being distributed in usdm, for human read, need to divide by (10 ** USDM' s decimals)",
        type: DataTypes.DECIMAL(78, 0),
      },
      toUSDMExchangeRate: {
        field: 'to_usdm_exchange_rate',
        allowNull: true,
        comment: 'Token=>USDM rate, e.g. BTCM->USDM / ETHM->USDM',
        type: DataTypes.DECIMAL(78, 0),
      },
      mstToUSDMExchangeRate: {
        field: 'mst_to_usdm_exchange_rate',
        allowNull: true,
        comment: 'MST=>USDM rate',
        type: DataTypes.DECIMAL(78, 0),
      },
      stakedMst: {
        field: 'staked_mst',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
      },
      txFeeGrade: {
        field: 'tx_fee_grade',
        allowNull: true,
        type: DataTypes.INTEGER,
        comment:
          'tx fee grade base on dateFrom and dateTo with terms on t_decats_mst_dist_rules',
      },
      stakedMSTGrade: {
        field: 'staked_mst_grade',
        allowNull: true,
        type: DataTypes.INTEGER,
        comment:
          'staked mst fee grade base on dateFrom and dateTo with terms on t_decats_mst_dist_rules',
      },
      grade: {
        field: 'grade',
        allowNull: true,
        type: DataTypes.INTEGER,
        comment: 'the greater grade of stakedMSTGrade and txFeeGrade',
      },
      cronJobId: {
        field: 'cron_job_id',
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      commissionRate: {
        field: 'commission_rate',
        allowNull: true,
        type: DataTypes.DECIMAL(78, 0),
      },
      dateEnd: {
        comment: 'The report ends in when',
        field: 'date_end',
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdDate: {
        comment: 'The report generated in when',
        field: 'created_date',
        allowNull: true,
        type: DataTypes.DATE,
      },
      status: {
        field: 'status',
        allowNull: false,
        defaultValue: AgentDailyReportStatus.StatusPending,
        type: DataTypes.SMALLINT,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['agent_id', 'token', 'dist_type', 'created_date'],
        },
      ],
    },
  );
}
