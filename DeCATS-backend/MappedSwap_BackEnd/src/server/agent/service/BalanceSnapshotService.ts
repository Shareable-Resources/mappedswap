import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { JSONB, Model, Op, QueryTypes, Sequelize } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[BalanceSnapshotService][getAll](query.agentId : ${query.agentId})`;
    logger.info(funcMsg);
    const whereStatement: any = {};

    if (query.dateFrom && query.dateTo) {
      whereStatement.dateFrom = {
        [Op.gte]: query.dateFrom,
      };
      whereStatement.dateTo = {
        [Op.lte]: query.dateTo,
      };
    } else if (query.dateFrom) {
      whereStatement.dateFrom = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereStatement.dateTo = {
        [Op.lte]: query.dateTo,
      };
    }
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'token',
      query.token,
    );
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'customerId',
      query.customerId,
    );
    const results: any = await modelModule[
      SeqModel.name.CommissionJob
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }
}
