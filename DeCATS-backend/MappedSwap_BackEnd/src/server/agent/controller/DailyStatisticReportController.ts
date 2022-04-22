import {
  apiResponse,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/DailyStatisticReportService';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import moment from 'moment';

export class Controller implements CommonController {
  constructor(
    private service: Service = new Service(),
    private val: ValidationHelper = new ValidationHelper(),
  ) {
    this.val.throwError = true;
    this.getAll = this.getAll.bind(this);
  }

  /**
     * Filter the t_decats_daily_statistic_reports
       [Required, from jwt] : agentId(jwt.id), jwt.role, jwt.parentAgentId
       [Required, from req] : recordPerPage, pageNo
       [Optional, from req] : dateFrom, dateTo
     */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
      if (req.query.dateFrom) {
        req.query.dateFrom = moment
          .utc(req.query.dateFrom)
          .startOf('day')
          .toDate();
      }
      if (req.query.dateTo) {
        req.query.dateTo = moment.utc(req.query.dateTo).endOf('day').toDate();
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    req.query.agentId = req.jwt.id;
    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
