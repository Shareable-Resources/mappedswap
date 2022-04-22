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
import { FetcherAPIReponseCoinbase } from '../model/FetcherAPIReponse';
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
export class FetcherCoinbase extends Fetcher {
  constructor(ethereumEthClient: EthClient, sideChainClient: EthClient) {
    super(ethereumEthClient, sideChainClient);
    this.sourceFrom = FetcherType.coinbase;
  }
  /**
   *
   * @returns price api of Coinbase  https://api.coinbase.com/v2/
   */
  async fetch(): Promise<AdjustItemWithPriceHistoryRef[]> {
    logger.info(`------ [FetcherCoinbase][fetch] - ${this.sourceFrom} ------`);
    const prefix = APIRoot.coinbase;

    const symbols = ['BTC-USD', 'ETH-USD'];
    const priceAdjustItems: AdjustItemWithPriceHistoryRef[] = [];
    for (const symbol of symbols) {
      const reqUrl = `${prefix}prices/${symbol}/spot`;
      const reqResult = await axios.get(reqUrl);
      const reponseData: FetcherAPIReponseCoinbase = reqResult.data.data;
      const priceAdjustItem = this.convertPriceToAdjustItem(reponseData);
      priceAdjustItems.push(priceAdjustItem);
    }
    return priceAdjustItems;
  }
  convertPriceToAdjustItem(
    obj: FetcherAPIReponseCoinbase,
  ): AdjustItemWithPriceHistoryRef {
    const decimals = 8;
    const targetPrice = new Big(new Big(obj.amount).toFixed(decimals))
      .mul(10 ** decimals)
      .toString();
    logger.info(
      `[FetcherUniswap][convertPriceToAdjustItem] - target price: ${targetPrice}`,
    );
    const priceHistoryRef = new PriceHistoryRef();
    priceHistoryRef.sourceFrom = this.sourceFrom;
    const tokenName = this.getTokenName(obj.base);
    const adjustItem: AdjustItemWithPriceHistoryRef = {
      tokenName: tokenMappedData[tokenName].name,
      tokenAddr: tokenMappedData[tokenName].addr,
      targetPrice: targetPrice,
      decimals: decimals,
      priceHistoryRef: priceHistoryRef,
    };
    return adjustItem;
  }

  private getTokenName(coinbaseToken: string) {
    switch (coinbaseToken) {
      case 'BTC':
        return 'WBTC';
      case 'ETH':
        return 'WETH';
      default:
        throw new Error('No pair found');
    }
  }
}
