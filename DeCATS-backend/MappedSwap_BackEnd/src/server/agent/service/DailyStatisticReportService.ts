import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, Sequelize } from 'sequelize';
import { DailyStatisticReport } from '../../../general/model/dbModel/0_index';
import JSONBig from 'json-bigint';
import moment from 'moment';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<DailyStatisticReport[]> {
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
    let results: any = await modelModule[
      SeqModel.name.DailyStatisticReport
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    results = JSONBig.parse(JSONBig.stringify(results));
    return results;
  }
}
