import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, QueryTypes, Sequelize } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { BalanceStat } from '../model/Report';
import {
  BalanceHistoryStatus,
  BalanceHistoryTypes,
} from '../../../general/model/dbModel/BalanceHistory';
import logger from '../util/ServiceLogger';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getActiveAddresses(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
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
    const returnData: any = await modelModule[
      SeqModel.name.BalanceHistory
    ].findAll({
      attributes: [
        'customerId',
        'address',
        [Sequelize.fn('max', Sequelize.col('created_date')), 'createdDate'],
      ],
      where: whereStatement,
      group: ['customerId', 'address'],
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [[Sequelize.fn('max', Sequelize.col('created_date')), 'desc']],
    });
    return returnData;
  }

  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereBalanceHistoryStatement: any = {};
    const whereCustomerStatment: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereCustomerStatment,
      'agentId',
      query.agentId,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereCustomerStatment,
      'name',
      query.name,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereCustomerStatment,
      'address',
      query.address,
    );

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereBalanceHistoryStatement,
      'token',
      query.token,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereBalanceHistoryStatement,
      'type',
      query.type,
    );

    if (query.dateFrom && query.dateTo) {
      whereBalanceHistoryStatement.updateTime = {
        [Op.between]: [query.dateFrom, query.dateTo + ' 23:59'],
      };
    } else if (query.dateFrom) {
      whereBalanceHistoryStatement.updateTime = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereBalanceHistoryStatement.updateTime = {
        [Op.lte]: query.dateTo,
      };
    }

    const results: any = await modelModule[
      SeqModel.name.BalanceHistory
    ].findAndCountAll({
      include: [
        {
          where: whereCustomerStatment,
          model: modelModule[SeqModel.name.Customer],
          as: 'customer',
        },
      ],
      where: whereBalanceHistoryStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }

  async getStat(query: any): Promise<BalanceStat> {
    //Get sell amount of each token in a range of time
    const funcCall: any = await seq.sequelize.query(
      ` -- 總存款，總提款，淨存款
        -- 1 : Buy
        -- 2 : Sell
        -- 3 : Deposit
        -- 4 : Withdraw
        -- 5 : Interest
        -- 總存款 (3)
        with deposit_cte as (

        select
          t1."type" as type,
          t1."token" as "token",
          coalesce(deposit."amount", 0) as "amount"
        from
          (
          select
            3 as "type",
            "name" as "token"
          from
            t_decats_tokens tdt where tdt."name" <> 'MST') as t1
        left join
        (
          select
            token,
            type,
            coalesce(sum(tdbh.amount), 0) as amount
          from
            t_decats_balances_histories tdbh
          where
            tdbh.created_date between :dateFrom::date  and :dateTo::date 
            and "type" = 3
          group by
            tdbh."type",
            tdbh."token"
        ) as deposit on
          t1."type" = deposit."type" and t1."token"=deposit."token"
        )
        ,
        withdraw_cte as (
        -- 總取款 (4)
        select
            t1."type" as type,
            t1."token" as "token",
            coalesce(withdraw."amount", 0) as "amount"
        from
            (
          select
              4 as "type",
              "name" as "token"
          from
              t_decats_tokens tdt where tdt."name" <> 'MST') as t1
        left join
          (
          select
              token,
              type,
              coalesce(sum(tdbh.amount), 0) as amount
          from
              t_decats_balances_histories tdbh
          where
              tdbh.created_date between :dateFrom::date and :dateTo::date 
            and "type" = 4
          group by
              tdbh."type",
              tdbh."token"
          ) as withdraw on
            t1."type" = withdraw."type"  and t1."token"=withdraw."token"
          )
        select
          d."token" as "token",
          d.amount as deposit,
          w.amount as withdraw,
          d.amount- w.amount as "netDeposit"
        from
          withdraw_cte as w
        inner join  
            deposit_cte as d
            on w."token"=d."token"`,
      {
        replacements: {
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        },
        type: QueryTypes.SELECT,
      },
    );
    return funcCall;
  }

  async getTotalDepositWithdrawAmount(query: any): Promise<any> {
    const funcMsg = `[TransactionService][getTotalDepositWithdrawAmount]`;
    logger.info(funcMsg);

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();
    const whereSellStatement =
      sequelizeHelper.whereQuery.generateWhereClauses();

    if (query.fromTime) {
      whereStatement.push(
        'update_time >= :fromTime',
        'fromTime',
        query.fromTime,
      );

      whereSellStatement.push(
        'update_time >= :fromTime',
        'fromTime',
        query.fromTime,
      );
    }
    if (query.toTime) {
      whereStatement.push('update_time <= :toTime', 'toTime', query.toTime);
      whereSellStatement.push('update_time <= :toTime', 'toTime', query.toTime);
    }
    whereStatement.push(
      'status = :status',
      'status',
      BalanceHistoryStatus.StatusCreated.toString(),
    );
    whereSellStatement.push(
      'status = :status',
      'status',
      BalanceHistoryStatus.StatusCreated.toString(),
    );

    whereStatement.push(
      'type = :typeDeposit',
      'typeDeposit',
      BalanceHistoryTypes.Deposit.toString(),
    );
    whereSellStatement.push(
      'type = :typeWithdraw',
      'typeWithdraw',
      BalanceHistoryTypes.Withdraw.toString(),
    );

    const sql = `
      select token, sum(DepositAmount) DepositAmount, sum(WithdrawAmount) WithdrawAmount
      from (
        select tdbh."token", sum(tdbh.amount) as DepositAmount, 0 WithdrawAmount
        from t_decats_balances_histories tdbh 
        ${whereStatement.toSql()}
        group by tdbh."token" 
        
        union all 
        
        select tdbh."token", 0 as DepositAmount, sum(tdbh.amount) WithdrawAmount
        from t_decats_balances_histories tdbh 
        ${whereSellStatement.toSql()}
        group by tdbh."token" 
      ) a
      group by "token" 
      ;
    `;

    const merged = {
      ...whereStatement.replacement,
    };
    const sellMerged = {
      ...whereSellStatement.replacement,
    };

    const result: any[] = await seq.sequelize.query(sql, {
      replacements: { ...merged, ...sellMerged },
      type: QueryTypes.SELECT,
    });

    return result;
  }
  async getActiveCustomers(query: any): Promise<any> {
    const funcMsg = `[BalanceHistoryService][getActiveCustomers]`;
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    whereStatement.push(
      '"t_decats_balances_histories"."created_date" >= :dateFrom',
      'dateFrom',
      query.dateFrom,
    );
    whereStatement.push(
      '"t_decats_balances_histories"."created_date" <= :dateTo',
      'dateTo',
      query.dateTo,
    );
    if (query.type) {
      whereStatement.push(
        '"t_decats_balances_histories"."type" = :type',
        'type',
        query.type,
      );
    }
    logger.info(funcMsg);
    const sql = `select
                  distinct("customer_id") as "customerId",
                  "customer"."id" as "customer.id",
                  "customer"."address" as "customer.address",
                  "customer"."name" as "customer.name",
                  "customer"."agent_id" as "customer.agentId",
                  "customer"."leverage" as "customer.leverage",
                  "customer"."max_funding" as "customer.maxFunding",
                  "customer"."credit_mode" as "customer.creditMode",
                  "customer"."contract_status" as "customer.contractStatus",
                  "customer"."risk_level" as "customer.riskLevel",
                  "customer"."funding_code_id" as "customer.fundingCodeId",
                  "customer"."type" as "customer.type",
                  "customer"."created_date" as "customer.createdDate",
                  "customer"."created_by_id" as "customer.createdById",
                  "customer"."last_modified_date" as "customer.lastModifiedDate",
                  "customer"."last_modified_by_id" as "customer.lastModifiedById",
                  "customer"."status" as "customer.status"
                from
                  "public"."t_decats_balances_histories" as "t_decats_balances_histories"
                inner join "public"."t_decats_customers" as "customer" on
                  "t_decats_balances_histories"."customer_id" = "customer"."id"
                  ${whereStatement.toSql()}
                limit :limit offset :offset;`;
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
      model: modelModule[SeqModel.name.BalanceHistory],
      type: QueryTypes.SELECT,
    });
    return results;
  }
}
