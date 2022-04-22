import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Service from '../service/MiningRewardsService';
import * as DBModel from '../../../general/model/dbModel/0_index';

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
    this.regenerateMiningRewards = this.regenerateMiningRewards.bind(this);
  }

  async getAll(req: any, res: any) {
    // const data = null;
    // return apiResponse(
    //   res,
    //   responseBySuccess(data, true, 'query', 'success', 'Founded'),
    //   statusCode(true, 'query'),
    // );
  }

  async regenerateMiningRewards(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.inputToDate, 'inputToDate');
      // this.val.isNum(req.query.id, 'id');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    const resp = await this.service.regenerateMiningRewards(
      req.body.inputToDate,
    );

    return apiResponse(
      res,
      responseBySuccess(
        resp.data,
        resp.success,
        'query',
        resp.respType,
        resp.msg,
      ),
      statusCode(true, 'query'),
    );
    // return data;
  }
}
export default Controller;
