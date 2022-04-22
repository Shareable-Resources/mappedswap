import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import {
  ErrorResponseBase,
  ResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import logger from '../util/ServiceLogger';
import { PriceHistoryRef } from '../../../general/model/dbModel/0_index';

const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async create(newObj: PriceHistoryRef) {
    const funcMsg = `[PriceRefService][create]`;
    logger.info(funcMsg, {
      message: `Price ${newObj.price}, Remark ${newObj.remark}`,
    });
    const insertResult: any = await modelModule[
      SeqModel.name.PriceHistoryRef
    ].create(newObj, {});

    return insertResult;
  }

  async bulkCreate(newObjs: PriceHistoryRef[]) {
    const funcMsg = `[PriceRefService][bulkCreate]`;

    const insertResult: any = await modelModule[
      SeqModel.name.PriceHistoryRef
    ].bulkCreate(newObjs, {});
    return insertResult;
  }
}
