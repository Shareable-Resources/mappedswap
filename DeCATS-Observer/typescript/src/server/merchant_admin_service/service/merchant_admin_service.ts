import { ResponseBase } from '../../../foundation/src/api/ApiMessage';
import * as DBModel from '../model/DBModel/0_index';
import * as SeqModel from '../model/SeqModel/0_index';
import seq from '../sequelize';
import CommonService from './common_service';
const models = seq.sequelize.models;
export default class Service implements CommonService {
  async login(merchantAdmin: DBModel.MerchantAdmin): Promise<ResponseBase> {
    const resp = new ResponseBase();

    const result: any = await models[SeqModel.name.MerchantAdmins].findOne({
      where: {
        merchantId: merchantAdmin.merchantId,
        username: merchantAdmin.username,
      },
    });

    if (result) {
      const merchantAdminInDb: DBModel.MerchantAdmin = result;
      if (merchantAdminInDb.passwordHash != merchantAdmin.passwordHash) {
        resp.success = false;
        resp.respType = 'warning';
        resp.msg = 'Password mismatched';
      } else {
        const { passwordHash, ...removeSensitiveObj } = JSON.parse(
          JSON.stringify(merchantAdminInDb),
        );
        resp.success = true;
        resp.respType = 'success';
        resp.msg = 'User Found';
        resp.data = removeSensitiveObj;
      }
    } else {
      resp.success = false;
      resp.respType = 'warning';
      resp.msg = 'User record not found';
    }

    return resp;
  }

  async getAll(searchParams: any): Promise<any> {
    throw Error('Not Implemented');
  }
}
