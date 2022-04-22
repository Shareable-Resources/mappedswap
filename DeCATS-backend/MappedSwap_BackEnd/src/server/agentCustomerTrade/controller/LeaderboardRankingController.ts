import moment from 'moment';
import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/LeaderboardRankingService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';

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
    this.writeTop20Leaderboards = this.writeTop20Leaderboards.bind(this);
  }

  async getAll(req: any, res: any) {
    throw new Error('Not implemented');
  }

  async writeTop20Leaderboards(req: any, res: any) {
    const resp = await this.service.writeTop20Leaderboards();
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }
}
export default Controller;
