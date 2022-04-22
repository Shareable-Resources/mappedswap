import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/CustomerService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import * as ReqModel from '../model/reqModel/0_index';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { EthAccount } from '../../../foundation/utils/ethereum/0_index';
import { baToJSON } from 'ethereumjs-util';
import { recoverTypedSignature_v4 } from 'eth-sig-util';

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
    this.login = this.login.bind(this);
    this.loadFundingCode = this.loadFundingCode.bind(this);
    this.loginByDeveloper = this.loginByDeveloper.bind(this);
    this.getAllFundingCode = this.getAllFundingCode.bind(this);
  }

  async getAll(req: any, res: any) {
    const data = null;
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async login(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.body.message, 'message');
      this.val.isNullOrEmpty(req.body.address, 'address');
      this.val.isNullOrEmpty(req.body.signature, 'signature');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    let resp: ResponseBase = new ResponseBase();
    const reqBody: ReqModel.CustomerLoginReq = req.body;
    // Verify the signed data is from actual user
    let addressFromSignature = '';
    if (reqBody.signatureType && reqBody.signatureType == 'eip712') {
      addressFromSignature = recoverTypedSignature_v4({
        data: JSON.parse(reqBody.message),
        sig: reqBody.signature,
      });
    } else {
      addressFromSignature = this.ethAccount.recover(
        reqBody.message,
        reqBody.signature,
      );
    }
    const isVerified =
      addressFromSignature.toLowerCase() == reqBody.address.toLowerCase();

    if (isVerified) {
      resp = await this.service.login(reqBody);
    } else {
      resp.msg = 'Signature mismatched';
      resp.success = false;
      resp.respType = 'warning';
    }

    return apiResponse(
      res,
      responseBySuccess(
        resp.data,
        resp.success,
        'query',
        resp.respType,
        resp.msg,
      ),
      statusCode(resp.success, 'query'),
    );
  }

  async loginByDeveloper(req: any, res: any) {
    try {
      //this.val.isNullOrEmpty(req.body.message, 'message');
      this.val.isNullOrEmpty(req.body.address, 'address');
      //this.val.isNullOrEmpty(req.body.signature, 'signature');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    let resp: ResponseBase = new ResponseBase();
    const reqBody: ReqModel.CustomerLoginReq = req.body;
    // Verify the signed data is from actual user
    resp = await this.service.login(reqBody);
    return apiResponse(
      res,
      responseBySuccess(
        resp.data,
        resp.success,
        'query',
        resp.respType,
        resp.msg,
      ),
      statusCode(resp.success, 'query'),
    );
  }

  async loadFundingCode(req: any, res: any) {
    const reqBody: DBModel.Customer = new DBModel.Customer();
    try {
      this.val.isNullOrEmpty(req.body.fundingCode, 'fundingCode');
      reqBody.address = req.jwt.address;
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.loadFundingCode(
      reqBody,
      req.body.fundingCode,
      req.jwt,
    );
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }

  async getAllFundingCode(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    req.query.id = req.jwt.id;
    const data = await this.service.getAllFundingCode(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }
}
export default Controller;
