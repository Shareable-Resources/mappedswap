import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/ProfitAndLossReportService';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import * as DBModel from '../../../general/model/dbModel/0_index';
import e from 'express';
import moment from 'moment';

export class Controller implements CommonController {
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.getCurrentPNL = this.getCurrentPNL.bind(this);
    this.getCurrentPNLTest = this.getCurrentPNLTest.bind(this);
  }
  /**
         * Filter the list of profit and loss reports based on
             [Required, from req] : recordPerPage, pageNo
             [Optional, from req] : dateFrom,dateTo,customerId
         */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.customerId = req.jwt.id;
    const resp = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'query', 'success', resp.msg),
      statusCode(true, 'query'),
    );
  }

  async getCurrentPNL(req: any, res: any) {
    req.query.customerId = req.jwt.id;
    const resp = await this.service.getCurrentPNL(req.query);
    return apiResponse(
      res,
      responseBySuccess(resp.data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getCurrentPNLTest(req: any, res: any) {
    const resp = await this.service.getCurrentPNLTest(req.query);
    return apiResponse(
      res,
      responseBySuccess(resp.data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
