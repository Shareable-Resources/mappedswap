import moment from 'moment';
import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { CronJobReqDailySettlement } from '../model/CronJobReq';
import Service from '../service/DailySettlementService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';

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
    this.createRealTimeDailySettlements =
      this.createRealTimeDailySettlements.bind(this);
    this.createDailySettlement = this.createDailySettlement.bind(this);
    this.createMany = this.createMany.bind(this);
    this.generateFromLastStart = this.generateFromLastStart.bind(this);
    this.createRealTimeOrInsert = this.createRealTimeOrInsert.bind(this);
  }

  async createRealTimeOrInsert(req: any, res: any) {
    const reqBody = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.createdDate, 'createdDate');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.createRealTimeOrInsert(req.body);
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }

  async generateFromLastStart(req: any, res: any) {
    const resp = await this.service.generateFromLastStart();
    return apiResponse(
      res,
      responseBySuccess(null, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }

  async createRealTimeDailySettlements(req: any, res: any) {
    const reqBody = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.createdDate, 'createdDate');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.createRealTimeOrInsert(req.body);
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }

  async createDailySettlement(req: any, res: any) {
    const reqBody = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.createdDate, 'createdDate');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.createDailySettlement(req.body);
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }
  async createMany(req: any, res: any) {
    const resps: ResponseBase[] = [];
    const originalQuery = JSON.parse(JSON.stringify(req.body));

    for (let i = 0; i < req.body.days; i++) {
      const query: CronJobReqDailySettlement = {
        createdDate: moment(originalQuery.createdDate)
          .startOf('day')
          .add(i, 'day')
          .format('YYYY-MM-DD'),
      };
      const resp = await this.service.createDailySettlement(query);
      resps.push(resp);
    }
    const data: any = {
      failMsg: resps.filter((x) => !x.success).map((x) => x.msg),
      succesMsg: resps.filter((x) => x.success).map((x) => x.msg),
    };
    const manyResp = new ResponseBase();
    manyResp.success = resps.find((x) => !x.success) ? false : true;
    manyResp.data = data;
    manyResp.respType = 'info';
    manyResp.msg =
      'Create many call success, please check data property to validate results';
    return apiResponse(
      res,
      responseBySuccess(
        manyResp.data,
        manyResp.success,
        'add',
        manyResp.respType,
        manyResp.msg,
      ),
      statusCode(manyResp.success, 'add'),
    );
  }
  async getAll() {
    throw new Error('Not Implemented');
  }
}
export default Controller;
