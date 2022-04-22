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
import { Model, Op, Sequelize, Transaction } from 'sequelize';
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
import UserWalletAbi from '../../../abi/UserWallet.json';
import { UserWallet } from '../../../@types/UserWallet';
// import crypto = require('crypto');
import crypto from 'crypto';
import { ConnectedType } from '../../../general/model/dbModel/ConnectedWallet';
import Event, { EventStatus } from '../../../general/model/dbModel/Event';
import {
  EventApproval,
  EventParticipant,
} from '../../../general/model/dbModel/0_index';
import Big from 'big.js';
import moment from 'moment';
import { EventApprovalStatus } from '../../../general/model/dbModel/EventApproval';
import { EventParticipantStatus } from '../../../general/model/dbModel/EventParticipant';
import logger from '../util/ServiceLogger';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async create(obj: Event): Promise<ResponseBase> {
    const event: Event = (await modelModule[SeqModel.name.Event].findOne({
      where: { code: obj.code },
    })) as any;
    let result: any = null;
    const resp: ResponseBase = new ResponseBase();
    if (event) {
      return new WarningResponseBase(
        ServerReturnCode.RecordDuplicated,
        'Event code already exists, please try another',
      );
    } else {
      result = await modelModule[SeqModel.name.Event].create(obj);
    }
    resp.success = true;
    resp.data = result;
    resp.msg = 'Created';
    return result;
  }
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
      'status',
      query.status,
    );

    const results: any = await modelModule[SeqModel.name.Event].findAndCountAll(
      {
        where: whereStatement,
        limit: query.recordPerPage,
        subQuery: false,
        offset: query.pageNo * query.recordPerPage,
        attributes: {
          include: [
            [
              Sequelize.fn('COUNT', Sequelize.col('participants.id')),
              'usedQuota',
            ],
            [Sequelize.fn('SUM', Sequelize.col('participants.amt')), 'usedAmt'],
          ],
        },
        include: [
          {
            model: modelModule[SeqModel.name.EventParticipant],
            as: 'participants',
            attributes: [],
          },
        ],
        group: ['t_decats_events.id'],
      },
    );
    return results;
  }
  async getEventDetails(query: any): Promise<Event> {
    const funcMsg = `[EventService][getEventParticipants]`;
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'id',
      query.eventId,
    );
    const result: any = await modelModule[SeqModel.name.Event].findAll({
      include: [
        {
          model: modelModule[SeqModel.name.EventParticipant],
          as: 'participants',
        },
      ],
      where: whereStatement,
    });
    return result;
  }
  async uploadEventParticipants(reqBody: any): Promise<ResponseBase> {
    const funcMsg = `[EventService][uploadEventParticipants]`; // Check event is here
    const resp = new ResponseBase();
    const t: Transaction = await seq.sequelize.transaction();
    try {
      let event: Event = (await modelModule[SeqModel.name.Event].findOne({
        where: { id: reqBody.eventId },
        transaction: t,
      })) as any;

      event = JSON.parse(JSON.stringify(event));
      if (!event) {
        await t.rollback();
        return new WarningResponseBase(
          ServerReturnCode.DatabaseError,
          `Event not existed`,
        );
      } else if (event.status == EventStatus.Inactive) {
        await t.rollback();
        return new WarningResponseBase(
          ServerReturnCode.DatabaseError,
          `Event is inactive`,
        );
      }

      const whereStatement: any = {};
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatement,
        'eventId',
        reqBody.eventId,
      );
      sequelizeHelper.where.pushArrayItemIfNotNull(
        whereStatement,
        'address',
        reqBody.participants.map((x) => x.address),
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
        await t.rollback();
        return new WarningResponseBase(
          ServerReturnCode.DatabaseError,
          `Address (${results
            .map((x) => x.address)
            .join(',')}) already exists for event ${reqBody.eventId}`,
        );
      } else {
        let eventParticipants = (await modelModule[
          SeqModel.name.EventParticipant
        ].findOne({
          attributes: [
            'eventId',
            [Sequelize.fn('sum', Sequelize.col('amt')), 'amt'],
            [Sequelize.fn('count', Sequelize.col('id')), 'count'],
          ],
          where: { eventId: reqBody.eventId },
          group: 'eventId',
          transaction: t,
        })) as any;
        if (!eventParticipants) {
          eventParticipants = {
            eventId: reqBody.eventId,
            amt: '0',
            count: '0',
          };
        }
        eventParticipants = JSON.parse(JSON.stringify(eventParticipants));
        // Create new event approval
        const approval = new EventApproval();
        const dateNow = moment.utc().toDate();
        approval.lastModifiedDate = dateNow;
        approval.status = EventApprovalStatus.Pending;
        approval.txHash = null;
        approval.eventId = event.id as string;
        approval.createdById = reqBody.agentId;
        approval.lastModifiedById = reqBody.agentId;
        approval.createdDate = dateNow;
        approval.amt = reqBody.participants
          .map((x) => x.amt)
          .reduce((a: any, b: any) => new Big(a).plus(new Big(b)).toString());

        //if exceeds quota or budget, throw error
        if (
          event.budget &&
          new Big(approval.amt).plus(eventParticipants.amt).gt(event.budget)
        ) {
          await t.rollback();
          return new WarningResponseBase(
            ServerReturnCode.DatabaseError,
            `Overbudget (${approval.amt}+${eventParticipants.amt} > ${event.budget})`,
          );
        } else if (
          event.quota &&
          new Big(reqBody.participants.length)
            .plus(eventParticipants.count)
            .gt(event.quota)
        ) {
          await t.rollback();
          return new WarningResponseBase(
            ServerReturnCode.DatabaseError,
            `No quota (${reqBody.participants.length}+${eventParticipants.count} > ${event.quota})`,
          );
        }

        let approveCreateResult: EventParticipant = (await modelModule[
          SeqModel.name.EventApproval
        ].create(approval, { transaction: t })) as any;
        approveCreateResult = JSON.parse(JSON.stringify(approveCreateResult));
        reqBody.participants.forEach((x: EventParticipant) => {
          x.approvalId = approveCreateResult.id as string;
          x.createdDate = dateNow;
          x.eventId = event.id as string;
          x.lastModifiedDate = dateNow;
          x.status = EventParticipantStatus.Pending;
        });
        const eventParticipantsCreateResult = (await modelModule[
          SeqModel.name.EventParticipant
        ].bulkCreate(reqBody.participants, { transaction: t })) as any;

        resp.data = {
          approval: approveCreateResult,
          event: event,
          participants: eventParticipantsCreateResult,
          usedQuota: eventParticipants.count,
          usedBudget: eventParticipants.amt,
        };
        resp.success = true;
        resp.msg = `Event approval created success ${approveCreateResult.id}`;
      }
      await t.commit();
    } catch (ex) {
      logger.error(ex);
      await t.rollback();
      throw ex;
    }

    return resp;
  }
}
