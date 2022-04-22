import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
  SuccessResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { Model, Op, Sequelize } from 'sequelize';
import IPaymentProxyArtifact from '../../../abi/IPaymentProxy.json';
import { IPaymentProxy } from '../../../@types/IPaymentProxy';
import TxnReceiptHelper from '../../../foundation/utils/TxnReceiptHelper';
import {
  CustomerContractStatus,
  CustomerCreditModeStatus,
  CustomerDefaultDetails,
  CustomerStatus,
  CustomerType,
} from '../../../general/model/dbModel/Customer';
import {
  signFundingCode,
  signToken,
  validateFundingCode,
} from '../../../foundation/server/Middlewares';
import {
  FundingCodeCodeStatus,
  FundingCodeStatus,
  FundingCodeTypeStatus,
} from '../../../general/model/dbModel/FundingCode';
// import { callPool } from '../../agent/service/CustomerService'
import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import callPool from '../../../foundation/utils/poolContract/Pool';
import foundationConst from '../../../foundation/const/index';
import {
  ReferralCodeCodeStatus,
  ReferralCodeStatus,
  ReferralCodeType,
} from '../../../general/model/dbModel/ReferralCode';
import { AgentStatus, AgentType } from '../../../general/model/dbModel/Agent';
import { AbiItem } from 'web3-utils';
import IAgentDataArtifact from '../../../abi/IAgentData.json';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import { IAgentData } from '../../../@types/IAgentData';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import { SignedTransaction } from 'web3-core';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Db from '../../../foundation/sequlelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';

