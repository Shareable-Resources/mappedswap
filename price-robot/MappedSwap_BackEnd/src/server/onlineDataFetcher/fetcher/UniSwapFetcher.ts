import { AbiItem } from 'web3-utils';
import foundationConfigJSON from '../../../config/FoundationConfig.json';
import * as DBModel from '../../../general/model/dbModel/0_index';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import logger from '../util/serviceLogger';
import Service from '../service/UniswapFetcherService';
import CommonFetcher from './CommonFetcher';
import UniswapV3FactoryArtifact from '../smartcontract/v3-core-main/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import { UniswapV3Factory } from '../smartcontract/v3-core-main/types/web3-v1-contracts/UniswapV3Factory';
import UniswapV3PoolArtifact from '../smartcontract/v3-core-main/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { UniswapV3Pool } from '../smartcontract/v3-core-main/types/web3-v1-contracts/UniswapV3Pool';

import PriceAdjustArtifact from '../../../abi/PriceAdjust.json';
import { PriceAdjust } from '../../../@types/PriceAdjust';

import ContractUniSwapPool from '../model/ContractUniSwapPool';
import PoolUniSwap from '../model/PoolUniSwap';
import BN from 'bn.js';
import { tickToPrice } from '@uniswap/v3-sdk';
import { Price, Token } from '@uniswap/sdk-core';
import AdjustItem from '../model/AdjustItem';
import tokenMappedData from '../const/TokenMapData';
import Big from 'big.js';
import { Account, SignedTransaction } from 'web3-core';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import Web3 from 'web3';
import { IPoolCustomer } from '../../../@types/IPoolCustomer';
import IPoolCustomerABI from '../../../abi/IPoolCustomer.json';

import { provider, WebsocketProvider } from 'web3-core';
const foundationConfig =
  foundationConfigJSON[process.env.NODE_ENV ? process.env.NODE_ENV : 'local'];

const USDC = new Token(
  1,
  foundationConfigJSON.ethereum.smartcontract.UniSwap.ERC20USDC,
  6,
  'USDC',
  'USDC',
);
const WETH = new Token(
  1,
  foundationConfigJSON.ethereum.smartcontract.UniSwap.ERC20WETH,
  18,
  'WETH',
  'WETH',
);

const WBTC = new Token(
  1,
  foundationConfigJSON.ethereum.smartcontract.UniSwap.ERC20WBTC,
  8,
  'WBTC',
  'WBTC',
);

export class UniSwapFetcher extends CommonFetcher {
  pools: PoolUniSwap[];
  uniswapV3FactoryContract?: UniswapV3Factory;
  uniswapV3Pool: ContractUniSwapPool[];
  priceAdjustContract?: PriceAdjust;
  service: Service;
  ethereumEthClient: EthClient;
  sideChainWeb3Account?: Account;
  txFeePercentage: number;
  constructor(ethereumEthClient: EthClient, ethClient: EthClient) {
    super(ethClient);
    this.txFeePercentage = 0.003;
    this.ethereumEthClient = ethereumEthClient;
    this.service = new Service();
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
  }

