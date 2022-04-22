import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/CustomerService';
import * as DBModel from '../../../general/model/dbModel/0_index';

import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { EthAccount } from '../../../foundation/utils/ethereum/0_index';
import { CustomerStatus } from '../../../general/model/dbModel/Customer';
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
    private ethAccount: EthAccount = new EthAccount(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.getCreditUpdates = this.getCreditUpdates.bind(this);
    this.genFundingCode = this.genFundingCode.bind(this);
    this.getAllFundingCode = this.getAllFundingCode.bind(this);
    this.updateFundingCode = this.updateFundingCode.bind(this);
  }

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
    req.query.status = req.query.status
      ? req.query.status
      : CustomerStatus.StatusActive;
    req.query.agentId = req.jwt.id;
    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getById(req: any, res: any) {
    try {
      this.val.isNum(req.params.id, 'Customer Id');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.getById(req.params.id);
    return apiResponse(
      res,
      responseBySuccess(
        resp.data,
        resp.success,
        'query',
        resp.respType,
        resp.msg,
      ),
      statusCode(resp.success, 'query'),
    );
  }
  async create(req: any, res: any) {
    const reqBody: DBModel.Customer = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.name, 'Name');
      this.val.isNullOrEmpty(reqBody.address, 'Address');
      this.val.isNullOrEmpty(reqBody.riskLevel, 'Risk level');
      this.val.isNum(reqBody.riskLevel, 'Risk level');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'add'),
      );
    }
    reqBody.agentId = req.jwt.id;
    reqBody.createdById = req.jwt.id;
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
      const resp = await this.service.create(reqBody);
      return apiResponse(res, resp, statusCode(resp.success, 'add'));
    }
  }
  async update(req: any, res: any) {
    const reqBody: DBModel.Customer = req.body;
    const resp = await this.service.update(reqBody, req.jwt.id, false, '');
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }

  async getCreditUpdates(req: any, res: any) {
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
    const data = await this.service.getCreditUpdates(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async genFundingCode(req: any, res: any) {
    const reqBody: DBModel.FundingCode = req.body;
    try {
      if (!reqBody.customerName) {
        reqBody.customerName = '';
      }

      // this.val.isNullOrEmpty(reqBody.customerName, 'customer_name');
      this.val.isNullOrEmpty(reqBody.type, 'type');
      // this.val.isNum(reqBody.id, 'id');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.genFundingCode(reqBody, req.jwt.id);
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }

  async getAllFundingCode(req: any, res: any) {
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
    const data = await this.service.getAllFundingCode(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async updateFundingCode(req: any, res: any) {
    const reqBody: DBModel.FundingCode = req.body;
    reqBody.id = req.body.fundingCode;
    try {
      this.val.isNullOrEmpty(reqBody.id, 'fundingCode');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.updateFundingCode(reqBody);
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }
}
export default Controller;
