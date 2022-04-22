import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/EventApprovalService';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import ArrayHelper from '../../../foundation/utils/ArrayHelper';
import { EthClient } from '../../../foundation/utils/ethereum/0_index';
import EventApproval, {
  EventApprovalStatus,
} from '../../../general/model/dbModel/EventApproval';
import moment from 'moment';
export class Controller implements CommonController {
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.approve = this.approve.bind(this);
    this.distribute = this.distribute.bind(this);
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
  async approve(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.txHash, 'txHash');
      this.val.isNullOrEmpty(req.body.id, 'id');
      this.val.isNullOrEmpty(req.body.roundId, 'roundId');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.id;
    const dateNow = moment.utc().toDate();
    const obj = new EventApproval();
    obj.id = req.body.id;
    obj.lastModifiedDate = dateNow;
    obj.approvedDate = dateNow;
    obj.status = EventApprovalStatus.Approved;
    obj.txHash = req.body.txHash;
    obj.eventId = req.body.eventId;
    obj.roundId = req.body.roundId;
    obj.createdById = req.query.agentId;
    obj.lastModifiedById = req.query.agentId;
    obj.approvedById = req.query.agentId;
    const resp = await this.service.approve(obj);
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }
  // async createRound(req: any, res: any) {
  //   const obj = new EventApproval();
  //   obj.id = req.body.id;
  //   const resp = await this.service.createRound(obj);
  //   return apiResponse(res, resp, statusCode(true, 'up'));
  // }
  async distribute(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.id, 'id');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'up'),
      );
    }
    const obj = new EventApproval();
    obj.id = req.body.id;
    obj.lastModifiedById = req.jwt.id;
    const resp = await this.service.distribute(obj);
    return apiResponse(res, resp, statusCode(true, 'up'));
  }
}
export default Controller;
