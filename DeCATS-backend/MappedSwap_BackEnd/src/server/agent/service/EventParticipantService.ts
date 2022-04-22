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
      SeqModel.name.EventParticipant
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
    });
    return results;
  }
}
