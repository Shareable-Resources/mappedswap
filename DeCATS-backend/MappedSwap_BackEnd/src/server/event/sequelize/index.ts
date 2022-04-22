import * as SeqModel from '../../../general/model/seqModel/0_index';
import Db from '../../../foundation/sequlelize';
import logger from '../util/ServiceLogger';
import globalVar from '../const/globalVar';
export class ServerDb extends Db {
  constructor() {
    super(globalVar.eventConfig, 'postgres', logger);
  }

  bindModelsToSeq(): void {
    //Put needed table in here
    SeqModel.factory.LeaderBoardRuleFactory(this.sequelize);
    SeqModel.factory.LeaderBoardRankingFactory(this.sequelize);
    SeqModel.factory.EventFactory(this.sequelize);
    SeqModel.factory.EventApprovalFactory(this.sequelize);
    SeqModel.factory.EventParticipantFactory(this.sequelize);
    SeqModel.factory.CustomerFactory(this.sequelize);
    SeqModel.factory.TransactionFactory(this.sequelize);
    SeqModel.factory.EventTradeVolumeFactory(this.sequelize);
  }

  setupRelationshipToSeq(): void {
    SeqModel.associaion.LeaderBoardRankingAssociation(this.sequelize);
    SeqModel.associaion.EventAssociation(this.sequelize);
    //throw Error('Not Implemented');
  }
}

const db = new ServerDb();
export default db;
