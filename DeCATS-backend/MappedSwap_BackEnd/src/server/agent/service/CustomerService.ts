import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { Model, Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import abi from '../../../abi/IPoolAgent.json';
import { IPoolAgent } from '../../../@types/IPoolAgent';
import { CustomerCreditUpdateStatus } from '../../../general/model/dbModel/CustomerCreditUpdate';
import { Mixed } from '../../../foundation/types/Mixed';
import {
  CustomerContractStatus,
  CustomerDefaultDetails,
  CustomerStatus,
} from '../../../general/model/dbModel/Customer';
import { Big } from 'big.js';
import { AgentStatus, AgentType } from '../../../general/model/dbModel/Agent';
import {
  signFundingCode,
  signToken,
} from '../../../foundation/server/Middlewares';
import { LogController } from '../controller/0_index';
import {
  FundingCodeCodeStatus,
  FundingCodeStatus,
  FundingCodeTypeStatus,
} from '../../../general/model/dbModel/FundingCode';
import callPool from '../../../foundation/utils/poolContract/Pool';
import crypto from 'crypto';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      // query.agentId,
      query.agentId,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereStatement,
      'address',
      query.address ? query.address.toLowerCase() : null,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereStatement,
      'name',
      query.name,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      query.status,
    );
    const results: any = await modelModule[
      SeqModel.name.Customer
    ].findAndCountAll({
      include: [
        {
          model: modelModule[SeqModel.name.Agent],
          as: 'agent',
          attributes: ['id', 'name'],
        },
        {
          model: modelModule[SeqModel.name.FundingCode],
          as: 'fundingCode',
        },
      ],
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }

  async getCreditUpdates(query?: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereCustomerStatement: any = {};
    const whereUpdatesStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereCustomerStatement,
      'agentId',
      query.agentId,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereCustomerStatement,
      'name',
      query.name,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereCustomerStatement,
      'address',
      query.address ? query.address.toLowerCase() : null,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereUpdatesStatement,
      'status',
      query.status,
    );

    if (query.dateFrom && query.dateTo) {
      whereUpdatesStatement.txTime = {
        [Op.between]: [query.dateFrom, query.dateTo],
      };
    } else if (query.dateFrom) {
      whereUpdatesStatement.txTime = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereUpdatesStatement.txTime = {
        [Op.lte]: query.dateTo,
      };
    }

    const results: any = await modelModule[
      SeqModel.name.Customer
    ].findAndCountAll({
      include: [
        {
          required: true,
          model: modelModule[SeqModel.name.CustomerCreditUpdate],
          as: 'updates',
          where: whereUpdatesStatement,
        },
      ],
      where: whereCustomerStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
    });
    return results;
  }

  async getTransactions(query?: any): Promise<DBModel.Customer[]> {
    const whereCustomerStatement: any = {};
    const whereUpdatesStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereCustomerStatement,
      'agentId',
      query.agentId,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereCustomerStatement,
      'name',
      query.name,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereCustomerStatement,
      'address',
      query.address ? query.address.toLowerCase() : null,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereUpdatesStatement,
      'status',
      query.status,
    );
    if (query.dateFrom && query.dateTo) {
      whereUpdatesStatement.txTime = {
        [Op.between]: [query.dateFrom, query.dateTo],
      };
    } else if (query.dateFrom) {
      whereUpdatesStatement.txTime = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereUpdatesStatement.txTime = {
        [Op.lte]: query.dateTo,
      };
    }

    const results: any = await modelModule[
      SeqModel.name.Customer
    ].findAndCountAll({
      include: [
        {
          required: true,
          model: modelModule[SeqModel.name.CustomerCreditUpdate],
          as: 'updates',
          where: whereUpdatesStatement,
        },
      ],
      where: whereCustomerStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results as DBModel.Customer[];
  }

  async getById(params?: any): Promise<ResponseBase> {
    const whereStatement: any = {};
    const funcMsg = `[CustomerService][getById](obj.id : ${params})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const result = await modelModule[SeqModel.name.Customer].findOne({
      where: {
        id: params,
      },
    });
    if (!result) {
      resp = new WarningResponseBase(
        ServerReturnCode.RecordNotFound,
        'Customer record not found',
      );
      logger.info(funcMsg + ' - fail ', { message: resp.msg });
    } else {
      resp.data = result;
      resp.success = true;
      resp.msg = 'Record found';

      logger.info(funcMsg + ' - success ', { message: resp.msg });
    }
    return resp;
  }

  async create(obj: DBModel.Customer, t?: any): Promise<ResponseBase> {
    const newObj = obj;
    newObj.id = null;
    const dateNow = new Date();
    if (newObj.address) {
      newObj.address = newObj.address.toLowerCase();
    }
    newObj.createdDate = dateNow;
    newObj.lastModifiedDate = dateNow;
    newObj.contractStatus = CustomerContractStatus.StatusEnabled;
    newObj.status = CustomerStatus.StatusPending;
    const funcMsg = `[CustomerService][create](obj.name : ${newObj.name})`;
    logger.info(funcMsg, { message: ' - start' });
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }
    let resp = new ResponseBase();

    try {
      //default set 10 times
      obj.leverage = CustomerDefaultDetails.leverage;
      obj.maxFunding = CustomerDefaultDetails.maxFunding;
      if (!obj.riskLevel) {
        obj.riskLevel = CustomerDefaultDetails.riskLevel;
      }

      const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
        where: {
          // name: newObj.name,
          address: newObj.address.toLowerCase(),
          status: CustomerStatus.StatusActive,
        },
        // transaction: t,
      });
      if (recordInDb) {
        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Duplicated Record',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        const insertResult: any = await modelModule[
          SeqModel.name.Customer
        ].create(newObj, {
          transaction: t,
        });

        newObj.id = insertResult.id;

        const returnResponse = await this.update(newObj, obj.agentId, true, t);

        if (returnResponse.success) {
          resp.msg = `New user is created. New record id :(${insertResult.id})`;
          resp.success = returnResponse.success;
          resp.returnCode = returnResponse.returnCode;
          resp.respType = returnResponse.respType;
          logger.info(funcMsg + ' - success ', { message: resp.msg });

          if (isNewTransaction) {
            await t.commit();
          }
        } else {
          resp.msg = returnResponse.msg;
          resp.respType = returnResponse.respType;
          resp.returnCode = returnResponse.returnCode;
          resp.success = returnResponse.success;

          logger.error(funcMsg + ' - fail ', { message: resp.msg });

          if (isNewTransaction) {
            await t.rollback();
          }
        }
      }

      // await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Insert user fail :' + e,
      );
      if (isNewTransaction) {
        await t.rollback();
      }
    }
    return resp;
  }

  async update(
    newObj: DBModel.Customer,
    id: Mixed,
    isNew: boolean,
    t: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][update](obj.id : ${newObj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }

    let resp = new ResponseBase();
    const dateNow = new Date();
    newObj.createdDate = dateNow;
    newObj.lastModifiedDate = dateNow;
    try {
      newObj.leverage = CustomerDefaultDetails.leverage;
      newObj.maxFunding = CustomerDefaultDetails.maxFunding;
      // newObj.creditMode = 1;

      if (process.env.NODE_ENV != 'dev' && process.env.NODE_ENV != 'local') {
        newObj.riskLevel = CustomerDefaultDetails.riskLevel;
      }

      //Validate the record is in db
      const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
        where: {
          // address: newObj.address,
          id: newObj.id,
        },
        transaction: t,
      });
      if (!recordInDb) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Customer record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        const recordDuplicatedInDb = await modelModule[
          SeqModel.name.Customer
        ].findOne({
          where: {
            // address: newObj.address,
            id: newObj.id,
            riskLevel: newObj.riskLevel,
            //enable: newObj.enable,
            // contractStatus: newObj.contractStatus,
          },
          transaction: t,
        });

        newObj.address = recordInDb.getDataValue('address').toLowerCase();
        newObj.agentId = recordInDb.getDataValue('agentId');
        newObj.creditMode = recordInDb.getDataValue('creditMode');

        if (recordDuplicatedInDb && !isNew) {
          const returnResp = await this.updateCustomerDetails(newObj, true, t);

          resp.success = returnResp.success;
          resp.msg = returnResp.msg;
          resp.returnCode = returnResp.returnCode;
          resp.respType = returnResp.respType;

          logger.info(resp.msg);
        } else {
          const customerCreditUpdateObj: DBModel.CustomerCreditUpdate =
            new DBModel.CustomerCreditUpdate();
          customerCreditUpdateObj.id = null;
          customerCreditUpdateObj.address = newObj.address;
          customerCreditUpdateObj.customerId = newObj.id!.toString();
          customerCreditUpdateObj.agentId = id;
          customerCreditUpdateObj.txHash = Date.now().toString();
          // customerCreditUpdateObj.gasFee = receipt.gasUsed;
          customerCreditUpdateObj.txTime = new Date();
          customerCreditUpdateObj.createdDate = new Date();
          customerCreditUpdateObj.createdById = id;
          customerCreditUpdateObj.lastModifiedDate = new Date();
          customerCreditUpdateObj.lastModifiedById = id;
          customerCreditUpdateObj.status =
            CustomerCreditUpdateStatus.StatusPending;

          const receipt: any = await callPool(
            newObj.address,
            newObj.maxFunding,
            newObj.riskLevel,
            newObj.contractStatus,
            newObj.creditMode,
            newObj.leverage,
            logger,
            // customerCreditUpdateObj,
          );
          // console.log("receipt at customer: ", receipt);

          if (
            receipt !== undefined &&
            receipt.status !== undefined &&
            receipt.status
          ) {
            logger.info(receipt.status);

            customerCreditUpdateObj.gasFee = receipt.gasUsed;
            customerCreditUpdateObj.txHash = receipt.transactionHash;
            customerCreditUpdateObj.txStatus = receipt.status ? 1 : 0;
            customerCreditUpdateObj.status =
              CustomerCreditUpdateStatus.StatusActive;

            if (!isNew) {
              await this.updateCustomerDetails(newObj, false, t);

              const affectedRowsMsg = `Customer Updated`;
              logger.info(funcMsg, {
                message: affectedRowsMsg,
              });
              resp.success = true;
              resp.msg = affectedRowsMsg;
              resp.returnCode = ServerReturnCode.Success;
              resp.respType = 'success';
            } else {
              const returnResp = await this.updateCustomerStatus(
                newObj,
                CustomerStatus.StatusActive,
                t,
              );

              resp.success = returnResp.success;
              resp.msg = returnResp.msg;
              resp.returnCode = returnResp.returnCode;
              resp.respType = returnResp.respType;

              logger.info(resp.msg);
            }
          } else {
            // resp = new ErrorResponseBase(
            //   ServerReturnCode.InternalServerError,
            //   'Update contract fail',
            // );

            if (receipt !== undefined && receipt.status !== undefined) {
              logger.info(receipt.status);
            } else {
              resp.msg = receipt;
            }

            if (isNew) {
              const returnResp = await this.updateCustomerStatus(
                newObj,
                CustomerStatus.StatusInactive,
                t,
              );

              resp.success = false;
              resp.msg = 'Customer failed to add contract';
              resp.returnCode = ServerReturnCode.InternalServerError;
              resp.respType = 'warning';

              logger.info(resp.msg);

              if (isNewTransaction) {
                await t.rollback();
              }
            }
          }
        }
      }

      if (isNewTransaction) {
        await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
        // t.afterCommit;
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
      if (isNewTransaction) {
        await t.rollback();
      }
      // } finally {
      //   if (t) {
      //     // t.rollback();
      //   }
    }
    return resp;
  }

  async updateCustomerDetails(
    newObj: DBModel.Customer,
    isNoCreditUpdate: boolean,
    t: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][updateCustomerDetails](obj.address : ${newObj.address})`;
    logger.info(funcMsg, { message: ' - start' });
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }
    let resp = new ResponseBase();
    const dateNow = new Date();
    newObj.lastModifiedDate = dateNow;
    newObj.status = CustomerStatus.StatusActive;

    try {
      //Validate the record is in db
      const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
        where: {
          id: newObj.id,
        },
        transaction: t,
      });
      if (!recordInDb) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Customer record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        // console.log("newObj.credit: ", newObj.credit);
        // let credit: string = newObj.credit + '';

        let updateResult: any;
        if (isNoCreditUpdate) {
          updateResult = await modelModule[SeqModel.name.Customer].update(
            newObj,
            {
              transaction: t,
              where: {
                id: newObj.id,
              },
              fields: [
                'name',
                'contractStatus',
                'riskLevel',
                'lastModifiedDate',
              ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
            },
          );
        } else {
          updateResult = await modelModule[SeqModel.name.Customer].update(
            newObj,
            {
              transaction: t,
              where: {
                id: newObj.id,
              },
              fields: [
                'name',
                'contractStatus',
                'riskLevel',
                'lastModifiedDate',
              ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
            },
          );
        }

        const affectedRowsMsg = `updateCustomerDetails affected rows (${updateResult[0]})`;
        logger.info(funcMsg, {
          message: affectedRowsMsg,
        });
        resp.success = updateResult[0] > 0 ? true : false;
        resp.msg = affectedRowsMsg;
        resp.returnCode =
          updateResult[0] > 0
            ? ServerReturnCode.Success
            : ServerReturnCode.InternalServerError;
        resp.respType = updateResult[0] > 0 ? 'success' : 'warning';
      }

      if (isNewTransaction) {
        await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
      if (isNewTransaction) {
        await t.rollback();
      }
    }
    return resp;
  }

  async updateCustomerStatus(
    newObj: DBModel.Customer,
    statusCode: number,
    t: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][updateCustomerStatus](obj.address : ${newObj.address})`;
    logger.info(funcMsg, { message: ' - start' });
    const isNewTransaction = false;

    if (!t) {
      t = await seq.sequelize.transaction();
    }

    let resp = new ResponseBase();
    const dateNow = new Date();
    newObj.lastModifiedDate = dateNow;
    newObj.status = statusCode;

    try {
      //Validate the record is in db
      const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
        where: {
          id: newObj.id,
        },
        transaction: t,
      });
      if (!recordInDb) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Customer record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        // console.log("newObj.credit: ", newObj.credit);
        // let credit: string = newObj.credit + '';

        const updateResult: any = await modelModule[
          SeqModel.name.Customer
        ].update(newObj, {
          transaction: t,
          where: {
            id: newObj.id,
          },
          fields: ['contractStatus', 'status', 'lastModifiedDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
        });

        const affectedRowsMsg = `updateCustomerDetails affected rows (${updateResult[0]})`;
        logger.info(funcMsg, {
          message: affectedRowsMsg,
        });
        resp.success = updateResult[0] > 0 ? true : false;
        resp.msg = affectedRowsMsg;
        resp.returnCode =
          updateResult[0] > 0
            ? ServerReturnCode.Success
            : ServerReturnCode.InternalServerError;
        resp.respType = updateResult[0] > 0 ? 'success' : 'warning';
      }

      if (isNewTransaction) {
        await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
      if (isNewTransaction) {
        await t.rollback();
      }
    }
    return resp;
  }

  async genFundingCode(
    obj: DBModel.FundingCode,
    id: number,
    t?: any,
  ): Promise<ResponseBase> {
    const funcMsg = `[CustomerService][genFundingCode](id : ${id})`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    let isNewTransaction = false;
    if (!t) {
      t = await seq.sequelize.transaction();
      isNewTransaction = true;
    }
    const dateNow = new Date();
    // const tomorrow = dateNow.setDate(dateNow.getDate() + 1);
    const tomorrow = new Date(
      dateNow.getTime() + 1000 * 60 * 60 * 24,
    ).toDateString();

    if (!obj.expiryDate) {
      obj.expiryDate = new Date(tomorrow);
    }
    const expiryDate = new Date(obj.expiryDate);
    // get total seconds between the times
    const delta = Math.abs(expiryDate.valueOf() - dateNow.valueOf()) / 1000;
    // calculate (and subtract) whole days
    const dayDiff = Math.ceil(delta / 86400);

    const unixTime = Math.round(new Date().getTime() / 1000);
    // const xxx = Math.round(new Date().getTime() / 1000 / 10000);
    const randomHex = crypto.randomBytes(2).toString('hex');
    const unixTimeHex = unixTime.toString(16);

    try {
      const recordInDb = await modelModule[SeqModel.name.Agent].findOne({
        where: {
          id: id,
        },
        transaction: t,
      });

      if (recordInDb) {
        // const num = await makeId();
        // const hashString = num + dateNow + id + obj.customerName;
        // const hashed = await hashIt(hashString);

        // const hashed = await signToken({
        //   createdDate: dateNow,
        //   expiry: tomorrow,
        //   type: 'FundingCode',
        // });

        // const hashed = await signFundingCode({ expiry }, dayDiff);

        // let hashed: any;
        // if (obj.type == FundingCodeTypeStatus.ForeverUse) {
        //   hashed = await signFundingCode({}, null);
        // } else {
        //   hashed = await signFundingCode({}, dayDiff + 'd');
        // }

        let fundingCode = (randomHex + unixTimeHex).toUpperCase();
        let isFundingDuplicated = true;

        while (isFundingDuplicated) {
          const checkFundingCodeDuplicated = await modelModule[
            SeqModel.name.FundingCode
          ].findOne({
            where: {
              fundingCode: fundingCode,
              status: FundingCodeStatus.StatusActive,
            },
            transaction: t,
          });

          if (!checkFundingCodeDuplicated) {
            isFundingDuplicated = false;
          } else {
            logger.info(
              `FundingCode duplicated ${fundingCode}, now regenerate again`,
            );
            fundingCode = (randomHex + unixTimeHex).toUpperCase();
          }
        }

        const hashed = fundingCode;

        const parentAgentId = recordInDb.getDataValue('parentAgentId');
        let isRootAgent = false;
        if (!parentAgentId) {
          isRootAgent = true;
        }

        obj.agentId = id;
        // obj.hashString = hashString;
        obj.isUsed = false;
        obj.codeStatus = FundingCodeCodeStatus.StatusActive;
        obj.createdDate = dateNow;
        obj.createdById = id;
        obj.lastModifiedDate = dateNow;
        obj.lastModifiedById = id;
        obj.status = FundingCodeStatus.StatusActive;

        if (isRootAgent) {
          obj.agentType = AgentType.MST;
          obj.type = FundingCodeTypeStatus.OneTimeUse;
        } else {
          obj.agentType = recordInDb.getDataValue('agentType');
        }

        if (hashed) {
          const fundingCode: string = hashed.substring(
            hashed.indexOf('.') + 1,
            hashed.length,
          );
          // obj.fundingCode = fundingCode;
          // obj.hashString = hashed.substring(0, hashed.indexOf('.'));
          obj.fundingCode = fundingCode;
          obj.hashString = '';

          const insertResult: any = await modelModule[
            SeqModel.name.FundingCode
          ].create(obj, {
            transaction: t,
          });

          resp.success = true;
          resp.data = fundingCode;
          resp.msg = 'Generate funding code successs';
          logger.info(hashed);
          logger.info(resp.msg);
        } else {
          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            'failed to gen funding code',
          );
          logger.info(funcMsg + ' - fail ', { message: resp.msg });
        }
      } else {
        resp = new WarningResponseBase(
          ServerReturnCode.UniqueViolationError,
          'Agent Record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      }

      if (isNewTransaction) {
        await t.commit();
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'generate funding code fail :' + e,
      );

      if (isNewTransaction) {
        await t.rollback();
      }
    }

    return resp;
  }

  async getAllFundingCode(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      FundingCodeStatus.StatusActive,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      query.agentId,
    );

    const results: any = await modelModule[
      SeqModel.name.FundingCode
    ].findAndCountAll({
      include: [
        {
          attributes: ['address'],
          model: modelModule[SeqModel.name.Customer],
          where: Sequelize.literal(
            '"t_decats_funding_code"."type" = ' +
              "'" +
              FundingCodeTypeStatus.OneTimeUse.toString() +
              "'",
          ),
          required: false,
          as: 'customer',
        },
      ],
      raw: true,
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    return results;
  }

  async updateFundingCode(newObj: DBModel.FundingCode): Promise<ResponseBase> {
    const funcMsg = `[AgentService][updateFundingCode](obj.FundingCode : ${newObj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    const dateNow = new Date();
    newObj.lastModifiedDate = dateNow;

    if (newObj.fundingCode) {
      newObj.fundingCode = newObj.fundingCode.toUpperCase();
    }

    try {
      const result = await modelModule[SeqModel.name.FundingCode].findOne({
        where: {
          // id: newObj.id,
          fundingCode: newObj.fundingCode,
        },
        transaction: t,
      });

      if (!result) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Funding Code not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        const updateResult: any = await modelModule[
          SeqModel.name.FundingCode
        ].update(newObj, {
          transaction: t,
          where: {
            // id: newObj.id?.toString(),
            fundingCode: newObj.fundingCode,
          },
          fields: ['codeStatus', 'lastModifiedDate', 'lastModifiedById'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
        });
        const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
        logger.info(funcMsg, {
          message: affectedRowsMsg,
        });
        resp.success = updateResult[0] > 0 ? true : false;
        resp.msg = affectedRowsMsg;
        resp.returnCode =
          updateResult[0] > 0
            ? ServerReturnCode.Success
            : ServerReturnCode.InternalServerError;
        resp.respType = updateResult[0] > 0 ? 'success' : 'warning';
      }
      await t.commit();
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Update user fail :' + e,
      );
      await t.rollback();
    }

    return resp;
  }
}

