import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { Model, Op, QueryTypes, Sequelize } from 'sequelize';
import { TransactionHistories } from '../model/TransactionHistories';
import { TransactionHistoriesWithCoins } from '../model/TransactionHistoriesWithCoins';
import { TransactionStat } from '../model/Report';
import {
  ErrorResponseBase,
  ResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import * as DBModel from '../../../general/model/dbModel/0_index';
import { BurnTransactionsStatus } from '../../../general/model/dbModel/BurnTransactions';
import { BuyBackDetailsStatus } from '../../../general/model/dbModel/BuyBackDetails';
import { TransactionStatus } from '../../../general/model/dbModel/Transaction';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<TransactionHistoriesWithCoins> {
    const whereStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();
    const whereUsdmStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();
    const whereEthmStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();
    const whereBtcmStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();

    // if (query.buyToken) {
    //   whereStatement.push('buy_token >= :buyToken', 'buyToken', query.buyToken);
    // }
    // if (query.sellToken) {
    //   whereStatement.push(
    //     'sell_token <= :sellToken',
    //     'sellToken',
    //     query.sellToken,
    //   );
    // }
    if (query.dateFrom && query.dateTo) {
      whereStatement.push('tx_time >= :dateFrom', 'dateFrom', query.dateFrom);
      whereStatement.push(
        'tx_time <= :dateTo',
        'dateTo',
        query.dateTo + ' 23:59',
      );
    } else if (query.dateFrom) {
      whereStatement.push('tx_time >= :dateFrom', 'dateFrom', query.dateFrom);
    } else if (query.dateTo) {
      whereStatement.push(
        'tx_time <= :dateTo',
        'dateTo',
        query.dateTo + ' 23:59',
      );
    }

    if (query.txStatus) {
      whereStatement.push('tx_status = :txStatus', 'txStatus', query.txStatus);
    }
    if (query.address) {
      whereStatement.push('tdt.address = :address', 'address', query.address);
    }
    if (query.name) {
      whereStatement.push('name = :name', 'name', query.name);
    }
    if (query.sellToken) {
      whereStatement.push(
        'sell_token = :sellToken',
        'sellToken',
        query.sellToken,
      );
    }
    if (query.buyToken) {
      whereStatement.push('buy_token = :buyToken', 'buyToken', query.buyToken);
    }
    whereStatement.push('tdc.agent_id = :agent_id', 'agent_id', query.agentId);

    whereUsdmStatement.push('sell_token = :sellToken', 'sellToken', 'USDM');
    whereUsdmStatement.push('agent_id = :agentId', 'agentId', query.agentId);
    whereEthmStatement.push('sell_token = :sellToken', 'sellToken', 'ETHM');
    whereEthmStatement.push('agent_id = :agentId', 'agentId', query.agentId);
    whereBtcmStatement.push('sell_token = :sellToken', 'sellToken', 'BTCM');
    whereBtcmStatement.push('agent_id = :agentId', 'agentId', query.agentId);

    const resultsUSDM: any = await modelModule[
      SeqModel.name.Transaction
    ].findAll({
      attributes: [
        (Sequelize.fn('sum', Sequelize.col('sellAmount')), 'sellAmount'),
      ],
      where: whereUsdmStatement.replacement,
      group: ['sellAmount'],
    });
    const resultsETHM: any = await modelModule[
      SeqModel.name.Transaction
    ].findAll({
      attributes: [
        (Sequelize.fn('sum', Sequelize.col('sellAmount')), 'sellAmount'),
      ],
      where: whereEthmStatement.replacement,
      group: ['sellAmount'],
    });

    const resultsBTCM: any = await modelModule[
      SeqModel.name.Transaction
    ].findAll({
      attributes: [
        (Sequelize.fn('sum', Sequelize.col('sellAmount')), 'sellAmount'),
      ],
      where: whereBtcmStatement.replacement,
      group: ['sellAmount'],
    });

    const resultsUSDMJson = JSON.parse(JSON.stringify(resultsUSDM));
    const resultsETHMJson = JSON.parse(JSON.stringify(resultsETHM));
    const resultsBTCMJson = JSON.parse(JSON.stringify(resultsBTCM));

    const merged = {
      ...whereStatement.replacement,
    };

    const transactionHistorySql = `
      select tdt.tx_hash as "txHash", tdc.address, tdc."name", tdt.sell_token as "sellToken", tdt.sell_amount as "sellAmount", tdt.buy_token as "buyToken", tdt.buy_amount as "buyAmount", tdt.tx_time as "txTime", tdt.tx_status as "txStatus", tdt.stopout as "stopout"
      from t_decats_transactions tdt 
      inner join t_decats_customers tdc 
      on tdt.customer_id = tdc.id 
        ${whereStatement.toSql()}  
      order by tdt.id desc limit :recordPerPage offset (:pageNo - 0) * :recordPerPage
      ;
    `;
    logger.info(transactionHistorySql);
    const transactionHistories: TransactionHistories[] =
      await seq.sequelize.query(transactionHistorySql, {
        replacements: {
          ...merged,
          recordPerPage: query.recordPerPage,
          pageNo: query.pageNo,
        },
        type: QueryTypes.SELECT,
      });

    const transactionHistorySumSql = `
      select count(tdt.*)
      from t_decats_transactions tdt
      inner join t_decats_customers tdc 
      on tdt.customer_id = tdc.id 
      ${whereStatement.toSql()}
    `;
    logger.info(transactionHistorySumSql);
    const transactionHistorySum: any = await seq.sequelize.query(
      transactionHistorySumSql,
      {
        replacements: { ...merged },
        type: QueryTypes.SELECT,
      },
    );

    const transactionHistorySumJson = JSON.parse(
      JSON.stringify(transactionHistorySum),
    );

    const transactionHistoriesWithCoins: TransactionHistoriesWithCoins = {
      rows: transactionHistories,
      count:
        transactionHistorySumJson.length > 0
          ? transactionHistorySumJson[0]['count']
          : 0,
      USDM: resultsUSDMJson.length > 0 ? resultsUSDMJson[0]['sellAmount'] : '',
      ETHM: resultsETHMJson.length > 0 ? resultsETHMJson[0]['sellAmount'] : '',
      BTCM: resultsBTCMJson.length > 0 ? resultsBTCMJson[0]['sellAmount'] : '',
    };

    return transactionHistoriesWithCoins;
  }

  async getStat(query: any): Promise<TransactionStat> {
    const whereStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();

    //Get sell amount of each token in a range of time
    const funcCall: any = await seq.sequelize.query(
      `select
      t_token."name" as "token",
      coalesce(sell_amount, 0) "sellAmount"
    from
      t_decats_tokens t_token
    left join
      (
      select
        sell_token,
        SUM(sell_amount) sell_amount
      from
        t_decats_transactions tdt 
      where "created_date" between :dateFrom::date and :dateTo::date
      group by
        sell_token)
      t2
      on
      t_token."name" = t2.sell_token
      where  t_token."name" <> 'MST'`,
      {
        replacements: {
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        },
        type: QueryTypes.SELECT,
      },
    );
    //Get no. of customer that had transactions in a range of time

    const countResult: any = await modelModule[SeqModel.name.Transaction].count(
      {
        distinct: true,
        where: whereStatement,
        col: 'customer_id',
      },
    );

    const returnResult: TransactionStat = {
      historyStat: funcCall,
      count: countResult,
    };
    return returnResult;
  }

  async addNewBurnTranscation(newObj: DBModel.BurnTransactions, id: any) {
    const funcMsg = `[TransactionService][addNewBurnTranscation]`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();

    const t = await seq.sequelize.transaction();

    try {
      newObj.createdDate = dateNow;
      newObj.createdById = id;
      newObj.lastModifiedDate = dateNow;
      newObj.lastModifiedById = id;
      newObj.status = BurnTransactionsStatus.StatusActive;

      const insertResult: any = await modelModule[
        SeqModel.name.BurnTransactions
      ].create(newObj, {
        transaction: t,
      });

      await t.commit();

      resp.success = true;
      resp.msg = `New burn transcation is created, id: ${insertResult.id}`;

      logger.info(funcMsg + ' - success ', { message: resp.msg });
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'add new burn transcation failed :' + e,
      );

      await t.rollback();
    }

    return resp;
  }

  async getAllBurnTranscation(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      BurnTransactionsStatus.StatusActive,
    );

    const results: any = await modelModule[
      SeqModel.name.BurnTransactions
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    return results;
  }

  async addNewBuyBackTranscation(newObj: DBModel.BuyBackDetails, id: any) {
    const funcMsg = `[TransactionService][addNewBuyBackTranscation]`;
    logger.info(funcMsg, { message: ' - start' });
    let resp = new ResponseBase();
    const dateNow = new Date();

    const t = await seq.sequelize.transaction();

    try {
      newObj.createdDate = dateNow;
      newObj.createdById = id;
      newObj.lastModifiedDate = dateNow;
      newObj.lastModifiedById = id;
      newObj.status = BuyBackDetailsStatus.StatusActive;

      const insertResult: any = await modelModule[
        SeqModel.name.BuyBackDetails
      ].create(newObj, {
        transaction: t,
      });

      await t.commit();

      resp.success = true;
      resp.msg = `New buy back transcation is created, id: ${insertResult.id}`;

      logger.info(funcMsg + ' - success ', { message: resp.msg });
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);

      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'add buy back transcation failed :' + e,
      );

      await t.rollback();
    }

    return resp;
  }

  async getAllBuyBackTranscation(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      BuyBackDetailsStatus.StatusActive,
    );

    const results: any = await modelModule[
      SeqModel.name.BuyBackDetails
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    return results;
  }

  async getTotalVolume(query: any): Promise<any> {
    const funcMsg = `[TransactionService][totalVolume]`;
    logger.info(funcMsg);
    const whereJobStatment: any = {};

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    if (query.fromTime) {
      whereStatement.push('tx_time >= :fromTime', 'fromTime', query.fromTime);
    }
    if (query.toTime) {
      whereStatement.push('tx_time <= :toTime', 'toTime', query.toTime);
    }
    whereStatement.push(
      'tx_status = :status',
      'status',
      TransactionStatus.Confirmed.toString(),
    );

    const sql = `
      select tdt.sell_token, sum(tdt.sell_amount) sell_amount
      from t_decats_transactions tdt
      ${whereStatement.toSql()}
      group by tdt.sell_token
      ;
    `;

    const merged = {
      ...whereStatement.replacement,
    };

    const result: any[] = await seq.sequelize.query(sql, {
      replacements: { ...merged },
      type: QueryTypes.SELECT,
    });

    return result;
  }

  async getActiveCustomers(query: any): Promise<any> {
    const funcMsg = `[TransactionService][getActiveCustomers]`;
    logger.info(funcMsg);
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    whereStatement.push(
      '"t_decats_transactions"."created_date" >= :dateFrom',
      'dateFrom',
      query.dateFrom,
    );
    whereStatement.push(
      '"t_decats_transactions"."created_date" <= :dateTo',
      'dateTo',
      query.dateTo,
    );

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
                    "public"."t_decats_transactions" as "t_decats_transactions"
                  left outer join "public"."t_decats_customers" as "customer" on
                    "t_decats_transactions"."customer_id" = "customer"."id"
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
      model: modelModule[SeqModel.name.Transaction],
      type: QueryTypes.SELECT,
    });
    return results;
  }
}
