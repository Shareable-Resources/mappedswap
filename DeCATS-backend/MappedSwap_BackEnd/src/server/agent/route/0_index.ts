import Route from '../../../foundation/server/CommonRoute';
import AgentRoute from './AgentRoute';
import CustomerRoute from './CustomerRoute';
import BalanceHistoryRoute from './BalanceHistoryRoute';
import BalanceRoute from './BalanceRoute';
import AgentDailyReportRoute from './AgentDailyReportRoute';
import LogRoute from './LogsRoute';
import TransactionRoute from './TransactionRoute';
import InterestRoute from './InterestRoute';
import CustomerCreditUpdateRoute from './CustomerCreditUpdateRoute';
import PriceRoute from './PriceRoute';
import CommissionJobRoute from './CommissionJobRoute';
import CommissionDistributionRoute from './CommissionDistributionRoute';
import CommissionLedgerRoute from './CommissionLedgerRoute';
import MiningRewardsRoute from './MiningRewardsRoute';
import CronJobRoute from './CronJobRoute';
import TransferRoute from './TransferRoute';
import BalanceSnapshotRoute from './BalanceSnapshotRoute';
import ProfitDailyReportRoute from './ProfitDailyReportRoute';
import PairDailyReportRoute from './PairDailyReportRoute';
import DailyStatisticRoute from './DailyStatisticReportRoute';
import ConnectedWalletRoute from './ConnectedWalletRoute';
import ExampleTableRoute from './ExampleTableRoute';
import EventRoute from './EventRoute';
import EventParticipantsRoute from './EventParticipantsRoute';
import EventApprovalRoute from './EventApprovalRoute';
import LeaderBoardRankingRoute from './LeaderBoardRankingRoute';
import ProfitAndLossReportRoute from './ProfitAndLossReportRoute';
import EventTradeRoute from './EventTradeVolumeRoute';
const router: Array<Route> = [
  new AgentRoute(),
  new CustomerRoute(),
  //new DbRoute(),
  new CustomerCreditUpdateRoute(),
  new LogRoute(),
  new BalanceHistoryRoute(),
  new BalanceRoute(),
  new BalanceSnapshotRoute(),
  new AgentDailyReportRoute(),
  new TransactionRoute(),
  new InterestRoute(),
  new PriceRoute(),
  new CommissionJobRoute(),
  new CommissionDistributionRoute(),
  new CommissionLedgerRoute(),
  new CronJobRoute(),
  new MiningRewardsRoute(),
  new TransferRoute(),
  new BalanceSnapshotRoute(),
  new ProfitDailyReportRoute(),
  new PairDailyReportRoute(),
  new DailyStatisticRoute(),
  new ConnectedWalletRoute(),
  new ExampleTableRoute(),
  new EventRoute(),
  new EventParticipantsRoute(),
  new EventApprovalRoute(),
  new LeaderBoardRankingRoute(),
  new ProfitAndLossReportRoute(),
  new EventTradeRoute(),
];

export default router;