/*
export async function callPool(
  customer_address: string,
  credit: any,
  newRiskLevel: number,
  newEnableStatus: number,
  newMode: number | string,
  newLeverage: number | string,
  newObj: DBModel.CustomerCreditUpdate,
) {
  const RPC_HOST = foundationConfig.rpcHost;
  // const POOL_ADDRESS = foundationConfig.smartcontract.MappedSwap.POOL_ADDRESS;
  const POOL_ADDRESS =
    foundationConfig.smartcontract.MappedSwap['OwnedUpgradeableProxy<Pool>']
      .address;

  const web3 = new Web3(RPC_HOST);
  // const abiItems: AbiItem[] = abi['abi'] as AbiItem[];
  const abiItems: AbiItem[] = abi as AbiItem[];

  const service: Service = new Service();

  try {
    const fromWei = web3.utils.fromWei;

    const pool = new web3.eth.Contract(
      abiItems,
      POOL_ADDRESS,
    ) as any as IPoolAgent;

    // const web3Account = web3.eth.accounts.privateKeyToAccount('5555fe01770a5c6dc621f00465e6a0f76bbd4bc1edbde5f2c380fcb00f354b99');
    // const web3Account = web3.eth.accounts.privateKeyToAccount(
    //   config.poolContract.privateKeyToAccount,
    // );\
    const web3Account = web3.eth.accounts.privateKeyToAccount(
      // foundationConfig.smartcontract.MappedSwap.privateKeyToAccount,
      foundationConfig.smartcontract.MappedSwap.privateKey.dApp,
    );

    logger.info(
      'customer_address: ' +
        customer_address +
        ', newMode: ' +
        newMode +
        ', newLeverage: ' +
        newLeverage +
        ', credit: ' +
        web3.utils.toBN(credit) +
        ', newRiskLevel: ' +
        newRiskLevel +
        ', newEnableStatus: ' +
        newEnableStatus,
    );

    // const txnData = web3.eth.abi.encodeFunctionCall({
    //     name: "updateCustomerDetails",
    //     type: 'function',
    //     inputs:
    //         [
    //             {
    //             "name": "customer",
    //             "type": "address"
    //             },
    //             {
    //             "name": "newCredit",
    //             "type": "uint256"
    //             },
    //             {
    //             "name": "newRiskLevel",
    //             "type": "int256"
    //             },
    //             {
    //             "name": "newEnableStatus",
    //             "type": "bool"
    //             }
    //         ],
    // }, ["0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", "true"]);
    // // }, [customer_address, newCredit, newRiskLevel, newEnableStatus]);

    // console.log(pool.methods);
    const tx = {
      // this could be provider.addresses[0] if it exists
      from: web3Account.address,
      // target address, this could be a smart contract address
      to: POOL_ADDRESS,
      gasPrice: '0x8F0D1800',
      // optional if you want to specify the gas limit
      gas: '0xAA690',
      // optional if you are invoking say a payable function
      value: '0x00',
      // this encodes the ABI of the method and the arguements
      // data: pool.methods.updateCustomerDetails("0x39EB6463871040f75C89C67ec1dFCB141C3da1cf", "100", "50", true).encodeABI(),
      data: pool.methods
        .updateCustomerDetails(
          customer_address,
          newMode,
          newLeverage,
          web3.utils.toBN(credit),
          newRiskLevel,
          newEnableStatus,
        )
        .encodeABI(),
      // data: pool.methods.updateCustomerDetails(customer_address, '11111', newRiskLevel, newEnableStatus).encodeABI(),
    };

    // logger.info('tx');
    logger.info('tx.data: ' + tx.data);

    // const signTxResult: transactionHash = await web3Account.signTransaction(tx);
    const signTxResult: any = await web3Account.signTransaction(tx);
    logger.info(
      'signTxResult.transactionHash: ' + signTxResult.transactionHash,
    );

    // newObj.txHash = signTxResult.transactionHash;
    // await service.createCustomerCreditHistory(newObj, null);

    const myReceipt: any = await web3.eth
      .sendSignedTransaction(signTxResult.rawTransaction)
      .on('transactionHash', function (transactionHash) {
        logger.info('transactionHash: ' + transactionHash);
      })
      .on('receipt', function (receipt) {
        logger.info('receipt: ' + receipt.status);
        return receipt;
      });
    // .on('error', function (error) {
    //   // logger.error(error);
    //   throw error;
    // });

    return myReceipt;
    // return obj;
  } catch (e: any) {
    logger.error(e);
    return e;
  }
}
*/
