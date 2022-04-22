import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import Service from '../service/ConnectedWalletService';

export class Controller implements CommonController {
  /**
   * @description Creates an instance of hello world log controller.
   *
   * @constructor
   *
   */
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
  }
  async getAll(req: any, res: any) {
    throw new Error('Method not implemented.');
  }

  async create(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.address, 'address');
      this.val.isNullOrEmpty(req.body.connectedType, 'connectedType');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.create(req.body);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'add', 'success', 'Created'),
      statusCode(true, 'add'),
    );
  }
}
export default Controller;
