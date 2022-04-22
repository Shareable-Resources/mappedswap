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
  }

  setupRelationshipToSeq(): void {
    //throw Error('Not Implemented');
  }
}

const db = new ServerDb();
export default db;
