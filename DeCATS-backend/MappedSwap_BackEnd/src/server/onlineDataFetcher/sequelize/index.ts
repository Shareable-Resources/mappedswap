import * as SeqModel from '../../../general/model/seqModel/0_index';
import Db from '../../../foundation/sequlelize';
import logger from '../util/ServiceLogger';
import globalVar from '../const/globalVar';

export class ServerDb extends Db {
  constructor() {
    super(globalVar.onlineDataFetcherConfig, 'postgres', logger);
  }

  bindModelsToSeq() {
    SeqModel.factory.PriceHistoryRefFactory(this.sequelize);
  }

  setupRelationshipToSeq(): void {
    //throw new Error('Not Implemented');
  }
}

const db = new ServerDb();
export default db;
