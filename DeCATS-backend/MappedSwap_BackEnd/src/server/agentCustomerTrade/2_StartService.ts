import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
//import expressServer, { printRoutes } from './server';
import { ContentTypeMiddleWare } from '../../foundation/server/Middlewares';
import { EventServer } from './model/EventServer';
import logger from './util/ServiceLogger';
import globalVar from './const/globalVar';

const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: EventServer = new EventServer(serverConfigObj);

export async function testDatabaseConnectionOk() {
  logger.info(
    `checking db connection ${globalVar.eventConfig.sequelize.host}..`,
  );
  serverBase.db = seq;
  await serverBase.db.testDatabaseConnectionOk();
}

export async function startService() {
  try {
    await testDatabaseConnectionOk();

    //Middleware should add to expressServer
    //expressServer.use(ContentTypeMiddleWare);
    //serverBase.server = expressServer;
    //2. Observer (Optional) - observer block in a eth chain

    //observer.startMonitoringSmartContract();
    await serverBase.cronJob();
    //expressServer listening
    // serverBase.httpServer = expressServer.listen(
    //   globalVar.eventConfig.express.port,
    //   () => {
    //     printRoutes(expressServer);
    //   },
    // );
  } catch (e) {
    logger.debug(e);
  }
}

// init();
