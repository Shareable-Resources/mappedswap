import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  successResponse,
} from '../../../foundation/src/api/ApiMessage';
import CommonController from '../../../foundation/src/server/CommonController';
import { ServerReturnCode } from '../../../foundation/src/ServerReturnCode';
import * as DBModel from '../model/DBModel/0_index';
import Service from '../service/merchant_client_service';
import elliptic from 'elliptic';
import ECSDAHelper from '../helper/ecdsa';
//import ethAccounts from '../util/EthAccount';
import * as ReqModel from '../model/ReqModel/0_index';
import Web3 from 'web3';
//import Accounts from 'web3-eth-accounts';
import Accounts from '../util/EthAccount';
export class Controller implements CommonController {
  /**
   * @description Creates an instance of merchant admin controller.
   * @author Vince Tang
   * @constructor
   * @param {Service} service
   */
  constructor(private service: Service = new Service()) {
    this.importWallet = this.importWallet.bind(this);
    this.getAll = this.getAll.bind(this);
  }

  async getAll(req: any, res: any) {
    const list = await this.service.getAll();
    return apiResponse(
      res,
      responseBySuccess(list, true, 'query', 'success'),
      statusCode(true, 'query'),
    );
  }

  async importWallet(req: any, res: any) {
    const reqBody: ReqModel.ImportWalletReq = req.body;
    // Verify the signed data is from actual user
    const addressFromSignature = Accounts.recover(
      reqBody.message,
      reqBody.signature,
    );
    const isVerified =
      addressFromSignature.toUpperCase() == reqBody.walletAddress.toUpperCase();
    let responseBase: ResponseBase = new ResponseBase();
    if (isVerified) {
      responseBase = await this.service.importWallet(reqBody);
    } else {
      responseBase.msg = 'Signature mismatched';
      responseBase.success = false;
      responseBase.respType = 'warning';
    }

    return apiResponse(
      res,
      responseBySuccess(
        responseBase.data,
        responseBase.success,
        'query',
        responseBase.respType,
        responseBase.msg,
      ),
      statusCode(responseBase.success, 'query'),
    );
  }
}
export default Controller;
