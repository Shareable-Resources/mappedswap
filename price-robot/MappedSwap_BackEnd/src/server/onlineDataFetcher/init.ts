import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
import { EthClient } from '../../foundation/utils/ethereum/EthClient';
import Web3 from 'web3';
import logger from './util/serviceLogger';
import foundationConfigJSON from '../../config/FoundationConfig.json';
import { OnlineDataFetcher } from './model/onlineDataFetcher';
import UniswapAdaptorService from './service/UniswapFetcherService';
import * as DBModel from '../../general/model/dbModel/0_index';
import moment from 'moment';
import { UniSwapFetcher } from './fetcher/UniSwapFetcher';
import foundationConst from '../../foundation/const/index';
import serverConfigJson from '../../config/OnlineDataFetcherConfig.json';
const foundationConfig =
  foundationConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];
const serverConfig =
  serverConfigJson[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];

const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: OnlineDataFetcher = new OnlineDataFetcher(serverConfigObj);

export async function testDatabaseConnectionOk() {
  serverBase.db = seq;
  await serverBase.db.testDatabaseConnectionOk();
}

export async function init() {
  try {
    //await assertDatabaseConnectionOk();

    //2. Observer (Optional) - observer block in a eth chain
    const ethereumWebSocketProvider = new Web3.providers.WebsocketProvider(
      foundationConfigJSON.ethereum.rpcHost,
      foundationConst.web3webSocketDefaultOption,
    );

    const webSocketProvider = new Web3.providers.WebsocketProvider(
      foundationConfig.rpcHost,
      foundationConst.web3webSocketDefaultOption,
    );

    //ethereum eth client
    serverBase.ethereumETHClient = new EthClient(
      ethereumWebSocketProvider,
      foundationConfigJSON.ethereum.chainId,
    );
    //eth client based on env (Dev/Testnet)
    serverBase.ethClient = new EthClient(
      webSocketProvider,
      foundationConfig.chainId,
    );
    //3. Data Fetcher
    serverBase.uniswapFetcher = new UniSwapFetcher(
      serverBase.ethereumETHClient,
      serverBase.ethClient,
    );
    await serverBase.uniswapFetcher.connectContract();

    setInterval(async () => {
      await serverBase.uniswapFetcher!.fetchPriceFromUniswapV3Pool();
    }, serverConfig.fetcherTimeInterval.uniswap);
  } catch (e) {
    logger.error(e);
  }
}

// init();
