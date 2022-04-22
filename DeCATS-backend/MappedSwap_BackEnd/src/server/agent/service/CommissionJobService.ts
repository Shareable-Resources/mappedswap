import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import CommissionJob, {
  CommissionJobStatus,
} from '../../../general/model/dbModel/CommissionJob';
import PayoutArtifact from '../../../abi/Payout.json';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import CommissionLedger from '../../../general/model/dbModel/CommissionLedger';
import CommissionDistribution, {
  CommissionDistributionStatus,
} from '../../../general/model/dbModel/CommissionDistribution';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Payout } from '../../../@types/Payout';
import moment from 'moment';
import globalVar from '../const/globalVar';
import { CronJob } from '../../../general/model/dbModel/0_index';
import { CronJobStatus } from '../../../general/model/dbModel/CronJob';
const modelModule = seq.sequelize.models;
const abiItems: AbiItem[] = PayoutArtifact as AbiItem[];
const contractAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedUpgradeableProxy<Payout>'
  ].address;

export default class Service implements CommonService {
  async enterMSTRate(reqBody: CronJob): Promise<ResponseBase> {
    const funcMsg = `[CommissionJobnService][enterMSTRate](obj.jobId : ${reqBody.id})`;
    const whereStatment: any = {};
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    try {
      sequelizeHelper.where.pushExactItemIfNotNull(
        whereStatment,
        'id',
        reqBody.id,
      );
      let result: CronJob | undefined = (await modelModule[
        SeqModel.name.CronJob
      ].findOne({
        where: whereStatment,
        transaction: t,
      })) as any;
      result = JSON.parse(JSON.stringify(result));
      if (result) {
        if (result.status != CronJobStatus.Created) {
          const msg =
            'CronJob status is changed (Only [Created] cron job can enter mst rate)';
          resp = new WarningResponseBase(ServerReturnCode.StatusChanged, msg);
          logger.info(funcMsg + ' - fail ', { message: msg });
        } else {
          result.lastModifiedDate = new Date();
          result.status = CronJobStatus.Processing;
          result.mstToUSDMExchangeRate = reqBody.mstToUSDMExchangeRate;
          result.lastModifiedById = reqBody.lastModifiedById;
          const updateResult: any = await modelModule[
            SeqModel.name.CronJob
          ].update(result, {
            transaction: t,
            where: whereStatment,
            fields: [
              'status',
              'lastModifiedDate',
              'lastModifiedById',
              'mstToUSDMExchangeRate',
            ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
          });

          const isUpdateSuccess = updateResult[0] > 0 ? true : false;
          resp.msg = isUpdateSuccess
            ? `Cron Job MST rate is updated`
            : `Cron Job MST rate is not updated`;
          resp.respType = isUpdateSuccess ? 'success' : 'warning';
          resp.returnCode = isUpdateSuccess
            ? ServerReturnCode.Success
            : ServerReturnCode.UpdateFail;
          resp.success = isUpdateSuccess;
        }
      }
      await t.commit();
    } catch (ex) {
      logger.error(ex);
      await t.rollback();
    }

    return resp;
  }

  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatment: any = {};

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'status',
      query.status,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'cronJobId',
      query.cronJobId,
    );

    const results: any = await modelModule[
      SeqModel.name.CommissionJob
    ].findAndCountAll({
      where: whereStatment,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }

  async getAllSummary(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[CommissionDistributionService][getAllSummary](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const whereJobStatment: any = {};
    const whereSummaryStatment: any = {};

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereJobStatment,
      'status',
      query.status,
    );

    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereJobStatment,
      'remark',
      query.remark,
    );

    sequelizeHelper.where.pushArrayItemIfNotNull(
      whereJobStatment,
      'id',
      query.jobIds,
    );

    if (query.dateFrom && query.dateTo) {
      whereJobStatment.createdDate = {
        [Op.between]: [query.dateFrom, query.dateTo],
      };
    } else if (query.dateFrom) {
      whereJobStatment.createdDate = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereJobStatment.createdDate = {
        [Op.lte]: query.dateTo,
      };
    }
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereSummaryStatment,
      'token',
      query.token,
    );

    const results: any = await modelModule[
      SeqModel.name.CommissionJob
    ].findAndCountAll({
      include: [
        {
          separate: true,
          model: modelModule[SeqModel.name.CommissionSummary],
          as: 'summaries',
          where: whereSummaryStatment,
        },
      ],
      where: whereJobStatment,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });

    return results;
  }
  async approve(
    obj: CommissionJob,
    approveAddress: string,
  ): Promise<ResponseBase> {
    const funcMsg = `[CommissionJobnService][approve](obj.id : ${obj.id})`;
    const t = await seq.sequelize.transaction();
    const whereStatment: any = {};
    const whereLedgerStatment: any = {};
    let resp = new ResponseBase();
    sequelizeHelper.where.pushExactItemIfNotNull(whereStatment, 'id', obj.id);
    try {
      const result: any = await modelModule[
        SeqModel.name.CommissionJob
      ].findOne({
        where: whereStatment,
        transaction: t,
      });

      if (!result) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Commission job not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else if (
        result &&
        result.getDataValue('status') != CommissionJobStatus.Created
      ) {
        resp = new WarningResponseBase(
          ServerReturnCode.BadRequest,
          `Commission job status does not allow to be approved(${
            CommissionJobStatus[result.getDataValue('status')]
          }) `,
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        // const web3 = new Web3(globalVar.foundationConfig.rpcHost);
        const web3 = new Web3(globalVar.foundationConfig.rpcHostHttp);
        const payoutContract: Payout = new web3.eth.Contract(
          abiItems,
          contractAddr,
        ) as any;
        const contractCall: any = await payoutContract.methods
          .getRoundSummary(result.roundId)
          .call();
        if (
          contractCall.approveTime == '0' ||
          contractCall.approver.toLowerCase() != approveAddress.toLowerCase()
        ) {
          logger.error('Only approver of this round can approve this contract');
        } else {
          const updateResult: any = await modelModule[
            SeqModel.name.CommissionJob
          ].update(obj, {
            transaction: t,
            where: whereStatment,
            fields: [
              'status',
              'approvedById',
              'approvedDate',
              'lastModifiedById',
              'lastModifiedDate',
            ], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
          });
          const affectedRowsMsg = `Upd ated affected rows (${updateResult[0]})`;
          logger.info(funcMsg, {
            message: affectedRowsMsg,
          });
          const isStatusUpdated = updateResult[0] > 0 ? true : false;

          resp.success = isStatusUpdated;
          resp.msg = resp.success ? 'Success' : 'Fail';
          resp.returnCode =
            updateResult[0] > 0
              ? ServerReturnCode.Success
              : ServerReturnCode.InternalServerError;
          resp.respType = updateResult[0] > 0 ? 'success' : 'warning';
        }
      }

      await t.commit();
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Change commission job status to approved fail :' + e,
      );
      await t.rollback();
    }
    return resp;
  }
}
