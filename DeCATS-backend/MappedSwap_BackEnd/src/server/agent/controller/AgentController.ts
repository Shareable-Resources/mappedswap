import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
  WarningResponseBase,
} from '../../../foundation/server/ApiMessage';
import CommonController from '../../../foundation/server/CommonController';
import Service from '../service/AgentService';
import * as DBModel from '../../../general/model/dbModel/0_index';
import { ValidationHelper } from '../../../foundation/utils/ValidationHelper';
import { ServerReturnCode } from '../../../foundation/server/ServerReturnCode';
import { AgentStatus, AgentType } from '../../../general/model/dbModel/Agent';
import EthAccount from '../../../foundation/utils/ethereum/EthAccount';
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
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getNoOfNodes = this.getNoOfNodes.bind(this);
    this.getSubAgent = this.getSubAgent.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.login = this.login.bind(this);
    this.loginByDeveloper = this.loginByDeveloper.bind(this);
    this.changeRole = this.changeRole.bind(this);
    this.genReferralCode = this.genReferralCode.bind(this);
    this.getAllReferralCode = this.getAllReferralCode.bind(this);
    this.registerWithReferralCode = this.registerWithReferralCode.bind(this);
    this.encryption = this.encryption.bind(this);
    this.insertSignDataOfOldUser = this.insertSignDataOfOldUser.bind(this);
    this.updateSignDataOfOldUser = this.updateSignDataOfOldUser.bind(this);
    this.approveSignDataOfOldUser = this.approveSignDataOfOldUser.bind(this);
    this.verifySignDataOfOldUser = this.verifySignDataOfOldUser.bind(this);
    this.getCurrentLevelDetails = this.getCurrentLevelDetails.bind(this);
    this.updateParentTreeList = this.updateParentTreeList.bind(this);
    this.updateSelf = this.updateSelf.bind(this);
    this.updateSelfPassword = this.updateSelfPassword.bind(this);
  }

  /**
   * Get data from t_decats_agents table    
   * Query sub agents by jwt.id/req.agentId
   * if root agent pass agentId as query params, it will show the sub agents of the agentId
   * if root agent does not pass agentId as query params, it will show the sub agents of the root agent
   * if normal agent, it will use jwt.id as agentId
     [Required, from jwt] : agentId, parentAgentId
     [Required, from req] : recordPerPage, pageNo
     [Optional, from req] : address, name, status
   */
  async getAll(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
      this.val.isNum(req.query.recordPerPage, 'recordPerPage');
      this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
      this.val.isNum(req.query.pageNo, 'pageNo');

      //Only parentAgentId=null can query subagent
      if (req.jwt.parentAgentId && req.query.agentId) {
        throw new Error('Permmision denied to query sub agent');
      } else if (!req.jwt.parentAgentId && req.query.agentId) {
        this.val.isNum(req.query.agentId, 'agentId');
      } else {
        req.query.agentId = req.jwt.id;
      }
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

    const data = await this.service.getAll(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getById(req: any, res: any) {
    try {
      this.val.isNullOrEmpty(req.params.id, 'id');
      this.val.isNum(req.params.id, 'id');
      if (req.params.id != req.jwt.id) {
        throw new Error("User is not allowed to view other user' s data");
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.getById(req.params.id);
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

  async insertSignDataOfOldUser(req: any, res: any) {
    const resp = await this.service.insertSignDataOfOldUser();
    return apiResponse(res, resp, statusCode(resp.success, 'add'));
  }

  async updateSignDataOfOldUser(req: any, res: any) {
    const id = req.body.id ? req.body.id : '';
    const resp = await this.service.updateSignDataOfOldUser(id);
    return apiResponse(res, resp, statusCode(resp.success, 'add'));
  }
  async approveSignDataOfOldUser(req: any, res: any) {
    const id = req.body.id ? req.body.id : '';
    const resp = await this.service.approveSignDataOfOldUser(id);
    return apiResponse(res, resp, statusCode(resp.success, 'add'));
  }

  async verifySignDataOfOldUser(req: any, res: any) {
    const resp = await this.service.verifySignDataOfOldUser();
    return apiResponse(res, resp, statusCode(resp.success, 'add'));
  }

  async create(req: any, res: any) {
    const reqBody: DBModel.Agent = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.address, 'address');
      this.val.isNullOrEmpty(reqBody.email, 'email');
      this.val.isEmail(reqBody.email);
      this.val.isNullOrEmpty(reqBody.password, 'password');
      this.val.isNullOrEmpty(reqBody.name, 'name');
      this.val.isNullOrEmpty(reqBody.interestPercentage, 'interestPercentage');
      this.val.isNullOrEmpty(reqBody.feePercentage, 'feePercentage');
      this.val.isNum(reqBody.interestPercentage, 'interestPercentage');
      this.val.isNum(reqBody.feePercentage, 'feePercentage');
      this.val.isPercentage(reqBody.interestPercentage, 'interestPercentage');
      this.val.isPercentage(reqBody.feePercentage, 'feePercentage');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    reqBody.id = req.jwt.id;
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
      const resp = await this.service.create(reqBody, req.jwt.id);
      return apiResponse(res, resp, statusCode(resp.success, 'add'));
    }
  }

  async update(req: any, res: any) {
    const reqBody: DBModel.Agent = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.id, 'id');
      this.val.isNum(reqBody.id, 'id');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
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
      const resp = await this.service.update(reqBody);
      return apiResponse(res, resp, statusCode(resp.success, 'up'));
    }
  }

  async loginByDeveloper(req: any, res: any) {
    const reqBody: DBModel.Agent = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.email, 'email');
      this.val.isNullOrEmpty(reqBody.password, 'password');
      this.val.isNullOrEmpty(reqBody.address, 'address');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    let resp: ResponseBase = new ResponseBase();
    const addressFromSignature = reqBody.address.toLowerCase();
    // const resp = await this.service.login(req.body);
    resp = await this.service.login(
      req.body,
      addressFromSignature,
      false,
      true,
    );

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

  async login(req: any, res: any) {
    const reqBody: DBModel.Agent = req.body;
    try {
      // this.val.isNullOrEmpty(req.body.message, 'message');
      // // this.val.isNullOrEmpty(req.body.address, 'address');
      // this.val.isNullOrEmpty(req.body.signature, 'signature');

      this.val.isNullOrEmpty(reqBody.email, 'email');
      this.val.isNullOrEmpty(reqBody.password, 'password');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    let resp: ResponseBase = new ResponseBase();

    if (req.body.signature) {
      let addressFromSignature = '';
      if (req.body.signatureType && req.body.signatureType == 'eip712') {
        addressFromSignature = recoverTypedSignature_v4({
          data: JSON.parse(req.body.message),
          sig: req.body.signature,
        });
      } else {
        addressFromSignature = this.ethAccount.recover(
          req.body.message,
          req.body.signature,
        );
      }
      // const isVerified =
      //   addressFromSignature.toLowerCase() == req.body.address.toLowerCase();

      resp = await this.service.login(
        req.body,
        addressFromSignature.toLowerCase(),
        false,
      );
    } else {
      resp = await this.service.login(req.body, null, true);
    }
    // if (isVerified) {
    //   resp = await this.service.login(req.body);
    // } else {
    //   resp.msg = 'Signature mismatched';
    //   resp.success = false;
    //   resp.respType = 'warning';
    // }
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

  async getNoOfNodes(req: any, res: any) {
    req.query.agentId = req.jwt.id;
    const data = await this.service.getNoOfNodes(req.query.agentId);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async getSubAgent(req: any, res: any) {
    try {
      if (req.jwt.parentAgentId && req.jwt.agentType != AgentType.MST) {
        throw new Error('Permmision denied to query sub agent');
      }
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
    //Only parentAgentId=null can query subagent

    req.query.agentId = req.query.agentId ? req.query.agentId : req.jwt.id;
    const data = await this.service.getSubAgent(req.query, req.jwt);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async changeRole(req: any, res: any) {
    // const reqBody: DBModel.Agent = req.body;
    try {
      this.val.isNullOrEmpty(req.body.agentId, 'agentId');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    const resp = await this.service.changeRole(req.jwt.id, req.body.agentId);
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

  // async agentTree(req: any, res: any) {
  //   // const reqBody: DBModel.Agent = req.body;
  //   try {
  //     this.val.isNullOrEmpty(req.query.recordPerPage, 'recordPerPage');
  //     this.val.isNum(req.query.recordPerPage, 'recordPerPage');
  //     this.val.isNullOrEmpty(req.query.pageNo, 'pageNo');
  //     this.val.isNum(req.query.pageNo, 'pageNo');
  //   } catch (e: any) {
  //     return apiResponse(
  //       res,
  //       new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
  //       statusCode(false, 'query'),
  //     );
  //   }
  //   const resp = await this.service.changeRole(req.jwt.id, req.body.agentId);
  //   return apiResponse(
  //     res,
  //     responseBySuccess(
  //       resp.data,
  //       resp.success,
  //       'query',
  //       resp.respType,
  //       resp.msg,
  //     ),
  //     statusCode(resp.success, 'query'),
  //   );
  // }

  async genReferralCode(req: any, res: any) {
    const reqBody: DBModel.ReferralCode = req.body;
    try {
      this.val.isNullOrEmpty(reqBody.type, 'type');
      if (reqBody.interestPercentage != 0) {
        this.val.isNullOrEmpty(reqBody.interestPercentage, 'type');
      }
      if (reqBody.interestPercentage != 0) {
        this.val.isNullOrEmpty(reqBody.feePercentage, 'type');
      }
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
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
      const resp = await this.service.genReferralCode(req.jwt.id, reqBody);
      return apiResponse(res, resp, statusCode(resp.success, 'up'));
    }
  }

  async getAllReferralCode(req: any, res: any) {
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
    req.query.agentId = req.jwt.id;
    const data = await this.service.getAllReferralCode(req.query);
    return apiResponse(
      res,
      responseBySuccess(data, true, 'query', 'success', 'Founded'),
      statusCode(true, 'query'),
    );
  }

  async registerWithReferralCode(req: any, res: any) {
    const reqBody: DBModel.Agent = req.body;
    try {
      this.val.isNullOrEmpty(req.body.message, 'message');
      this.val.isNullOrEmpty(req.body.address, 'address');
      this.val.isNullOrEmpty(req.body.signature, 'signature');

      this.val.isNullOrEmpty(reqBody.address, 'address');
      this.val.isNullOrEmpty(reqBody.email, 'email');
      this.val.isEmail(reqBody.email);
      this.val.isNullOrEmpty(reqBody.password, 'password');
      // this.val.isNullOrEmpty(reqBody.name, 'name');

      // this.val.isNullOrEmpty(reqBody.interestPercentage, 'interestPercentage');
      // this.val.isNullOrEmpty(reqBody.feePercentage, 'feePercentage');
      // this.val.isNum(reqBody.interestPercentage, 'interestPercentage');
      // this.val.isNum(reqBody.feePercentage, 'feePercentage');
      // this.val.isPercentage(reqBody.interestPercentage, 'interestPercentage');
      // this.val.isPercentage(reqBody.feePercentage, 'feePercentage');

      this.val.isNullOrEmpty(req.body.referralCode, 'referralCode');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }
    let resp: ResponseBase = new ResponseBase();

    const addressFromSignature = this.ethAccount.recover(
      req.body.message,
      req.body.signature,
    );
    const isVerified =
      addressFromSignature.toLowerCase() == req.body.address.toLowerCase();
    if (isVerified) {
      resp = await this.service.registerWithReferralCode(
        reqBody,
        req.body.referralCode,
      );
    } else {
      resp.msg = 'Signature mismatched';
      resp.success = false;
      resp.respType = 'warning';
    }
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }

  async encryption(req: any, res: any) {
    const resp = await this.service.encryption(
      req.body.encryptString,
      req.body.theKey,
      req.body.theIv,
    );
    return apiResponse(res, resp, statusCode(resp.success, 'query'));
  }

  async getCurrentLevelDetails(req: any, res: any) {
    // req.query.agentId = req.jwt.id;
    const data = await this.service.getCurrentLevelDetails(req.jwt.id);
    return apiResponse(
      res,
      // responseBySuccess(data, true, 'query', 'success', 'Founded'),
      data,
      statusCode(true, 'query'),
    );
  }

  async updateParentTreeList(req: any, res: any) {
    const resp = await this.service.updateParentTreeList();
    return apiResponse(res, resp, statusCode(resp.success, 'up'));
  }

  async updateSelf(req: any, res: any) {
    const reqBody: DBModel.Agent = req.body;
    reqBody.id = req.jwt.id;

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
      const resp = await this.service.updateSelf(reqBody);
      return apiResponse(res, resp, statusCode(resp.success, 'up'));
    }
  }

  async updateSelfPassword(req: any, res: any) {
    try {
      // this.val.isNullOrEmpty(req.body.id, 'id');
      // this.val.isNum(req.body.id, 'id');
      this.val.isNullOrEmpty(req.body.currentPassword, 'currentPassword');
      this.val.isNullOrEmpty(req.body.newPassword, 'newPassword');
    } catch (e: any) {
      return apiResponse(
        res,
        new WarningResponseBase(ServerReturnCode.InvalidArgument, e.message),
        statusCode(false, 'query'),
      );
    }

    if (req.body.currentPassword == req.body.newPassword) {
      return apiResponse(
        res,
        new WarningResponseBase(
          ServerReturnCode.InvalidArgument,
          'New password is same as current password',
        ),
        statusCode(false, 'query'),
      );
    }

    const reqBody: DBModel.Agent = new DBModel.Agent();
    reqBody.id = req.jwt.id;
    reqBody.password = req.body.newPassword;

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
      const resp = await this.service.updateSelfPassword(
        reqBody,
        req.body.currentPassword,
      );
      return apiResponse(res, resp, statusCode(resp.success, 'up'));
    }
  }
}
export default Controller;
