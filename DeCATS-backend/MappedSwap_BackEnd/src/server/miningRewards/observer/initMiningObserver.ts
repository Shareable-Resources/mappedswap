import seq from '../sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import * as ReqModel from '../../../server/dApp/model/reqModel/0_index';
import * as DBModel from '../../../general/model/dbModel/0_index';
import { Model, Op, Sequelize, Transaction } from 'sequelize';
import CommonObserver from './CommonObserver';
import logger from '../util/ServiceLogger';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import Service from '../service/MiningRewardsService';
import globalVar from '../const/globalVar';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import miningPoolAbi from '../../../abi/IMiningPool.json';
import { WarningResponseBase } from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { StakeRewards, IMiningPool } from '../../../@types/IMiningPool';
import { StakeRewardsStatus } from '../../../general/model/dbModel/StakeRewards';
import foundationConst from '../../../foundation/const/index';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import StakingAbi from '../../../abi/Staking.json';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import { addLockedStakingEventApi } from '../const';

const usdmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedBeaconProxy<USDMiningPool>'
  ].address;
const btcmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedBeaconProxy<BTCMiningPool>'
  ].address;
const ethmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedBeaconProxy<ETHMiningPool>'
  ].address;
const mstAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<MST>']
    .address;

const modelModule = seq.sequelize.models;

const webSocketProvider = new Web3.providers.WebsocketProvider(
  globalVar.foundationConfig.rpcHostMining,
  foundationConst.web3webSocketDefaultOption,
);
// const webSocketProvider = new Web3.providers.HttpProvider(
//   globalVar.foundationConfig.rpcHostHttpMining,
//   foundationConst.web3webSocketDefaultOption,
// );

const contractAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedUpgradeableProxy<Staking>'
  ].address;

const unlockInterval = globalVar.miningRewardsConfig.stakeReward.unlockInterval;
const division = globalVar.miningRewardsConfig.stakeReward.division;

// const newWebSocketProvider = new Web3.providers.WebsocketProvider(
//   globalVar.foundationConfig.rpcHost,
//   foundationConst.web3webSocketDefaultOption,
// );
const newWebSocketProvider = new Web3.providers.HttpProvider(
  globalVar.foundationConfig.rpcHostHttp,
  foundationConst.web3webSocketDefaultOption,
);

const chainClient = new EthClient(
  newWebSocketProvider,
  globalVar.foundationConfig.chainId,
);

export class initMiningObserver extends CommonObserver {
  RpcHost: string;

  web3: any;
  abiItems: AbiItem[];

  sideChainClient?: EthClient; // mainnet/testnet/dev

  constructor(ethClient: EthClient, private service: Service = new Service()) {
    super(ethClient);
    this.RpcHost = globalVar.foundationConfig.rpcHostMining;
    // this.RpcHost = globalVar.foundationConfig.rpcHostHttpMining;
    this.web3 = new Web3(this.RpcHost);
    this.abiItems = miningPoolAbi as AbiItem[];

    this.sideChainClient = new EthClient(
      webSocketProvider,
      globalVar.foundationConfig.chainIdMining,
    );
  }

