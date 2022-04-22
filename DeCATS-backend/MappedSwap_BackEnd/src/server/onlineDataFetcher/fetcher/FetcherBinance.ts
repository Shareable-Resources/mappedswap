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
import { FetcherAPIReponseBinance } from '../model/FetcherAPIReponse';
import Big from 'big.js';
import AdjustItem, {
  AdjustItemWithPriceHistoryRef,
  convertAdjustItemToPriceHistoryRef,
} from '../model/AdjustItem';
import e from 'express';
import BN from 'bn.js';
import { FetcherType } from '../const/allFetchers';
import PriceHistoryRef from '../../../general/model/dbModel/PriceHistoryRef';
import axios from 'axios';
import { APIRoot } from '../const/APIEndPoints';
import { AxiosHelper } from '../../../foundation/utils/AxiosHelper';
export class FetcherBinance extends Fetcher {
  constructor(ethereumEthClient: EthClient, sideChainClient: EthClient) {
    super(ethereumEthClient, sideChainClient);
    this.sourceFrom = FetcherType.binance;
  }
  /**
   *
   * @returns price api of Binance  https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
   */
  async fetch(): Promise<AdjustItemWithPriceHistoryRef[]> {
    logger.info(`------ [FetcherCoinbase][fetch] - ${this.sourceFrom} ------`);
    const prefix = APIRoot.binance;
    const route = `ticker/price`;
    const reqEndPoints = prefix + route;
    const symbols = ['BTCUSDT', 'ETHUSDT'];
    const priceAdjustItems: AdjustItemWithPriceHistoryRef[] = [];
    for (const symbol of symbols) {
      const reqQuery = {
        symbol: symbol,
      };
      const reqUrl =
        reqEndPoints + AxiosHelper.convertObjKeysToQueryString(reqQuery);
      const reqResult = await axios.get(reqUrl);
      const reponseData: FetcherAPIReponseBinance = reqResult.data;
      const priceAdjustItem = this.convertPriceToAdjustItem(reponseData);
      priceAdjustItems.push(priceAdjustItem);
    }

    return priceAdjustItems;
  }
  convertPriceToAdjustItem(
    obj: FetcherAPIReponseBinance,
  ): AdjustItemWithPriceHistoryRef {
    const decimals = 8;
    const targetPrice = new Big(new Big(obj.price).toFixed(decimals))
      .mul(10 ** decimals)
      .toString();
    logger.info(
      `[FetcherUniswap][convertPriceToAdjustItem] - target price: ${targetPrice}`,
    );
    const priceHistoryRef = new PriceHistoryRef();
    priceHistoryRef.sourceFrom = this.sourceFrom;
    const tokenName = this.getTokenName(obj.symbol);
    const adjustItem: AdjustItemWithPriceHistoryRef = {
      tokenName: tokenMappedData[tokenName].name,
      tokenAddr: tokenMappedData[tokenName].addr,
      targetPrice: targetPrice,
      decimals: decimals,
      priceHistoryRef: priceHistoryRef,
    };
    return adjustItem;
  }

  private getTokenName(binanceToken: string) {
    switch (binanceToken) {
      case 'BTCUSDT':
        return 'WBTC';
      case 'ETHUSDT':
        return 'WETH';
      default:
        throw new Error('No pair found');
    }
  }
}
