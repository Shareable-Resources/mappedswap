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
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(query: any): Promise<ResponseBase> {
    const funcMsg = `[InterestHistoryService][getAll](obj.address : ${query.address})`;
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    try {
      const recordInDb = await modelModule[SeqModel.name.Customer].findOne({
        where: {
          // name: newObj.name,
          address: query.address,
        },
        transaction: t,
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
          SeqModel.name.InterestHistory
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
      await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Insert user fail :' + e,
      );
      await t.rollback();
    }
    return resp;
  }
}
