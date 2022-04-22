import seq from '../sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, QueryTypes, Sequelize } from 'sequelize';
import CommonService from '../../../foundation/server/CommonService';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';
import * as DBModel from '../../../general/model/dbModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
  successResponse,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { MiningRewardsStatus } from '../../../general/model/dbModel/MiningRewards';
import Web3 from 'web3';
import { Payout } from '../../../@types/Payout';
import { AbiItem } from 'web3-utils';
import PayoutArtifact from '../../../abi/Payout.json';
import { MiningRewardsDistributionStatus } from '../../../general/model/dbModel/MiningRewardsDistribution';
import globalVar from '../const/globalVar';
const modelModule = seq.sequelize.models;
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
const contractAddr =
  globalVar.foundationConfig.smartcontract.MappedSwap[
    'OwnedUpgradeableProxy<Payout>'
  ].address;

const abiItems: AbiItem[] = PayoutArtifact as AbiItem[];

export default class Service implements CommonService {
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

    if (!query.recordPerPage || query.recordPerPage > 1000) {
      query.recordPerPage = 1000;
    }

    const results: any = await modelModule[
      SeqModel.name.MiningRewards
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

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    if (query.fromTime) {
      whereStatement.push('date_from >= :fromTime', 'dateFrom', query.dateFrom);
    }
    if (query.toTime) {
      whereStatement.push(
        'dateTo <= :toTime',
        'dateTo',
        query.toTime + ' 23:59:59',
      );
    }

    let token = '';
    if (query.token) {
      if (query.token.toLowerCase() == 'usd') {
        token = USDMiningPoolAddress.toLowerCase();
      } else if (query.token.toLowerCase() == 'btc') {
        token = BTCMiningPoolAddress.toLowerCase();
      } else if (query.token.toLowerCase() == 'eth') {
        token = ETHMiningPoolAddress.toLowerCase();
      }
    }
    if (query.token) {
      whereStatement.push('pool_token = :pool_token', 'pool_token', token);
    }
    if (query.jobId) {
      whereStatement.push('tdmr.id = :jobId', 'jobId', query.jobId);
    }
    if (query.status) {
      whereStatement.push('tdmr.status = :status', 'status', query.status);
    }

    const sql = `
      select tdmr.id, tdmr.date_from as "dateFrom", tdmr.date_to as "dateTo", tdmr.round_id as "roundId", tdmrd."pool_token" as "poolToken", sum(tdmrd.amount) as amount
      from t_decats_mining_rewards tdmr
      left join t_decats_mining_rewards_distribution tdmrd 
      on tdmr.id = tdmrd.job_id
      ${whereStatement.toSql()}
      group by tdmr.id, tdmr.date_from, tdmr.date_to, tdmr.round_id, tdmrd."pool_token", tdmr.id
      order by tdmr.id desc limit :recordPerPage offset (:pageNo - 0) * :recordPerPage
      ;
    `;
    // logger.info(sql);

    const merged = {
      ...whereStatement.replacement,
    };

    const result: any[] = await seq.sequelize.query(sql, {
      replacements: {
        ...merged,
        recordPerPage: query.recordPerPage,
        pageNo: query.pageNo, //agent_id: id,
      },
      type: QueryTypes.SELECT,
    });

    const sumSql = `
      select count(*)
      from (
        select tdmr.id, tdmr.date_from as "dateFrom", tdmr.date_to as "dateTo", tdmr.round_id as "roundId", tdmrd."pool_token" as "poolToken", sum(tdmrd.amount) as amount
        from t_decats_mining_rewards tdmr
        left join t_decats_mining_rewards_distribution tdmrd 
        on tdmr.id = tdmrd.job_id
        ${whereStatement.toSql()}
        group by tdmr.id, tdmr.date_from, tdmr.date_to, tdmr.round_id, tdmrd."pool_token", tdmr.id
      ) as a
    `;
    // logger.info(sumSql);
    const rewardSum: any = await seq.sequelize.query(sumSql, {
      replacements: { ...merged },
      type: QueryTypes.SELECT,
    });

    const returnResult = {
      count: rewardSum[0].count,
      rows: result,
    };

    return returnResult;
  }

