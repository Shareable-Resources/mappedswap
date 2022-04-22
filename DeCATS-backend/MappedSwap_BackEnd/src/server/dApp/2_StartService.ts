import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
import expressServer, { printRoutes } from './server';
import { ContentTypeMiddleWare } from '../../foundation/server/Middlewares';
import { EthClient } from '../../foundation/utils/ethereum/EthClient';
import foundationConst from '../../foundation/const';
import { DAppServer } from './model/DAppServer';
import Web3 from 'web3';
import logger from './util/ServiceLogger';
import { PriceLoader } from './SystemTask/PriceLoader';
import globalVar from './const/globalVar';
import { NonceLoader } from './SystemTask/NonceLoader';
const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: DAppServer = new DAppServer(serverConfigObj);

export async function testDatabaseConnectionOk() {
  logger.info(
    `checking db connection ${globalVar.dAppConfig.sequelize.host}..`,
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
      globalVar.dAppConfig.express.port,
      () => {
        printRoutes(expressServer);
      },
    );

    //2. Observer (Optional) - observer block in a eth chain
    const httpProvider = new Web3.providers.HttpProvider(
      globalVar.foundationConfig.rpcHostHttp,
      foundationConst.web3HttpProviderOption,
    );
    const ethClient = new EthClient(
      httpProvider,
      globalVar.foundationConfig.chainId,
    );

    serverBase.ethClient = ethClient;

    //3. inital PriceLoader() function
    serverBase.priceLoader = new PriceLoader();
    await serverBase.priceLoader.loadPriceIntoMemory();

    serverBase.nonceLoader = new NonceLoader();
    await serverBase.nonceLoader.loadNonceIntoMemory();
  } catch (e) {
    logger.error(e);
  }
}

// init();
