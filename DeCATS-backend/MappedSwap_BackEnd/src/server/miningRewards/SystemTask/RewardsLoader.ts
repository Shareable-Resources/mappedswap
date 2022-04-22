import seq from '../sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import Web3 from 'web3';
import abi from '../../../abi/IMiningPool.json';
import { AbiItem } from 'web3-utils';
import { any } from 'sequelize/types/lib/operators';
import { BN } from 'ethereumjs-util';
import { miningRewardsServer } from '../model/MiningRewardsServer';
import miningRewardsService from '../service/MiningRewardsService';
import { MiningRewardsDistributionStatus } from '../../../general/model/dbModel/MiningRewardsDistribution';
import schedule from 'node-schedule';
import { list } from 'pm2';
import globalVar from '../const/globalVar';
import { crytoDecimalPlace } from '../../../general/model/dbModel/Prices';
import { pipeline } from 'winston-daily-rotate-file';
import { MstPriceStatus } from '../../../general/model/dbModel/MstPrice';
import { Big } from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';
import { RewardsObserver } from './RewardsObserver';
import { initMiningObserver } from '../observer/initMiningObserver';
import foundationConst from '../../../foundation/const/index';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import { Model, Op } from 'sequelize';

const modelModule = seq.sequelize.models;

export let miningReward: any;
export let exportDateFrom: any;
export let exportDateTo: any;
// export let exportTokenPayoutList: any;
export let exportMiningRewardsDistributionList: any;

let thisMiningReward: any;

const usdmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<USDM>']
    .address;
const btcmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<BTCM>']
    .address;
const ethmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<ETHM>']
    .address;

// const webSocketProvider = new Web3.providers.WebsocketProvider(
//   globalVar.foundationConfig.rpcHostMining,
//   foundationConst.web3webSocketDefaultOption,
// );
// const ethClient = new EthClient(
//   webSocketProvider,
//   globalVar.foundationConfig.chainIdMining,
// );
const webSocketProvider = new Web3.providers.HttpProvider(
  globalVar.foundationConfig.rpcHostHttpMining,
  foundationConst.web3webSocketDefaultOption,
);
const ethClient = new EthClient(
  webSocketProvider,
  globalVar.foundationConfig.chainIdMining,
);

export class RewardsLoader {
  async loadRewards() {
    logger.info('start RewardsLoader');

    const rewardsObserver = new RewardsObserver();
    const minusMinutes = globalVar.miningRewardsConfig.rewardsJob.minusMinteus;

    try {
      // if (process.env.NODE_ENV == 'local') {
      //   // await getCustomerListFromMiningPool();
      //   // await rewardsObserver.observeMiningRewardJob();
      // }
      // // await getCustomerListFromMiningPool();
      // // await rewardsObserver.observeMiningRewardJob();

      const miningObserver = new initMiningObserver(ethClient);
      await miningObserver.startUpScanblock();
      await miningObserver.startMonitoringSmartContract();

      const job = schedule.scheduleJob(
        '[MiningRewards][RewardsLoader]',
        globalVar.miningRewardsConfig.rewardsJob.miningRewards,
        async () => {
          logger.info('Start Liquidity Mining');

          await getCustomerListFromMiningPool();
          logger.info('End Liquidity Mining');
        },
      );

      const observer = schedule.scheduleJob(
        '[MiningRewards][RewardsObserver]',
        globalVar.miningRewardsConfig.rewardsObserver.rewardsObserver,
        async () => {
          logger.info('Start Observe mining reward jobs');
          await rewardsObserver.observeMiningRewardJob();
          logger.info('End Observe mining reward  jobs');
        },
      );
    } catch (e) {
      logger.error(`Load RewardsLoader failed`);
      logger.error(e);
    }
  }
}

