import * as SeqModel from '../../../general/model/seqModel/0_index';
import Db from '../../../foundation/sequlelize';
import logger from '../util/ServiceLogger';
import globalVar from '../const/globalVar';
export class ServerDb extends Db {
  constructor() {
    //logger.info(serverConfig.sequelize);
    super(globalVar.miningRewardsConfig, 'postgres', logger);
  }

  bindModelsToSeq() {
    SeqModel.factory.MiningRewardsFactory(this.sequelize);
    SeqModel.factory.MiningRewardsDistributionFactory(this.sequelize);
    SeqModel.factory.PricesFactory(this.sequelize);
    SeqModel.factory.MstPriceFactory(this.sequelize);
    SeqModel.factory.StakeRewardsFactory(this.sequelize);
    SeqModel.factory.BlockPricesFactory(this.sequelize);
  }

  setupRelationshipToSeq(): void {
    // SeqModel.associaion.ReferralCodeAssociation(this.sequelize);
    // SeqModel.associaion.AgentAssociation(this.sequelize);
    // SeqModel.associaion.FundingCodeAssociation(this.sequelize);
    // SeqModel.associaion.CommissionLedgerAssociation(this.sequelize);
    // SeqModel.associaion.CommissionJobAssociation(this.sequelize);
  }
}

const db = new ServerDb();
export default db;
