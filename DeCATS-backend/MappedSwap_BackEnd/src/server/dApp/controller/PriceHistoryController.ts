import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/PriceHistoryService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { avaliableTimeInterval } from '../model/EnumPriceHistoryAllowedTimeInterval';
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
    this.getKLineData = this.getKLineData.bind(this);
    this.getKLineDataVolumeSum = this.getKLineDataVolumeSum.bind(this);
    this.getHistoryPrice = this.getHistoryPrice.bind(this);
  }
  getTimeIntervalSql(timeInterval: any): number | null {
    console.log(avaliableTimeInterval);
    timeInterval = Number(timeInterval);
    if (!avaliableTimeInterval.find((x) => x == timeInterval)) {
      throw new Error(
        `Data must be any of [${avaliableTimeInterval.join(
          ',',
        )}] - timeInterval`,
      );
    } else {
      timeInterval = Number(timeInterval);
    }
    return timeInterval;
  }
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      this.val.isNullOrEmpty(req.query.pairName, 'pairName');
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
  async getKLineData(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.pairName, 'pairName');
      this.val.isNullOrEmpty(req.query.timeInterval, 'timeInterval');
      this.val.isNum(req.query.timeInterval, 'timeInterval');
      req.query.timeInterval = this.getTimeIntervalSql(req.query.timeInterval);
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getKLineData(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
  /**
   * Get 2 set of sum of volume from t_decats_price_histories table base on a duration and dateFrom
   * [Required, from req] : pairName, duration
   * [Optional, from req] : dateFrom
     [Required, from jwt] : id
     order by createdDate Desc
   */
  async getKLineDataVolumeSum(req: any, res: any) {
    try {
      const allowDurations = [8, 16, 24];
      this.val.isNullOrEmpty(req.query.pairName, 'pairName');
      this.val.isNullOrEmpty(req.query.duration, 'duration');
      this.val.isNum(req.query.duration, 'duration');
      //If no startFrom is specified, default to now
      req.query.dateFrom = req.query.dateFrom
        ? `'${req.query.dateFrom}'::timestamptz`
        : 'NOW()::timestamptz';
      if (!allowDurations.includes(Number(req.query.duration))) {
        throw new Error(
          `Data must be any of [${allowDurations.join(',')}] - duration`,
        );
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const dataLatest = await this.service.getKLineDataVolumeSum(req.query);
    const lastOfLatestQuery = { ...req.query };
    lastOfLatestQuery.dateFrom = `${req.query.dateFrom}  - interval '${req.query.duration} hours' `;
    const dataLastOfLatest = await this.service.getKLineDataVolumeSum(
      lastOfLatestQuery,
    );
    const returnData = [dataLatest, dataLastOfLatest];
    return apiResponse(
      res,
      responseBySuccess(returnData, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getHistoryPrice(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.pairName, 'pairName');

      // this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      // this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      // this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      // this.val.isNum(req.query.pageNo, 'pageNo');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getHistoryPrice(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}

export default Controller;
