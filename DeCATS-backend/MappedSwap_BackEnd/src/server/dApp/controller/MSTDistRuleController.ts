import {
  apiResponse,
  responseBySuccess,
  statusCode,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/MSTDistRuleService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { EthAccount } from '../../../foundation/utils/ethereum/0_index';
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
    private ethAccount: EthAccount = new EthAccount(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
  }

  async getAll(req: any, res: any) {
    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
