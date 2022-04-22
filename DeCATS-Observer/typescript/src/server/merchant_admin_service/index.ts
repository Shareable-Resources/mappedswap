import { ServerBase } from '../../foundation/src/server/ServerBase';
import { ServerConfigBase } from '../../foundation/src/server/ServerConfigBase';
import seq from '../merchant_admin_service/sequelize';
import expressServer, { printRoutes } from './server';
import { ContentTypeMiddleWare } from '../../foundation/src/api/middlewares';
import config from './config/MerchantAdminServerConfig.json';
let serverConfig: ServerConfigBase = new ServerConfigBase();
let serverBase: ServerBase = new ServerBase(serverConfig);

const assertDatabaseConnectionOk = async () => {
  serverBase.db = seq;
  await serverBase.db.assertDatabaseConnectionOk();
};

async function init() {
  try {
    await assertDatabaseConnectionOk();
    //Middleware should add to expressServer
    expressServer.use(ContentTypeMiddleWare);
    serverBase.server = expressServer;

    //expressServer listening
    serverBase.httpServer = expressServer.listen(config.express.port, () => {
      printRoutes(expressServer);
    });
  } catch (e) {
    console.log(e);
  }
}

init();
