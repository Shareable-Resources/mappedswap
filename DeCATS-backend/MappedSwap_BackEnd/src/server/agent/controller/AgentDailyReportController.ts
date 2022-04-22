import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Service from '../service/AgentDailyReportService';
export class Controller implements CommonController {
  /**
   * @description Creates an instance of hello world users controller.
   *
   * @constructor
   * @param {Service} service
   */
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.getAll = this.getAll.bind(this);
    this.getIncomeAnalysis = this.getIncomeAnalysis.bind(this);
    this.val.throwError = true;
  }
  /**
  * Get data from sum table    
  * 
  * if normal agent, it will use jwt.id as agentId
    [Required, from jwt] : agentId (jwt.id)
    [Required, from req] : dateFrom, dateTo 
  */
  async getIncomeAnalysis(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.dateFrom, 'dateFrom');
      this.val.isNullOrEmpty(req.query.dateTo, 'dateTo');
      this.val.dateOnly(req.query.dateFrom);
      this.val.dateOnly(req.query.dateTo);
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.id;
    const data = await this.service.getIncomeAnalysis(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
  /**
  * Get data from t_decats_balances table    
  * 
  * if normal agent, it will use jwt.id as agentId
    [Required, from jwt] : agentId (jwt.id)
    [Required, from req] : recordPerPage, pageNo
    [Optional, from req] : agentId, token, dateFrom, dateTo */
  async getAll(req: any, res: any) {
    let distTypes = [];
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.distTypes) {
        distTypes = req.query.distTypes.split(',');
        distTypes.forEach((x) => {
          this.val.isNum(x, 'distType');
        });
        req.query.distTypes = distTypes;
      }
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
}
export default Controller;
