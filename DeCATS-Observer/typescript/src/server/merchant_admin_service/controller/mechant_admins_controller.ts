import { Request, Response } from 'express';
import {
  apiResponse,
  responseBySuccess,
  statusCode,
  successResponse,
} from '../../../foundation/src/api/ApiMessage';
import CommonController from '../../../foundation/src/server/CommonController';
import { ServerReturnCode } from '../../../foundation/src/ServerReturnCode';
import User from '../model/DBModel/MerchantClient';
import Service from '../service/merchant_admin_service';
import * as DBModel from '../model/DBModel/0_index';
import { StatusCodes } from 'http-status-codes';
export class Controller implements CommonController {
  /**
   * @description Creates an instance of merchant admin controller.
   * @author Vince Tang
   * @constructor
   * @param {Service} service
   */
  constructor(private service: Service = new Service()) {
    this.login = this.login.bind(this);
  }

  async login(req: any, res: any) {
    const obj: DBModel.MerchantAdmin = req.body;
    obj.merchantId = BigInt(1);
    const responseBase = await this.service.login(obj);
    return apiResponse(
      res,
      responseBySuccess(
        responseBase.data,
        responseBase.success,
        'query',
        responseBase.respType,
        responseBase.msg,
      ),
      statusCode(responseBase.success, 'query'),
    );
  }

  async getAll() {
    throw Error('Not Implemented');
  }
}
export default Controller;
