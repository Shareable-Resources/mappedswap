import { EventApprovalStatus } from '../../../general/model/dbModel/EventApproval';
import seq from '../sequelize';
import globalVar from '../const/globalVar';
import moment from 'moment';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/EthClient';
import foundationConst from '../../../foundation/const/index';
import IUniswapV2PairArtifact from '../../../abi/IUniswapV2Pair.json';
import { IUniswapV2Pair } from '../../../@types/IUniswapV2Pair';
import { ERC20 } from '../../../@types/ERC20';
import Big from 'big.js';
import IPaymentProxyArtifact from '../../../abi/IPaymentProxy.json';
import { Model, Op, Sequelize, Transaction } from 'sequelize';
import {
  ErrorResponseBase,
  ResponseBase,
} from '../../../foundation/server/ApiMessage';
import { AbiItem } from 'web3-utils';
import PairDailyReport from '../../../general/model/dbModel/PairDailyReport';
import { crytoDecimalNumber } from '../../../general/model/dbModel/Prices';
import ProfitAndLossReport from '../../../general/model/dbModel/ProfitAndLossReport';
import { REQUEST_HEADER_FIELDS_TOO_LARGE } from 'http-status-codes';
import {
  EventApproval,
  EventParticipant,
} from '../../../general/model/dbModel/0_index';
import { EventParticipantStatus } from '../../../general/model/dbModel/EventParticipant';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { IPaymentProxy } from '../../../@types/IPaymentProxy';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import BN from 'bn.js';
import ArrayHelper from '../../../foundation/utils/ArrayHelper';
const foundationConfig = globalVar.foundationConfig;
const modelModule = seq.sequelize.models;
export default class Service {
  isDistributing: boolean;
  constructor() {
    this.isDistributing = false;
  }
  /**
   * Write top 20 into t_decats_leaderboard_rankings
   */
  async distributeTokens(): Promise<ResponseBase> {
    this.isDistributing = true;
    const resp = new ResponseBase();
    try {
      let eventApprovalInDb: EventApproval = (await modelModule[
        SeqModel.name.EventApproval
      ].findOne({
        where: {
          status: EventApprovalStatus.Distributing,
        },
        attributes: ['id', 'roundId', 'status'],
      })) as any;
      if (eventApprovalInDb) {
        logger.info(
          `Found event approval that is not distributed. Distributing ${eventApprovalInDb.id}`,
        );
        eventApprovalInDb = JSON.parse(JSON.stringify(eventApprovalInDb));
        let distributions: EventParticipant[] = (await modelModule[
          SeqModel.name.EventParticipant
        ].findAll({
          where: {
            approvalId: eventApprovalInDb.id as string,
            status: {
              [Op.in]: [EventParticipantStatus.Pending],
            },
          },
          order: [['id', 'asc']],
        })) as any;
        distributions = JSON.parse(JSON.stringify(distributions));
        const httpProvider = new Web3.providers.HttpProvider(
          globalVar.foundationConfig.rpcHostHttp,
          foundationConst.web3HttpProviderOption,
        );
        const sideChainClient = new EthClient(
          httpProvider,
          globalVar.foundationConfig.chainId,
        );

        const chunksOfDistributions = ArrayHelper.splitInChunks(
          distributions,
          globalVar.eventConfig.chunk,
        );

        for (let i = 0; i < chunksOfDistributions.length; i++) {
          const amounts = chunksOfDistributions[i].map((x) => x.amt as string);
          const addresses = chunksOfDistributions[i].map(
            (x) => x.address as string,
          );
          const callContract = await transferMultipleWithData(
            globalVar.foundationConfig.smartcontract.MappedSwap['PaymentProxy']
              .address,
            sideChainClient,
            encryptionKey!,
            {
              roundID: eventApprovalInDb.roundId as string,
              amounts: amounts,
              data: addresses,
            },
          );
          chunksOfDistributions[i].forEach((x) => {
            x.txHash = callContract.data;
            x.status = EventParticipantStatus.Disted;
            x.lastModifiedDate = moment().utc().toDate();
          });

          for (let y = 0; y < chunksOfDistributions[i].length; y++) {
            const result1: any = await modelModule[
              SeqModel.name.EventParticipant
            ].update(chunksOfDistributions[i][y], {
              fields: ['txHash', 'lastModifiedDate', 'status'],
              where: {
                id: chunksOfDistributions[i][y].id as string,
              },
            });
          }
        }

        distributions = (await modelModule[
          SeqModel.name.EventParticipant
        ].findAll({
          where: {
            approvalId: eventApprovalInDb.id as string,
            status: {
              [Op.in]: [EventParticipantStatus.Pending],
            },
          },
          order: [['id', 'asc']],
        })) as any;
        const anyNotDisted = distributions.find(
          (x) => x.status != EventParticipantStatus.Disted,
        );
        if (
          !anyNotDisted &&
          eventApprovalInDb.status == EventApprovalStatus.Distributing
        ) {
          eventApprovalInDb.status = EventApprovalStatus.Disted;
          eventApprovalInDb.lastModifiedDate = moment().utc().toDate();
          const result2: any = await modelModule[
            SeqModel.name.EventApproval
          ].update(eventApprovalInDb, {
            fields: ['lastModifiedDate', 'status', 'lastModifiedById'],
            where: {
              id: eventApprovalInDb.id as string,
            },
          });
          logger.info(`ID ${eventApprovalInDb.id} distributed `);
        }
        resp.success = true;
        resp.msg = 'Success';
      }
    } catch (ex: any) {
      logger.error(ex);
      this.isDistributing = false;
      return new ErrorResponseBase(ServerReturnCode.BadRequest, ex.toString());
    }
    this.isDistributing = false;
    return resp;
  }
}
export async function transferMultipleWithData(
  contractAddr: string,
  sideChainClient: EthClient,
  encryptionKey: string,
  transferMultipleWithData: {
    roundID: number | string | BN;
    amounts: (number | string | BN)[];
    data: (string | number[])[];
  },
) {
  logger.info(
    `[IPaymentProxy].[transferWithData], users :${transferMultipleWithData.data.join(
      ',',
    )}, amt: ${transferMultipleWithData.amounts.join(',')}, (RoundId:${
      transferMultipleWithData.roundID
    })`,
  );
  const abiItems: AbiItem[] = IPaymentProxyArtifact as AbiItem[];
  const contract = new sideChainClient.web3Client.eth.Contract(
    abiItems,
    contractAddr,
  ) as any;
  const amounts = transferMultipleWithData.amounts.map((x) => x);
  const addresses = transferMultipleWithData.data.map((x) => {
    return Web3.utils.padLeft(x as string, 64);
  });

  const paymentContract: IPaymentProxy = contract as any;
  const web3Account =
    sideChainClient.web3Client.eth.accounts.privateKeyToAccount(encryptionKey);
  const resp = new ResponseBase();
  const tx: any = {
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
    // data: pool.methods.updateCustomerDetails("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", true).encodeABI(),
    data: paymentContract.methods
      .transferMultipleWithData(
        transferMultipleWithData.roundID,
        amounts,
        addresses,
      )
      .encodeABI(),
    // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
  };

  const esiGas = await sideChainClient.web3Client.eth.estimateGas(tx);
  tx.gas = esiGas;
  const signTxResult: any = await web3Account.signTransaction(tx);
  const sendSignTxResult =
    await sideChainClient.web3Client.eth.sendSignedTransaction(
      signTxResult.rawTransaction,
    );
  logger.info(sendSignTxResult.transactionHash);
  const receipt = await TxnReceiptHelper.getReceiptFromTxHash(
    sendSignTxResult.transactionHash,
    sideChainClient.web3Client,
  );
  if (receipt.status) {
    logger.info(`Success, txHash :${receipt.transactionHash}`);
    resp.success = true;
    resp.data = receipt.transactionHash;
  } else {
    logger.error(`[IPaymentProxy].[transferMultipleWithData] `, {
      message: ' - fail',
    });
    throw new Error(`[IPaymentProxy].[transferMultipleWithData] `);
  }

  return resp;
}
