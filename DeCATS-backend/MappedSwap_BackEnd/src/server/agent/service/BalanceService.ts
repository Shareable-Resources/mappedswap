import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';

import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { BalanceInUSDM } from '../model/BalanceInUSDM';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import * as DBModel from '../../../general/model/dbModel/0_index';
import { PriceHistoryInSplit } from '../model/PriceHistoryInSplit';
import { QueryTypes } from 'sequelize';
import Big from 'big.js';
import logger from '../util/ServiceLogger';
import JSONBig from 'json-bigint';
import { BalanceInUSDMWithCoins } from '../model/BalanceInUSDMWithCoins';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<any> {
    //Prevent SQL Injection must use replacement, don' t just append SQL

    const priceHistoriesSql = `SELECT DISTINCT ON (pair_name)
                                    id,
                                    pair_name as "pairName",
                                    split_part(pair_name, '/', 1) as from, 
                                    split_part(pair_name, '/', 2) as to, 
                                    close,
                                    reserve0,
                                    reserve1,
                                    created_date as "createdDate"
                              FROM   "public"."t_decats_price_histories"
                              where interval = 60
                              ORDER  BY pair_name ,created_date desc;`;
    const priceHistories: PriceHistoryInSplit[] = await seq.sequelize.query(
      priceHistoriesSql,
      {
        type: QueryTypes.SELECT,
      },
    );
    const priceMap: any = {};
    priceMap['USDM'] = '1';
    priceHistories.forEach((x) => (priceMap[x.from] = x.close));

    const whereStatement: any = {};
    const whereCustomerStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      query.agentId,
    );
    sequelizeHelper.where.pushLikeItemIfNotNull(
      whereCustomerStatement,
      'name',
      query.name,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'token',
      query.token,
    );
    const results: any = await modelModule[
      SeqModel.name.Balance
    ].findAndCountAll({
      include: [
        {
          model: modelModule[SeqModel.name.Customer],
          as: 'customer',
          attributes: ['id', 'name'],
          where: whereCustomerStatement,
        },
      ],
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    const obj: { rows: any[]; count: number } = JSONBig.parse(
      JSONBig.stringify(results),
    );
    const returnValues: BalanceInUSDM[] = [];
    obj.rows.forEach((bal: DBModel.Balance) => {
      returnValues.push({
        id: bal.id as string,
        address: bal.address,
        updateTime: bal.updateTime,
        name: bal.customer ? bal.customer.name : '',
        token: bal.token,
        sumOfIncome: bal.balance,
        usdmValue: Big(bal.balance).mul(priceMap[bal.token]),
      });
    });
    obj.rows = returnValues;

    return obj;
  }

  async getTotalBalance(query: any): Promise<any> {
    const funcMsg = `[BalanceService][getTotalBalance]`;
    logger.info(funcMsg);

    const sql = `
      select tdb."token", sum(tdb.balance) as balance
      from t_decats_balances tdb 
      where tdb.update_time = 
        (
          select max(update_time)
          from t_decats_balances tdbs 
          where tdbs."token" = tdb."token" 
        )
      group by tdb."token"
      ;
    `;

    // const merged = {
    //   ...whereStatement.replacement,
    // };

    const result: any[] = await seq.sequelize.query(sql, {
      // replacements: { ...merged },
      type: QueryTypes.SELECT,
    });

    return result;
  }
}
