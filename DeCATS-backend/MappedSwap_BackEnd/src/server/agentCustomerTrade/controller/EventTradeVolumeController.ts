import moment from 'moment';
import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/EventTradeVolumeService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { EventServer } from '../model/EventServer';
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
    this.getAll = this.getAll.bind(this);
    this.writeTradeVolume = this.writeTradeVolume.bind(this);
  }

  async getAll(req: any, res: any) {
    throw new Error('Not implemented');
  }

  async writeTradeVolume(req: any, res: any) {
    const resp = await this.service.writeTradeVolume();
    return apiResponse(
      res,
      responseBySuccess(resp.data, resp.success, 'add', 'info', resp.msg),
      statusCode(resp.success, 'add'),
    );
  }
}
export default Controller;
