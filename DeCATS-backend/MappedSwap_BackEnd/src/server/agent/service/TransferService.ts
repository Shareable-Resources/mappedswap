import seq from '../sequelize';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, QueryTypes, Sequelize } from 'sequelize';
import CommonService from '../../../foundation/server/CommonService';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import logger from '../util/ServiceLogger';
import * as DBModel from '../../../general/model/dbModel/0_index';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll() {
    //
  }

  async getTransferEunRewards(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const funcMsg = `[TransferService][getTransferEunRewards]`;
    logger.info(funcMsg);

    const whereStatement: any = {};

    if (query.fromTime && query.toTime) {
      whereStatement.createTime = {
        [Op.between]: [query.fromTime, query.toTime],
      };
    } else if (query.fromTime) {
      whereStatement.createTime = {
        [Op.gte]: query.fromTime,
      };
    } else if (query.toTime) {
      whereStatement.createTime = {
        [Op.lte]: query.toTime,
      };
    }

    const results: any = await modelModule[
      SeqModel.name.TransferEunRewards
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }

  async getTransferHistories(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const funcMsg = `[TransferService][getTransferHistories]`;
    logger.info(funcMsg);

    const whereStatement: any = {};

    if (query.fromTime && query.toTime) {
      whereStatement.createTime = {
        [Op.between]: [query.fromTime, query.toTime],
      };
    } else if (query.fromTime) {
      whereStatement.createTime = {
        [Op.gte]: query.fromTime,
      };
    } else if (query.toTime) {
      whereStatement.createTime = {
        [Op.lte]: query.toTime,
      };
    }

    const results: any = await modelModule[
      SeqModel.name.TransferHistories
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['id', 'DESC']],
    });
    return results;
  }
}
