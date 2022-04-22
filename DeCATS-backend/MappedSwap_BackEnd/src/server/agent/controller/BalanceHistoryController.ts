import moment from 'moment';
import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Service from '../service/BalanceHistoryService';
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
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.getStat = this.getStat.bind(this);
    this.getTotalDepositWithdrawAmount =
      this.getTotalDepositWithdrawAmount.bind(this);
    this.getActiveCustomers = this.getActiveCustomers.bind(this);
    this.getActiveAddresses = this.getActiveAddresses.bind(this);
  }
  /**
   * Get data from t_decats_balances_histories table    
   * 
   * if normal agent, it will use jwt.id as agentId
     [Required, from jwt] : agentId (jwt.id)
     [Required, from req] : recordPerPage, pageNo
     [Optional, from req] : name (like), agentId, address, token, type, dateFrom, dateTo
   */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.jwt.id, 'agentId (jwt)');
      this.val.isNum(req.jwt.id, 'agentId (jwt)');
      req.query.agentId = req.jwt.id;
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getStat(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.dateFrom, 'dateFrom');
      this.val.isNullOrEmpty(req.query.dateTo, 'dateTo');
      if (req.jwt.parentAgentId) {
        throw new Error('Root Agent Only');
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getStat(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getTotalDepositWithdrawAmount(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.fromTime, 'fromTime');
      this.val.isNullOrEmpty(req.query.toTime, 'toTime');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getTotalDepositWithdrawAmount(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  } /**
   * Get active address from t_decats_balances_histories table    
   * 
   * if normal agent, it will use jwt.id as agentId
     [Required, from jwt] : req.jwt.role
     [Required, from req] : recordPerPage, pageNo
     [Optional, from req] : dateFrom, dateTo
   */
  async getActiveAddresses(req: any, res: any) {
    try {
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      if (req.query.dateFrom) {
        req.query.dateFrom = moment
          .utc(req.query.dateFrom)
          .startOf('day')
          .toDate();
      }
      if (req.query.dateTo) {
        req.query.dateTo = moment.utc(req.query.dateTo).endOf('day').toDate();
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getActiveAddresses(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getActiveCustomers(req: any, res: any) {
    try {
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      this.val.isNullOrEmpty(req.query.dateFrom, 'dateFrom');
      this.val.isNullOrEmpty(req.query.dateTo, 'dateTo');
      if (req.query.type) {
        this.val.isNum(req.query.type, 'type');
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getActiveCustomers(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
