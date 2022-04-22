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
    this.getRewardByAddress = this.getRewardByAddress.bind(this);
    this.updateRewardById = this.updateRewardById.bind(this);
    this.getClaimSummary = this.getClaimSummary.bind(this);
  }

  async getAll(req: any, res: any) {
    // const data = null;
    // return apiResponse(
    //   res,
    //   responseBySuccess(data, true, 'query', 'success', 'Founded'),
    //   statusCode(true, 'query'),
    // );
  }

  async getRewardByAddress(req: any, res: any) {
    // try {
    //   this.val.isNullOrEmpty(req.query.pairName, 'pairName');
    //   this.val.isNullOrEmpty(req.query.timeInterval, 'timeInterval');
    //   this.val.isNum(req.query.timeInterval, 'timeInterval');
    //   req.query.timeInterval = this.getTimeIntervalSql(req.query.timeInterval);
    // } catch (e: any) {
    //   return apiResponse(
    //     res,
    //     new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
    //     statusCode(false, 'query'),
    //   );
    // }

    const data = await this.service.getRewardByAddress(
      req.query,
      req.jwt.address,
    );
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async updateRewardById(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.id, 'id');
      // this.val.isNum(req.query.id, 'id');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    const miningRewardsDistribution: DBModel.MiningRewardsDistribution =
      new DBModel.MiningRewardsDistribution();
    miningRewardsDistribution.id = req.body.id;
    miningRewardsDistribution.address = req.jwt.address;

    const resp = await this.service.updateRewardById(miningRewardsDistribution);
    // return apiResponse(
    //   res,
    //   responseBySuccess(data, true, 'query', 'success', 'Founded'),
    //   statusCode(true, 'query'),
    // );

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

  async getClaimSummary(req: any, res: any) {
    // try {
    //   this.val.isNullOrEmpty(req.query.pairName, 'pairName');
    //   this.val.isNullOrEmpty(req.query.timeInterval, 'timeInterval');
    //   this.val.isNum(req.query.timeInterval, 'timeInterval');
    //   req.query.timeInterval = this.getTimeIntervalSql(req.query.timeInterval);
    // } catch (e: any) {
    //   return apiResponse(
    //     res,
    //     new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
    //     statusCode(false, 'query'),
    //   );
    // }

    const data = await this.service.getClaimSummary(req.query, req.jwt.address);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
