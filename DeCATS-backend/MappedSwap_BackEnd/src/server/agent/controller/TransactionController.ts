import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/TransactionService';
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
    this.getStat = this.getStat.bind(this);
    this.addNewBurnTranscation = this.addNewBurnTranscation.bind(this);
    this.getAllBurnTranscation = this.getAllBurnTranscation.bind(this);
    this.addNewBuyBackTranscation = this.addNewBuyBackTranscation.bind(this);
    this.getAllBuyBackTranscation = this.getAllBuyBackTranscation.bind(this);
    this.getTotalVolume = this.getTotalVolume.bind(this);
    this.getActiveCustomers = this.getActiveCustomers.bind(this);
  }
  /**
   * Filter the list of Transaction based on
     [Required, from jwt] : agentId(jwt.id)
     [Required, from req] : recordPerPage, pageNo
     [Optional, from req] : dateFrom,dateTo,txStatus,address,name,sellToken,buyToken
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

  async addNewBurnTranscation(req: any, res: any) {
    const reqBody: DBModel.BurnTransactions = req.body;
    try {
      this.val.checkRole(
        req.jwt.role,
        'mst_info_config',
        req.jwt.parentAgentId,
      );

      this.val.isNullOrEmpty(reqBody.txHash, 'blockId');
      this.val.isNullOrEmpty(reqBody.mstAmount, 'price');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    // reqBody.id = req.jwt.id;
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
      const resp = await this.service.addNewBurnTranscation(
        reqBody,
        req.jwt.id,
      );
      return apiResponse(res, resp, statusCode(resp.success, 'add'));
    }
  }

  async getAllBurnTranscation(req: any, res: any) {
    try {
      this.val.checkRole(
        req.jwt.role,
        'mst_info_config',
        req.jwt.parentAgentId,
      );

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

    const data = await this.service.getAllBurnTranscation(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async addNewBuyBackTranscation(req: any, res: any) {
    const reqBody: DBModel.BuyBackDetails = req.body;
    try {
      this.val.checkRole(
        req.jwt.role,
        'mst_info_config',
        req.jwt.parentAgentId,
      );

      this.val.isNullOrEmpty(reqBody.txHash, 'blockId');
      this.val.isNullOrEmpty(reqBody.mstAmount, 'price');
      this.val.isNullOrEmpty(reqBody.usdPrice, 'usdPirce');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    // reqBody.id = req.jwt.id;
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
      const resp = await this.service.addNewBuyBackTranscation(
        reqBody,
        req.jwt.id,
      );
      return apiResponse(res, resp, statusCode(resp.success, 'add'));
    }
  }

  async getAllBuyBackTranscation(req: any, res: any) {
    try {
      this.val.checkRole(
        req.jwt.role,
        'mst_info_config',
        req.jwt.parentAgentId,
      );

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

    const data = await this.service.getAllBuyBackTranscation(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getTotalVolume(req: any, res: any) {
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
    const data = await this.service.getTotalVolume(req.query);
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
