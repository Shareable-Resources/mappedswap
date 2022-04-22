import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import Service from '../service/CommissionDistributionService';
import CommissionDistribution, {
  CommissionDistributionStatus,
} from '../../../general/model/dbModel/CommissionDistribution';
export class Controller implements CommonController {
  /**
   * @description Creates an instance of hello world log controller.
   *
   * @constructor
   *
   */
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.acquireSuccess = this.acquireSuccess.bind(this);
    this.getActiveAgents = this.getActiveAgents.bind(this);
  }

  /**
   * Filter the list of t_decats_distributions based on agentId(jwt.id)
     [Optional] : status
     [Required, from jwt] : agentId(jwt.id)
     [Required, from req] : recordPerPage, pageNo, status
     order by createdDate Desc
   */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
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
  // When front end succussfully call Payout.acquire function
  async acquireSuccess(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.jobId, 'jobId');
      this.val.isNullOrEmpty(req.body.txHash, 'txHash');
      this.val.isNullOrEmpty(req.body.txDate, 'txDate');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const obj: CommissionDistribution = new CommissionDistribution();
    obj.jobId = req.body.jobId;
    obj.agentId = req.jwt.id;
    obj.acquiredDate = new Date();
    obj.status = CommissionDistributionStatus.Acquired;
    obj.txHash = req.body.txHash;
    obj.txDate = req.body.txDate;
    const resp: ResponseBase = await this.service.acquireSuccess(obj);
    return apiResponse(
      res,
      responseBySuccess(
        resp.data,
        resp.success,
        'up',
        resp.respType,
        resp.msg,
        resp.returnCode,
      ),
      statusCode(true, 'query'),
    );
  }

  async getActiveAgents(req: any, res: any) {
    try {
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      this.val.isNullOrEmpty(req.query.dateFrom, 'dateFrom');
      this.val.isNullOrEmpty(req.query.dateTo, 'dateTo');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getActiveAgents(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}

export default Controller;
