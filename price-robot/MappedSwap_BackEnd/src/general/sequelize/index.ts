import serverConfigJSON from '../../config/DecatsServerConfig.json';

const serverConfig =
  serverConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
import * as SeqModel from '../model/seqModel/0_index';
import Db from '../../foundation/sequlelize';
import logger from '../util/ServiceLogger';
export class ServerDb extends Db {
  constructor() {
    super(serverConfig, 'postgres', logger);
  }

  bindModelsToSeq() {
    SeqModel.factory.PriceHistoryRefFactory(this.sequelize);
  }

  setupRelationshipToSeq(): void {
    //
  }
}

const db = new ServerDb();
export default db;
