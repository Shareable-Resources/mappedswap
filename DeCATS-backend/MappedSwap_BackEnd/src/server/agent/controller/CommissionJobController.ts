import {
  apiResponse,
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
import globalVar from '../const/globalVar';
import { CronJob } from '../../../general/model/dbModel/0_index';
export class Controller implements CommonController {
  /**
   * @description Creates an instance of hello world log controller.
   *
   * @constructor
   *
   */
  verifierAddress: string;
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.getAllSummary = this.getAllSummary.bind(this);
    //this.verify = this.verify.bind(this);
    this.approve = this.approve.bind(this);
    this.enterMSTRate = this.enterMSTRate.bind(this);
    this.verifierAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap['verifierAddress'];
  }
  /**
   * Approve t_decats_commission_jobs
   * [Required, from jwt] : agentId(jwt.id)
     [Required, from req] : recordPerPage, pageNo
     [optional, from req] : status
     order by id Desc
   */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.status) {
        this.val.isNum(req.query.status, 'status');
      }
      if (req.query.cronJobId) {
        this.val.isNum(req.query.cronJobId, 'cronJobId');
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
  /**
   * Approve t_decats_commission_jobs
   * [Required, from jwt] : agentId(jwt.id)
     [Required, from req] : recordPerPage, pageNo, jobIds
     [Optional, from req] : status, remark (like), dateFrom, dateTo, token
     order by id Desc
   */
  async getAllSummary(req: any, res: any) {
    let jobIds = [];
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.status) {
        this.val.isNum(req.query.status, 'status');
      }

      if (
        !req.jwt.role ||
        !this.val.containsElement(req.jwt.role, '|', 'account', 'Role')
        // && req.jwt.address != this.verifierAddress
      ) {
        throw new Error('User must be account or verifier to view this page');
      }
      this.val.isNullOrEmpty(req.query.jobIds, 'jobIds');
      jobIds = req.query.jobIds.split(',');
      jobIds.forEach((x) => {
        this.val.isNum(x, 'jobIds');
      });
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.id;
    req.query.jobIds = jobIds;
    const data = await this.service.getAllSummary(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
  /**
   * Approve t_decats_commission_jobs, only avaliable to the account
     [Required, from jwt] : id
     [Required, from req body] : jobId
   */
  async approve(req: any, res: any) {
    try {
      if (!this.val.containsElement(req.jwt.role, '|', 'account', 'Role')) {
        throw new Error('User must be account to approve summary');
      }
      if (
        !this.val.containsElement(req.jwt.role, '|', 'account', 'Role') &&
        req.jwt.address != this.verifierAddress
      ) {
        throw new Error('User must be account or verifier to view this page');
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'up'),
      );
    }
    const obj: CommissionJob = new CommissionJob();
    const dateNow = new Date();
    obj.id = req.body.jobId;
    obj.approvedById = req.jwt.id;
    obj.approvedDate = dateNow;
    obj.lastModifiedById = req.jwt.id;
    obj.lastModifiedDate = dateNow;
    obj.status = CommissionJobStatus.Approved;
    const walletAddress = req.jwt.address;
    if (req.jwt.isReadOnly) {
      return apiResponse(
        res,
        new WarningResponseBase(
          ServerReturnCode.InvalidArgument,
          'This login is ReadOnly',
        ),
        statusCode(false, 'query'),
      );
    } else {
      const resp = await this.service.approve(obj, walletAddress);
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
        statusCode(true, 'up'),
      );
    }
  }

  /**
   * Enter commission rate, only avaliable to account
     [Required, from jwt] : id, parentAgentId
     [Required, from req body] : mstToUSDMExchangeRate
   */
  async enterMSTRate(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.id, 'Job Id');
      this.val.isNum(req.body.id, 'Job Id');
      this.val.isNullOrEmpty(
        req.body.mstToUSDMExchangeRate,
        'mstToUSDMExchangeRate',
      );
      this.val.isNum(req.body.mstToUSDMExchangeRate, 'mstToUSDMExchangeRate');
      if (req.jwt.parentAgentId) {
        throw new Error('Root Agent Only');
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'up'),
      );
    }
    const obj: CronJob = new CronJob();
    obj.id = req.body.id;
    obj.lastModifiedById = req.jwt.id;
    obj.mstToUSDMExchangeRate = req.body.mstToUSDMExchangeRate;
    if (req.jwt.isReadOnly) {
      return apiResponse(
        res,
        new WarningResponseBase(
          ServerReturnCode.InvalidArgument,
          'This login is ReadOnly',
        ),
        statusCode(false, 'query'),
      );
    } else {
      const resp = await this.service.enterMSTRate(obj);
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
        statusCode(true, 'up'),
      );
    }
  }
}
export default Controller;
