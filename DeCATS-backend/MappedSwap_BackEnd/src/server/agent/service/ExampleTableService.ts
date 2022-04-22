import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op } from 'sequelize';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatment: any = {};
    const results: any = await modelModule[
      SeqModel.name.ExampleTable
    ].findAndCountAll({
      where: whereStatment,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
    });
    return results;
  }
}
