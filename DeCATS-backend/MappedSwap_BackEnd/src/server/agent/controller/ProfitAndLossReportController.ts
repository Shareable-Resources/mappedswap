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

export class Controller implements CommonController {
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.getPNLUsersOver = this.getPNLUsersOver.bind(this);
  }
  /**
         * Filter the list of profit daily reports based on
             [Required, from req] : recordPerPage, pageNo
             [Optional, from req] : dateFrom,dateTo,token
         */
  async getAll(req: any, res: any) {
    throw new Error('Not implemented');
  }
  /**
         * Filter the list of profit daily reports based on
             [Required, from req] : recordPerPage, pageNo, profitAndLoss, dateFrom, dateTo
    */
  async getPNLUsersOver(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.profitAndLoss, 'profitAndLoss');
      this.val.isNum(req.query.profitAndLoss, 'profitAndLoss');
      this.val.isNullOrEmpty(req.query.dateFrom, 'dateFrom');
      this.val.isNullOrEmpty(req.query.dateTo, 'dateTo');
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.id;
    const data = await this.service.getPNLUsersOver(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
