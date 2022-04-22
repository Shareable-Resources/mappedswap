import {
  apiResponse,
  ResponseBase,
  responseBySuccess,
  statusCode,
} from '../../../foundation/src/api/ApiMessage';
import CommonController from '../../../foundation/src/server/CommonController';
import Service from '../service/deposit_ledger_service';
//import ethAccounts from '../util/EthAccount';
import * as ReqModel from '../model/ReqModel/0_index';
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
}
export default Controller;
