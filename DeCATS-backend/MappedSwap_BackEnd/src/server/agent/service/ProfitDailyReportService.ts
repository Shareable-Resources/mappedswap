import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, QueryTypes } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';
import moment from 'moment';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[ProfitDailyReportService][getAll](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const whereStatement: any = {};
    const createdFrom = query.dateFrom
      ? moment.utc(query.dateFrom).startOf('day').add(1, 'day').toDate()
      : undefined;
    const createdTo = query.dateTo
      ? moment.utc(query.dateTo).startOf('day').add(1, 'day').toDate()
      : undefined;

    if (createdFrom && createdTo) {
      whereStatement.createdDate = {
        [Op.between]: [createdFrom, createdTo],
      };
    } else if (createdFrom) {
      whereStatement.createdDate = {
        [Op.gte]: query.createdFrom,
      };
    } else if (createdTo) {
      whereStatement.createdDate = {
        [Op.lte]: query.createdTo,
      };
    }
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'token',
      query.token,
    );

    const results: any = await modelModule[
      SeqModel.name.ProfitDailyReport
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }

  async getPNLUsersOver(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[ProfitDailyReportService][getPNLUsersOver](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const createdFrom = moment
      .utc(query.dateFrom)
      .startOf('day')
      .add(1, 'day')
      .toDate();
    const createdTo = moment
      .utc(query.dateTo)
      .startOf('day')
      .add(1, 'day')
      .toDate();

    const whereStatement = sequelizeHelper.whereQuery.generateWhereClauses();

    whereStatement.push(
      '"t_decats_profit_and_loss_reports"."created_date" >= :dateFrom',
      'dateFrom',
      createdFrom as any,
    );
    whereStatement.push(
      '"t_decats_profit_and_loss_reports"."created_date" <= :dateTo',
      'dateTo',
      createdTo as any,
    );
    const sql = `select
                  count(*) OVER() AS "count",
                  customer_id as "customerId",
                  t_decats_customers.created_date as "createdDate",
                  t_decats_customers.address  as "address",
                  sum(profit_and_loss) as "profitAndLoss",
                  case when sum(profit_and_loss) >= (:amtOfUSDM * 10^6) then true else false end as "qualified"
                from
                  t_decats_profit_and_loss_reports
                inner join
                    t_decats_customers on
                t_decats_profit_and_loss_reports.customer_id = t_decats_customers.id
                ${whereStatement.toSql()}
                group by
                customer_id ,
                t_decats_customers.created_date,
                t_decats_customers.address
                order by
                sum(profit_and_loss) desc,t_decats_customers.created_date asc
                limit :limit offset :offset;`;

    const merged = {
      ...whereStatement.replacement,
    };

    const results: any = await seq.sequelize.query(sql, {
      replacements: {
        ...merged,
        amtOfUSDM: query.profitAndLoss,
        limit: query.recordPerPage,
        offset: query.pageNo * query.recordPerPage,
      },
      raw: true, // Without this `nest` hasn't effect, IDK why,
      type: QueryTypes.SELECT,
    });

    if (results.length) {
      return {
        rows: results.map(({ count, ...item }) => item),
        count: results[0].count,
      };
    }
    return {
      rows: [],
      count: 0,
    };
  }
}