  async getAllLedger(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[CommissionDistributionService][getAllLedger](query.agentId : ${query.agentId})`;
    logger.info(funcMsg, { message: ' - start' });
    const whereJobStatment: any = {};
    const whereSummaryStatment: any = {};

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    let token = '';
    if (query.token) {
      if (query.token.toLowerCase() == 'usd') {
        token = USDMiningPoolAddress.toLowerCase();
      } else if (query.token.toLowerCase() == 'btc') {
        token = BTCMiningPoolAddress.toLowerCase();
      } else if (query.token.toLowerCase() == 'eth') {
        token = ETHMiningPoolAddress.toLowerCase();
      }
    }
    if (query.token) {
      whereStatement.push('pool_token = :pool_token', 'pool_token', token);
    }
    if (query.jobId) {
      whereStatement.push('tdmr.id = :jobId', 'jobId', query.jobId);
    }
    if (query.status) {
      whereStatement.push('tdmr.status = :status', 'status', query.status);
    }

    const sql = `
      select tdmr.id, tdmr.date_from as "dateFrom", tdmr.date_to as "dateTo", tdmr.round_id as "roundId", tdmr.status, tdmrd."pool_token" as "poolToken", tdmrd.address, sum(tdmrd.amount) as amount, tdmrd.acquired_date as "acquiredDate"
      from t_decats_mining_rewards tdmr
      left join t_decats_mining_rewards_distribution tdmrd 
      on tdmr.id = tdmrd.job_id
      ${whereStatement.toSql()}
      group by tdmr.id, tdmr.date_from, tdmr.date_to, tdmr.round_id, tdmr.status, tdmrd."pool_token", tdmrd.address, tdmrd.acquired_date, tdmr.id
      order by tdmr.id desc limit :recordPerPage offset (:pageNo - 0) * :recordPerPage
      ;
    `;
    // logger.info(sql);

    const merged = {
      ...whereStatement.replacement,
    };

    const result: any[] = await seq.sequelize.query(sql, {
      replacements: {
        ...merged,
        recordPerPage: query.recordPerPage,
        pageNo: query.pageNo, //agent_id: id,
      },
      type: QueryTypes.SELECT,
    });

    const sumSql = `
      select count(*)
      from t_decats_mining_rewards tdmr 
      left join t_decats_mining_rewards_distribution tdmrd 
      on tdmr.id  = tdmrd.job_id 
      ${whereStatement.toSql()}
    `;
    // logger.info(sumSql);
    const rewardSum: any = await seq.sequelize.query(sumSql, {
      replacements: { ...merged },
      type: QueryTypes.SELECT,
    });

    const returnResult = {
      count: rewardSum[0].count,
      rows: result,
    };

    logger.info(funcMsg + ' - success ');

    return returnResult;
  }

  async approve(
    obj: DBModel.MiningRewards,
    approveAddress: string,
  ): Promise<ResponseBase> {
    const funcMsg = `[MiningRewardsService][approve](obj.id : ${obj.id})`;
    logger.info(funcMsg, { message: ' - start' });
    const t = await seq.sequelize.transaction();
    const whereStatment: any = {};
    let resp = new ResponseBase();
    sequelizeHelper.where.pushExactItemIfNotNull(whereStatment, 'id', obj.id);
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'status',
      MiningRewardsStatus.Finished,
    );

    try {
      const result: any = await modelModule[
        SeqModel.name.MiningRewards
      ].findOne({
        where: whereStatment,
        transaction: t,
      });

      if (!result) {
        await t.rollback();

        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Commission job not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else if (
        result &&
        result.getDataValue('status') != MiningRewardsStatus.Finished
      ) {
        await t.rollback();

        resp = new WarningResponseBase(
          ServerReturnCode.BadRequest,
          `Mining reward status does not allow to be approved(${
            MiningRewardsStatus[result.getDataValue('status')]
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
          await t.rollback();
          logger.error('Only approver of this round can approve this contract');
        } else {
          const updateResult: any = await modelModule[
            SeqModel.name.MiningRewards
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

          const miningRewardsDistribution: DBModel.MiningRewardsDistribution =
            new DBModel.MiningRewardsDistribution();
          miningRewardsDistribution.status =
            MiningRewardsDistributionStatus.NotAcquired;

          const updateChildResult: any = await modelModule[
            SeqModel.name.MiningRewardsDistribution
          ].update(miningRewardsDistribution, {
            where: {
              jobId: obj.id?.toString(),
            },
            fields: ['status'],
          });

          await t.commit();

          const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
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

  async updateMstPrice(jobId: string, mstPrice: string): Promise<ResponseBase> {
    const funcMsg = `[MiningRewardsService][updateMstPrice](jobId : ${jobId}, mstPrice : ${mstPrice})`;
    logger.info(funcMsg, { message: ' - start' });
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();

    const whereStatment: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(whereStatment, 'id', jobId);
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'status',
      MiningRewardsStatus.Created,
    );

    try {
      const result: any = await modelModule[
        SeqModel.name.MiningRewards
      ].findOne({
        where: whereStatment,
        transaction: t,
      });

      if (result) {
        const updateMiningRewardsResult: any = await modelModule[
          SeqModel.name.MiningRewards
        ].update(
          {
            mstExchangeRate: mstPrice,
            status: MiningRewardsStatus.Processing,
          },
          {
            where: whereStatment,
            fields: ['mstExchangeRate', 'status'],
          },
        );

        if (updateMiningRewardsResult[0] > 0) {
          resp.success = true;
          resp.respType = 'success';
          resp.returnCode = ServerReturnCode.Success;
          resp.msg = funcMsg + ' - success ';

          logger.info(resp.msg);

          await t.commit();
        } else {
          await t.rollback();

          resp = new WarningResponseBase(
            ServerReturnCode.RecordNotFound,
            `Update Mining Rewards Result failed with jobId: ${jobId}`,
          );

          logger.info(resp.msg);
        }
      } else {
        await t.rollback();

        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          `Record not found with jobId: ${jobId}`,
        );

        logger.info(resp.msg);
      }
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
