import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import logger from '../util/ServiceLogger';
import { Model } from 'sequelize';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import { BurnTransactionsStatus } from '../../../general/model/dbModel/BurnTransactions';
import { BuyBackDetailsStatus } from '../../../general/model/dbModel/BuyBackDetails';

const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<ResponseBase> {
    const funcMsg = `[TransactionService][getAll](obj.address : ${query.address})`;

    let resp = new ResponseBase();
    try {
      const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
        where: {
          // name: newObj.name,
          address: query.address,
        },
      });
      if (!recordInDb) {
        resp = new WarningResponseBase(
          ServerReturnCode.RecordNotFound,
          'Customer record not found',
        );
        logger.info(funcMsg + ' - fail ', { message: resp.msg });
      } else {
        const customer: DBModel.Customer = recordInDb as any;
        const results: any = await modelModule[
          SeqModel.name.Transaction
        ].findAndCountAll({
          where: { customerId: customer.id?.toString() },
          limit: query.recordPerPage,
          offset: query.pageNo * query.recordPerPage,
          order: [['id', 'DESC']],
        });

        resp.success = true;
        resp.data = results;
        resp.msg = `Record found`;
        logger.info(funcMsg + ' - success ', { message: resp.msg });
      }
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        '[TransactionService][getAll] fail :' + e,
      );
    }
    return resp;
  }

  async getAllBurnTranscation(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      BurnTransactionsStatus.StatusActive,
    );

    const results: any = await modelModule[
      SeqModel.name.BurnTransactions
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    return results;
  }

  async getAllBuyBackTranscation(query: any): Promise<{
    rows: Model<any, any>[];
    count: number;
  }> {
    const whereStatement: any = {};
    sequelizeHelper.where.pushExactItemIfNotNull(
      whereStatement,
      'status',
      BuyBackDetailsStatus.StatusActive,
    );

    const results: any = await modelModule[
      SeqModel.name.BuyBackDetails
    ].findAndCountAll({
      where: whereStatement,
      limit: query.recordPerPage,
      offset: query.pageNo * query.recordPerPage,
      order: [['created_date', 'DESC']],
    });

    return results;
  }
}
