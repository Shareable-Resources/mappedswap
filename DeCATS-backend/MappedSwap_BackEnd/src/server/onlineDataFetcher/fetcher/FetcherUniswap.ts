import { AbiItem } from 'web3-utils';
import globalVar from '../const/globalVar';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
import { Fetcher } from '../model/Fetcher';
import tokenMappedData from '../const/TokenMapData';
import { tickToPrice } from '@uniswap/v3-sdk';
import { Price, Token } from '@uniswap/sdk-core';
import UniswapV3FactoryArtifact from '../smartcontract/v3-core-main/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import { UniswapV3Factory } from '../smartcontract/v3-core-main/types/web3-v1-contracts/UniswapV3Factory';
import UniswapV3PoolArtifact from '../smartcontract/v3-core-main/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { UniswapV3Pool } from '../smartcontract/v3-core-main/types/web3-v1-contracts/UniswapV3Pool';
import PoolUniSwap from '../model/PoolUniSwap';
import ContractUniSwapPool from '../model/ContractUniSwapPool';
import { WBTC, USDC, WETH } from '../const/ethereumTokens';
import logger from '../util/ServiceLogger';

import Big from 'big.js';
import AdjustItem, { AdjustItemWithPriceHistoryRef } from '../model/AdjustItem';
import e from 'express';
import BN from 'bn.js';
import { FetcherType } from '../const/allFetchers';
import PriceHistoryRef from '../../../general/model/dbModel/PriceHistoryRef';
export class FetcherUniswap extends Fetcher {
  pools: PoolUniSwap[];
  uniswapV3FactoryContract?: UniswapV3Factory;
  uniswapV3Pool: ContractUniSwapPool[];
  connectedContract: boolean;
  constructor(ethereumEthClient: EthClient, sideChainClient: EthClient) {
    super(ethereumEthClient, sideChainClient);
    this.sourceFrom = FetcherType.uniswap;
    this.pools = [
      {
        token1: WBTC,
        token2: USDC,
        poolAddr: '',
      },
      {
        token1: WETH,
        token2: USDC,
        poolAddr: '',
      },
    ];
    this.uniswapV3Pool = [];
    this.connectedContract = false;
  }
  async fetch(): Promise<AdjustItemWithPriceHistoryRef[]> {
    logger.info(`------ [FetcherCoinbase][fetch] - ${this.sourceFrom} ------`);
    await this.connectContract();
    const period = new BN(60);
    const secondsAgos: any[] = [];
    secondsAgos[0] = period.toString();
    secondsAgos[1] = 0;
    let pool: ContractUniSwapPool;
    const priceAdjustItems: AdjustItemWithPriceHistoryRef[] = [];
    for (let i = 0; i < this.uniswapV3Pool.length; i++) {
      try {
        logger.info('[FetcherUniswap][fetch][pool.contract.methods.observe]');
        pool = this.uniswapV3Pool[i];
        const observation = await pool.contract.methods
          .observe(secondsAgos)
          .call();
        const tickCumulatives = observation.tickCumulatives;
        const tickCumulatives0 = new BN(tickCumulatives[0]);
        const tickCumulatives1 = new BN(tickCumulatives[1]);
        const tickCumulativesDelta = tickCumulatives1.sub(tickCumulatives0);
        const timeWeightedAverageTick: any = tickCumulativesDelta
          .div(period)
          .toNumber();

        const uniswapPrice = tickToPrice(
          this.uniswapV3Pool[i].poolUniSwap.token1,
          this.uniswapV3Pool[i].poolUniSwap.token2,
          timeWeightedAverageTick,
        );
        logger.info(
          `TOKEN [${this.uniswapV3Pool[i].poolUniSwap.token1.name}] - [${this.uniswapV3Pool[i].poolUniSwap.token2.name}]`,
        );
        const priceAdjustItem = this.convertPriceToAdjustItem(uniswapPrice);
        priceAdjustItems.push(priceAdjustItem);
      } catch (e) {
        logger.error(e);
        let reconnectAttempts = '';
        if (this.sideChainClient.web3Client.currentProvider) {
          if (
            (this.sideChainClient.web3Client.currentProvider as any)
              .reconnecting
          ) {
            reconnectAttempts = (
              this.sideChainClient.web3Client.currentProvider as any
            ).reconnectAttempts;
          }
        }
      }
    }
    return priceAdjustItems;
  }
  async connectContract() {
    if (!this.connectedContract) {
      logger.info(
        '[FetcherUniswap][connectContract]Starting to connect web 3 contract',
      );
      await this.connectToUniswapV3Factory();
      await this.fetchPoolAddressesFromUniswapV3Factory();
      await this.connectToUniswapV3Pool();
      this.connectedContract = true;
    }
  }

