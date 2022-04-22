import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import sequelize from 'sequelize';
import { QueryTypes } from 'sequelize';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatment: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'agentId',
      query.agentId,
    );

    sequelizeHelper.where.pushArrayItemIfNotNull(
      whereStatment,
      'jobId',
      query.jobIds,
    );
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();
    if (query.jobIds.length > 0) {
      whereStatement.push(
        '"t_decats_commission_ledgers"."job_id" in (:jobIds)',
        'jobIds',
        query.jobIds,
      );
    }
    if (query.agentId) {
      whereStatement.push(
        '"t_decats_commission_ledgers"."agent_id" = :agentId',
        'agentId',
        query.agentId,
      );
    }
    if (!query.withZero) {
      whereStatement.push(
        '"t_decats_commission_ledgers"."dist_commission" > :distCommission',
        'distCommission',
        '0',
      );
    }
    const merged = {
      ...whereStatement.replacement,
    };
    const funcCall: any = await seq.sequelize.query(
      `select
        "t_decats_commission_ledgers"."id",
        "t_decats_commission_ledgers"."job_id" as "jobId",
        "t_decats_commission_ledgers"."token",
        "t_decats_commission_ledgers"."agent_id" as "agentId",
        "distribution"."address" as "address",
        "t_decats_commission_ledgers"."dist_commission" as "distCommission",
        "t_decats_commission_ledgers"."created_date" as "createdDate",
        "job"."date_from" as "dateFrom",
        "job"."date_to" as "dateTo",
        "job"."status" as "status",
        "job"."remark" as "remark",
        "job"."round_id" as "roundId",
        "agent"."name" as "name"
      from
        "public"."t_decats_commission_ledgers" as "t_decats_commission_ledgers"
      left outer join "public"."t_decats_commission_jobs" as "job" on
        "t_decats_commission_ledgers"."job_id" = "job"."id"
      left outer join "public"."t_decats_agents" as "agent" on
        "t_decats_commission_ledgers"."agent_id" = "agent"."id"
      left outer join "public"."t_decats_commission_distributions" as "distribution" on 
          "t_decats_commission_ledgers"."agent_id" = "distribution"."agent_id"
          and 
          "t_decats_commission_ledgers"."job_id" = "distribution"."job_id"
          ${whereStatement.toSql()}
      order by
        "t_decats_commission_ledgers"."created_date" desc
      limit :recordPerPage offset (:pageNo - 0) * :recordPerPage`,
      {
        replacements: {
          ...merged,
          recordPerPage: query.recordPerPage,
          pageNo: query.pageNo,
        },
        type: QueryTypes.SELECT,
      },
    );

    return funcCall;
  }
}
