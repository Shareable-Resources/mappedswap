import * as SeqModel from '../../../general/model/seqModel/0_index';
import Db from '../../../foundation/sequlelize';
import logger from '../util/serviceLogger';

import serverConfigJSON from '../../../config/OnlineDataFetcherConfig.json';

const serverConfig =
  serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
export class ServerDb extends Db {
  constructor() {
    super(serverConfig, 'postgres', logger);
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
