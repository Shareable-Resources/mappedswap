import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import logger from '../util/serviceLogger';

const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async create(newObj: DBModel.PriceHistoryRef): Promise<ResponseBase> {
    const funcMsg = `[UniswapFetcherService][create](obj.createdDate : ${new Date()})`;
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    try {
      const insertResult: any = await modelModule[
        SeqModel.name.PriceHistoryRef
      ].create(newObj, {
        transaction: t,
      });
      await t.commit(); //Transaction must be commited or rollback, otherwise sequlize connection to DB will be locked
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Insert PriceHistoryRef fail :' + e,
      );
      await t.rollback();
    }
    return resp;
  }
}
