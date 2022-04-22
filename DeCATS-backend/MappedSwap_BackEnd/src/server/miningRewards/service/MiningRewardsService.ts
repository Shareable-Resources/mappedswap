import seq from '../sequelize';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import PayoutArtifact from '../../../abi/Payout.json';
import { AbiItem } from 'web3-utils';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import Web3 from 'web3';
import foundationConst from '../../../foundation/const/index';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import logger from '../util/ServiceLogger';
import CommonService from '../../../foundation/server/CommonService';
import { Model, Sequelize } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { MiningRewardsDistributionStatus } from '../../../general/model/dbModel/MiningRewardsDistribution';
import { createdEventApi } from '../const';
import {
  exportDateFrom,
  exportDateTo,
  exportMiningRewardsDistributionList,
  getCustomerListFromMiningPool,
} from '../SystemTask/RewardsLoader';
import { MiningRewardsStatus } from '../../../general/model/dbModel/MiningRewards';
import BlockChainHelper from '../../../foundation/utils/BlockChainHelper';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import {
  ErrorResponseBase,
  ResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import globalVar from '../const/globalVar';

const modelModule = seq.sequelize.models;

const abiItems: AbiItem[] = PayoutArtifact as AbiItem[];
const contractAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedUpgradeableProxy<Payout>'
  ].address;

// const webSocketProvider = new Web3.providers.WebsocketProvider(
//   globalVar.foundationConfig.rpcHost,
//   foundationConst.web3webSocketDefaultOption,
// );
const webSocketProvider = new Web3.providers.HttpProvider(
  globalVar.foundationConfig.rpcHostHttp,
  foundationConst.web3HttpProviderOption,
);

const ethClient = new EthClient(
  webSocketProvider,
  globalVar.foundationConfig.chainId,
);

const payoutContract = new ethClient.web3Client.eth.Contract(
  abiItems,
  contractAddr,
) as any;

export default class Service implements CommonService {
  sideChainClient?: EthClient; // mainnet/testnet/dev

  async getAll() {
    //
  }

