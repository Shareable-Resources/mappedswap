import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import * as ReqModel from '../../../server/dApp/model/reqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { Model, Sequelize, Transaction } from 'sequelize';
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
// import { callPool } from '../../agent/service/CustomerService';
import { defaultAgentId } from '../const';
import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import callPool from '../../../foundation/utils/poolContract/Pool';
import foundationConst from '../../../foundation/const/index';
import {
  ReferralCodeCodeStatus,
  ReferralCodeStatus,
  ReferralCodeType,
} from '../../../general/model/dbModel/ReferralCode';
import {
  checkAgentLevel,
  checkParentAgentRate,
  getFixedLevelPercentage,
} from './AgentService';
import { AgentStatus, AgentType } from '../../../general/model/dbModel/Agent';
import { AbiItem } from 'web3-utils';
import IAgentDataArtifact from '../../../abi/IAgentData.json';
import Web3 from 'web3';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import { IAgentData } from '../../../@types/IAgentData.d';
import { encryptionKey } from '../../../foundation/server/InputEncryptionKey';
import { SignedTransaction } from 'web3-core';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Db from '../../../foundation/sequlelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import UserWalletAbi from '../../../abi/UserWallet.json';
import { UserWallet } from '../../../@types/UserWallet';
// import crypto = require('crypto');
import crypto from 'crypto';
import globalVar from '../const/globalVar';
import ConnectedWallet, {
  ConnectedType,
} from '../../../general/model/dbModel/ConnectedWallet';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async create(
    reqBody: ConnectedWallet,
    t?: Transaction,
  ): Promise<ConnectedWallet> {
    const obj: ConnectedWallet = {
      id: null,
      address: reqBody.address,
      connectedType: reqBody.connectedType,
      createdDate: new Date(),
    };
    const isRollBackFromParent = t ? true : false;
    t = t ? t : await seq.sequelize.transaction();
    let createResult: any;
    try {
      createResult = await modelModule[SeqModel.name.ConnectedWallet].create(
        obj,
        { transaction: t },
      );
      await t.commit();
    } catch (ex) {
      if (isRollBackFromParent) {
        throw ex;
      }
      await t.rollback();
    }

    return createResult;
  }
}
