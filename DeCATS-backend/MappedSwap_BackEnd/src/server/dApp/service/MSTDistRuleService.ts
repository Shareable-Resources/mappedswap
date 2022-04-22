import seq from '../sequelize';
import CommonService from '../../../foundation/server/CommonService';
import * as SeqModel from '../../../general/model/seqModel/0_index';

import { MSTDistRule } from '../../../general/model/dbModel/0_index';

const modelModule = seq.sequelize.models;

export default class Service implements CommonService {
  async getAll(query: any): Promise<MSTDistRule[]> {
    const funcMsg = `[MSTDistRuleService][getAll]`;
    const whereStatement: any = {};
    const result: any = await modelModule[SeqModel.name.MSTDistRule].findAll({
      where: whereStatement,
      order: [['grade', 'asc']],
    });
    return result;
  }
}
