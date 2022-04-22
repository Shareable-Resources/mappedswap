import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';
import moment from 'moment';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(
    query: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    const funcMsg = `[PairDailyReportService][getAll](query.agentId : ${query.agentId})`;
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
      SeqModel.name.PairDailyReport
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }
}
