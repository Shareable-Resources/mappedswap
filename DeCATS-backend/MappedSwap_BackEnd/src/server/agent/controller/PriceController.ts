import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/PriceService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import * as DBModel from '../../../general/model/dbModel/0_index';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';

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
    this.addMstPrice = this.addMstPrice.bind(this);
    this.getMstPrice = this.getMstPrice.bind(this);
  }

  async getAll(req: any, res: any) {
    // req.query.agentId = req.jwt.id;
    const resp = await this.service.getAll();
    return apiResponse(
      res,
      // responseBySuccess(data, true, 'query', 'success', 'Founded'),
      responseBySuccess(resp.data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async addMstPrice(req: any, res: any) {
    const reqBody: DBModel.MstPrice = req.body;

    try {
      this.val.checkRole(
        req.jwt.role,
        'mst_info_config',
        req.jwt.parentAgentId,
      );

      this.val.isNullOrEmpty(reqBody.mstPrice, 'mstPrice');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    // reqBody.id = req.jwt.id;
    reqBody.createdById = req.jwt.id;
    reqBody.lastModifiedById = req.jwt.id;

    if (req.jwt.isReadOnly) {
      return apiResponse(
        res,
        new WarningResponseBase(
          ServerReturnCode.InvalidArgument,
          'This login is ReadOnly',
        ),
        statusCode(false, 'query'),
      );
    } else {
      const resp = await this.service.addMstPrice(reqBody);
      return apiResponse(res, resp, statusCode(resp.success, 'add'));
    }
  }

  async getMstPrice(req: any, res: any) {
    const resp = await this.service.getMstPrice();

    try {
      this.val.checkRole(
        req.jwt.role,
        'mst_info_config',
        req.jwt.parentAgentId,
      );
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    return apiResponse(
      res,
      responseBySuccess(resp.data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
