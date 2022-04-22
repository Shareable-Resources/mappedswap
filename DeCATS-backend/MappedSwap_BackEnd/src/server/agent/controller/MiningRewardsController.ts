import CommonController from '../../../foundation/server/CommonController';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import Service from '../service/MiningRewardsService';
import MiningRewards, {
  MiningRewardsStatus,
} from '../../../general/model/dbModel/MiningRewards';
import globalVar from '../const/globalVar';
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
    this.getAllLedger = this.getAllLedger.bind(this);
    this.approve = this.approve.bind(this);
    this.updateMstPrice = this.updateMstPrice.bind(this);
    this.verifierAddress =
      globalVar.foundationConfig.smartcontract.MappedSwap['verifierAddress'];
  }

  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.status) {
        this.val.isNum(req.query.status, 'status');
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
      // if (
      //   !req.jwt.role ||
      //   !this.val.containsElement(req.jwt.role, '|', 'account', 'Role')
      //   // && req.jwt.address != this.verifierAddress
      // ) {
      //   throw new Error('User must be account or verifier to view this page');
      // }
      this.val.checkRole(req.jwt.role, 'account', req.jwt.parentAgentId);

      this.val.isNullOrEmpty(req.query.jobId, 'jobId');
      jobIds = req.query.jobId.split(',');
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
    req.query.jobId = jobIds;
    const data = await this.service.getAllSummary(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getAllLedger(req: any, res: any) {
    let jobIds = [];
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.status) {
        this.val.isNum(req.query.status, 'status');
      }
      // if (
      //   !req.jwt.role ||
      //   !this.val.containsElement(req.jwt.role, '|', 'account', 'Role')
      //   // && req.jwt.address != this.verifierAddress
      // ) {
      //   throw new Error('User must be account or verifier to view this page');
      // }
      this.val.checkRole(req.jwt.role, 'account', req.jwt.parentAgentId);

      this.val.isNullOrEmpty(req.query.jobId, 'jobId');
      jobIds = req.query.jobId.split(',');
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
    req.query.jobId = jobIds;
    const data = await this.service.getAllLedger(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async approve(req: any, res: any) {
    try {
      // if (req.jwt.role != 'account') {
      //   throw new Error('User must be account to approve summary');
      // }

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
    const obj: MiningRewards = new MiningRewards();
    const dateNow = new Date();
    obj.id = req.body.jobId;
    obj.approvedById = req.jwt.id;
    obj.approvedDate = dateNow;
    obj.lastModifiedById = req.jwt.id;
    obj.lastModifiedDate = dateNow;
    obj.status = MiningRewardsStatus.Approved;
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

  async updateMstPrice(req: any, res: any) {
    try {
      if (
        !this.val.containsElement(req.jwt.role, '|', 'account', 'Role') &&
        req.jwt.address != this.verifierAddress
      ) {
        throw new Error('User must be account or verifier to view this page');
      }

      this.val.isNullOrEmpty(req.body.jobId, 'jobId');
      this.val.isNullOrEmpty(req.body.mstPrice, 'mstPrice');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

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
      const resp = await this.service.updateMstPrice(
        req.body.jobId,
        req.body.mstPrice,
      );

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