export async function getCustomerListFromMiningPool(inputCurrentTime?: any) {
  logger.info('start getCustomerListFromMiningPool');

  // const RPC_HOST = globalVar.foundationConfig.rpcHostMining;
  const RPC_HOST = globalVar.foundationConfig.rpcHostHttpMining;
  const USDMiningPoolAddress =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedBeaconProxy<USDMiningPool>'
    ].address;
  const BTCMiningPoolAddress =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedBeaconProxy<BTCMiningPool>'
    ].address;
  const ETHMiningPoolAddress =
    globalVar.foundationConfig.smartcontract.MappedSwap[
      'OwnedBeaconProxy<ETHMiningPool>'
    ].address;
  const MSTMiningPoolAddress =
    globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<MST>']
      .address;

  const web3 = new Web3(RPC_HOST);
  const abiItems: AbiItem[] = abi as AbiItem[];

  const miningAddress = [
    USDMiningPoolAddress,
    BTCMiningPoolAddress,
    ETHMiningPoolAddress,
  ];

  let miningRewardsDistribution: DBModel.MiningRewardsDistribution =
    new DBModel.MiningRewardsDistribution();
  ``;
  let miningRewardsDistributionList: DBModel.MiningRewardsDistribution[] = [];

  const tokenList: any = [];
  let payoutList: [string, (number | string | BN)[]][] = [];

  try {
    let currentTime: any;
    if (inputCurrentTime) {
      const inputDate = new Date(inputCurrentTime);

      currentTime = parseInt((inputDate.getTime() / 1000).toString()).toFixed(
        0,
      );
    } else {
      currentTime = parseInt((new Date().getTime() / 1000).toString()).toFixed(
        0,
      );
    }
    currentTime = parseInt(currentTime);
    // const dateFrom =
    //   currentTime - parseInt(globalVar.miningRewardsConfig.rewardsJob.fromTime);
    const dateFrom = currentTime;
    const dateTo = currentTime;
    // const dateFrom = 1641202559;
    // const dateTo = 1641202561;

    const minusMinutes = globalVar.miningRewardsConfig.rewardsJob.minusMinteus;
    const queryDate = new Date((currentTime - parseInt(minusMinutes)) * 1000);

    exportDateFrom = new Date(dateFrom * 1000);
    exportDateTo = new Date(dateTo * 1000);

    // logger.info('dateFrom: ' + dateFrom);
    // logger.info('dateTo: ' + dateTo);

    const mstPrice = 0;

    // const mstPriceInDb = await modelModule[SeqModel.name.MstPrice].findOne({
    //   where: {
    //     status: MstPriceStatus.StatusActive,
    //   },
    // });

    // if (mstPriceInDb) {
    //   mstPrice = mstPriceInDb.getDataValue('mstPrice');
    // }

    const usdPrice = 100000000;
    const usdDecimal = crytoDecimalPlace.USDM;
    let ethPrice = 0;
    const ethDecimal = crytoDecimalPlace.ETHM;
    let btcPrice = 0;
    const btcDecimal = crytoDecimalPlace.BTCM;

    // const recordInDb = await modelModule[SeqModel.name.Prices].findAll({});

    const recordInDb = await modelModule[SeqModel.name.BlockPrices].findAll({
      where: {
        createdDate: {
          [Op.lte]: queryDate,
        },
      },
      limit: 2,
      order: [['created_date', 'DESC']],
    });

    for (let i = 0; i < recordInDb.length; i++) {
      let price0 = 0;
      let price1 = 0;

      // price0 =
      //   recordInDb[i]['reserve0'] / 10 ** recordInDb[i]['reserve0DecimalPlace'];
      // price1 =
      //   recordInDb[i]['reserve1'] / 10 ** recordInDb[i]['reserve1DecimalPlace'];
      price0 = recordInDb[i]['reserve0'];
      price1 = recordInDb[i]['reserve1'];

      if (recordInDb[i]['pairName'].includes('BTCM')) {
        if (usdmAddress < btcmAddress) {
          price0 = price0 / 10 ** usdDecimal;
          price1 = price1 / 10 ** btcDecimal;

          btcPrice = price0 / price1;
        } else {
          price0 = price0 / 10 ** btcDecimal;
          price1 = price1 / 10 ** usdDecimal;

          btcPrice = price1 / price0;
        }
      } else {
        if (usdmAddress < ethmAddress) {
          price0 = price0 / 10 ** usdDecimal;
          price1 = price1 / 10 ** ethDecimal;

          ethPrice = price0 / price1;
        } else {
          price0 = price0 / 10 ** ethDecimal;
          price1 = price1 / 10 ** usdDecimal;

          ethPrice = price1 / price0;
        }
      }
    }

    if (btcPrice) {
      btcPrice = btcPrice * 10 ** usdDecimal;
      btcPrice = Math.trunc(btcPrice);
    }

    if (ethPrice) {
      ethPrice = ethPrice * 10 ** usdDecimal;
      ethPrice = Math.trunc(ethPrice);
    }

    let usdmUserList;
    let btcmUserList;
    let ethmUserList;
    for (let i = 0; i < miningAddress.length; i++) {
      const element = miningAddress[i];
      const poolContract = new web3.eth.Contract(abiItems, element);
      const userList = await poolContract.methods.getAllUsers().call();

      if (element == USDMiningPoolAddress) {
        usdmUserList = userList;
      } else if (element == ETHMiningPoolAddress) {
        ethmUserList = userList;
      } else if (element == BTCMiningPoolAddress) {
        btcmUserList = userList;
      }
    }

    // logger.info('usdmUserList: ', usdmUserList);
    // logger.info('btcmUserList: ', btcmUserList);
    // logger.info('ethmUserList: ', ethmUserList);

    const userList = [usdmUserList, btcmUserList, ethmUserList];

    tokenList.push(MSTMiningPoolAddress.toString());

    for (let c = 0; c < userList.length; c++) {
      const userAddressList = userList[c];
      if (userAddressList && userAddressList.length > 0) {
        let contractAddress = '';
        let price = 0;
        const decimal = usdDecimal;

        // let amountList: (number | string | BN)[] = [0];
        // let amountList: (number | string | BN)[] = [0];
        let amountList: (number | string | BN)[] = [];

        if (userAddressList == usdmUserList) {
          contractAddress = USDMiningPoolAddress.toLowerCase();
          price = usdPrice;
        } else if (userAddressList == ethmUserList) {
          contractAddress = ETHMiningPoolAddress.toLowerCase();
          price = ethPrice;
        } else if (userAddressList == btcmUserList) {
          contractAddress = BTCMiningPoolAddress.toLowerCase();
          price = btcPrice;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        for (let i = 0; i < userAddressList.length; i++) {
          const uAddress = userAddressList[i].toLowerCase();
          const poolContract = new web3.eth.Contract(
            abiItems,
            contractAddress.toLowerCase(),
          );

          const userRewardsDetails = await poolContract.methods
            .getUserRewardsAt(uAddress, dateTo, price, decimal)
            .call();

          // for (let j = 0; j < userRewardsDetails.length; j++) {
          const amount = userRewardsDetails.amount;
          const acquiredDate = userRewardsDetails.timestamp;

          // const updateAmount = Math.trunc(
          //   (amount / mstPrice) * 10 ** crytoDecimalPlace.MST,
          // );
          // amountList.push(
          //   updateAmount.toLocaleString('fullwide', { useGrouping: false }),
          // );
          const updateAmount = 0;
          amountList.push(updateAmount.toString());

          miningRewardsDistribution = new DBModel.MiningRewardsDistribution();
          miningRewardsDistribution.status =
            MiningRewardsDistributionStatus.Created;
          miningRewardsDistribution.poolToken = contractAddress.toLowerCase();
          miningRewardsDistribution.address = uAddress;
          // miningRewardsDistribution.amount = Big(amount).mul(Big(mstPrice));
          // miningRewardsDistribution.amount = amount * mstPrice;
          miningRewardsDistribution.amount = updateAmount;
          // Math.trunc(
          //   amount * (mstPrice / 10 ** crytoDecimalPlace.MST),
          // );
          miningRewardsDistribution.UsdcAmount = amount;
          miningRewardsDistribution.acquiredDate = acquiredDate;
          miningRewardsDistribution.createdDate = new Date(currentTime * 1000);

          miningRewardsDistributionList.push(miningRewardsDistribution);

          payoutList.push([uAddress, amountList]);
          amountList = [];
          // }

          if (i == userAddressList.length - 1) {
            thisMiningReward = {
              tokenList: tokenList,
              payoutList: payoutList,
            };

            if (thisMiningReward.tokenList.length > 0) {
              miningReward = thisMiningReward;

              exportMiningRewardsDistributionList =
                miningRewardsDistributionList;

              const service: miningRewardsService = new miningRewardsService();

              await service.createMiningRewards(
                contractAddress.toLowerCase(),
                price,
                mstPrice,
              );

              await new Promise((resolve) => setTimeout(resolve, 2000));

              payoutList = [];
              thisMiningReward = {};
              miningRewardsDistributionList = [];
            }
          }
        }
      }
    }
  } catch (e: any) {
    logger.error(e);
    return e;
  }
}
