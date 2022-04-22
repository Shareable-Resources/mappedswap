import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, QueryTypes, Sequelize } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommissionDistribution, {
  CommissionDistributionStatus,
} from '../../../general/model/dbModel/CommissionDistribution';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import logger from '../util/ServiceLogger';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const funcMsg = `[CommissionDistributionService][getAll]`;
    const whereLedgerStatment: any = {};
    const whereDistStatment: any = {};
    const whereJobStatment: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereDistStatment,
      'status',
      query.distStatus,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereDistStatment,
      'agentId',
      query.agentId,
    );

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereLedgerStatment,
      'agentId',
      query.agentId,
    );

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereJobStatment,
      'status',
      query.status,
    );

    const results: any = await modelModule[
      SeqModel.name.CommissionJob
    ].findAndCountAll({
      where: {},
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      attributes: ['id', 'dateFrom', 'dateTo', 'status', 'roundId'],
      order: [['dateTo', 'DESC']],
      include: [
        {
          separate: true,
          required: false,
          model: modelModule[SeqModel.name.CommissionDistribution],
          as: 'distributions',
          where: whereDistStatment,
        },
        {
          separate: true,
          model: modelModule[SeqModel.name.CommissionLedger],
          as: 'ledgers',
          attributes: ['jobId', 'agentId', 'token', 'distCommission'],
          where: whereLedgerStatment,
        },
      ],
    });
    return results;
  }
  async acquireSuccess(obj: CommissionDistribution): Promise<ResponseBase> {
    const funcMsg = `[CommissionDistributionService][acquireSuccess](obj.jobId : ${obj.jobId})`;
    const t = await seq.sequelize.transaction();
    const whereStatment: any = {};
    let resp = new ResponseBase();
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'agentId',
      obj.agentId,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'jobId',
      obj.jobId,
    );

    try {
      const result = await modelModule[
        SeqModel.name.CommissionDistribution
      ].findOne({
        where: {
          jobId: obj.jobId.toString(),
          agentId: obj.agentId.toString(),
        },
        transaction: t,
      });

      if (!result) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Commission distribution not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else if (
        result &&
        result.getDataValue('status') == CommissionDistributionStatus.Acquired
      ) {
        resp = new WarningResponseBase(
          ServerReturnCode.BadRequest,
          'Commission distribution status has been changed',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        const updateResult: any = await modelModule[
          SeqModel.name.CommissionDistribution
        ].update(obj, {
          transaction: t,
          where: whereStatment,
          fields: ['status', 'acquiredDate', 'txHash', 'txDate'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
        });
        const affectedRowsMsg = `Updated affected rows (${updateResult[0]})`;
        logger.info(funcMsg, {
          message: affectedRowsMsg,
        });
        resp.success = updateResult[0] > 0 ? true : false;
        resp.msg = resp.success ? 'Success' : 'Fail';
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
        'Change distribution status to acquired fail :' + e,
      );
      await t.rollback();
    }
    return resp;
  }

  async getActiveAgents(query: any): Promise<any> {
    const funcMsg = `[CommissionDistributionService][getActiveAgents]`;
    logger.info(funcMsg);
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    whereStatement.push(
      '"t_decats_commission_distributions"."created_date" >= :dateFrom',
      'dateFrom',
      query.dateFrom,
    );
    whereStatement.push(
      '"t_decats_commission_distributions"."created_date" <= :dateTo',
      'dateTo',
      query.dateTo,
    );
    const sql = `select
                    distinct("agent_id") as "agentId",
                    "agent"."address" as "agent.address"
                    from
                    "public"."t_decats_commission_distributions" as "t_decats_commission_distributions"
                    left outer join "public"."t_decats_agents" as "agent" on
                    "t_decats_commission_distributions"."agent_id" = "agent"."id"
                      ${whereStatement.toSql()}
                 limit :limit offset :offset;
                `;
    const merged = {
      ...whereStatement.replacement,
    };
    const results: any[] = await seq.sequelize.query(sql, {
      replacements: {
        ...merged,
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
      },
      mapToModel: true,
      nest: true,
      raw: true, // Without this `nest` hasn't effect, IDK why,
      model: modelModule[SeqModel.name.CommissionDistribution],
      type: QueryTypes.SELECT,
    });
    return results;
  }
}
