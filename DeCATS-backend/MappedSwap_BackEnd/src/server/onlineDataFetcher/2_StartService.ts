import { ServerConfigBase } from '../../foundation/server/ServerConfigBase';
import seq from './sequelize';
import { EthClient } from '../../foundation/utils/ethereum/EthClient';
import Web3 from 'web3';
import logger from './util/ServiceLogger';
import { OnlineDataFetcher } from './model/OnlineDataFetcher';
import foundationConst from '../../foundation/const/index';
import globalVar from './const/globalVar';
import {
  FactoryFetcherUniswap,
  FactoryFetcherBinance,
  FactoryFetcherCoinbase,
  getAllFactories,
} from './model/Factories';
import { Fetcher } from './model/Fetcher';
import PriceHistoryRef from '../../general/model/dbModel/PriceHistoryRef';
import Big from 'big.js';
import PriceAdjustArtifact from '../../abi/PriceAdjust.json';
import { PriceAdjust } from '../../@types/PriceAdjust';
import AdjustItem, {
  AdjustItemWithPriceHistoryRef,
  convertAdjustItemToPriceHistoryRef,
} from './model/AdjustItem';
import { AbiItem } from 'web3-utils';
import TxnReceiptHelper from '../../foundation/utils/TxnReceiptHelper';
import FactoryFetcher from './model/FactoryFetcher';
import ArrayHelper from '../../foundation/utils/ArrayHelper';
import { FetcherType } from './const/allFetchers';
const serverConfigObj: ServerConfigBase = new ServerConfigBase();
const serverBase: OnlineDataFetcher = new OnlineDataFetcher(serverConfigObj);

export async function testDatabaseConnectionOk() {
  logger.info(
    `checking db connection ${globalVar.onlineDataFetcherConfig.sequelize.host}..`,
  );
  serverBase.db = seq;
  await serverBase.db.testDatabaseConnectionOk();
}

export async function startService() {
  try {
    await serverBase.connectContract();

    const fetchers: Fetcher[] = [];
    const factories = getAllFactories();
    for (const factory of factories) {
      const fetcher = await factory.create(
        serverBase.ethereumETHClient!,
        serverBase.ethClient!,
      );
      factory.logDetails();
      fetchers.push(fetcher);
    }
    // for (const fetcher of fetchers) {
    //   validateConnection(fetcher);
    // }
    await loop(fetchers);
  } catch (e) {
    logger.error(e);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loop(fetchers: Fetcher[]) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    logger.info('[2_StartService][loop]');
    //prices is use to insert database
    let prices: AdjustItemWithPriceHistoryRef[] = [];
    let pairPrices: AdjustItemWithPriceHistoryRef[] = [];
    const createdDate = new Date();
    try {
      for (const fetcher of fetchers) {
        try {
          pairPrices = await fetcher.fetch();

          prices = prices.concat(pairPrices);
        } catch (e) {
          logger.error(
            `Fetcher Error for [${fetcher.sourceFrom}], ignoring ${fetcher.sourceFrom} price`,
          );
          logger.error(e);
        }
      }
      const avgPrices = await serverBase.comparePrices(prices);
      for (const avgPrice of avgPrices) {
        logger.info(
          `[2_StartService][loop] Calling contract [Price][Adjust] ${
            avgPrice.tokenName
          } with avgPrice ${avgPrice.targetPrice} (${new Big(
            avgPrice.targetPrice,
          ).div(10 ** Number(avgPrice.decimals))})`,
        );
        const callPriceResult = await serverBase.callPriceAdjust(avgPrice);
      }
      logger.info(
        `Finish Price Adjust for ${avgPrices
          .map((x) => x.tokenName)
          .join(',')}, delay for ${
          globalVar.onlineDataFetcherConfig.fetcherTimeInterval
        } for another go`,
      );
      //await insertToDb(prices, createdDate);
    } catch (e) {
      logger.error(e);
      logger.error('Loop cannot be finished');
    }
    await delay(globalVar.onlineDataFetcherConfig.fetcherTimeInterval);
  }
}

async function insertToDb(
  prices: AdjustItemWithPriceHistoryRef[],
  createdDate: Date,
) {
  for (const price of prices) {
    price.priceHistoryRef = convertAdjustItemToPriceHistoryRef(
      price,
      createdDate,
    );
  }

  logger.info(`Inserting to db `);
  const refs: PriceHistoryRef[] = [];
  prices.forEach((x) => {
    if (x.priceHistoryRef) {
      refs.push(x.priceHistoryRef);
    }
  });
  if (refs.length > 0) {
    const insertDbResult = await serverBase.insertToDatabase(refs);
  }
}

// init();
