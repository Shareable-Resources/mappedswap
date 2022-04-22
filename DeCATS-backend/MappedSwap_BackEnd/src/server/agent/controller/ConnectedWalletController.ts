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
import { RequestBase } from '../../../foundation/old/duncan';
import moment from 'moment';

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
    this.getMonthlyReports = this.getMonthlyReports.bind(this);
  }
  async getAll(req: any, res: any) {
    throw new Error('Method not implemented.');
  }

  async create(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.address, 'address');
      this.val.isNullOrEmpty(req.query.connectedType, 'connectedType');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.create(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'add', 'success', 'Created'),
      statusCode(true, 'add'),
    );
  }

  async getMonthlyReports(req: any, res: any) {
    try {
      this.val.checkRole(req.jwt.role, 'report', req.jwt.parentAgentId);
      if (req.query.connectedTypes) {
        const connectedTypes = JSON.parse(
          JSON.stringify(req.query.connectedTypes),
        );
        req.query.connectedTypes = [];
        if (connectedTypes) {
          req.query.connectedTypes = connectedTypes.split(',');
          req.query.connectedTypes.forEach((x) => {
            this.val.isNum(x, 'connectedType');
          });
        }
      }
      if (req.query.dateFrom) {
        req.query.dateFrom = moment
          .utc(req.query.dateFrom, 'YYYY-MM')
          .startOf('month')
          .toDate();
      }
      if (req.query.dateTo) {
        req.query.dateTo = moment
          .utc(req.query.dateTo, 'YYYY-MM')
          .endOf('month')
          .toDate();
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const data = await this.service.getMonthlyReports(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
