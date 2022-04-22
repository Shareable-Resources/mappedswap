import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/PriceService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { price } from '../SystemTask/PriceLoader';

export class Controller implements CommonController {
  /**
   * @description Creates an instance of users controller.
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
    this.getPairInfo = this.getPairInfo.bind(this);
    this.getAllBlockPrice = this.getAllBlockPrice.bind(this);
  }

  async getAll(req: any, res: any) {
    // logger.info('entered getAll function in Price');
    // req.query.agentId = req.jwt.id;
    // const data = await this.service.getAll();

    // logger.info('before exit getAll function in Price');

    return apiResponse(
      res,
      // responseBySuccess(data, true, 'query', 'success', 'Founded'),
      responseBySuccess(price, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getPairInfo(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.pairName, 'pairName');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getPairInfo(req.query);
    return apiResponse(
      res,
      // responseBySuccess(data, true, 'query', 'success', 'Founded'),
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getAllBlockPrice(req: any, res: any) {
    try {
      // this.val.isNullOrEmpty(req.jwt.id, 'agentId (jwt)');
      // this.val.isNum(req.jwt.id, 'agentId (jwt)');
      // req.query.agentId = req.jwt.id;

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

    // if (req.query.dateFrom) {
    //   req.query.dateFrom = req.query.dateFrom + ' GMT+0008';
    // }
    // if (req.query.dateTo) {
    //   req.query.dateTo = req.query.dateTo + ' GMT+0008';
    // }

    const data = await this.service.getAllBlockPrice(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
