import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import sequelize from 'sequelize';
import { QueryTypes } from 'sequelize';
import moment from 'moment';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatment: any = {};
    query.dateFrom = query.dateFrom
      ? moment(query.dateFrom).startOf('day').format('YYYY-MM-DD HH:mm:ss')
      : null;
    query.dateTo = query.dateFrom
      ? moment(query.dateTo).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      : null;
    if (query.dateFrom && query.dateTo) {
      whereStatment.dateFrom = {
        [Op.gte]: query.dateFrom,
      };
      whereStatment.dateTo = {
        [Op.lte]: query.dateTo,
      };
    } else if (query.dateFrom) {
      whereStatment.dateEnd = {
        [Op.gte]: query.dateFrom,
      };
    } else if (query.dateTo) {
      whereStatment.dateEnd = {
        [Op.lte]: query.dateTo,
      };
    }

    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatment,
      'status',
      query.status,
    );
    const results: any = await modelModule[
      SeqModel.name.CronJob
    ].findAndCountAll({
      where: whereStatment,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['dateFrom', 'DESC']],
    });
    return results;
  }
}
