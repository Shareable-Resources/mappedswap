import winston from 'winston';
import { ServerBase } from '../../../foundation/server/ServerBase';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/ServiceLogger';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
import PriceAdjustArtifact from '../../../abi/PriceAdjust.json';
import { PriceAdjust } from '../../../@types/PriceAdjust';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import foundationConst from '../../../foundation/const/index';
import globalVar from '../const/globalVar';
import { Account, SignedTransaction } from 'web3-core';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import AdjustItem, { AdjustItemWithPriceHistoryRef } from './AdjustItem';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import ArrayHelper from '../../../foundation/utils/ArrayHelper';
import ValueComparer from '../../../foundation/utils/ValueComparer';
import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';
import PriceRefService from '../service/PriceRefService';
import e from 'express';
import PriceHistoryRef from '../../../general/model/dbModel/PriceHistoryRef';
import { FetcherType } from '../const/allFetchers';

export class OnlineDataFetcher extends ServerBase {
  logger?: winston.Logger; // you can import this logger by import
  ethereumETHClient?: EthClient;
  priceAdjustContract?: PriceAdjust;
  sideChainWeb3Account?: Account;
  service: PriceRefService;
  chosenSource: FetcherType;
  constructor(configBase: ServerConfigBase) {
    super(configBase);
    this.logger = logger;
    this.service = new PriceRefService();
    this.chosenSource = FetcherType.uniswap;
  }
  private async connectToPriceAdjust() {
    try {
      const abiItems: AbiItem[] = PriceAdjustArtifact as AbiItem[];
      const contractAddr =
        globalVar.foundationConfig.smartcontract.MappedSwap[
          'OwnedUpgradeableProxy<PriceAdjust>'
        ].address;
      this.priceAdjustContract = new this.ethClient!.web3Client.eth.Contract(
        abiItems,
        contractAddr,
      ) as any;
    } catch (e) {
      logger.error('Cannot connectToUniswapV3Factory');
      logger.error(e);
      throw e;
    }
  }
  async callPriceAdjust(priceAdjustItem: AdjustItemWithPriceHistoryRef) {
    const priceAdjustContract: PriceAdjust = this.priceAdjustContract as any;
    const tx: any = {
      // this could be provider.addresses[0] if it exists
      from: this.sideChainWeb3Account!.address,
      to: priceAdjustContract.options.address,
      gasPrice: '0x8F0D1800',
      // optional if you want to specify the gas limit
      gas: '0xAA690',
      // optional if you are invoking say a payable function
      value: '0x00',
      data: priceAdjustContract.methods
        .adjust(
          priceAdjustItem.tokenName,
          priceAdjustItem.tokenAddr,
          priceAdjustItem.targetPrice.toString(),
          priceAdjustItem.decimals.toString(),
        )
        .encodeABI(),
    };
    const esiGas = await this.ethClient!.web3Client.eth.estimateGas(tx);
    tx.gas = esiGas;
    const signTxResult: any = await this.sideChainWeb3Account!.signTransaction(
      tx,
    );
    const adjustTxResult: any =
      await this.ethClient!.web3Client.eth.sendSignedTransaction(
        signTxResult.rawTransaction,
      );
    const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
      adjustTxResult.transactionHash,
      this.ethClient!.web3Client,
    );
    if (receipt.status) {
      logger.info(
        `[OnlineDataFetcher][callPriceAdjust] success, txHash :${receipt.transactionHash}`,
      );
      return true;
    } else {
      return false;
    }
  }

  async insertToDatabase(priceHistoriesRef: PriceHistoryRef[]) {
    const result = await this.service.bulkCreate(priceHistoriesRef);
    if (result) {
      logger.info('[OnlineDataFetcher][InsertToDatabase] Success');
    } else {
      logger.error('[OnlineDataFetcher][InsertToDatabase]', {
        message: ' - fail',
      });
      throw new Error('[OnlineDataFetcher][InsertToDatabase] [Error] ');
    }
  }

  async connectContract() {
    logger.info('[OnlineDataFetcher][connectContract]');
    //2. Observer (Optional) - observer block in a eth chain
    const ethereumWebSocketProvider = new Web3.providers.WebsocketProvider(
      globalVar.ethereumConfig.rpcHost,
      foundationConst.web3webSocketDefaultOption,
    );

    const webSocketProvider = new Web3.providers.WebsocketProvider(
      globalVar.foundationConfig.rpcHost,
      foundationConst.web3webSocketDefaultOption,
    );

    //ethereum eth client
    this.ethereumETHClient = new EthClient(
      ethereumWebSocketProvider,
      globalVar.ethereumConfig.chainId,
    );
    //eth client based on env (Dev/Testnet)
    this.ethClient = new EthClient(
      webSocketProvider,
      globalVar.foundationConfig.chainId,
    );

    logger.info('Starting to connect web 3 contract');

    const sideChainProvider: any = this.ethClient!.web3Client.currentProvider;
    logger.info(
      `connecting to side chain at ${
        (this.ethClient!.web3Client.currentProvider as any).url
      }.....`,
    );
    let chainId: any = await this.ethClient!.web3Client.eth.getChainId();
    const sideChainWeb3Connected = sideChainProvider.connected;

    if (sideChainWeb3Connected) {
      chainId = await this.ethClient!.web3Client.eth.getChainId();
      logger.info(
        `connected to side chain (${chainId}) at ${
          (this.ethClient!.web3Client.currentProvider as any).url
        }`,
      );
    }

    const ethereumProvider: any =
      this.ethereumETHClient!.web3Client.currentProvider;
    logger.info(
      `connecting to ethereum chain at ${
        (this.ethereumETHClient!.web3Client.currentProvider as any).url
      }.....`,
    );
    chainId = await this.ethereumETHClient!.web3Client.eth.getChainId();
    const ethereumWeb3Connected = ethereumProvider.connected;

    if (ethereumWeb3Connected) {
      chainId = await this.ethereumETHClient!.web3Client.eth.getChainId();
      logger.info(
        `connected to ethereum chain (${chainId}) at ${
          (this.ethereumETHClient!.web3Client.currentProvider as any).url
        }`,
      );
    }

    if (sideChainWeb3Connected && ethereumWeb3Connected) {
      await this.connectToPriceAdjust();

      this.sideChainWeb3Account =
        this.ethClient!.web3Client.eth.accounts.privateKeyToAccount(
          encryptionKey!,
        );
    }
  }

  async comparePrices(prices: AdjustItemWithPriceHistoryRef[]) {
    logger.info('[OnlineDataFetcher][comparePrices]');
    const array = ArrayHelper.groupBy(prices, 'tokenName');
    const avgPrices: AdjustItemWithPriceHistoryRef[] = [];

    for (const key of Object.keys(array)) {
      const chosenPrice = prices.find(
        (x) =>
          x.tokenName == key &&
          x.priceHistoryRef.sourceFrom == this.chosenSource,
      );
      const refPrices = prices.filter(
        (x) =>
          x.tokenName == key &&
          x.priceHistoryRef.sourceFrom != this.chosenSource,
      );
      let outOfRange = false;
      for (const refPrice of refPrices) {
        const result = ValueComparer.isOutOfBoundary(
          chosenPrice!.targetPrice,
          refPrice.targetPrice,
          globalVar.onlineDataFetcherConfig.priceTolerancePercentage,
        );
        if (!result.inRange) {
          logger.warn(
            `Price [${key}] from ${refPrice.priceHistoryRef.sourceFrom}, ${
              refPrice!.targetPrice
            }
            , is out of range of chosen price from ${
              chosenPrice!.priceHistoryRef.sourceFrom
            }, ${chosenPrice!.targetPrice}
            [${result.lower} - ${result.upper}]`,
          );
          outOfRange = true;
          break;
        } else {
          logger.info(
            `Price [${key}] from ${refPrice.priceHistoryRef.sourceFrom}, ${
              refPrice!.targetPrice
            }
            , is in range of chosen price from ${
              chosenPrice!.priceHistoryRef.sourceFrom
            }, ${chosenPrice!.targetPrice}
            [${result.lower} - ${result.upper}]`,
          );
        }
      }
      if (!outOfRange) {
        avgPrices.push(chosenPrice!);
      }
    }
    return avgPrices;
  }

  // async getAvgPrice(prices: AdjustItemWithPriceHistoryRef[]) {
  //   logger.info('[OnlineDataFetcher][getAvgPrice]');
  //   const array = ArrayHelper.groupBy(prices, 'tokenName');
  //   const avgPrices: AdjustItemWithPriceHistoryRef[] = [];
  //   for (const key of Object.keys(array)) {
  //     const pricesOfThisToken = prices
  //       .filter((x) => x.tokenName == key)
  //       .map((x) => x.targetPrice);
  //     let avg: Mixed = 0;
  //     for (const priceOfThisToken of pricesOfThisToken) {
  //       avg = new Big(avg).plus(new Big(priceOfThisToken)).toString();
  //     }
  //     avg = new Big(avg).div(pricesOfThisToken.length).toString();
  //     const avgPrice: AdjustItemWithPriceHistoryRef = {
  //       tokenName: key,
  //       tokenAddr: array[key][0].tokenAddr,
  //       targetPrice: avg,
  //       decimals: array[key][0].decimals,
  //     };
  //     avgPrices.push(avgPrice);
  //   }
  //   return avgPrices;
  // }
}
