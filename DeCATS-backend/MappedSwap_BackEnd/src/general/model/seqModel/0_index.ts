import { AgentDailyReportFactory } from './AgentDailyReport';
import { BalanceAssociation, BalanceFactory } from './Balance';
import { PriceHistoryFactory } from './PriceHistory';
import {
  BalanceHistoryAssociation,
  BalanceHistoryFactory,
} from './BalanceHistory';
import { CustomerFactory } from './Customer';
import { AgentFactory } from './Agent';
import { CustomerCreditUpdateFactory } from './CustomerCreditUpdate';
import { InterestHistoryFactory } from './InterestHistory';
import { StopoutFactory } from './Stopout';
import { TransactionFactory, TranscationAssociation } from './Transaction';
import { Model, ModelCtor } from 'sequelize/types';
import { AgentAssociation } from './Agent';
import { TokenFactory } from './Token';
import { CustomerAssociation } from './Customer';
import { PriceHistoryRefFactory } from './PriceHistoryRef';
import { PricesFactory } from './Prices';
import { FundingCodeAssociation, FundingCodeFactory } from './FundingCode';
import {
  CommissionJobFactory,
  CommissionJobAssociation,
} from './CommissionJob';
import {
  CommissionDistributionFactory,
  CommissionDistributionAssociation,
} from './CommissionDistribution';
import {
  CommissionLedgerFactory,
  CommissionLedgerAssociation,
} from './CommissionLedger';
import { CommissionSummaryFactory } from './CommissionSummary';
import { BlockPricesFactory } from './BlockPrices';
import { CronJobFactory } from './CronJob';
import { ReferralCodeAssociation, ReferralCodeFactory } from './ReferralCode';
import { MSTDistRuleFactory } from './MSTDistRule';
import { LeaderBoardRuleFactory } from './LeaderBoardRule';
import {
  LeaderBoardRankingAssociation,
  LeaderBoardRankingFactory,
} from './LeaderBoardRanking';
import { MiningRewardsDistributionFactory } from './MiningRewardsDistribution';
import {
  MiningRewardsAssociation,
  MiningRewardsFactory,
} from './MiningRewards';
import { AgentDailyReportRealTimeFactory } from './AgentDailyReportRealTime';
import { BurnTransactionsFactory } from './BurnTransactions';
import { BuyBackDetailsFactory } from './BuyBackDetails';
import { MstPriceFactory } from './MstPrice';
import { ProfitDailyReportFactory } from './ProfitDailyReport';
import { BalanceSnapshotFactory } from './BalanceSnapShot';
import { PairDailyReportFactory } from './PairDailyReport';
import { TransferEunRewardsFactory } from './TransferEunRewards';
import { TransferHistoriesFactory } from './TransferHistories';
import { DailyStatisticReportFactory } from './DailyStatisticReport';
import { StakeRewardsFactory } from './StakeRewards';
import { ProfitAndLossReportFactory } from './ProfitAndLossReport';
import { ConnectedWalletFactory } from './ConnectedWallet';
import { ExampleTableFactory } from './ExampleTable';
import { EventFactory, EventAssociation } from './Event';
import { EventParticipantFactory } from './EventParticipant';
import { EventApprovalFactory } from './EventApproval';
import { EventTradeVolumeFactory } from './EventTradeVolume';
export enum name {
  Agent = 't_decats_agents',
  CustomerCreditUpdate = 't_decats_customers_credit_updates',
  AgentDailyReport = 't_decats_agent_daily_reports',
  AgentDailyReportRealTime = 't_decats_agent_daily_reports_real_time',
  Balance = 't_decats_balances',
  BalanceHistory = 't_decats_balances_histories',
  BalanceSnapshot = 't_decats_balances_snapshots',
  ProfitAndLossReport = 't_decats_profit_and_loss_reports',
  ProfitDailyReport = 't_decats_profit_daily_reports',
  PriceHistory = 't_decats_price_histories',
  Stopout = 't_decats_stopouts',
  Transaction = 't_decats_transactions',
  Customer = 't_decats_customers',
  InterestHistory = 't_decats_interest_histories',
  PriceHistoryRef = 't_decats_price_histories_ref',
  Token = 't_decats_tokens',
  Prices = 't_decats_prices',
  FundingCode = 't_decats_funding_code',
  BlockPrices = 't_decats_block_prices',
  CommissionDistribution = 't_decats_commission_distributions',
  CommissionJob = 't_decats_commission_jobs',
  CommissionLedger = 't_decats_commission_ledgers',
  CommissionSummary = 't_decats_commission_summaries',
  CronJob = 't_decats_cron_jobs',
  ReferralCode = 't_decats_referral_code',
  MSTDistRule = 't_decats_mst_dist_rules',
  LeaderBoardRule = 't_decats_leaderboard_rules',
  LeaderBoardRanking = 't_decats_leaderboard_rankings',
  SysConfig = 't_decats_sys_config',
  MiningRewards = 't_decats_mining_rewards',
  MiningRewardsDistribution = 't_decats_mining_rewards_distribution',
  BurnTransactions = 't_decats_burn_transactions',
  BuyBackDetails = 't_decats_buy_back_details',
  MstPrice = 't_decats_mst_price',
  PairDailyReport = 't_decats_pair_daily_reports',
  TransferEunRewards = 't_decats_transfer_eun_rewards',
  TransferHistories = 't_decats_transfer_histories',
  DailyStatisticReport = 't_decats_daily_statistic_reports',
  StakeRewards = 't_decats_stake_rewards',
  ConnectedWallet = 't_decats_connected_wallets',
  ExampleTable = 't_decats_example_tables',
  Event = 't_decats_events',
  EventParticipant = 't_decats_event_participants',
  EventApproval = 't_decats_event_approvals',
  EventTradeVolume = 't_decats_event_trade_volumes',
}

