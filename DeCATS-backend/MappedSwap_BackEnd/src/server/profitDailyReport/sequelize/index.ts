import * as SeqModel from '../../../general/model/seqModel/0_index';
import Db from '../../../foundation/sequlelize';
import logger from '../util/ServiceLogger';
import globalVar from '../const/globalVar';
export class ServerDb extends Db {
  constructor() {
    logger.info(JSON.stringify(globalVar.profitDailyReportConfig.sequelize));
    super(globalVar.profitDailyReportConfig, 'postgres', logger);
  }

  bindModelsToSeq(): void {
    //Put needed table in here
    SeqModel.factory.AgentFactory(this.sequelize);
    SeqModel.factory.AgentDailyReportFactory(this.sequelize);
    SeqModel.factory.AgentDailyReportRealTimeFactory(this.sequelize);
    SeqModel.factory.CommissionJobFactory(this.sequelize);
    SeqModel.factory.CommissionLedgerFactory(this.sequelize);
    SeqModel.factory.CommissionDistributionFactory(this.sequelize);
    SeqModel.factory.CommissionSummaryFactory(this.sequelize);
    SeqModel.factory.CronJobFactory(this.sequelize);
    SeqModel.factory.MSTDistRuleFactory(this.sequelize);
    SeqModel.factory.TokenFactory(this.sequelize);
    SeqModel.factory.PricesFactory(this.sequelize);
    SeqModel.factory.ProfitDailyReportFactory(this.sequelize);
    SeqModel.factory.BalanceSnapshotFactory(this.sequelize);
    SeqModel.factory.BalanceFactory(this.sequelize);
    SeqModel.factory.MstPriceFactory(this.sequelize);
    SeqModel.factory.PairDailyReportFactory(this.sequelize);
    SeqModel.factory.PriceHistoryFactory(this.sequelize);
    SeqModel.factory.CustomerFactory(this.sequelize);
    SeqModel.factory.ProfitAndLossReportFactory(this.sequelize);
    SeqModel.factory.BalanceHistoryFactory(this.sequelize);
    SeqModel.factory.InterestHistoryFactory(this.sequelize);
    SeqModel.factory.DailyStatisticReportFactory(this.sequelize);
    SeqModel.factory.ConnectedWalletFactory(this.sequelize);
  }

  setupRelationshipToSeq(): void {
    SeqModel.associaion.CommissionJobAssociation(this.sequelize);
    //throw Error('Not Implemented');
  }
}

const db = new ServerDb();
export default db;
