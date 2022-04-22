import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as SeqModel from '../../../general/model/seqModel/0_index';
import { Model, Op, Sequelize, Transaction } from 'sequelize';
import {
  ErrorResponseBase,
  ResponseBase,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import logger from '../util/ServiceLogger';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { signToken } from '../../../foundation/server/Middlewares';
import sequelizeHelper from '../../../foundation/utils/SequelizeHelper';
import Big from 'big.js';
import { Mixed } from '../../../foundation/types/Mixed';
import { MstPriceStatus } from '../../../general/model/dbModel/MstPrice';

const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(): Promise<ResponseBase> {
    const funcMsg = `[PriceService][getAll]`;
    const resp = new ResponseBase();
    //const priceList: any[] = [];

    // await this.getAll();

    try {
      const whereStatement: any = {};
      const getPriceAgentResult = await modelModule[
        SeqModel.name.Prices
      ].findAll({
        where: whereStatement,
      });
      resp.data = getPriceAgentResult;
      resp.success = true;
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }

    return resp;
  }

  async addMstPrice(newObj: DBModel.MstPrice): Promise<ResponseBase> {
    const funcMsg = `[PriceService][updateMstPrice](price: ${newObj.mstPrice})`;
    const t = await seq.sequelize.transaction();
    let resp = new ResponseBase();
    const dateNow = new Date();

    newObj.status = MstPriceStatus.StatusActive;
    newObj.createdDate = dateNow;
    newObj.lastModifiedDate = dateNow;

    try {
      const recordInDb = await modelModule[SeqModel.name.MstPrice].findOne({
        where: {
          status: MstPriceStatus.StatusActive,
        },
        transaction: t,
      });

      if (recordInDb) {
        const id = recordInDb.getDataValue('id');

        const mstPriceObj: DBModel.MstPrice = new DBModel.MstPrice();
        mstPriceObj.status = MstPriceStatus.StatusInactive;

        await modelModule[SeqModel.name.MstPrice].update(mstPriceObj, {
          transaction: t,
          where: {
            id: id,
          },
          fields: ['status'], //fields will limit the columns that need to be updated, use the DBModel attributes name instead of DB column name
        });
      }

      const insertResult: any = await modelModule[
        SeqModel.name.MstPrice
      ].create(newObj, {
        transaction: t,
      });

      await t.commit();

      resp.success = true;
      resp.msg = `New MST price is created. New record id :(${insertResult.id})`;
      logger.info(funcMsg + ' - success ', { message: resp.msg });
    } catch (e) {
      await t.rollback();

      logger.error(funcMsg + ' - fail ');
      logger.error(e);
      resp = new ErrorResponseBase(
        ServerReturnCode.InternalServerError,
        'Add System Parameter fail:' + e,
      );
    }

    return resp;
  }

  async getMstPrice(): Promise<ResponseBase> {
    const funcMsg = `[PriceService][getMstPrice]`;
    const resp = new ResponseBase();

    try {
      const getMstPriceResult = await modelModule[
        SeqModel.name.MstPrice
      ].findAll({
        where: {
          status: MstPriceStatus.StatusActive,
        },
      });
      resp.data = getMstPriceResult;
      resp.success = true;
    } catch (e) {
      logger.error(funcMsg + ' - fail ');
      logger.error(e);
    }

    return resp;
  }
}
