import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
import expressServer, { printRoutes } from './server';
import { ContentTypeMiddleWare } from '../../foundation/server/Middlewares';
import { EthClient } from '../../foundation/utils/ethereum/EthClient';
import foundationConst from '../../foundation/const';
import { AgentServer } from './model/AgentServer';
import Web3 from 'web3';
import logger from './util/ServiceLogger';
import globalVar from './const/globalVar';
const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: AgentServer = new AgentServer(serverConfigObj);

export async function testDatabaseConnectionOk() {
  logger.info(
    `checking db connection ${globalVar.agentConfig.sequelize.host}..`,
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
    //expressServer listening
    serverBase.httpServer = expressServer.listen(
      globalVar.agentConfig.express.port,
      () => {
        printRoutes(expressServer);
      },
    );

    //2. Observer (Optional) - observer block in a eth chain
    const httpProvider = new Web3.providers.HttpProvider(
      globalVar.foundationConfig.rpcHostHttp,
      foundationConst.web3webSocketDefaultOption,
    );
    const ethClient = new EthClient(
      httpProvider,
      globalVar.foundationConfig.chainId,
    );
    serverBase.ethClient = ethClient;
  } catch (e) {
    logger.error(e);
  }
}

// init();
// init_subscriber();
