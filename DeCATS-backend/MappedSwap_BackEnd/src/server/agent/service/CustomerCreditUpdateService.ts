import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { Model } from 'sequelize';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<DBModel.Customer[]> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      query.agentId,
    );
    const results: any = await modelModule[
      SeqModel.name.CustomerCreditUpdate
    ].findAndCountAll({
      include: [
        {
          model: modelModule[SeqModel.name.Customer],
          as: 'customer',
        },
      ],
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results as DBModel.Customer[];
  }
  async getAllWithCustomerInfo(
    query: any,
    id: any,
  ): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'agentId',
      // query.agentId,
      id,
    );
    const results: any = await modelModule[
      SeqModel.name.CustomerCreditUpdate
    ].findAndCountAll({
      include: [
        {
          model: modelModule[SeqModel.name.Customer],
          as: 'customer',
        },
      ],
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }
}