  async proccessCreatedEvent(roundId: any, miningReward: any, t: any) {
    const funcMsg = `[MiningRewardsService][proccessCreatedEvent]`;
    logger.info(funcMsg, { message: ' - start' });

    if (roundId && miningReward.tokenList.length > 0) {
      try {
        this.sideChainClient = new EthClient(
          webSocketProvider,
          globalVar.foundationConfig.chainId,
        );

        const web3Account =
          ethClient.web3Client.eth.accounts.privateKeyToAccount(encryptionKey!);

        logger.info('tokenList: ', miningReward['tokenList']);
        logger.info('payoutList:', miningReward['payoutList']);
        logger.info(
          'exportMiningRewardsDistributionList: ',
          exportMiningRewardsDistributionList,
        );
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
          data: payoutContract.methods
            .update(
              roundId,
              miningReward['tokenList'],
              miningReward['payoutList'],
            )
            .encodeABI(),
        };
        const gas = await this.sideChainClient!.web3Client.eth.estimateGas(tx);
        tx.gas = gas.toString();

        const signTxResult: any = await web3Account.signTransaction(tx);
        logger.info(signTxResult.transactionHash);
        const myReceipt: any = await ethClient.web3Client.eth
          .sendSignedTransaction(signTxResult.rawTransaction)
          .on('transactionHash', function (transactionHash) {
            logger.info(`[MiningPayout].[update] txHash :${transactionHash}`);
          })
          .on('receipt', async (receipt) => {
            logger.info(
              `[MiningPayout].[update] Receipt:${JSON.stringify(receipt)}`,
            );
            if (receipt.status) {
              logger.info(
                `[MiningPayout].[update] success, txHash :${receipt.transactionHash}`,
              );
              logger.info(
                `[MiningPayout].[update] success, next updateFinish txHash :${receipt.transactionHash}`,
              );

              await t.commit();

              await this.updateFinish(roundId);
            } else {
              await t.rollback();

              logger.error(
                `[MiningPayout].[update] fail, txHash :${receipt.transactionHash}`,
              );
            }
            return receipt;
          })
          .on('error', function (error) {
            logger.error(`[MiningPayout].[update] fail`, { message: error });
          });
      } catch (e) {
        await t.rollback();

        logger.error('Cannot Payout contract');
        BlockChainHelper.logRevertReason(e, logger);
        logger.error(e);
        throw e;
      }
    } else {
      logger.info(`roundId or tokenList not exist`);
    }
  }

  async updateFinish(roundId: string) {
    const funcMsg = `[MiningRewardsService][updateFinish]`;
    logger.info(funcMsg, { message: ' - start' });

    const web3Account = ethClient.web3Client.eth.accounts.privateKeyToAccount(
      encryptionKey!,
    );
    const verifierAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap['verifierAddress'];
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
      // this encodes the ABI of the method and the arguements
      data: payoutContract.methods
        .updateFinish(roundId, verifierAddress)
        .encodeABI(),
    };
    const signTxResult: any = await web3Account.signTransaction(tx);
    logger.info(signTxResult.transactionHash);
    const myReceipt: any = await ethClient.web3Client.eth
      .sendSignedTransaction(signTxResult.rawTransaction)
      .on('transactionHash', function (transactionHash) {
        logger.info(
          `[MiningPayout].[updateFinish], txHash :${transactionHash}`,
        );
      })
      .on('receipt', async (receipt) => {
        logger.info(`Receipt:${JSON.stringify(receipt)}`);
        if (receipt.status) {
          logger.info(
            `[MiningPayout].[updateFinish] success, txHash :${receipt.transactionHash}`,
          );
          // await this.updateRoundId(this.commissionJob);
        } else {
          logger.info(
            `[MiningPayout].[updateFinish] fail, txHash :${receipt.transactionHash}`,
          );
        }

        return receipt;
      })
      .on('error', function (error) {
        logger.error(`[MiningPayout] Update finish fail`);
        logger.error(error);
      });
  }

  async createMiningRewards(poolToken: any, price: any, mstPrice: any) {
    let myReceipt: any = null;

    try {
      const funcMsg = `[MiningRewardsService][createMiningRewards]`;
      logger.info(funcMsg, { message: ' - start' });

      const abiItemsPayout: AbiItem[] = PayoutArtifact as AbiItem[];

      // const webSocketProvider = new Web3.providers.WebsocketProvider(
      //   globalVar.foundationConfig.rpcHost,
      //   foundationConst.web3webSocketDefaultOption,
      // );
      const webSocketProvider = new Web3.providers.HttpProvider(
        globalVar.foundationConfig.rpcHostHttp,
        foundationConst.web3webSocketDefaultOption,
      );
      this.sideChainClient = new EthClient(
        webSocketProvider,
        globalVar.foundationConfig.chainId,
      );

      const rewardsLoader = await import('../SystemTask/RewardsLoader');
      rewardsLoader.miningReward;
      const obj: DBModel.MiningRewardsDistribution =
        rewardsLoader.exportMiningRewardsDistributionList[0];

      const checkDuplicate: any = await modelModule[
        SeqModel.name.MiningRewardsDistribution
      ].findOne({
        where: {
          poolToken: obj.poolToken,
          acquiredDate: obj.acquiredDate.toString(),
        },
      });

      if (!checkDuplicate) {
        const web3 = new Web3(this.sideChainClient!.web3Client.currentProvider);
        const web3Account = web3.eth.accounts.privateKeyToAccount(
          encryptionKey!,
        );
        // const payoutContractAddr =
        //   globalVar.foundationConfig.smartcontract.MappedSwap[
        //     'OwnedUpgradeableProxy<Payout>'
        //   ].address;

        // const payoutContract =
        //   new this.sideChainClient!.web3Client.eth.Contract(
        //     abiItemsPayout,
        //     globalVar.foundationConfig.smartcontract.MappedSwap[
        //       'OwnedUpgradeableProxy<Payout>'
        //     ].address,
        //   ) as any;

        const nonce = await ethClient.web3Client.eth.getTransactionCount(
          web3Account.address,
          'pending',
        );

        const tx = {
          // this could be provider.addresses[0] if it exists
          from: web3Account.address,
          // target address, this could be a smart contract address
          // to: payoutContractAddr,
          to: contractAddr,
          gasPrice: '0x8F0D1800',
          // optional if you want to specify the gas limit
          gas: '0xAA690',
          // optional if you are invoking say a payable function
          //value: '0x00',
          // this encodes the ABI of the method and the arguements
          data: payoutContract.methods.create().encodeABI(),
          nonce: nonce,
        };

        logger.info('tx.data: ' + tx.data);

        const signTxResult: any = await web3Account.signTransaction(tx);
        logger.info(
          'signTxResult.transactionHash: ' + signTxResult.transactionHash,
        );

        myReceipt =
          await this.sideChainClient!.web3Client.eth.sendSignedTransaction(
            signTxResult.rawTransaction,
          );

        const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
          myReceipt.transactionHash,
          this.sideChainClient!.web3Client,
        );

        if (receipt.status) {
          logger.info(
            `[MiningPayout].[create] success, txHash :${receipt.transactionHash}`,
          );

          const decodeData = await TxnReceiptHelper.decodeEvent(
            myReceipt.transactionHash,
            this.sideChainClient!.web3Client,
            createdEventApi,
          );

          const roundId = decodeData.roundID;

          const t = await seq.sequelize.transaction();

          try {
            const date = new Date();

            const miningReward: DBModel.MiningRewards =
              new DBModel.MiningRewards();
            miningReward.dateFrom = exportDateFrom;
            miningReward.dateTo = exportDateTo;
            miningReward.roundId = roundId;
            miningReward.poolToken = poolToken.toLowerCase();
            miningReward.createdDate = date;
            miningReward.lastModifiedDate = date;
            miningReward.status = MiningRewardsStatus.Created;
            miningReward.exchangeRate = price;
            miningReward.mstExchangeRate = mstPrice;

            const insertResult: any = await modelModule[
              SeqModel.name.MiningRewards
            ].create(miningReward, {
              transaction: t,
            });

            if (insertResult && insertResult.id > 0) {
              logger.info(funcMsg + ' - success ', {
                message: `update MiningRewards success`,
              });

              rewardsLoader.exportMiningRewardsDistributionList.forEach((x) => {
                x.jobId = insertResult.id;
              });

              const miningRewardInsert: any = await modelModule[
                SeqModel.name.MiningRewardsDistribution
              ].bulkCreate(rewardsLoader.exportMiningRewardsDistributionList, {
                transaction: t,
              });

              await t.commit();
            } else {
              logger.info(funcMsg + ' - success ', {
                message: `update MiningRewards failed`,
              });

              await t.rollback();
            }

            // await this.proccessCreatedEvent(roundId, t);
          } catch (e) {
            await t.rollback();

            logger.error(e);

            const removeMiningRewardsResults: any = await modelModule[
              SeqModel.name.MiningRewards
            ].destroy({
              where: {
                dateFrom: exportDateFrom,
                dateTo: exportDateTo,
              },
            });

            // await t.commit();
          }
        } else {
          logger.info(
            `[MiningPayout].[create] failed, txHash :${receipt.transactionHash}`,
          );
        }
      } else {
        logger.info(
          `[MiningRewardsService][proccessCreatedEvent] record duplicated poolToken: ${obj.poolToken}, acquiredDate: ${obj.acquiredDate}`,
        );
      }
    } catch (ex) {
      logger.error('create roundId error');
      logger.error('ex: ' + ex);
    }

    return myReceipt;
  }

  async regenerateMiningRewards(inputToDate: any): Promise<ResponseBase> {
    const funcMsg = `[MiningRewardsService][regenerateMiningRewards](To Date: ${inputToDate.toString()})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();

    try {
      await getCustomerListFromMiningPool(inputToDate);

      resp.success = true;
      resp.msg = `Regenerate Mining Rewards at To Date: ${inputToDate.toString()} success`;
      logger.info(funcMsg + ' - success ', { message: resp.msg });
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'regenerate mining rewards fail :' + e,
      );
    }

    return resp;
  }
}
