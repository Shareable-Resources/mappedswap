import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(
    query: any,
    address,
  ): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereBalanceHistoryStatement: any = {};

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
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereBalanceHistoryStatement,
      'address',
      address,
    );

    if (query.dateFrom && query.dateTo) {
      whereBalanceHistoryStatement.txTime = {
        [Op.between]: [query.dateFrom, query.dateTo],
      };
    } else if (query.dateFrom) {
      whereBalanceHistoryStatement.txTime = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereBalanceHistoryStatement.txTime = {
        [Op.lte]: query.dateTo,
      };
    }

    const results: any = await modelModule[
      SeqModel.name.BalanceHistory
    ].findAndCountAll({
      where: whereBalanceHistoryStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }
}
