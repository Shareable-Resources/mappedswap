import Route from '../../../foundation/server/CommonRoute';
import InterestRoute from './InterestHistoryRoute';
import LogsRoute from './LogsRoute';
import PriceHistoryRoute from './PriceHistoryRoute';
import TransactionRoute from './TransactionRoute';
import PriceRoute from './PriceRoute';
import CustomerRoute from './CustomerRoute';
import BalanceHistoryRoute from './BalanceHistoryRoute';
import CommissionJobRoute from './CommissionJobRoute';
import AgentRoute from './AgentRoute';
import MiningRewardsRoute from './MiningRewardsRoute';
import MSTDistRuleRoute from './MSTDistRuleRoute';
import LeaderBoardRuleRoute from './LeaderBoardRuleRoute';
import BalanceSnapshotRoute from './BalanceSnapshotRoute';
import ProfitAndLossRoute from './ProfitAndLossRoute';
import ConnectedWalletRoute from './ConnectedWalletRoute';
import LeaderBoardRankingRoute from './LeaderBoardRankingRoute';
const router: Array<Route> = [
  new PriceHistoryRoute(),
  new InterestRoute(),
  new TransactionRoute(),
  new LogsRoute(),
  new PriceRoute(),
  new CustomerRoute(),
  new BalanceHistoryRoute(),
  new CommissionJobRoute(),
  new AgentRoute(),
  new MiningRewardsRoute(),
  new MSTDistRuleRoute(),
  new LeaderBoardRuleRoute(),
  new BalanceSnapshotRoute(),
  new ProfitAndLossRoute(),
  new ConnectedWalletRoute(),
  new LeaderBoardRankingRoute(),
];

export default router;
