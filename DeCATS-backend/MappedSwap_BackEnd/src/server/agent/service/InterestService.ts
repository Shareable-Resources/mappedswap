import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import logger from '../util/ServiceLogger';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { QueryTypes, Sequelize } from 'sequelize';
import { InterestHistoriesWithCoins } from '../model/InterestHistoriesWithCoins';
import { InterestHistories } from '../model/InterestHistories';
import { ResponseBase } from '../../../foundation/server/ApiMessage';
import { InterestHistoryStatus } from '../../../general/model/dbModel/InterestHistory';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<InterestHistoriesWithCoins> {
    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();
    const whereUsdMStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();
    const whereEthlStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();
    const whereBtclStatement: any =
      sequelizeHelper.whereQuery.generateWhereClauses();

    if (query.fromTime) {
      whereStatement.push('from_time >= :fromTime', 'fromTime', query.fromTime);
    }
    if (query.toTime) {
      whereStatement.push(
        'to_time <= :toTime',
        'toTime',
        query.toTime + ' 23:59:59',
      );
    }
    if (query.token) {
      whereStatement.push('token = :token', 'token', query.token);
    }
    if (query.address) {
      whereStatement.push('address = :address', 'address', query.address);
    }
    if (query.name) {
      whereStatement.push('name = :name', 'name', query.name);
    }
    whereStatement.push('tdih.agent_id = :agent_id', 'agent_id', query.agentId);

    whereUsdMStatement.push('token = :token', 'token', 'USDM');
    whereUsdMStatement.push('agent_id = :agentId', 'agentId', query.agentId);
    whereEthlStatement.push('token = :token', 'token', 'ETHM');
    whereEthlStatement.push('agent_id = :agentId', 'agentId', query.agentId);
    whereBtclStatement.push('token = :token', 'token', 'BTCM');
    whereBtclStatement.push('agent_id = :agentId', 'agentId', query.agentId);

    const resultsUSDM: any = await modelModule[
      SeqModel.name.InterestHistory
    ].findAll({
      attributes: [(Sequelize.fn('sum', Sequelize.col('amount')), 'amount')],
      where: whereUsdMStatement.replacement,
      group: ['amount'],
    });
    const resultsETHM: any = await modelModule[
      SeqModel.name.InterestHistory
    ].findAll({
      attributes: [(Sequelize.fn('sum', Sequelize.col('amount')), 'amount')],
      where: whereEthlStatement.replacement,
      group: ['amount'],
    });

    const resultsBTCM: any = await modelModule[
      SeqModel.name.InterestHistory
    ].findAll({
      attributes: [(Sequelize.fn('sum', Sequelize.col('amount')), 'amount')],
      where: whereBtclStatement.replacement,
      group: ['amount'],
    });

    const resultsUSDMJson = JSON.parse(JSON.stringify(resultsUSDM));
    const resultsETHMJson = JSON.parse(JSON.stringify(resultsETHM));
    const resultsBTCMJson = JSON.parse(JSON.stringify(resultsBTCM));

    const merged = {
      ...whereStatement.replacement,
    };

    const x = whereStatement.toSql();

    const interestHistorySql = `
            select tdih.from_time as "fromTime",tdih.to_time as "toTime", tdih.address, tdc."name", tdih."token", tdih.amount, EXTRACT(EPOCH FROM (tdih.to_time - tdih.from_time)) AS "timeLength", tdih.rate, tdih.interest
            from t_decats_interest_histories tdih 
            inner join t_decats_customers tdc 
            on tdih.customer_id = tdc.id 
                and tdih.customer_id = tdc.id 
                ${whereStatement.toSql()}
            order by tdih.id desc limit :recordPerPage offset (:pageNo - 0) * :recordPerPage
            ;
        `;
    logger.info(interestHistorySql);
    const interestHistories: InterestHistories[] = await seq.sequelize.query(
      interestHistorySql,
      {
        replacements: {
          ...merged,
          recordPerPage: query.recordPerPage,
          pageNo: query.pageNo, //agent_id: id,
        },
        type: QueryTypes.SELECT,
      },
    );

    const interestHistorySumSql = `
            select count(tdih.*)
            from t_decats_interest_histories tdih 
            inner join t_decats_customers tdc 
            on tdih.customer_id = tdc.id 
                and tdih.customer_id = tdc.id 
            ${whereStatement.toSql()}
        `;
    logger.info(interestHistorySumSql);
    const interestHistorySum: any = await seq.sequelize.query(
      interestHistorySumSql,
      {
        replacements: { ...merged },
        type: QueryTypes.SELECT,
      },
    );

    const interestHistorySumJson = JSON.parse(
      JSON.stringify(interestHistorySum),
    );

    const interestHistoriesWithCoins: InterestHistoriesWithCoins = {
      rows: interestHistories,
      count:
        interestHistorySumJson.length > 0
          ? interestHistorySumJson[0]['count']
          : 0,
      USDM: resultsUSDMJson.length > 0 ? resultsUSDMJson[0]['amount'] : 0,
      ETHM: resultsETHMJson.length > 0 ? resultsETHMJson[0]['amount'] : 0,
      BTCM: resultsBTCMJson.length > 0 ? resultsBTCMJson[0]['amount'] : 0,
    };

    return interestHistoriesWithCoins;
  }

  async getTotalInterest(query: any): Promise<any> {
    const funcMsg = `[InterestService][getTotalInterest]`;
    logger.info(funcMsg);
    const whereJobStatment: any = {};
    // const whereSummaryStatment: any = {};

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    if (query.fromTime) {
      whereStatement.push('from_time >= :fromTime', 'fromTime', query.fromTime);
    }
    if (query.toTime) {
      whereStatement.push('to_time <= :toTime', 'toTime', query.toTime);
    }
    whereStatement.push(
      'status = :status',
      'status',
      InterestHistoryStatus.StatusActive.toString(),
    );

    const sql = `
      select tdih."token", sum(tdih.interest) interest 
      from t_decats_interest_histories tdih
      ${whereStatement.toSql()}
      group by tdih."token" 
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
}
