import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import Service from '../service/CommissionLedgerService';
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
  }
  /**
   * Filter the list of t_decats_ledgers based on
     [Optional] : status
     [Required, from jwt] : id
     [Required, from req] : recordPerPage, pageNo, jobIds
     order by createdDate Desc
   */
  async getAll(req: any, res: any) {
    let jobIds = [];
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      this.val.isNullOrEmpty(req.query.jobIds, 'jobIds');

      if (req.query.withZero) {
        req.query.withZero = this.val.isBoolean(req.query.withZero);
      }
      jobIds = req.query.jobIds.split(',');
      jobIds.forEach((x) => {
        this.val.isNum(x, 'jobIds');
      });
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    if (!req.jwt.role) {
      req.query.agentId = req.jwt.id;
    }
    req.query.jobIds = jobIds;
    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
