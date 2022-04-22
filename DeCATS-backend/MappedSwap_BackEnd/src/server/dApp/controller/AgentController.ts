import CommonController from '../../../foundation/server/CommonController';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import Service from '../service/AgentService';
import EthAccount from '../../../foundation/utils/ethereum/EthAccount';
import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { AgentStatus } from '../../../general/model/dbModel/Agent';

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
    this.getMstToUsdRate = this.getMstToUsdRate.bind(this);
  }

  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');

      req.query.agentId = req.jwt.agentId;
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.status = req.query.status
      ? req.query.status
      : AgentStatus.StatusActive;

    if (req.query.agentId) {
      const data = await this.service.getAll(req.query);
      return apiResponse(
        res,
        responseBySuccess(data, true, 'query', 'success', 'Founded'),
        statusCode(true, 'query'),
      );
    } else {
      return apiResponse(
        res,
        responseBySuccess('agentId cannot be empty', false, 'error'),
        statusCode(true, 'error'),
      );
    }
  }

  async getMstToUsdRate(req: any, res: any) {
    const data = await this.service.toMSTExchangeRate();
    return apiResponse(
      res,
      // responseBySuccess(data, true, 'query', 'success', 'Founded'),
      data,
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