  async startMonitoringSmartContract() {
    logger.info('[initReportObserver] Starts monitoring block');

    try {
      // const web3Client = this.ethClient.web3Client;

      const uSDMiningPool = new this.web3.eth.Contract(
        this.abiItems,
        usdmAddress,
      );
      await uSDMiningPool.events
        .StakeRewards()
        .on('data', async (event: StakeRewards) => {
          logger.info('USDMiningPool [data] ', event);
          await this.proccessBlocks(event, usdmAddress, event.blockNumber);
        })
        .on('changed', (event) => {
          logger.info('USDMiningPool [changed]', event);
        })
        .on('error', (event) => {
          logger.info('USDMiningPool [error]', event);
        })
        .on('connected', (event) => {
          logger.info('USDMiningPool [connected]', event);
          logger.info(`usdmAddress: ${usdmAddress}`);
        });

      const bTCMiningPool = new this.web3.eth.Contract(
        this.abiItems,
        btcmAddress,
      );
      await bTCMiningPool.events
        .StakeRewards()
        .on('data', async (event: StakeRewards) => {
          logger.info('BTCMiningPool [data] ', event);
          await this.proccessBlocks(event, btcmAddress, event.blockNumber);
        })
        .on('changed', (event) => {
          logger.info('BTCMiningPool [changed]', event);
        })
        .on('error', (event) => {
          logger.info('BTCMiningPool [error]', event);
        })
        .on('connected', (event) => {
          logger.info('BTCMiningPool [connected]', event);
          logger.info(`btcmAddress: ${btcmAddress}`);
        });

      // const eTHMiningPool = new web3Client.eth.Contract(
      const eTHMiningPool = new this.web3.eth.Contract(
        this.abiItems,
        ethmAddress,
      ) as any as IMiningPool;
      await eTHMiningPool.events
        .StakeRewards()
        .on('data', async (event: StakeRewards) => {
          logger.info('ETHMiningPool [data] ', event);
          try {
            await this.proccessBlocks(event, ethmAddress, event.blockNumber);
          } catch (e) {
            logger.error(e);
          }
        })
        .on('changed', (event) => {
          logger.info('ETHMiningPool [changed]', event);
        })
        .on('error', (event) => {
          logger.info('ETHMiningPool [error]', event);
        })
        .on('connected', (event) => {
          logger.info('ETHMiningPool [connected]', event);
          logger.info(`ethmAddress: ${ethmAddress}`);
        });

      logger.info('after pool');
    } catch (e: any) {
      new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message);
      logger.error(e);
    }
  }

  async proccessBlock(event: any) {
    //
  }

  async proccessBlocks(event: any, poolToken: any, blockNumber: any) {
    logger.info("event.event: '" + event.event + "'");

    const dateNow = new Date();
    const minMstTransferValue =
      globalVar.miningRewardsConfig.stakeReward.minMstTransferValue;

    if (event.event == 'StakeRewards') {
      const returnValues = event.returnValues;

      if (returnValues.stakeRewardsAmount >= minMstTransferValue) {
        const stakeRewardsObj = new DBModel.StakeRewards();
        stakeRewardsObj.poolToken = poolToken;
        stakeRewardsObj.address = returnValues.userAddr
          .toString()
          .toLowerCase();
        stakeRewardsObj.stakeAmount = returnValues.stakeAmount;
        stakeRewardsObj.stakeRewardsAmount = returnValues.stakeRewardsAmount;
        stakeRewardsObj.stakeTime = returnValues.stakeTime;
        stakeRewardsObj.nodeID = returnValues.nodeID;
        stakeRewardsObj.stakeHash = returnValues.stakeHash;
        stakeRewardsObj.blockNumber = blockNumber;
        stakeRewardsObj.status = StakeRewardsStatus.StatusActive;
        stakeRewardsObj.createdDate = dateNow;
        stakeRewardsObj.lastModifiedDate = dateNow;

        await this.checkBlock(stakeRewardsObj, poolToken);
      } else {
        logger.info(
          `stakeRewardsAmount (${returnValues.stakeRewardsAmount}) is less then 0.01`,
        );
      }
    }

    return null;
  }

  async checkBlock(stakeRewardsObj: DBModel.StakeRewards, poolToken: any) {
    const funcMsg = `[initMiningObserver][checkBlock](nodeId: ${stakeRewardsObj.nodeID})`;
    logger.info(funcMsg, { message: ' - start' });
    // const t = await seq.sequelize.transaction();
    // let myReceipt: any = null;

    try {
      const maxBlockNumber = await this.getMaxBlockNumber(poolToken);

      if (maxBlockNumber) {
        logger.info(`maxBlockNumber: ${maxBlockNumber}`);

        await this.scanBlock(
          maxBlockNumber,
          stakeRewardsObj.blockNumber,
          poolToken,
        );
      } else {
        logger.info(`No maxBlockNumber`);

        await addBlock(stakeRewardsObj);
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }
  }

  async scanBlock(maxBlockNumber: any, blockNumber: any, poolToken: any) {
    const funcMsg = `[initMiningObserver][scanBlock]`;
    logger.info(funcMsg, { message: ' - start' });

    try {
      const minMstTransferValue =
        globalVar.miningRewardsConfig.stakeReward.minMstTransferValue;
      const nodeDifference = parseInt(blockNumber) - parseInt(maxBlockNumber);

      if (nodeDifference <= 0) {
        logger.info(
          `blockNumber (${blockNumber}) is smaller than DB record (${maxBlockNumber})`,
        );

        return;
      }

      const expectedBlcokNumber = parseInt(maxBlockNumber) + 1;
      if (expectedBlcokNumber <= blockNumber) {
        const web3Client = this.ethClient.web3Client;

        if (poolToken == usdmAddress) {
          const uSDMiningPool = new this.web3.eth.Contract(
            this.abiItems,
            usdmAddress,
          );
          await uSDMiningPool
            .getPastEvents(
              'StakeRewards',
              {
                fromBlock: expectedBlcokNumber,
                toBlock: 'latest',
              },
              // async function (error, events: any) {
              async (error, events: any) => {
                logger.info(events);

                if (!error) {
                  const dateNow = new Date();
                  for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    logger.info(event);

                    if (
                      event.returnValues.stakeRewardsAmount >=
                      minMstTransferValue
                    ) {
                      const stakeRewardsObj: DBModel.StakeRewards =
                        new DBModel.StakeRewards();

                      stakeRewardsObj.poolToken = usdmAddress;
                      stakeRewardsObj.address = event.returnValues.userAddr
                        .toString()
                        .toLowerCase();
                      stakeRewardsObj.stakeAmount =
                        event.returnValues.stakeAmount;
                      stakeRewardsObj.stakeRewardsAmount =
                        event.returnValues.stakeRewardsAmount;
                      stakeRewardsObj.stakeTime = event.returnValues.stakeTime;
                      stakeRewardsObj.nodeID = event.returnValues.nodeID;
                      stakeRewardsObj.stakeHash = event.returnValues.stakeHash;
                      stakeRewardsObj.blockNumber = event.blockNumber;
                      stakeRewardsObj.status = StakeRewardsStatus.StatusActive;
                      stakeRewardsObj.createdDate = dateNow;
                      stakeRewardsObj.lastModifiedDate = dateNow;

                      await addBlock(stakeRewardsObj);
                    } else {
                      logger.info(
                        `stakeRewardsAmount (${event.returnValues.stakeRewardsAmount}) is less then 0.01`,
                      );
                    }

                    if (i == events.length - 1) {
                      if (event.blockNumber < blockNumber) {
                        logger.info(
                          `event.blockNumber (${event.blockNumber}) is smaller then blockNumber ${blockNumber}`,
                        );

                        await new Promise((resolve) =>
                          setTimeout(resolve, 1000),
                        );

                        const newBlockNumber = parseInt(event.blockNumber) + 1;
                        await this.scanBlock(
                          newBlockNumber,
                          blockNumber,
                          poolToken,
                        );
                      }
                    }
                  }
                } else {
                  logger.info(`error: ${error}`);
                }
              },
            )
            .then(function (events) {
              console.log(events); // same results as the optional callback above
            });
        } else if (poolToken == btcmAddress) {
          const bTCMiningPool = new this.web3.eth.Contract(
            this.abiItems,
            btcmAddress,
          );
          await bTCMiningPool
            .getPastEvents(
              'StakeRewards',
              {
                fromBlock: expectedBlcokNumber,
                // toBlock: blockNumber,
                toBlock: 'latest',
              },
              async (error, events: any) => {
                logger.info(events);

                if (!error) {
                  const dateNow = new Date();
                  for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    logger.info(event);

                    if (
                      event.returnValues.stakeRewardsAmount >=
                      minMstTransferValue
                    ) {
                      const stakeRewardsObj: DBModel.StakeRewards =
                        new DBModel.StakeRewards();

                      stakeRewardsObj.poolToken = btcmAddress;
                      stakeRewardsObj.address = event.returnValues.userAddr
                        .toString()
                        .toLowerCase();
                      stakeRewardsObj.stakeAmount =
                        event.returnValues.stakeAmount;
                      stakeRewardsObj.stakeRewardsAmount =
                        event.returnValues.stakeRewardsAmount;
                      stakeRewardsObj.stakeTime = event.returnValues.stakeTime;
                      stakeRewardsObj.nodeID = event.returnValues.nodeID;
                      stakeRewardsObj.stakeHash = event.returnValues.stakeHash;
                      stakeRewardsObj.blockNumber = event.blockNumber;
                      stakeRewardsObj.status = StakeRewardsStatus.StatusActive;
                      stakeRewardsObj.createdDate = dateNow;
                      stakeRewardsObj.lastModifiedDate = dateNow;

                      await addBlock(stakeRewardsObj);
                    } else {
                      logger.info(
                        `stakeRewardsAmount (${event.returnValues.stakeRewardsAmount}) is less then 0.01`,
                      );
                    }

                    if (i == events.length - 1) {
                      if (event.blockNumber < blockNumber) {
                        logger.info(
                          `event.blockNumber (${event.blockNumber}) is smaller then blockNumber ${blockNumber}`,
                        );

                        await new Promise((resolve) =>
                          setTimeout(resolve, 1000),
                        );

                        const newBlockNumber = parseInt(event.blockNumber) + 1;
                        await this.scanBlock(
                          newBlockNumber,
                          blockNumber,
                          poolToken,
                        );
                      }
                    }
                  }
                } else {
                  logger.info(`error: ${error}`);
                }
              },
            )
            .then(function (events) {
              console.log(events); // same results as the optional callback above
            });
        } else if (poolToken == ethmAddress) {
          const eTHMiningPool = new web3Client.eth.Contract(
            this.abiItems,
            ethmAddress,
          );
          await eTHMiningPool
            .getPastEvents(
              'StakeRewards',
              {
                fromBlock: expectedBlcokNumber,
                // toBlock: blockNumber,
                toBlock: 'latest',
              },
              async (error, events: any) => {
                logger.info(events);

                if (!error) {
                  const dateNow = new Date();
                  for (let i = 0; i < events.length; i++) {
                    const event = events[i];
                    logger.info(event);

                    if (
                      event.returnValues.stakeRewardsAmount >=
                      minMstTransferValue
                    ) {
                      const stakeRewardsObj: DBModel.StakeRewards =
                        new DBModel.StakeRewards();

                      stakeRewardsObj.poolToken = ethmAddress;
                      stakeRewardsObj.address = event.returnValues.userAddr
                        .toString()
                        .toLowerCase();
                      stakeRewardsObj.stakeAmount =
                        event.returnValues.stakeAmount;
                      stakeRewardsObj.stakeRewardsAmount =
                        event.returnValues.stakeRewardsAmount;
                      stakeRewardsObj.stakeTime = event.returnValues.stakeTime;
                      stakeRewardsObj.nodeID = event.returnValues.nodeID;
                      stakeRewardsObj.stakeHash = event.returnValues.stakeHash;
                      stakeRewardsObj.blockNumber = event.blockNumber;
                      stakeRewardsObj.status = StakeRewardsStatus.StatusActive;
                      stakeRewardsObj.createdDate = dateNow;
                      stakeRewardsObj.lastModifiedDate = dateNow;

                      await addBlock(stakeRewardsObj);
                    } else {
                      logger.info(`error: ${error}`);
                    }

                    if (i == events.length - 1) {
                      if (event.blockNumber < blockNumber) {
                        logger.info(
                          `event.blockNumber (${event.blockNumber}) is smaller then blockNumber ${blockNumber}`,
                        );

                        await new Promise((resolve) =>
                          setTimeout(resolve, 1000),
                        );

                        const newBlockNumber = parseInt(event.blockNumber) + 1;
                        await this.scanBlock(
                          newBlockNumber,
                          blockNumber,
                          poolToken,
                        );
                      }
                    }
                  }
                } else {
                  logger.info(`error: ${error}`);
                }
              },
            )
            .then(function (events) {
              console.log(events); // same results as the optional callback above
            });
        } else {
          logger.info(`pookToken(${poolToken}) is not recognized`);
        }

        logger.info(`done`);
      } else {
        logger.info(
          `expectedBlcokNumber ${expectedBlcokNumber} bigger then blockNumber ${blockNumber}`,
        );
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }
  }

  async getMaxBlockNumber(poolToken: any) {
    const funcMsg = `[initMiningObserver][getMaxId]`;
    logger.info(funcMsg, { message: ' - start' });

    try {
      const maxRecordInDb = await modelModule[
        SeqModel.name.StakeRewards
      ].findOne({
        attributes: [
          [Sequelize.fn('max', Sequelize.col('block_number')), 'blockNumber'],
        ],
        where: {
          status: StakeRewardsStatus.StatusActive,
          poolToken: poolToken,
        },
      });

      if (maxRecordInDb && maxRecordInDb.getDataValue('blockNumber')) {
        const maxBlockNumber = maxRecordInDb
          .getDataValue('blockNumber')
          .toString();

        logger.info(`maxBlockNumber: ${maxBlockNumber}`);

        return maxBlockNumber;
      } else {
        logger.info(`Cannot find max block number`);
        return null;
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }
  }

  async startUpScanblock() {
    const funcMsg = `[initMiningObserver][startUpScanblock]`;
    logger.info(funcMsg, { message: ' - start' });

    try {
      const addressList = [usdmAddress, btcmAddress, ethmAddress];

      for (let i = 0; i < addressList.length; i++) {
        const poolToken = addressList[i];

        const maxRecordInDb = await modelModule[
          SeqModel.name.StakeRewards
        ].findOne({
          attributes: [
            [Sequelize.fn('max', Sequelize.col('block_number')), 'blockNumber'],
          ],
          where: {
            status: StakeRewardsStatus.StatusActive,
            poolToken: poolToken,
          },
        });

        if (maxRecordInDb && maxRecordInDb.getDataValue('blockNumber')) {
          const maxBlockNumber = maxRecordInDb
            .getDataValue('blockNumber')
            .toString();

          const blockNumber = parseInt(maxBlockNumber) + 10;

          logger.info(
            `maxBlockNumber: ${maxBlockNumber} in poolToken: ${poolToken}`,
          );

          await this.scanBlock(maxBlockNumber, blockNumber, poolToken);
        } else {
          logger.info(`Cannot find max block number`);
          return null;
        }
      }
    } catch (e: any) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message);
    }

    return null;
  }
}