import moment from 'moment';
import {
  EventApproval,
  EventParticipant,
} from '../../../general/model/dbModel/0_index';
import { EventApprovalStatus } from '../../../general/model/dbModel/EventApproval';
import logger from '../util/ServiceLogger';
import { EventParticipantStatus } from '../../../general/model/dbModel/EventParticipant';
import BN from 'bn.js';
import globalVar from '../const/globalVar';
import e from 'express';
import Big from 'big.js';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    query.dateFrom = query.dateFrom
      ? moment.utc(query.dateFrom).startOf('day').toDate()
      : null;
    query.dateTo = query.dateTo
      ? moment.utc(query.dateTo).endOf('day').toDate()
      : null;

    if (query.dateFrom && query.dateTo) {
      whereStatement.createdDate = {
        [Op.between]: [query.dateFrom, query.dateTo],
      };
    } else if (query.dateFrom) {
      whereStatement.createdDate = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereStatement.createdDate = {
        [Op.lte]: query.dateTo,
      };
    }
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'eventId',
      query.eventId,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      query.status,
    );
    const results: any = await modelModule[
      SeqModel.name.EventApproval
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      include: [
        {
          model: modelModule[SeqModel.name.Event],
          as: 'event',
          attributes: [
            'id',
            'token',
            'budget',
            'quota',
            'name',
            'code',
            'distType',
            'status',
          ],
        },
      ],
      offset: query.pageNo * query.recordPerPage,
    });
    return results;
  }

  async create(
    obj: EventApproval,
    participants: EventParticipant[],
  ): Promise<ResponseBase> {
    const t = await seq.sequelize.transaction();
    const resp = new ResponseBase();
    try {
      const whereStatement: any = {};
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatement,
        'eventId',
        obj.eventId,
      );
      sequelizeHelper.where.pushArrayItemIfNotNull(
        whereStatement,
        'address',
        participants.map((x) => x.address),
      );

      let results: EventParticipant[] = (await modelModule[
        SeqModel.name.EventParticipant
      ].findAll({
        where: whereStatement,
        attributes: ['address'],
        transaction: t,
      })) as any;
      results = JSON.parse(JSON.stringify(results));

      if (results.length > 0) {
        return new WarningResponseBase(
          ServerReturnCode.RecordDuplicated,
          `Address (${results
            .map((x) => x.address)
            .join(',')}) already exists for event ${obj.eventId}`,
        );
      }

      let approval: any = await modelModule[SeqModel.name.EventApproval].create(
        obj,
        { transaction: t },
      );
      approval = JSON.parse(JSON.stringify(approval));
      participants = JSON.parse(JSON.stringify(participants));
      const dateNow = moment().utc().toDate();
      obj.lastModifiedDate = dateNow;
      for (const participant of participants) {
        participant.approvalId = approval.id;
        participant.status = EventParticipantStatus.Pending;
        participant.lastModifiedDate = dateNow;
        participant.createdDate = dateNow;
        participant.eventId = approval.eventId;
      }
      const approvalParticipants: any = await modelModule[
        SeqModel.name.EventParticipant
      ].bulkCreate(participants, { transaction: t });
      resp.success = true;
      resp.data = approval;
      await t.commit();
    } catch (ex) {
      logger.error(ex);
      resp.success = false;
      resp.msg = 'Cannot create approval';
      await t.rollback();
    }
    return resp;
  }
  async approve(obj: EventApproval): Promise<ResponseBase> {
    const resp = new ResponseBase();
    try {
      const eventApproval: EventApproval[] = (await modelModule[
        SeqModel.name.EventApproval
      ].findOne({
        where: {
          roundId: obj.roundId as string,
        },
        attributes: ['id'],
      })) as any;
      if (eventApproval) {
        return new WarningResponseBase(
          ServerReturnCode.RecordDuplicated,
          `Event round id duplicated (${obj.roundId})`,
        );
      }
      let eventApprovalInDb: EventApproval = (await modelModule[
        SeqModel.name.EventApproval
      ].findOne({
        where: {
          id: obj.id as string,
        },
        attributes: ['id', 'status'],
      })) as any;
      eventApprovalInDb = JSON.parse(JSON.stringify(eventApprovalInDb));
      if (!eventApprovalInDb) {
        return new WarningResponseBase(
          ServerReturnCode.RecordDuplicated,
          `Event approval not found for id (${obj.id})`,
        );
      } else if (
        eventApprovalInDb &&
        eventApprovalInDb.status != EventApprovalStatus.Pending
      ) {
        return new WarningResponseBase(
          ServerReturnCode.RecordDuplicated,
          `Event approval status already change to ${
            EventApprovalStatus[eventApprovalInDb.status]
          }`,
        );
      }
      const approval: any = await modelModule[
        SeqModel.name.EventApproval
      ].update(obj, {
        where: { id: obj.id as string },
        fields: [
          'lastModifiedDate',
          'approvedDate',
          'status',
          'txHash',
          'roundId',
          'lastModifiedById',
          'approvedById',
        ],
      });

      resp.success = true;
      resp.data = null;
      resp.msg = 'Approved';
    } catch (ex) {
      logger.error(ex);
      resp.success = false;
      resp.msg = 'Cannot update approval';
    }
    return resp;
  }

  async distribute(obj: EventApproval): Promise<ResponseBase> {
    const resp = new ResponseBase();
    const dateNow = moment().utc().toDate();
    obj.lastModifiedDate = dateNow;
    let eventApprovalInDb: EventApproval = (await modelModule[
      SeqModel.name.EventApproval
    ].findOne({
      where: {
        id: obj.id as string,
      },
      attributes: ['id', 'status', 'roundId'],
    })) as any;
    eventApprovalInDb = JSON.parse(JSON.stringify(eventApprovalInDb));
    if (!eventApprovalInDb) {
      return new WarningResponseBase(
        ServerReturnCode.RecordDuplicated,
        `Event approval not found for id (${obj.id})`,
      );
    } else if (
      eventApprovalInDb &&
      eventApprovalInDb.status != EventApprovalStatus.Approved
    ) {
      return new WarningResponseBase(
        ServerReturnCode.RecordDuplicated,
        `Event approval status already change, must be Approved`,
      );
    }
    eventApprovalInDb.lastModifiedDate = moment().utc().toDate();
    eventApprovalInDb.lastModifiedById = obj.lastModifiedById;
    await modelModule[SeqModel.name.EventApproval].update(eventApprovalInDb, {
      fields: ['lastModifiedDate', 'lastModifiedById', 'status'],
      where: {
        id: eventApprovalInDb.id as string,
      },
    });

    let distributions: EventParticipant[] = (await modelModule[
      SeqModel.name.EventParticipant
    ].findAll({
      where: {
        approvalId: obj.id as string,
        status: {
          [Op.in]: [EventParticipantStatus.Pending],
        },
      },
      order: [['id', 'asc']],
    })) as any;
    distributions = JSON.parse(JSON.stringify(distributions));

    const t = await seq.sequelize.transaction();
    try {
      obj.status = EventApprovalStatus.Distributing;
      obj.lastModifiedDate = moment().utc().toDate();
      const result2: any = await modelModule[
        SeqModel.name.EventApproval
      ].update(obj, {
        fields: ['lastModifiedDate', 'status', 'lastModifiedById'],
        where: {
          id: obj.id as string,
        },
        transaction: t,
      });
      await t.commit();
      resp.success = true;
      resp.msg = 'Success';
    } catch (ex: any) {
      logger.error(ex);
      await t.rollback();
      return new ErrorResponseBase(ServerReturnCode.BadRequest, ex.toString());
    }
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