export interface ModelCtors {
  [name.Agent]: ModelCtor<Model>;
  [name.Customer]: ModelCtor<Model>;
  [name.CustomerCreditUpdate]: ModelCtor<Model>;
  [name.AgentDailyReport]: ModelCtor<Model>;
  [name.Balance]: ModelCtor<Model>;
  [name.BalanceHistory]: ModelCtor<Model>;
  [name.InterestHistory]: ModelCtor<Model>;
  [name.PriceHistory]: ModelCtor<Model>;
  [name.PriceHistoryRef]: ModelCtor<Model>;
  [name.Stopout]: ModelCtor<Model>;
  [name.Transaction]: ModelCtor<Model>;
  [name.Token]: ModelCtor<Model>;
  [name.Prices]: ModelCtor<Model>;
  [name.FundingCode]: ModelCtor<Model>;
  [name.BlockPrices]: ModelCtor<Model>;
  [name.CronJob]: ModelCtor<Model>;
  [name.ReferralCode]: ModelCtor<Model>;
  [name.MSTDistRule]: ModelCtor<Model>;
  [name.LeaderBoardRule]: ModelCtor<Model>;
  [name.LeaderBoardRanking]: ModelCtor<Model>;
  [name.SysConfig]: ModelCtor<Model>;
  [name.MiningRewards]: ModelCtor<Model>;
  [name.MiningRewardsDistribution]: ModelCtor<Model>;
  [name.BurnTransactions]: ModelCtor<Model>;
  [name.BuyBackDetails]: ModelCtor<Model>;
  [name.MstPrice]: ModelCtor<Model>;
  [name.PairDailyReport]: ModelCtor<Model>;
  [name.TransferEunRewards]: ModelCtor<Model>;
  [name.TransferHistories]: ModelCtor<Model>;
  //[name.StakeRewards]: ModelCtor<Model>;
  [name.ProfitAndLossReport]: ModelCtor<Model>;
  [name.DailyStatisticReport]: ModelCtor<Model>;
  [name.ConnectedWallet]: ModelCtor<Model>;
  [name.ExampleTable]: ModelCtor<Model>;
  [name.EventParticipant]: ModelCtor<Model>;
  [name.Event]: ModelCtor<Model>;
  [name.EventApproval]: ModelCtor<Model>;
  [name.EventTradeVolume]: ModelCtor<Model>;
}

export const factory = {
  AgentFactory,
  CustomerFactory,
  CustomerCreditUpdateFactory,
  AgentDailyReportFactory,
  AgentDailyReportRealTimeFactory,
  BalanceFactory,
  BalanceHistoryFactory,
  InterestHistoryFactory,
  PriceHistoryFactory,
  PriceHistoryRefFactory,
  StopoutFactory,
  TransactionFactory,
  TokenFactory,
  PricesFactory,
  FundingCodeFactory,
  BlockPricesFactory,
  CommissionJobFactory,
  CommissionDistributionFactory,
  CommissionLedgerFactory,
  CommissionSummaryFactory,
  CronJobFactory,
  ReferralCodeFactory,
  MSTDistRuleFactory,
  LeaderBoardRuleFactory,
  LeaderBoardRankingFactory,
  MiningRewardsFactory,
  MiningRewardsDistributionFactory,
  BurnTransactionsFactory,
  BuyBackDetailsFactory,
  MstPriceFactory,
  ProfitDailyReportFactory,
  BalanceSnapshotFactory,
  PairDailyReportFactory,
  TransferEunRewardsFactory,
  TransferHistoriesFactory,
  StakeRewardsFactory,
  ProfitAndLossReportFactory,
  DailyStatisticReportFactory,
  ConnectedWalletFactory,
  ExampleTableFactory,
  EventFactory,
  EventParticipantFactory,
  EventApprovalFactory,
  EventTradeVolumeFactory,
};

export const associaion = {
  AgentAssociation,
  CustomerAssociation,
  BalanceAssociation,
  BalanceHistoryAssociation,
  TranscationAssociation,
  FundingCodeAssociation,
  CommissionJobAssociation,
  CommissionDistributionAssociation,
  CommissionLedgerAssociation,
  ReferralCodeAssociation,
  MiningRewardsAssociation,
  EventAssociation,
  LeaderBoardRankingAssociation,
};
export default { name, factory, associaion };