  async connectContract() {
    logger.info('Starting to connect web 3 contract');
    /*
    const mainnetWeb3Listening =
      await this.mainnetEthClient.web3Client.eth.net.isListening();*/

    const sideChainProvider: any = this.ethClient.web3Client.currentProvider;
    let chainId: any = await this.ethClient.web3Client.eth.getChainId();
    const sideChainWeb3Connected = sideChainProvider.connected;
    logger.info(
      `connecting to side chain (${chainId}) at ${
        (this.ethClient.web3Client.currentProvider as any).url
      }.....`,
    );
    if (sideChainWeb3Connected) {
      chainId = await this.ethClient.web3Client.eth.getChainId();
      logger.info(
        `connected to side chain (${chainId}) at ${
          (this.ethClient.web3Client.currentProvider as any).url
        }`,
      );
    }

    const ethereumProvider: any =
      this.ethereumEthClient.web3Client.currentProvider;
    chainId = await this.ethereumEthClient.web3Client.eth.getChainId();
    const ethereumWeb3Connected = ethereumProvider.connected;
    logger.info(
      `connecting to ethereum chain (${chainId}) at ${
        (this.ethereumEthClient.web3Client.currentProvider as any).url
      }.....`,
    );
    if (ethereumWeb3Connected) {
      chainId = await this.ethClient.web3Client.eth.getChainId();
      logger.info(
        `connected to ethereum chain (${chainId}) at ${
          (this.ethClient.web3Client.currentProvider as any).url
        }`,
      );
    }

    if (sideChainWeb3Connected && ethereumWeb3Connected) {
      await this.connectToUniswapV3Factory();
      await this.fetchPoolAddressesFromUniswapV3Factory();
      await this.connectToUniswapV3Pool();
      await this.connectToPriceAdjust();

      this.sideChainWeb3Account =
        this.ethClient.web3Client.eth.accounts.privateKeyToAccount(
          encryptionKey!,
        );
    }
  }

  protected subscribe(event?: any): void {
    throw new Error('Method not implemented.');
  }
  async connectToPriceAdjust() {
    try {
      const abiItems: AbiItem[] = PriceAdjustArtifact as AbiItem[];
      const contractAddr =
        foundationConfig.smartcontract.MappedSwap[
          'OwnedUpgradeableProxy<PriceAdjust>'
        ].address;
      this.priceAdjustContract = new this.ethClient.web3Client.eth.Contract(
        abiItems,
        contractAddr,
      ) as any;
    } catch (e) {
      logger.error('Cannot connectToUniswapV3Factory');
      logger.error(e);
      throw e;
    }
  }

  async connectToUniswapV3Factory() {
    try {
      const abiItems: AbiItem[] = UniswapV3FactoryArtifact.abi as AbiItem[];
      this.uniswapV3FactoryContract =
        new this.ethereumEthClient.web3Client.eth.Contract(
          abiItems,
          foundationConfigJSON.ethereum.smartcontract.UniSwap.UniswapV3Factory,
        ) as any;
    } catch (e) {
      logger.error('Cannot connectToUniswapV3Factory');
      logger.error(e);
      throw e;
    }
  }

