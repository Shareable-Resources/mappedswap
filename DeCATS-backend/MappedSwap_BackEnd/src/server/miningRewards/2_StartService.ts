import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
import expressServer, { printRoutes } from './server';
import { ContentTypeMiddleWare } from '../../foundation/server/Middlewares';
import { miningRewardsServer } from './model/MiningRewardsServer';
import logger from './util/ServiceLogger';
import { RewardsLoader } from './SystemTask/RewardsLoader';
import globalVar from './const/globalVar';
import Web3 from 'web3';
import foundationConst from '../../foundation/const';
import { EthClient } from '../../foundation/utils/ethereum/0_index';

const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: miningRewardsServer = new miningRewardsServer(
  serverConfigObj,
);

export async function testDatabaseConnectionOk() {
  logger.info(
    `checking db connection ${globalVar.miningRewardsConfig.sequelize.host}..`,
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
      globalVar.miningRewardsConfig.express.port,
      () => {
        printRoutes(expressServer);
      },
    );

    // //2. Observer (Optional) - observer block in a eth chain
    // const webSocketProvider = new Web3.providers.WebsocketProvider(
    //   globalVar.foundationConfig.rpcHost,
    //   foundationConst.web3webSocketDefaultOption,
    // );
    // const ethClient = new EthClient(
    //   webSocketProvider,
    //   globalVar.foundationConfig.chainId,
    // );
    // serverBase.ethClient = ethClient;

    // serverBase.observer = new initMiningObserver(ethClient);
    // await serverBase.observer.startMonitoringSmartContract;

    //3. inital rewardsLoader() function
    serverBase.rewardsLoader = new RewardsLoader();
    await serverBase.rewardsLoader.loadRewards();
  } catch (e) {
    logger.error(e);
  }
}
