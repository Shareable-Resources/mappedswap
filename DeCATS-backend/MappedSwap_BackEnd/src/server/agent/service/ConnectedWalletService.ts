import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Sequelize, Op, Transaction } from 'sequelize';
import ConnectedWallet, {
  ConnectedType,
} from '../../../general/model/dbModel/ConnectedWallet';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async create(
    reqBody: ConnectedWallet,
    t?: Transaction,
  ): Promise<ConnectedWallet> {
    const obj: ConnectedWallet = {
      id: null,
      address: reqBody.address,
      connectedType: reqBody.connectedType,
      createdDate: new Date(),
    };
    const isRollBackFromParent = t ? true : false;
    t = t ? t : await seq.sequelize.transaction();
    let createResult: any;
    try {
      createResult = await modelModule[SeqModel.name.ConnectedWallet].create(
        obj,
        { transaction: t },
      );
      await t.commit();
    } catch (ex) {
      if (isRollBackFromParent) {
        throw ex;
      }
      await t.rollback();
    }

    return createResult;
  }

  async getMonthlyReports(query: any) {
    const whereStatement: any = {};
    const createdFrom = query.dateFrom;
    const createdTo = query.dateTo;
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

    sequelizeHelper.where.pushArrayItemIfNotNull(
      whereStatement,
      'connectedType',
      query.connectedTypes,
    );

    const results: any = await modelModule[
      SeqModel.name.ConnectedWallet
    ].findAll({
      where: whereStatement,
      attributes: [
        'connectedType',
        [
          Sequelize.fn('count', Sequelize.col('address')),
          'noOfConnectedWallets',
        ],
        [
          Sequelize.fn('to_char', Sequelize.col('created_date'), 'YYYY-MM'),
          'createdDate',
        ],
      ],
      group: ['createdDate', 'connectedType'],
      order: [[Sequelize.col('createdDate'), 'ASC']],
    });

    return results;
  }
}