export async function addBlock(stakeRewardsObj: DBModel.StakeRewards) {
  const funcMsg = `[initMiningObserver][addBlock]`;
  logger.info(funcMsg, { message: ' - start' });
  const t = await seq.sequelize.transaction();
  let myReceipt: any = null;

  try {
    const insertResult: any = await modelModule[
      SeqModel.name.StakeRewards
    ].create(stakeRewardsObj, {
      transaction: t,
    });

    const web3Account = chainClient.web3Client.eth.accounts.privateKeyToAccount(
      encryptionKey!,
    );

    const abiItems: AbiItem[] = StakingAbi as AbiItem[];
    const stakingContract = new chainClient.web3Client.eth.Contract(
      abiItems,
      contractAddr,
    ) as any;

    const tx = {
      // this could be provider.addresses[0] if it exists
      from: web3Account.address,
      // target address, this could be a smart contract address
      to: contractAddr,
      gasPrice: '0x8F0D1800',
      // optional if you want to specify the gas limit
      gas: '0xAA690',
      // optional if you are invoking say a payable function
      //value: '0x00',
      // this encodes the ABI of the method and the arguements]
      data: stakingContract.methods
        .addLockedStaking(
          mstAddress,
          stakeRewardsObj.poolToken,
          stakeRewardsObj.address,
          stakeRewardsObj.stakeRewardsAmount,
          stakeRewardsObj.stakeTime,
          stakeRewardsObj.nodeID,
          stakeRewardsObj.stakeHash,
          unlockInterval,
          division,
        )
        .encodeABI(),
    };
    const gas = await chainClient.web3Client.eth.estimateGas(tx);
    tx.gas = gas.toString();
    logger.info('tx.data: ' + tx.data);

    const signTxResult: any = await web3Account.signTransaction(tx);
    logger.info(
      'signTxResult.transactionHash: ' + signTxResult.transactionHash,
    );

    myReceipt = await chainClient.web3Client.eth.sendSignedTransaction(
      signTxResult.rawTransaction,
    );

    const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
      myReceipt.transactionHash,
      chainClient.web3Client,
    );

    if (receipt.status) {
      logger.info(
        `[Staking].[addLockedStaking] success, txHash :${receipt.transactionHash}`,
      );

      await t.commit();
    } else {
      logger.info(
        `[Staking].[addLockedStaking] failed, txHash :${receipt.transactionHash}`,
      );

      await t.rollback();
    }
  } catch (e) {
    logger.error(funcMsg + ' - fail ');
    logger.error(e);

    logger.info('typeof e: ' + typeof e);

    await t.rollback();
  }
}
