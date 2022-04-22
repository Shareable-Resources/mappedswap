import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
import expressServer, { printRoutes } from './server';
import { ContentTypeMiddleWare } from '../../foundation/server/Middlewares';
import { CronJobServer } from './model/CronJobServer';
import logger from './util/ServiceLogger';
import globalVar from './const/globalVar';

const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: CronJobServer = new CronJobServer(serverConfigObj);

export async function testDatabaseConnectionOk() {
  logger.info(
    `checking db connection ${globalVar.cronJobConfig.sequelize.host}..`,
  );
  serverBase.db = seq;
  await serverBase.db.testDatabaseConnectionOk();
}

export async function startService() {
  try {
    await testDatabaseConnectionOk();

    //Middleware should add to expressServer
    expressServer.use(ContentTypeMiddleWare);
    serverBase.server = expressServer;
    //2. Observer (Optional) - observer block in a eth chain

    //observer.startMonitoringSmartContract();
    await serverBase.cronJob();
    //expressServer listening
    serverBase.httpServer = expressServer.listen(
      globalVar.cronJobConfig.express.port,
      () => {
        printRoutes(expressServer);
      },
    );
  } catch (e) {
    logger.error(e);
  }
}

// init();
