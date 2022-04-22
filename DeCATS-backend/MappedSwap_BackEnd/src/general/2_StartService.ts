import { ServerConfigBase } from '../foundation/server/ServerConfigBase';
import seq from './sequelize';

import { DecatsServer } from './model/DecatsServer';
const serverConfigObj: ServerConfigBase = new ServerConfigBase();
// import { PoolObserver } from './observer/PoolObserver';
const serverBase: DecatsServer = new DecatsServer(serverConfigObj);

export async function testDatabaseConnectionOk() {
  serverBase.db = seq;
  await serverBase.db.testDatabaseConnectionOk();
}
