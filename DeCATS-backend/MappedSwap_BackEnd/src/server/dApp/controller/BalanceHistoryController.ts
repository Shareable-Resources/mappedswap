import {
  apiResponse,
  responseBySuccess,
  statusCode,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
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
  }
  /**
   * Get data from t_decats_balance_histories table based on address
   * [Optional, from req] : token, type, address, dateFrom, dateTo
     [Required, from jwt] : address
     order by id desc
   */
  async getAll(req: any, res: any) {
    const address = req.jwt.address;
    const data = await this.service.getAll(req.query, address);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
