import { ResponseBase } from '../../../foundation/src/api/ApiMessage';
import * as DBModel from '../model/DBModel/0_index';
import * as SeqModel from '../model/SeqModel/0_index';
import seq from '../sequelize';
import CommonService from './common_service';
import * as ReqModel from '../model/ReqModel/0_index';
import { Transaction } from 'sequelize/types';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async importWallet(reqBody: ReqModel.ImportWalletReq): Promise<ResponseBase> {
    try {
      let t: Transaction = await seq.sequelize.transaction();

      try {
        const resp = new ResponseBase();
        const result: any = await modelModule[
          SeqModel.name.MerchantClient
        ].findOne({
          where: {
            walletAddress: reqBody.walletAddress,
          },
          transaction: t,
        });
        if (result) {
          if (result.username != reqBody.username) {
            resp.success = false;
            resp.respType = 'warning';
            resp.msg = 'User already exists';
          } else {
            resp.success = true;
            resp.respType = 'success';
            resp.msg = 'User found';
            resp.data = result;
          }
        } else {
          // Not Found
          const newUser = new DBModel.MerchantClient();
          newUser.username = reqBody.username;
          newUser.createdDate = new Date();
          newUser.lastModifiedDate = new Date();
          newUser.status = 1;
          newUser.walletAddress = reqBody.walletAddress;
          newUser.balance = BigInt(0);
          const insertResult: any = await modelModule[
            SeqModel.name.MerchantClient
          ].create(newUser, {
            returning: true,
            transaction: t,
          });

          console.log(insertResult);
          resp.success = true;
          resp.respType = 'success';
          resp.msg = 'User not found, new user is created';
          resp.data = insertResult;
        }
        await t.commit();
        return resp;
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getAll(searchParams?: any): Promise<any> {
    const result: any = await modelModule[
      SeqModel.name.MerchantClient
    ].findAll();
    return result;
  }
}
