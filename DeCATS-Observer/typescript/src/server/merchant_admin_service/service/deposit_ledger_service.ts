import * as SeqModel from '../model/SeqModel/0_index';
import seq from '../sequelize';
import CommonService from './common_service';
const modelModule = seq.sequelize.models;
export default class Service implements CommonService {
  async getAll(searchParams?: any): Promise<any> {
    const result: any = await modelModule[
      SeqModel.name.DepositLedgers
    ].findAll();
    return result;
  }
}
