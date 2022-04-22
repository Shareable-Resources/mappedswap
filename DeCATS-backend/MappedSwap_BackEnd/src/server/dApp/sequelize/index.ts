import * as SeqModel from '../../../general/model/seqModel/0_index';
import Db from '../../../foundation/sequlelize';
import logger from '../util/ServiceLogger';
import globalVar from '../const/globalVar';

export class ServerDb extends Db {
  constructor() {
    //logger.info(serverConfig.sequelize);
    super(globalVar.dAppConfig, 'postgres', logger);
  }

  bindModelsToSeq() {
    SeqModel.factory.CustomerFactory(this.sequelize);
    SeqModel.factory.InterestHistoryFactory(this.sequelize);
    SeqModel.factory.PriceHistoryFactory(this.sequelize);
    SeqModel.factory.TransactionFactory(this.sequelize);
    SeqModel.factory.PricesFactory(this.sequelize);
    SeqModel.factory.FundingCodeFactory(this.sequelize);
    SeqModel.factory.BalanceHistoryFactory(this.sequelize);
    SeqModel.factory.BlockPricesFactory(this.sequelize);
    SeqModel.factory.ReferralCodeFactory(this.sequelize);
    SeqModel.factory.AgentFactory(this.sequelize);
    SeqModel.factory.CronJobFactory(this.sequelize);
    SeqModel.factory.CommissionDistributionFactory(this.sequelize);
    SeqModel.factory.CommissionJobFactory(this.sequelize);
    SeqModel.factory.CommissionLedgerFactory(this.sequelize);
    SeqModel.factory.CommissionSummaryFactory(this.sequelize);
    SeqModel.factory.AgentDailyReportFactory(this.sequelize);
    SeqModel.factory.AgentDailyReportRealTimeFactory(this.sequelize);
    SeqModel.factory.MiningRewardsFactory(this.sequelize);
    SeqModel.factory.MiningRewardsDistributionFactory(this.sequelize);
    SeqModel.factory.MSTDistRuleFactory(this.sequelize);
    SeqModel.factory.LeaderBoardRuleFactory(this.sequelize);
    SeqModel.factory.LeaderBoardRankingFactory(this.sequelize);
    SeqModel.factory.MstPriceFactory(this.sequelize);
    SeqModel.factory.BurnTransactionsFactory(this.sequelize);
    SeqModel.factory.BuyBackDetailsFactory(this.sequelize);
    SeqModel.factory.BalanceSnapshotFactory(this.sequelize);
    SeqModel.factory.TokenFactory(this.sequelize);
    SeqModel.factory.BlockPricesFactory(this.sequelize);
    SeqModel.factory.ProfitAndLossReportFactory(this.sequelize);
    SeqModel.factory.ConnectedWalletFactory(this.sequelize);
    SeqModel.factory.BalanceFactory(this.sequelize);
  }

  setupRelationshipToSeq(): void {
    SeqModel.associaion.ReferralCodeAssociation(this.sequelize);
    SeqModel.associaion.AgentAssociation(this.sequelize);
    SeqModel.associaion.FundingCodeAssociation(this.sequelize);
    SeqModel.associaion.CommissionLedgerAssociation(this.sequelize);
    SeqModel.associaion.CommissionJobAssociation(this.sequelize);
    SeqModel.associaion.MiningRewardsAssociation(this.sequelize);
    SeqModel.associaion.LeaderBoardRankingAssociation(this.sequelize);
  }
}

const db = new ServerDb();
export default db;
