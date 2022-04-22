import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/TransactionService';
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
    this.getAll = this.getAll.bind(this);
    this.getAllBurnTranscation = this.getAllBurnTranscation.bind(this);
    this.getAllBuyBackTranscation = this.getAllBuyBackTranscation.bind(this);
  }
  /**
   * Get sum data of volume from t_decats_price_transactions table
   * [Required, from req] : recordPerPage, pageNo, address
   * order by id Desc
   */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      this.val.isNullOrEmpty(req.query.address, 'address');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.getAll(req.query);
    return apiResponse(res, resp, statusCode(resp.success, 'query'));
  }

  async getAllBurnTranscation(req: any, res: any) {
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

    const data = await this.service.getAllBurnTranscation(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getAllBuyBackTranscation(req: any, res: any) {
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

    const data = await this.service.getAllBuyBackTranscation(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
