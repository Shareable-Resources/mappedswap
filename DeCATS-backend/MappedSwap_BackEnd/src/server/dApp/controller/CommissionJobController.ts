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
import Service from '../service/CommissionJobService';
import CommissionJob, {
  CommissionJobStatus,
} from '../../../general/model/dbModel/CommissionJob';
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
    this.getLedgers = this.getLedgers.bind(this);
    this.getLedgersDetails = this.getLedgersDetails.bind(this);
    this.getExpectedCommission = this.getExpectedCommission.bind(this);
    this.getSubAgentsWeeklyCommission =
      this.getSubAgentsWeeklyCommission.bind(this);
    this.acquireSuccess = this.acquireSuccess.bind(this);
  }
  async getAll(req: any, res: any) {
    throw new Error('Method not implemented.');
  }

  /**
    Get commission jobs and distributions list by agent id, use in dApp' s [My Referral Rewards] page
    [Required, from jwt] : agentId (jwt.id)
    [Required, from req] : recordPerPage, pageNo 
    [Required, from req] : status(distributon status), dateMonth, dateYear 
    */
  async getLedgers(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.status) {
        this.val.isNum(req.query.status, 'status');
      }
      if (req.query.distStatus) {
        this.val.isNum(req.query.status, 'status');
      }
      if (!req.query.dateYear && req.query.dateMonth) {
        throw new Error('Either select year, year&month or nothing');
      }
      if (req.query.dateYear) {
        this.val.isNum(req.query.dateYear, 'dateYear');
      }
      if (req.query.dateMonth) {
        this.val.isNum(req.query.dateMonth, 'dateMonth');
      }
      this.val.isNullOrEmpty(req.jwt.agentId, 'agentId(jwt)');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    req.query.agentId = req.jwt.agentId;
    const data = await this.service.getLedgers(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
  /**
    Get lastest commission from agent daily reports, use in dApp' s [Referral Program] tab
    [Required, from jwt] : agentId (jwt.id)
  */
  async getExpectedCommission(req: any, res: any) {
    req.query.agentId = req.jwt.agentId;
    const data = await this.service.getExpectedCommission(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
  /**
    Get reports by agent id, use in dApp' s [My Referral Rewards] page when click Detail button
    [Required, from jwt] : agentId (jwt.id)
    [Required, from req] : createdDate */
  async getLedgersDetails(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.cronJobId, 'cronJobId');
      this.val.isNum(req.query.cronJobId, 'cronJobId');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.agentId;
    const data = await this.service.getLedgersDetails(req.query);
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
    obj.agentId = req.jwt.agentId;
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

  async getSubAgentsWeeklyCommission(req: any, res: any) {
    req.query.agentId = req.jwt.agentId;
    const data = await this.service.getSubAgentsWeeklyCommission(
      req.query,
      req.jwt,
    );
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