  async connectToUniswapV3Factory() {
    logger.info('[FetcherUniswap][connectToUniswapV3Factory]');
    try {
      const abiItems: AbiItem[] = UniswapV3FactoryArtifact.abi as AbiItem[];
      this.uniswapV3FactoryContract =
        new this.ethereumEthClient.web3Client.eth.Contract(
          abiItems,
          globalVar.ethereumConfig.smartcontract.UniSwap.UniswapV3Factory,
        ) as any;
    } catch (e) {
      logger.error('Cannot connectToUniswapV3Factory');
      logger.error(e);
      throw e;
    }
  }

  async connectToUniswapV3Pool() {
    logger.info('[FetcherUniswap][connectToUniswapV3Pool]');
    try {
      for (let i = 0; i < this.pools.length; i++) {
        const abiItems: AbiItem[] = UniswapV3PoolArtifact.abi as AbiItem[];
        const contract: UniswapV3Pool =
          new this.ethereumEthClient.web3Client.eth.Contract(
            abiItems,
            this.pools[i].poolAddr,
          ) as any;
        this.uniswapV3Pool[i] = {
          contract: contract,
          poolUniSwap: this.pools[i],
        };
      }
    } catch (e) {
      logger.error('Cannot connectToUniswapV3Pool');
      logger.error(e);
      throw e;
    }
  }
  //Use Contract methods to get pool adress
  async fetchPoolAddressesFromUniswapV3Factory() {
    logger.info('[FetcherUniswap][fetchPoolAddressesFromUniswapV3Factory]');
    const isPoolAddressFound = this.pools.find((x) => x.poolAddr);
    if (!isPoolAddressFound) {
      const feePercentageOfThePool: any = new Big(3000);
      const uniswapV3FactoryContract: UniswapV3Factory = this
        .uniswapV3FactoryContract as any;
      for (let i = 0; i < this.pools.length; i++) {
        const poolAddress = await uniswapV3FactoryContract.methods
          .getPool(
            this.pools[i].token1.address,
            this.pools[i].token2.address,
            feePercentageOfThePool.toString(),
          )
          .call({});

        this.pools[i].poolAddr = poolAddress.toString();
      }
      this.pools.forEach((x) =>
        logger.info(
          `Pool address fetched (${x.token1.name} - ${x.token2.name}) : ${x.poolAddr}`,
        ),
      );
    }
  }
  convertPriceToAdjustItem(
    price: Price<Token, Token>,
  ): AdjustItemWithPriceHistoryRef {
    // logger.info('[FetcherUniswap][convertPriceToAdjustItem]');
    const decimals = 8; //Ref. from chainlink, should be 8
    let multiplier = '1';
    for (let i = 0; i < decimals; i++) {
      multiplier += '0';
    }
    const targetPrice = new Big(price.toFixed(8)).mul(multiplier).toString();
    logger.info(
      `[FetcherUniswap][convertPriceToAdjustItem] - target price: ${targetPrice}`,
    );
    const priceHistoryRef = new PriceHistoryRef();
    priceHistoryRef.sourceFrom = this.sourceFrom;
    const adjustItem: AdjustItemWithPriceHistoryRef = {
      tokenName: tokenMappedData[price.baseCurrency.name as string].name,
      tokenAddr: tokenMappedData[price.baseCurrency.name as string].addr,
      targetPrice: targetPrice,
      decimals: decimals,
      priceHistoryRef: priceHistoryRef,
    };
    return adjustItem;
  }
}
