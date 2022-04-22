import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/EventService';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import ArrayHelper from '../../../foundation/utils/ArrayHelper';
import Event, {
  EventDistType,
  EventStatus,
} from '../../../general/model/dbModel/Event';
import moment from 'moment';
export class Controller implements CommonController {
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
    this.getEventDetails = this.getEventDetails.bind(this);
    this.uploadEventParticipants = this.uploadEventParticipants.bind(this);
  }
  async create(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.distType, 'distType');
      this.val.isNullOrEmpty(req.body.token, 'token');
      this.val.isNullOrEmpty(req.body.code, 'code');
      this.val.isNullOrEmpty(req.body.name, 'name');
      this.val.isEnum(req.body.distType, 'distType', EventDistType);
      if (req.body.budget) {
        this.val.isNum(req.body.budget, 'buget');
      }
      if (req.body.quota) {
        this.val.isNum(req.body.quota, 'quota');
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'add'),
      );
    }
    const agentId = req.jwt.id;
    const obj = new Event();
    const dateNow = moment().utc().toDate();
    obj.createdById = agentId;
    obj.lastModifiedById = agentId;
    obj.status = EventStatus.Active;
    obj.distType = req.body.distType;
    obj.token = req.body.token;
    obj.code = req.body.code;
    obj.name = req.body.name;
    obj.quota = req.body.quota ? req.body.quota : null;
    obj.budget = req.body.budget ? req.body.budget : null;
    obj.lastModifiedDate = dateNow;
    obj.createdDate = dateNow;
    const resp = await this.service.create(obj);
    return apiResponse(res, resp, statusCode(resp.success, 'add'));
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

  async getEventDetails(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.eventId, 'eventId');
      this.val.isNum(req.query.eventId, 'eventId');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.agentId = req.jwt.id;
    const resp = await this.service.getEventDetails(req.body);
    return apiResponse(res, resp, statusCode(false, 'query'));
  }
  /**
       * Upload address and return quota and amt
         [Required, from req] : recordPerPage, pageNo
       */
  async uploadEventParticipants(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.eventId, 'eventId');
      this.val.isNum(req.body.eventId, 'eventId');
      if (req.body.participants.length == 0) {
        throw new Error('Please at least have 1 participant');
      }
      for (let i = 0; i < req.body.participants.length; i++) {
        this.val.isWalletAddress(req.body.participants[i].address);
      }
      const duplicates = ArrayHelper.findDuplicates(
        req.body.participants,
        'address',
      );
      if (duplicates.length > 0) {
        throw new Error(`Addresses duplicate for (${duplicates.join(',')})`);
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.body.agentId = req.jwt.id;
    const resp = await this.service.uploadEventParticipants(req.body);
    return apiResponse(res, resp, statusCode(false, 'query'));
  }
}
export default Controller;
