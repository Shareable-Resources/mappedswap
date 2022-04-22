import moment from 'moment';
import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/ProfitDailyReportService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ProfitDailyReportServer } from '../model/ProfitDailyReportServer';
import { ServerConfigBase } from '../../../foundation/server/ServerConfigBase';
import logger from '../util/ServiceLogger';

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
    this.create = this.create.bind(this);
    this.createMany = this.createMany.bind(this);
  }

  async create(req: any, res: any) {
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
    const serverConfigObj: ServerConfigBase = new ServerConfigBase();
    const serverBase: ProfitDailyReportServer = new ProfitDailyReportServer(
      serverConfigObj,
    );
    const resp = await serverBase.createDailyReport(reqBody.createdDate);
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }
  async createMany(req: any, res: any) {
    const reqBody = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.dateFrom, 'dateFrom');
      this.val.isNullOrEmpty(reqBody.dateTo, 'dateTo');
      reqBody.dateFrom = moment(reqBody.dateFrom).format('YYYY-MM-DD');
      reqBody.dateTo = moment(reqBody.dateTo).format('YYYY-MM-DD');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const serverConfigObj: ServerConfigBase = new ServerConfigBase();
    const serverBase: ProfitDailyReportServer = new ProfitDailyReportServer(
      serverConfigObj,
    );
    const resps: ResponseBase[] = [];
    let diff = moment(reqBody.dateFrom).diff(moment(reqBody.dateTo));
    while (diff <= 0) {
      logger.debug(diff);
      const createdDate = reqBody.dateFrom;
      const resp = await serverBase.createDailyReport(createdDate);
      resps.push(resp);
      reqBody.dateFrom = moment(reqBody.dateFrom).add(1, 'day').toDate();
      diff = moment(reqBody.dateFrom).diff(moment(reqBody.dateTo));
    }

    const success = !resps.find((x) => !x.success);
    const msgs = resps.map((x) => x.msg).join('/n');
    return apiResponse(
      res,
      responseBySuccess(null, success, 'add', 'info', msgs),
      statusCode(success, 'add'),
    );
  }
}
export default Controller;
