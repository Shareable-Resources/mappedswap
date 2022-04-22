import {
  apiResponse,
  responseBySuccess,
  statusCode,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/LeaderBoardRankingService';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { EthAccount } from '../../../foundation/utils/ethereum/0_index';
import express from 'express';

export default class Controller implements CommonController {
  /**
   * @description Creates an instance of leaderboard rankings controller
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
  }

  getAll = async (
    req: express.Request,
    res: express.Response,
  ): Promise<express.Response<unknown, Record<string, unknown>>> => {
    const funcMsg = `[LeaderBoardRanking Controller] [getAll]`;
    try {
      const data = await this.service.getAll();
      return apiResponse(
        res,
        responseBySuccess(data, true, 'query', 'success', 'Founded'),
        statusCode(true, 'query'),
      );
    } catch (err) {
      throw new Error(`${funcMsg}: ${err}`);
    }
  };
}