  async connectToUniswapV3Pool() {
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
    const isPoolAddressFound = this.pools.find((x) => x.poolAddr);
    if (!isPoolAddressFound) {
      const feePercentageOfThePool: any = new BN(3000);
      const uniswapV3FactoryContract: UniswapV3Factory = this
        .uniswapV3FactoryContract as any;
      for (let i = 0; i < this.pools.length; i++) {
        const poolAddress = await uniswapV3FactoryContract.methods
          .getPool(
            this.pools[i].token1.address,
            this.pools[i].token2.address,
            feePercentageOfThePool,
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
  //Use Contract methods to get price
  async fetchPriceFromUniswapV3Pool(): Promise<void> {
    const period = new BN(60);
    const createdDate = new Date();
    const secondsAgos: any[] = [];
    secondsAgos[0] = period;
    secondsAgos[1] = 0;
    let pool: ContractUniSwapPool;
    for (let i = 0; i < this.uniswapV3Pool.length; i++) {
      pool = this.uniswapV3Pool[i];
      const observation = await pool.contract.methods
        .observe(secondsAgos)
        .call();
      const tickCumulatives = observation.tickCumulatives;
      const tickCumulatives0 = new BN(tickCumulatives[0]);
      const tickCumulatives1 = new BN(tickCumulatives[1]);
      const tickCumulativesDelta = tickCumulatives1.sub(tickCumulatives0);
      const timeWeightedAverageTick = tickCumulativesDelta.div(period);

      const uniswapPrice = tickToPrice(
        this.uniswapV3Pool[i].poolUniSwap.token1,
        this.uniswapV3Pool[i].poolUniSwap.token2,
        timeWeightedAverageTick.toNumber(),
      );
      const uniswapPriceToFixed8 = uniswapPrice.toFixed(8);
      // logger.info(
      //   `${this.uniswapV3Pool[i].poolUniSwap.token1.symbol}<=>${
      //     this.uniswapV3Pool[i].poolUniSwap.token2.symbol
      //   } = Ticks(${timeWeightedAverageTick}) Price(${uniswapPrice.toFixed(
      //     8,
      //   )})`,
      // );

      // const mappedSwapPrice = await this.priceFromMappedSwapPool(
      //   this.uniswapV3Pool[i].poolUniSwap.token1.name!,
      //   this.uniswapV3Pool[i].poolUniSwap.token2.name!,
      // );
      // const upLimitOfUniswapPrice = new Big(uniswapPriceToFixed8).mul(
      //   1 + this.txFeePercentage,
      // );
      // const btmLimitOfUniswapPrice = new Big(uniswapPriceToFixed8).mul(
      //   1 - this.txFeePercentage,
      // );
      // let withinFeeRange =
      //   mappedSwapPrice >= btmLimitOfUniswapPrice &&
      //   mappedSwapPrice <= upLimitOfUniswapPrice;
      // logger.info(
      //   `mappedSwapPrice is ${mappedSwapPrice}, and is ${
      //     !withinFeeRange ? 'not' : ''
      //   } between ${btmLimitOfUniswapPrice} to ${upLimitOfUniswapPrice} for uniswap price ${uniswapPriceToFixed8}`,
      // );
      let withinFeeRange = false;

      if (!withinFeeRange) {
        // logger.info('Not within 0.003 range, starts to adjust price');
        try {
          const priceAdjustItem = this.convertPriceToAdjustItem(uniswapPrice);
          const priceAdjustContract: PriceAdjust = this
            .priceAdjustContract as any;
          const nonce = await this.ethClient.web3Client.eth.getTransactionCount(
            this.sideChainWeb3Account!.address,
            'pending',
          );
          const tx = {
            // this could be provider.addresses[0] if it exists
            from: this.sideChainWeb3Account!.address,
            to: priceAdjustContract.options.address,
            gasPrice: '0x8F0D1800',
            nonce: nonce,
            // optional if you want to specify the gas limit
            gas: '0xAA690',
            // optional if you are invoking say a payable function
            value: '0x00',
            data: priceAdjustContract.methods
              .adjust(
                priceAdjustItem.tokenName,
                priceAdjustItem.tokenAddr,
                priceAdjustItem.targetPrice,
                priceAdjustItem.decimals,
              )
              .encodeABI(),
            // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
          };

          const signTxResult: SignedTransaction =
            await this.sideChainWeb3Account!.signTransaction(tx);
          const result = await this.ethClient.web3Client.eth
            .sendSignedTransaction(signTxResult.rawTransaction as string)
            .on('transactionHash', function (transactionHash) {
              logger.info(`[AdjustPrice].[adjust].[TxHash]:${transactionHash}`);
            })
            .on('receipt', function (receipt) {
              if (receipt.blockHash) {
                logger.info(
                  `[AdjustPrice].[adjust].[Receipt BlockHash]:${receipt.blockHash}`,
                );
              }
              return receipt;
            })
            .on('error', function (error) {
              logger.error(error);
            });
        } catch (e) {
          logger.error(e);
          let reconnectAttempts = '';
          if (this.ethClient.web3Client.currentProvider) {
            if (
              (this.ethClient.web3Client.currentProvider as any).reconnecting
            ) {
              reconnectAttempts = (
                this.ethClient.web3Client.currentProvider as any
              ).reconnectAttempts;
            }
          }

          logger.error(
            `Cannot call PriceAdjust SmartContract - Reconnect Attempts [${reconnectAttempts}]`,
          );
        }

        const result = await this.insertLatestPrice(
          uniswapPrice,
          pool.poolUniSwap.poolAddr,
          createdDate,
        );
      } else {
        logger.info('Within 0.003 range, do not adjust price');
      }
    }
  }

  changeToMappedSwappedPair(name: string) {
    switch (name) {
      case 'WBTC':
        return 'BTCM';
      case 'USDC':
        return 'USDM';
      case 'WETH':
        return 'ETHM';
      default:
        throw new Error('Cannot find token');
    }
  }
  getPairName(pairname1: string, pairname2: string) {
    if (pairname1 == 'USDM') {
      return `USDM/${pairname2}`;
    } else {
      return `USDM/${pairname1}`;
    }
  }

  async priceFromMappedSwapPool(pairname1: string, pairname2: string) {
    let priceRate: any = '';
    pairname1 = this.changeToMappedSwappedPair(pairname1);
    pairname2 = this.changeToMappedSwappedPair(pairname2);
    const pairName = this.getPairName(pairname1, pairname2);
    const contractAddress =
      foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<Pool>']
        .address;

    const abiItems: AbiItem[] = IPoolCustomerABI as AbiItem[];

    try {
      const poolContract = new this.ethClient.web3Client.eth.Contract(
        abiItems,
        contractAddress,
      );
      const pairInfo = await poolContract.methods
        .getPairInfo(`${pairName}`)
        .call();
      let usdmReserve =
        pairInfo.token0Name == 'USDM' ? pairInfo.reserve0 : pairInfo.reserve1;
      let otherTokenReserve =
        pairInfo.token0Name == 'USDM' ? pairInfo.reserve1 : pairInfo.reserve0;
      const otherToken = pairname1 == 'USDM' ? pairname2 : pairname1;
      const otherTokenDecimal =
        foundationConfig.smartcontract.MappedSwap[
          `OwnedBeaconProxy<${otherToken}>`
        ].decimals;
      const usdmTokenDecimal =
        foundationConfig.smartcontract.MappedSwap[`OwnedBeaconProxy<USDM>`]
          .decimals;
      otherTokenReserve = new Big(otherTokenReserve).div(
        10 ** otherTokenDecimal,
      );
      usdmReserve = new Big(usdmReserve).div(10 ** usdmTokenDecimal);
      const str1 = usdmReserve.toString();
      const str2 = otherTokenReserve.toString();
      const divided = new Big(usdmReserve).div(new Big(otherTokenReserve));
      priceRate = divided.toString();
    } catch (e: any) {
      logger.error('Cannot get price rate from IPool');
      logger.error(e);
    }

    return priceRate;
  }

  private async insertLatestPrice(
    price: Price<Token, Token>,
    poolAddress: string,
    createdDate: Date,
  ) {
    const obj: DBModel.PriceHistoryRef = {
      tokenFrom: price.baseCurrency.address,
      tokenTo: price.quoteCurrency.address,
      price: price.toFixed(8),
      createdDate: createdDate,
      sourceFrom: poolAddress,
      remark: `UniswapV3Pool.sol|${price.baseCurrency.name}-${price.quoteCurrency.name}`,
    };

    const result = await this.service.create(obj);
  }

  private convertPriceToAdjustItem(price: Price<Token, Token>) {
    const decimals = 8; //Ref. from chainlink, should be 8
    let multiplier = '1';
    for (let i = 0; i < decimals; i++) {
      multiplier += '0';
    }
    const targetPrice = Big(price.toFixed(8)).mul(multiplier).toString();
    console.log(`Target price: ${targetPrice}`);
    const adjustItem: AdjustItem = {
      tokenName: tokenMappedData[price.baseCurrency.name as string].name,
      tokenAddr: tokenMappedData[price.baseCurrency.name as string].addr,
      targetPrice: new BN(targetPrice),
      decimals: decimals,
    };
    return adjustItem;
  }
}
