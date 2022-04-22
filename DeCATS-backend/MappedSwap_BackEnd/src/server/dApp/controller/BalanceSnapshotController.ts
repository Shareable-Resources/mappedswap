import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/BalanceSnapshotService';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import * as DBModel from '../../../general/model/dbModel/0_index';
import e from 'express';

export class Controller implements CommonController {
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.getProfitAndLoss = this.getProfitAndLoss.bind(this);
  }
  /**
       * Filter the list of profit daily reports based on
           [Required, from req] : recordPerPage, pageNo
           [Optional, from req] : dateFrom,dateTo,token,customerId
       */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.customerId) {
        this.val.isNum(req.query.customerId, 'customerId');
      }
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.id;
    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getProfitAndLoss(req: any, res: any) {
    try {
      if (req.query.customerId) {
        req.query.customerId = req.customerId;
      } else {
        req.query.customerId = req.jwt.id;
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.getProfitAndLoss(req.query);
    return apiResponse(res, resp, statusCode(true, 'query'));
  }
}
export default Controller;
